from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Callable, Protocol
import uuid

from app.models import Reservation, ReservationStatus
from app.repositories.reservation_repository import ReservationRepository
from app.services.accounts import UserAccount
from app.services.audit_logs import AuditLogModule, AuditLogRecorder
from app.services.booking_settings import BookingSettings
from app.services.notifications import NotificationModule
from app.services.reservation_lifecycle import FacilityReservationLifecycleModule
from app.services.reservation_time_selection import ReservationTimeSelectionModule
from app.services.staff_reservation_review_access import (
    StaffReservationReviewAccessDenied,
    StaffReservationReviewAccessModule,
    StaffReservationReviewReservationNotFound,
)
from app.services.student_reservation_workflow_projections import (
    ReservationExtraRequirements,
    StudentReservation,
    StudentReservationWorkflowProjectionModule,
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
        self._audit_recorder = AuditLogRecorder(audit_logs)
        self._student_reservation_projection = StudentReservationWorkflowProjectionModule()

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
        self._audit_recorder.record(
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
        self._audit_recorder.record(
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
        self._audit_recorder.record(
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
        self._audit_recorder.record(
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
        return self._student_reservation_projection.project(
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

_PRE_APPROVAL_CANCELLABLE_STATUSES = (
    ReservationStatus.pending_document_upload,
    ReservationStatus.pending_document_review,
    ReservationStatus.pending_payment,
    ReservationStatus.overdue_verification,
)


def _new_reservation_code() -> str:
    return f"RSV-{uuid.uuid4().hex[:8].upper()}"


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
