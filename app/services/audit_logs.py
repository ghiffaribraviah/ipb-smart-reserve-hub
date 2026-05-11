from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime

from app.models import AuditLog
from app.repositories.audit_log_repository import AuditLogFilters, AuditLogRepository
from app.services.accounts import UserAccount


@dataclass(frozen=True)
class AuditLogEntry:
    id: str
    actor_id: str | None
    actor_email: str | None
    action_type: str
    target_type: str
    target_id: str
    facility_id: str | None
    student_id: str | None
    reservation_id: str | None
    created_at: datetime


class AuditLogModule:
    def __init__(self, *, audit_log_repository: AuditLogRepository, clock: Callable[[], datetime]) -> None:
        self._audit_log_repository = audit_log_repository
        self._clock = clock

    def record(
        self,
        *,
        actor: UserAccount | None,
        action_type: str,
        target_type: str,
        target_id: str,
        facility_id: str | None = None,
        student_id: str | None = None,
        reservation_id: str | None = None,
    ) -> AuditLogEntry:
        audit_log = AuditLog(
            actor_id=actor.id if actor is not None else None,
            actor_email=actor.email if actor is not None else None,
            action_type=action_type,
            target_type=target_type,
            target_id=target_id,
            facility_id=facility_id,
            student_id=student_id,
            reservation_id=reservation_id,
            created_at=_as_utc(self._clock()),
        )
        return _to_audit_log_entry(self._audit_log_repository.add(audit_log))

    def list_logs(self, filters: AuditLogFilters) -> list[AuditLogEntry]:
        return [_to_audit_log_entry(audit_log) for audit_log in self._audit_log_repository.list(filters)]


class AuditLogRecorder:
    def __init__(self, audit_logs: AuditLogModule | None) -> None:
        self._audit_logs = audit_logs

    def record(
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


def _to_audit_log_entry(audit_log: AuditLog) -> AuditLogEntry:
    return AuditLogEntry(
        id=audit_log.id,
        actor_id=audit_log.actor_id,
        actor_email=audit_log.actor_email,
        action_type=audit_log.action_type,
        target_type=audit_log.target_type,
        target_id=audit_log.target_id,
        facility_id=audit_log.facility_id,
        student_id=audit_log.student_id,
        reservation_id=audit_log.reservation_id,
        created_at=_as_utc(audit_log.created_at),
    )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
