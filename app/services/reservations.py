from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Callable, Protocol
import uuid

from app.models import Reservation, ReservationRejectionSource, ReservationStatus
from app.repositories.reservation_repository import ReservationRepository
from app.services.accounts import UserAccount
from app.services.audit_logs import AuditLogModule
from app.services.booking_settings import BookingSettings
from app.services.notifications import NotificationModule
from app.services.reservation_lifecycle import FacilityReservationLifecycleModule
from app.services.reservation_time_selection import ReservationTimeSelectionModule
from app.services.staff_reservation_review_access import (
    StaffReservationReviewAccessDenied,
    StaffReservationReviewAccessModule,
    StaffReservationReviewReservationNotFound,
)


class ReservationError(Exception):
    pass


class FacilityNotFound(ReservationError):
    pass


class OrganizationUnitNotFound(ReservationError):
    pass


class ReservationTimeUnavailable(ReservationError):
    pass


class ReservationSubmissionConflict(ReservationError):
    pass


class ReservationNotFound(ReservationError):
    pass


class ReservationCancellationUnavailable(ReservationError):
    pass


class ReservationCancellationReasonRequired(ReservationError):
    pass


class StaffCancellationReviewAccessDenied(ReservationError):
    pass


class CancellationRequestNotFound(ReservationError):
    pass


class ReservationSubmissionConflictReader(Protocol):
    def has_overlapping_blocking_reservation(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> bool:
        raise NotImplementedError


class ReservationSubmissionConflictGuard:
    def __init__(self, *, conflict_reader: ReservationSubmissionConflictReader) -> None:
        self._conflict_reader = conflict_reader

    def ensure_reservation_can_be_held(self, facility_id: str, *, starts_at: datetime, ends_at: datetime) -> None:
        if self._conflict_reader.has_overlapping_blocking_reservation(
            facility_id,
            starts_at=starts_at,
            ends_at=ends_at,
        ):
            raise ReservationSubmissionConflict


@dataclass(frozen=True)
class ReservationExtraRequirements:
    av_support: bool = False
    logistics_coordination: bool = False
    extra_cleaning: bool = False
    security_personnel: bool = False
    notes: str | None = None


@dataclass(frozen=True)
class ReservationSubmission:
    facility_id: str
    activity_title: str
    event_description: str
    participant_count: int
    organization_unit_id: str
    contact_phone: str
    starts_at: datetime
    ends_at: datetime
    extra_requirements: ReservationExtraRequirements = ReservationExtraRequirements()


@dataclass(frozen=True)
class ReservationFacilitySummary:
    id: str
    name: str


@dataclass(frozen=True)
class ReservationOrganizationUnitSummary:
    id: str
    name: str


@dataclass(frozen=True)
class StudentReservationReviewSummary:
    id: str
    is_deleted: bool
    deleted_by: str | None
    deleted_at: datetime | None
    admin_removal_reason: str | None


@dataclass(frozen=True)
class ReservationDocumentMetadata:
    filename: str
    content_type: str
    size_bytes: int
    generated_at: datetime | None = None
    uploaded_at: datetime | None = None


@dataclass(frozen=True)
class StudentReservationDocumentProjection:
    approval_letter: ReservationDocumentMetadata | None
    signed_approval_letter: ReservationDocumentMetadata | None
    review_status: str
    rejection_reason: str | None = None


@dataclass(frozen=True)
class StudentReservationPaymentProjection:
    required: bool
    receipt: ReservationDocumentMetadata | None
    review_status: str
    rejection_reason: str | None = None


@dataclass(frozen=True)
class StudentReservationRejectionProjection:
    source: str
    reason: str | None


@dataclass(frozen=True)
class StudentReservation:
    id: str
    reservation_code: str
    status: ReservationStatus
    facility: ReservationFacilitySummary
    organization_unit: ReservationOrganizationUnitSummary
    activity_title: str
    event_description: str
    participant_count: int
    contact_phone: str
    starts_at: datetime
    ends_at: datetime
    price_rupiah: int
    extra_requirements: ReservationExtraRequirements
    document: StudentReservationDocumentProjection
    payment: StudentReservationPaymentProjection
    rejection: StudentReservationRejectionProjection | None = None
    document_upload_due_at: datetime | None = None
    document_verification_due_at: datetime | None = None
    payment_upload_due_at: datetime | None = None
    payment_verification_due_at: datetime | None = None
    cancellation_reason: str | None = None
    cancellation_rejection_reason: str | None = None
    review: StudentReservationReviewSummary | None = None


@dataclass(frozen=True)
class StudentCancellationRequest:
    reservation: StudentReservation
    refund_warning: str | None = None


class ReservationModule:
    def __init__(
        self,
        *,
        reservation_repository: ReservationRepository,
        reservation_time_selection: ReservationTimeSelectionModule,
        submission_conflict_guard: ReservationSubmissionConflictGuard,
        booking_settings: BookingSettings,
        clock: Callable[[], datetime],
        reservation_lifecycle: FacilityReservationLifecycleModule | None = None,
        staff_review_access: StaffReservationReviewAccessModule | None = None,
        notifications: NotificationModule | None = None,
        audit_logs: AuditLogModule | None = None,
    ) -> None:
        self._reservation_repository = reservation_repository
        self._reservation_time_selection = reservation_time_selection
        self._submission_conflict_guard = submission_conflict_guard
        self._clock = clock
        self._reservation_lifecycle = reservation_lifecycle or FacilityReservationLifecycleModule(
            booking_settings=booking_settings,
            clock=clock,
        )
        self._staff_review_access = staff_review_access or StaffReservationReviewAccessModule(
            reservation_repository=reservation_repository
        )
        self._notifications = notifications
        self._audit_logs = audit_logs

    def submit_reservation(self, student: UserAccount, submission: ReservationSubmission) -> StudentReservation:
        facility = self._reservation_repository.get_active_facility(submission.facility_id)
        if facility is None:
            raise FacilityNotFound

        organization_unit = self._reservation_repository.get_active_organization_unit(
            submission.organization_unit_id
        )
        if organization_unit is None:
            raise OrganizationUnitNotFound

        time_selection = self._reservation_time_selection.validate_time_selection(
            submission.facility_id,
            starts_at=submission.starts_at,
            ends_at=submission.ends_at,
        )
        if not time_selection.available:
            raise ReservationTimeUnavailable

        starts_at = _as_utc(submission.starts_at)
        ends_at = _as_utc(submission.ends_at)
        try:
            self._submission_conflict_guard.ensure_reservation_can_be_held(
                submission.facility_id,
                starts_at=starts_at,
                ends_at=ends_at,
            )
        except ReservationSubmissionConflict:
            raise ReservationTimeUnavailable

        reservation = Reservation(
            facility_id=facility.id,
            student_id=student.id,
            organization_unit_id=organization_unit.id,
            reservation_code=_new_reservation_code(),
            activity_title=submission.activity_title,
            event_description=submission.event_description,
            participant_count=submission.participant_count,
            contact_phone=submission.contact_phone,
            price_rupiah=facility.price_rupiah,
            organization_unit_name=organization_unit.name,
            extra_requirement_av_support=submission.extra_requirements.av_support,
            extra_requirement_logistics_coordination=submission.extra_requirements.logistics_coordination,
            extra_requirement_extra_cleaning=submission.extra_requirements.extra_cleaning,
            extra_requirement_security_personnel=submission.extra_requirements.security_personnel,
            extra_requirement_notes=submission.extra_requirements.notes,
            starts_at=starts_at,
            ends_at=ends_at,
            status=ReservationStatus.pending_document_upload,
        )
        self._reservation_lifecycle.record_submission_held(reservation)
        reservation = self._reservation_repository.add(reservation)
        self._record_audit(
            actor=student,
            action_type="reservation.submitted",
            target_type="reservation",
            target_id=reservation.id,
            facility_id=reservation.facility_id,
            student_id=reservation.student_id,
            reservation_id=reservation.id,
        )
        if self._notifications is not None:
            self._notifications.reservation_submitted(reservation)
        return self._to_student_reservation(reservation)

    def list_student_reservations(self, student: UserAccount) -> list[StudentReservation]:
        return [
            self._to_student_reservation(reservation)
            for reservation in self._reservation_repository.list_for_student(student.id)
        ]

    def get_student_reservation(self, student: UserAccount, reservation_id: str) -> StudentReservation:
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        return self._to_student_reservation(reservation)

    def cancel_student_reservation(self, student: UserAccount, reservation_id: str) -> StudentReservation:
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        if reservation.status not in _PRE_APPROVAL_CANCELLABLE_STATUSES:
            raise ReservationCancellationUnavailable
        self._reservation_lifecycle.cancel_before_approval(reservation)
        self._record_audit(
            actor=student,
            action_type="reservation.cancelled",
            target_type="reservation",
            target_id=reservation.id,
            facility_id=reservation.facility_id,
            student_id=reservation.student_id,
            reservation_id=reservation.id,
        )
        return self._to_student_reservation(reservation)

    def request_student_cancellation(
        self,
        student: UserAccount,
        reservation_id: str,
        *,
        reason: str,
    ) -> StudentCancellationRequest:
        reason = reason.strip()
        if not reason:
            raise ReservationCancellationReasonRequired
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        if self._reservation_lifecycle.effective_status(reservation) != ReservationStatus.approved:
            raise ReservationCancellationUnavailable
        self._reservation_lifecycle.request_cancellation(reservation, reason=reason)
        refund_warning = None
        if reservation.price_rupiah > 0:
            refund_warning = "Sistem tidak memproses refund. Silakan hubungi TU fasilitas untuk tindak lanjut refund."
        return StudentCancellationRequest(
            reservation=self._to_student_reservation(reservation),
            refund_warning=refund_warning,
        )

    def approve_cancellation_request(self, staff: UserAccount, reservation_id: str) -> StudentReservation:
        reservation = self._get_staff_cancellation_request(staff, reservation_id)
        self._reservation_lifecycle.approve_cancellation(reservation)
        self._record_audit(
            actor=staff,
            action_type="cancellation.approved",
            target_type="reservation",
            target_id=reservation.id,
            facility_id=reservation.facility_id,
            student_id=reservation.student_id,
            reservation_id=reservation.id,
        )
        return self._to_student_reservation(reservation)

    def reject_cancellation_request(
        self,
        staff: UserAccount,
        reservation_id: str,
        *,
        reason: str,
    ) -> StudentReservation:
        reason = reason.strip()
        if not reason:
            raise ReservationCancellationReasonRequired
        reservation = self._get_staff_cancellation_request(staff, reservation_id)
        self._reservation_lifecycle.reject_cancellation(reservation, reason=reason)
        self._record_audit(
            actor=staff,
            action_type="cancellation.rejected",
            target_type="reservation",
            target_id=reservation.id,
            facility_id=reservation.facility_id,
            student_id=reservation.student_id,
            reservation_id=reservation.id,
        )
        return self._to_student_reservation(reservation)

    def _to_student_reservation(self, reservation: Reservation) -> StudentReservation:
        return _to_student_reservation(
            reservation,
            effective_status=self._reservation_lifecycle.effective_status(reservation),
        )

    def _get_staff_cancellation_request(self, staff: UserAccount, reservation_id: str) -> Reservation:
        try:
            reservation = self._staff_review_access.require_assigned_reservation(reservation_id, staff_id=staff.id)
        except StaffReservationReviewAccessDenied:
            raise StaffCancellationReviewAccessDenied
        except StaffReservationReviewReservationNotFound:
            raise ReservationNotFound
        if reservation.status != ReservationStatus.cancellation_requested:
            raise CancellationRequestNotFound
        return reservation

    def _record_audit(
        self,
        *,
        actor: UserAccount | None,
        action_type: str,
        target_type: str,
        target_id: str,
        facility_id: str | None = None,
        student_id: str | None = None,
        reservation_id: str | None = None,
    ) -> None:
        if self._audit_logs is not None:
            self._audit_logs.record(
                actor=actor,
                action_type=action_type,
                target_type=target_type,
                target_id=target_id,
                facility_id=facility_id,
                student_id=student_id,
                reservation_id=reservation_id,
            )


_PRE_APPROVAL_CANCELLABLE_STATUSES = (
    ReservationStatus.pending_document_upload,
    ReservationStatus.pending_document_review,
    ReservationStatus.pending_payment,
    ReservationStatus.overdue_verification,
)


def _to_student_reservation(reservation: Reservation, *, effective_status: ReservationStatus) -> StudentReservation:
    return StudentReservation(
        id=reservation.id,
        reservation_code=reservation.reservation_code,
        status=effective_status,
        facility=ReservationFacilitySummary(
            id=reservation.facility_id,
            name=reservation.facility.name,
        ),
        organization_unit=ReservationOrganizationUnitSummary(
            id=reservation.organization_unit_id,
            name=reservation.organization_unit_name or reservation.organization_unit.name,
        ),
        activity_title=reservation.activity_title,
        event_description=reservation.event_description,
        participant_count=reservation.participant_count,
        contact_phone=reservation.contact_phone,
        starts_at=_as_utc(reservation.starts_at),
        ends_at=_as_utc(reservation.ends_at),
        price_rupiah=reservation.price_rupiah,
        extra_requirements=ReservationExtraRequirements(
            av_support=reservation.extra_requirement_av_support,
            logistics_coordination=reservation.extra_requirement_logistics_coordination,
            extra_cleaning=reservation.extra_requirement_extra_cleaning,
            security_personnel=reservation.extra_requirement_security_personnel,
            notes=reservation.extra_requirement_notes,
        ),
        document=_to_student_reservation_document_projection(reservation),
        payment=_to_student_reservation_payment_projection(reservation),
        rejection=_to_student_reservation_rejection_projection(reservation),
        document_upload_due_at=_optional_utc(reservation.document_upload_due_at),
        document_verification_due_at=_optional_utc(reservation.document_verification_due_at),
        payment_upload_due_at=_optional_utc(reservation.payment_upload_due_at),
        payment_verification_due_at=_optional_utc(reservation.payment_verification_due_at),
        cancellation_reason=reservation.cancellation_reason,
        cancellation_rejection_reason=reservation.cancellation_rejection_reason,
        review=_to_student_reservation_review(reservation),
    )


def _to_student_reservation_document_projection(reservation: Reservation) -> StudentReservationDocumentProjection:
    rejection_reason = None
    if reservation.status == ReservationStatus.rejected and reservation.rejection_source == ReservationRejectionSource.document:
        rejection_reason = reservation.rejection_reason
    return StudentReservationDocumentProjection(
        approval_letter=_approval_letter_metadata(reservation),
        signed_approval_letter=_signed_approval_letter_metadata(reservation),
        review_status=_document_review_status(reservation),
        rejection_reason=rejection_reason,
    )


def _to_student_reservation_payment_projection(reservation: Reservation) -> StudentReservationPaymentProjection:
    rejection_reason = None
    if reservation.status == ReservationStatus.rejected and reservation.rejection_source == ReservationRejectionSource.payment:
        rejection_reason = reservation.rejection_reason
    return StudentReservationPaymentProjection(
        required=reservation.price_rupiah > 0,
        receipt=_payment_receipt_metadata(reservation),
        review_status=_payment_review_status(reservation),
        rejection_reason=rejection_reason,
    )


def _to_student_reservation_rejection_projection(reservation: Reservation) -> StudentReservationRejectionProjection | None:
    if reservation.status != ReservationStatus.rejected:
        return None
    source = reservation.rejection_source.value if reservation.rejection_source is not None else "unknown"
    return StudentReservationRejectionProjection(source=source, reason=reservation.rejection_reason)


def _approval_letter_metadata(reservation: Reservation) -> ReservationDocumentMetadata | None:
    if reservation.approval_letter is None:
        return None
    return ReservationDocumentMetadata(
        filename=reservation.approval_letter.filename,
        content_type=reservation.approval_letter.content_type,
        size_bytes=reservation.approval_letter.size_bytes,
        generated_at=_as_utc(reservation.approval_letter.generated_at),
    )


def _signed_approval_letter_metadata(reservation: Reservation) -> ReservationDocumentMetadata | None:
    if reservation.signed_approval_letter is None:
        return None
    return ReservationDocumentMetadata(
        filename=reservation.signed_approval_letter.filename,
        content_type=reservation.signed_approval_letter.content_type,
        size_bytes=reservation.signed_approval_letter.size_bytes,
        uploaded_at=_as_utc(reservation.signed_approval_letter.uploaded_at),
    )


def _payment_receipt_metadata(reservation: Reservation) -> ReservationDocumentMetadata | None:
    if reservation.payment_receipt is None:
        return None
    return ReservationDocumentMetadata(
        filename=reservation.payment_receipt.filename,
        content_type=reservation.payment_receipt.content_type,
        size_bytes=reservation.payment_receipt.size_bytes,
        uploaded_at=_as_utc(reservation.payment_receipt.uploaded_at),
    )


def _document_review_status(reservation: Reservation) -> str:
    if reservation.status == ReservationStatus.pending_document_upload:
        return "upload_needed"
    if reservation.status == ReservationStatus.pending_document_review:
        return "waiting_review"
    if reservation.status == ReservationStatus.rejected and reservation.rejection_source == ReservationRejectionSource.document:
        return "rejected"
    if reservation.status in (
        ReservationStatus.pending_payment,
        ReservationStatus.approved,
        ReservationStatus.cancellation_requested,
        ReservationStatus.completed,
    ):
        return "approved"
    return "not_ready"


def _payment_review_status(reservation: Reservation) -> str:
    if reservation.price_rupiah <= 0:
        return "not_required"
    if reservation.status == ReservationStatus.pending_payment:
        if reservation.payment_receipt is None:
            return "upload_needed"
        return "waiting_review"
    if reservation.status == ReservationStatus.rejected and reservation.rejection_source == ReservationRejectionSource.payment:
        return "rejected"
    if reservation.status in (
        ReservationStatus.approved,
        ReservationStatus.cancellation_requested,
        ReservationStatus.completed,
    ):
        return "approved"
    return "not_ready"


def _to_student_reservation_review(reservation: Reservation) -> StudentReservationReviewSummary | None:
    if reservation.review is None:
        return None
    return StudentReservationReviewSummary(
        id=reservation.review.id,
        is_deleted=reservation.review.is_deleted,
        deleted_by=reservation.review.deleted_by,
        deleted_at=_optional_utc(reservation.review.deleted_at),
        admin_removal_reason=reservation.review.admin_removal_reason,
    )


def _new_reservation_code() -> str:
    return f"RSV-{uuid.uuid4().hex[:8].upper()}"


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _optional_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    return _as_utc(value)
