from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import object_session

from app.models import AuditLog, Notification, Reservation
from app.services.booking_settings import BookingSettings
from app.services.reservation_lifecycle import DeadlineTransition, FacilityReservationLifecycleModule


@dataclass(frozen=True)
class DeadlineWorkerResult:
    expired: int = 0
    overdue_verification: int = 0
    completed: int = 0


class DeadlineWorkerModule:
    def __init__(
        self,
        *,
        session_factory: Callable,
        clock: Callable[[], datetime],
        booking_settings: BookingSettings | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._clock = clock
        self._booking_settings = booking_settings or BookingSettings.defaults()
        self._reservation_lifecycle = FacilityReservationLifecycleModule(
            booking_settings=self._booking_settings,
            clock=clock,
        )

    def process_due_reservations(self) -> DeadlineWorkerResult:
        now = _as_utc(self._clock())
        expired = 0
        overdue_verification = 0
        completed = 0
        with self._session_factory() as session:
            reservations = list(session.scalars(select(Reservation)))
            for reservation in reservations:
                transition = self._reservation_lifecycle.process_deadline(reservation)
                if transition == DeadlineTransition.completed:
                    _record_deadline_audit(reservation, action_type="deadline.completed", created_at=now)
                    _notify_student(
                        reservation,
                        title="Reservasi selesai",
                        message=f"Reservasi {reservation.activity_title} sudah selesai.",
                        created_at=now,
                    )
                    completed += 1
                elif transition == DeadlineTransition.expired:
                    _record_deadline_audit(reservation, action_type="deadline.expired", created_at=now)
                    _notify_student(
                        reservation,
                        title="Reservasi kedaluwarsa",
                        message=f"Reservasi {reservation.activity_title} kedaluwarsa karena melewati batas waktu.",
                        created_at=now,
                    )
                    expired += 1
                elif transition == DeadlineTransition.overdue_verification:
                    _record_deadline_audit(
                        reservation,
                        action_type="deadline.overdue_verification",
                        created_at=now,
                    )
                    _notify_student(
                        reservation,
                        title="Verifikasi melewati batas waktu",
                        message=(
                            f"Reservasi {reservation.activity_title} membutuhkan tindak lanjut TU. "
                            f"Hubungi {reservation.facility.contact_name} di {reservation.facility.contact_phone}."
                        ),
                        created_at=now,
                    )
                    overdue_verification += 1
            session.commit()
        return DeadlineWorkerResult(
            expired=expired,
            overdue_verification=overdue_verification,
            completed=completed,
        )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _notify_student(reservation: Reservation, *, title: str, message: str, created_at: datetime) -> None:
    session = object_session(reservation)
    if session is not None:
        session.add(
            Notification(
                recipient_id=reservation.student_id,
                reservation_id=reservation.id,
                title=title,
                message=message,
                created_at=created_at,
            )
        )


def _record_deadline_audit(reservation: Reservation, *, action_type: str, created_at: datetime) -> None:
    session = object_session(reservation)
    if session is not None:
        session.add(
            AuditLog(
                actor_id=None,
                actor_email=None,
                action_type=action_type,
                target_type="reservation",
                target_id=reservation.id,
                facility_id=reservation.facility_id,
                student_id=reservation.student_id,
                reservation_id=reservation.id,
                created_at=created_at,
            )
        )
