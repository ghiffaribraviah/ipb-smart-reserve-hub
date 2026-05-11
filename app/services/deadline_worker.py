from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import select

from app.models import Reservation
from app.repositories.audit_log_repository import SqlAlchemyAuditLogRepository
from app.repositories.notification_repository import SqlAlchemyNotificationRepository
from app.services.audit_logs import AuditLogModule, AuditLogRecorder
from app.services.booking_settings import BookingSettings
from app.services.notifications import NotificationModule
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
        expired = 0
        overdue_verification = 0
        completed = 0
        with self._session_factory() as session:
            audit_logs = AuditLogModule(
                audit_log_repository=SqlAlchemyAuditLogRepository(session),
                clock=self._clock,
            )
            audit_recorder = AuditLogRecorder(audit_logs)
            notifications = NotificationModule(
                notification_repository=SqlAlchemyNotificationRepository(session),
                clock=self._clock,
            )
            reservations = list(session.scalars(select(Reservation)))
            for reservation in reservations:
                transition = self._reservation_lifecycle.process_deadline(reservation)
                if transition == DeadlineTransition.completed:
                    _record_deadline_audit(audit_recorder, reservation, action_type="deadline.completed")
                    notifications.reservation_completed_by_deadline(reservation)
                    completed += 1
                elif transition == DeadlineTransition.expired:
                    _record_deadline_audit(audit_recorder, reservation, action_type="deadline.expired")
                    notifications.reservation_expired_by_deadline(reservation)
                    expired += 1
                elif transition == DeadlineTransition.overdue_verification:
                    _record_deadline_audit(audit_recorder, reservation, action_type="deadline.overdue_verification")
                    notifications.reservation_overdue_verification_by_deadline(reservation)
                    overdue_verification += 1
            session.commit()
        return DeadlineWorkerResult(
            expired=expired,
            overdue_verification=overdue_verification,
            completed=completed,
        )


def _record_deadline_audit(audit_recorder: AuditLogRecorder, reservation: Reservation, *, action_type: str) -> None:
    audit_recorder.record(
        actor=None,
        action_type=action_type,
        target_type="reservation",
        target_id=reservation.id,
        facility_id=reservation.facility_id,
        student_id=reservation.student_id,
        reservation_id=reservation.id,
    )
