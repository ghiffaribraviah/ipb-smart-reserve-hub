from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime

from app.models import Notification, Reservation
from app.repositories.notification_repository import NotificationRepository
from app.services.accounts import UserAccount


class NotificationNotFound(Exception):
    pass


@dataclass(frozen=True)
class UserNotification:
    id: str
    reservation_id: str | None
    title: str
    message: str
    created_at: datetime
    read_at: datetime | None


class NotificationModule:
    def __init__(
        self,
        *,
        notification_repository: NotificationRepository,
        clock: Callable[[], datetime],
    ) -> None:
        self._notification_repository = notification_repository
        self._clock = clock

    def list_notifications(self, user: UserAccount) -> list[UserNotification]:
        return [_to_user_notification(notification) for notification in self._notification_repository.list_for_user(user.id)]

    def mark_read(self, user: UserAccount, notification_id: str) -> UserNotification:
        notification = self._notification_repository.get_for_user(notification_id, user.id)
        if notification is None:
            raise NotificationNotFound
        if notification.read_at is None:
            notification.read_at = _as_utc(self._clock())
        return _to_user_notification(notification)

    def reservation_submitted(self, reservation: Reservation) -> None:
        self._create_student_notification(
            reservation,
            title="Reservasi diterima",
            message=f"Reservasi {reservation.activity_title} menunggu unggah surat persetujuan.",
        )

    def reservation_completed_by_deadline(self, reservation: Reservation) -> None:
        self._create_student_notification(
            reservation,
            title="Reservasi selesai",
            message=f"Reservasi {reservation.activity_title} sudah selesai.",
        )

    def reservation_expired_by_deadline(self, reservation: Reservation) -> None:
        self._create_student_notification(
            reservation,
            title="Reservasi kedaluwarsa",
            message=f"Reservasi {reservation.activity_title} kedaluwarsa karena melewati batas waktu.",
        )

    def reservation_overdue_verification_by_deadline(self, reservation: Reservation) -> None:
        self._create_student_notification(
            reservation,
            title="Verifikasi melewati batas waktu",
            message=(
                f"Reservasi {reservation.activity_title} membutuhkan tindak lanjut TU. "
                f"Hubungi {reservation.facility.contact_name} di {reservation.facility.contact_phone}."
            ),
        )

    def student_action_recorded(self, reservation: Reservation, *, title: str, message: str) -> None:
        self._create_student_notification(reservation, title=title, message=message)

    def staff_action_needed(self, reservation: Reservation, *, title: str, message: str) -> None:
        for recipient_id in self._notification_repository.list_assigned_staff_and_super_admin_ids(reservation.facility_id):
            self._notification_repository.add(
                Notification(
                    recipient_id=recipient_id,
                    reservation_id=reservation.id,
                    title=title,
                    message=message,
                    created_at=_as_utc(self._clock()),
                )
            )

    def _create_student_notification(self, reservation: Reservation, *, title: str, message: str) -> None:
        self._notification_repository.add(
            Notification(
                recipient_id=reservation.student_id,
                reservation_id=reservation.id,
                title=title,
                message=message,
                created_at=_as_utc(self._clock()),
            )
        )


def _to_user_notification(notification: Notification) -> UserNotification:
    return UserNotification(
        id=notification.id,
        reservation_id=notification.reservation_id,
        title=notification.title,
        message=notification.message,
        created_at=_as_utc(notification.created_at),
        read_at=_optional_utc(notification.read_at),
    )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _optional_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    return _as_utc(value)
