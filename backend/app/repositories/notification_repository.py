from typing import Protocol

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import FacilityStaffAssignment, Notification, User, UserRole


class NotificationRepository(Protocol):
    def add(self, notification: Notification) -> Notification:
        raise NotImplementedError

    def list_for_user(self, user_id: str, *, limit: int | None = None, offset: int = 0) -> list[Notification]:
        raise NotImplementedError

    def list_unread_for_user(self, user_id: str) -> list[Notification]:
        raise NotImplementedError

    def get_for_user(self, notification_id: str, user_id: str) -> Notification | None:
        raise NotImplementedError

    def list_assigned_staff_and_super_admin_ids(self, facility_id: str) -> list[str]:
        raise NotImplementedError


class SqlAlchemyNotificationRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, notification: Notification) -> Notification:
        self._session.add(notification)
        self._session.flush()
        return notification

    def list_for_user(self, user_id: str, *, limit: int | None = None, offset: int = 0) -> list[Notification]:
        query = (
            select(Notification)
            .where(Notification.recipient_id == user_id)
            .order_by(Notification.created_at.desc(), Notification.id.desc())
        )
        if offset > 0:
            query = query.offset(offset)
        if limit is not None:
            query = query.limit(limit)
        return list(self._session.scalars(query))

    def list_unread_for_user(self, user_id: str) -> list[Notification]:
        return list(
            self._session.scalars(
                select(Notification)
                .where(Notification.recipient_id == user_id, Notification.read_at.is_(None))
                .order_by(Notification.created_at.desc(), Notification.id.desc())
            )
        )

    def get_for_user(self, notification_id: str, user_id: str) -> Notification | None:
        return self._session.scalar(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.recipient_id == user_id,
            )
        )

    def list_assigned_staff_and_super_admin_ids(self, facility_id: str) -> list[str]:
        staff_ids = self._session.scalars(
            select(FacilityStaffAssignment.staff_id).where(FacilityStaffAssignment.facility_id == facility_id)
        )
        super_admin_ids = self._session.scalars(
            select(User.id).where(User.role == UserRole.super_admin, User.is_active.is_(True))
        )
        return list(dict.fromkeys([*staff_ids, *super_admin_ids]))
