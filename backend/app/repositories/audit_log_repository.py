from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AuditLog


@dataclass(frozen=True)
class AuditLogFilters:
    actor_id: str | None = None
    action_type: str | None = None
    target_type: str | None = None
    facility_id: str | None = None
    student_id: str | None = None
    reservation_id: str | None = None
    created_from: datetime | None = None
    created_to: datetime | None = None
    limit: int | None = None


class AuditLogRepository(Protocol):
    def add(self, audit_log: AuditLog) -> AuditLog:
        raise NotImplementedError

    def list(self, filters: AuditLogFilters) -> list[AuditLog]:
        raise NotImplementedError


class SqlAlchemyAuditLogRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, audit_log: AuditLog) -> AuditLog:
        self._session.add(audit_log)
        self._session.flush()
        return audit_log

    def list(self, filters: AuditLogFilters) -> list[AuditLog]:
        statement = select(AuditLog)
        if filters.actor_id is not None:
            statement = statement.where(AuditLog.actor_id == filters.actor_id)
        if filters.action_type is not None:
            statement = statement.where(AuditLog.action_type == filters.action_type)
        if filters.target_type is not None:
            statement = statement.where(AuditLog.target_type == filters.target_type)
        if filters.facility_id is not None:
            statement = statement.where(AuditLog.facility_id == filters.facility_id)
        if filters.student_id is not None:
            statement = statement.where(AuditLog.student_id == filters.student_id)
        if filters.reservation_id is not None:
            statement = statement.where(AuditLog.reservation_id == filters.reservation_id)
        if filters.created_from is not None:
            statement = statement.where(AuditLog.created_at >= filters.created_from)
        if filters.created_to is not None:
            statement = statement.where(AuditLog.created_at <= filters.created_to)
        statement = statement.order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
        if filters.limit is not None:
            statement = statement.limit(filters.limit)
        return list(self._session.scalars(statement))
