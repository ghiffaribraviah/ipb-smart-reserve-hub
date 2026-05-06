from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Callable, Protocol
import uuid

from app.models import Reservation, ReservationStatus
from app.repositories.reservation_repository import ReservationRepository
from app.services.accounts import UserAccount
from app.services.booking_settings import BookingSettings
from app.services.notifications import NotificationModule
from app.services.reservation_time_selection import ReservationTimeSelectionModule


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


@dataclass(frozen=True)
class ReservationFacilitySummary:
    id: str
    name: str


@dataclass(frozen=True)
class ReservationOrganizationUnitSummary:
    id: str
    name: str


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
    document_upload_due_at: datetime | None = None
    document_verification_due_at: datetime | None = None
    payment_upload_due_at: datetime | None = None
    payment_verification_due_at: datetime | None = None
    cancellation_reason: str | None = None
    cancellation_rejection_reason: str | None = None


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
        notifications: NotificationModule | None = None,
    ) -> None:
        self._reservation_repository = reservation_repository
        self._reservation_time_selection = reservation_time_selection
        self._submission_conflict_guard = submission_conflict_guard
        self._booking_settings = booking_settings
        self._clock = clock
        self._notifications = notifications

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
            starts_at=starts_at,
            ends_at=ends_at,
            document_upload_due_at=_as_utc(self._clock())
            + timedelta(hours=self._booking_settings.document_upload_due_hours),
            status=ReservationStatus.pending_document_upload,
        )
        reservation = self._reservation_repository.add(reservation)
        if self._notifications is not None:
            self._notifications.reservation_submitted(reservation)
        return _to_student_reservation(reservation, now=_as_utc(self._clock()))

    def list_student_reservations(self, student: UserAccount) -> list[StudentReservation]:
        return [
            _to_student_reservation(reservation, now=_as_utc(self._clock()))
            for reservation in self._reservation_repository.list_for_student(student.id)
        ]

    def get_student_reservation(self, student: UserAccount, reservation_id: str) -> StudentReservation:
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        return _to_student_reservation(reservation, now=_as_utc(self._clock()))

    def cancel_student_reservation(self, student: UserAccount, reservation_id: str) -> StudentReservation:
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        if reservation.status not in _PRE_APPROVAL_CANCELLABLE_STATUSES:
            raise ReservationCancellationUnavailable
        reservation.status = ReservationStatus.cancelled
        return _to_student_reservation(reservation, now=_as_utc(self._clock()))

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
        if _effective_status(reservation, _as_utc(self._clock())) != ReservationStatus.approved:
            raise ReservationCancellationUnavailable
        reservation.status = ReservationStatus.cancellation_requested
        reservation.cancellation_reason = reason
        reservation.cancellation_rejection_reason = None
        refund_warning = None
        if reservation.price_rupiah > 0:
            refund_warning = "Sistem tidak memproses refund. Silakan hubungi TU fasilitas untuk tindak lanjut refund."
        return StudentCancellationRequest(
            reservation=_to_student_reservation(reservation, now=_as_utc(self._clock())),
            refund_warning=refund_warning,
        )

    def approve_cancellation_request(self, staff: UserAccount, reservation_id: str) -> StudentReservation:
        reservation = self._get_staff_cancellation_request(staff, reservation_id)
        reservation.status = ReservationStatus.cancelled
        return _to_student_reservation(reservation, now=_as_utc(self._clock()))

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
        reservation.status = ReservationStatus.approved
        reservation.cancellation_rejection_reason = reason
        return _to_student_reservation(reservation, now=_as_utc(self._clock()))

    def _get_staff_cancellation_request(self, staff: UserAccount, reservation_id: str) -> Reservation:
        reservation = self._reservation_repository.get_for_assigned_staff_review(reservation_id, staff.id)
        if reservation is not None:
            if reservation.status != ReservationStatus.cancellation_requested:
                raise CancellationRequestNotFound
            return reservation
        if self._reservation_repository.get_by_id_for_review(reservation_id) is not None:
            raise StaffCancellationReviewAccessDenied
        raise ReservationNotFound


_PRE_APPROVAL_CANCELLABLE_STATUSES = (
    ReservationStatus.pending_document_upload,
    ReservationStatus.pending_document_review,
    ReservationStatus.pending_payment,
    ReservationStatus.overdue_verification,
)


def _to_student_reservation(reservation: Reservation, *, now: datetime) -> StudentReservation:
    return StudentReservation(
        id=reservation.id,
        reservation_code=reservation.reservation_code,
        status=_effective_status(reservation, now),
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
        document_upload_due_at=_optional_utc(reservation.document_upload_due_at),
        document_verification_due_at=_optional_utc(reservation.document_verification_due_at),
        payment_upload_due_at=_optional_utc(reservation.payment_upload_due_at),
        payment_verification_due_at=_optional_utc(reservation.payment_verification_due_at),
        cancellation_reason=reservation.cancellation_reason,
        cancellation_rejection_reason=reservation.cancellation_rejection_reason,
    )


def _effective_status(reservation: Reservation, now: datetime) -> ReservationStatus:
    if reservation.status == ReservationStatus.approved and _as_utc(reservation.ends_at) <= now:
        return ReservationStatus.completed
    return reservation.status


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
