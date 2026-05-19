from collections.abc import Callable
from datetime import UTC, datetime, timedelta
import enum

from app.models import Reservation, ReservationRejectionSource, ReservationStatus
from app.services.booking_settings import BookingSettings


class DeadlineTransition(str, enum.Enum):
    expired = "expired"
    overdue_verification = "overdue_verification"
    completed = "completed"


class FacilityReservationLifecycleModule:
    def __init__(self, *, booking_settings: BookingSettings, clock: Callable[[], datetime]) -> None:
        self._booking_settings = booking_settings
        self._clock = clock

    def approve_document(self, reservation: Reservation) -> None:
        if reservation.price_rupiah == 0:
            reservation.status = ReservationStatus.approved
            return

        reservation.status = ReservationStatus.pending_payment
        reservation.payment_upload_due_at = _as_utc(self._clock()) + timedelta(
            hours=self._booking_settings.payment_upload_due_hours
        )

    def record_submission_held(self, reservation: Reservation) -> None:
        reservation.status = ReservationStatus.pending_document_upload
        reservation.document_upload_due_at = _as_utc(self._clock()) + timedelta(
            hours=self._booking_settings.document_upload_due_hours
        )

    def record_signed_document_uploaded(self, reservation: Reservation) -> None:
        uploaded_at = _as_utc(self._clock())
        reservation.status = ReservationStatus.pending_document_review
        reservation.document_verification_due_at = uploaded_at + timedelta(
            hours=self._booking_settings.document_verification_due_hours
        )

    def reject_document(self, reservation: Reservation, *, reason: str) -> None:
        reservation.status = ReservationStatus.rejected
        reservation.rejection_reason = reason
        reservation.rejection_source = ReservationRejectionSource.document

    def record_payment_receipt_uploaded(self, reservation: Reservation) -> None:
        uploaded_at = _as_utc(self._clock())
        reservation.payment_verification_due_at = uploaded_at + timedelta(
            hours=self._booking_settings.payment_verification_due_hours
        )

    def approve_payment(self, reservation: Reservation) -> None:
        reservation.status = ReservationStatus.approved

    def reject_payment(self, reservation: Reservation, *, reason: str) -> None:
        reservation.status = ReservationStatus.rejected
        reservation.rejection_reason = reason
        reservation.rejection_source = ReservationRejectionSource.payment

    def cancel_before_approval(self, reservation: Reservation) -> None:
        reservation.status = ReservationStatus.cancelled

    def request_cancellation(self, reservation: Reservation, *, reason: str) -> None:
        reservation.status = ReservationStatus.cancelled
        reservation.cancellation_reason = reason
        reservation.cancellation_rejection_reason = None

    def approve_cancellation(self, reservation: Reservation) -> None:
        reservation.status = ReservationStatus.cancelled

    def reject_cancellation(self, reservation: Reservation, *, reason: str) -> None:
        reservation.status = ReservationStatus.approved
        reservation.cancellation_rejection_reason = reason

    def effective_status(self, reservation: Reservation) -> ReservationStatus:
        if reservation.status == ReservationStatus.approved and _as_utc(reservation.ends_at) <= _as_utc(self._clock()):
            return ReservationStatus.completed
        return reservation.status

    def process_deadline(self, reservation: Reservation) -> DeadlineTransition | None:
        now = _as_utc(self._clock())
        if self._should_complete(reservation, now):
            reservation.status = ReservationStatus.completed
            return DeadlineTransition.completed
        if self._overdue_cutoff_reached(reservation, now):
            reservation.status = ReservationStatus.expired
            return DeadlineTransition.expired
        if self._should_mark_overdue_verification(reservation, now):
            if self._staff_overdue_cutoff_reached(reservation, now):
                reservation.status = ReservationStatus.expired
                return DeadlineTransition.expired
            reservation.status = ReservationStatus.overdue_verification
            return DeadlineTransition.overdue_verification
        if self._should_expire_student_delay_or_normal_cutoff(reservation, now):
            reservation.status = ReservationStatus.expired
            return DeadlineTransition.expired
        return None

    def _should_complete(self, reservation: Reservation, now: datetime) -> bool:
        return reservation.status == ReservationStatus.approved and _as_utc(reservation.ends_at) <= now

    def _should_expire_student_delay_or_normal_cutoff(self, reservation: Reservation, now: datetime) -> bool:
        if (
            reservation.status == ReservationStatus.pending_document_upload
            and reservation.document_upload_due_at is not None
            and _as_utc(reservation.document_upload_due_at) <= now
        ):
            return True
        if (
            reservation.status == ReservationStatus.pending_payment
            and reservation.payment_receipt is None
            and reservation.payment_upload_due_at is not None
            and _as_utc(reservation.payment_upload_due_at) <= now
        ):
            return True
        if reservation.status in (
            ReservationStatus.pending_document_upload,
            ReservationStatus.pending_document_review,
            ReservationStatus.pending_payment,
        ):
            return _as_utc(reservation.starts_at) - now <= timedelta(
                hours=self._booking_settings.final_approval_cutoff_hours
            )
        return False

    def _overdue_cutoff_reached(self, reservation: Reservation, now: datetime) -> bool:
        return reservation.status == ReservationStatus.overdue_verification and self._staff_overdue_cutoff_reached(
            reservation,
            now,
        )

    def _staff_overdue_cutoff_reached(self, reservation: Reservation, now: datetime) -> bool:
        return _as_utc(reservation.starts_at) - now <= timedelta(
            hours=self._booking_settings.overdue_final_approval_cutoff_hours
        )

    def _should_mark_overdue_verification(self, reservation: Reservation, now: datetime) -> bool:
        if (
            reservation.status == ReservationStatus.pending_document_review
            and reservation.document_verification_due_at is not None
            and _as_utc(reservation.document_verification_due_at) <= now
        ):
            return True
        return (
            reservation.status == ReservationStatus.pending_payment
            and reservation.payment_receipt is not None
            and reservation.payment_verification_due_at is not None
            and _as_utc(reservation.payment_verification_due_at) <= now
        )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
