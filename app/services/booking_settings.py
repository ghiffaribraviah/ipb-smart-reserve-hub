import json
from dataclasses import asdict, dataclass, fields
from typing import Any

from sqlalchemy.orm import Session

from app.models import SystemSetting
from app.core.student_email_policy import (
    DEFAULT_ALLOWED_STUDENT_EMAIL_DOMAINS,
    normalize_allowed_student_email_domains,
)



class BookingSettingsError(Exception):
    pass


class InvalidBookingSettings(BookingSettingsError):
    def __init__(self, errors: list[str]) -> None:
        self.errors = errors
        super().__init__("; ".join(errors))


@dataclass(frozen=True)
class BookingSettings:
    min_booking_lead_hours: int = 336
    max_booking_advance_hours: int = 1440
    document_upload_due_hours: int = 72
    document_verification_due_hours: int = 48
    payment_upload_due_hours: int = 24
    payment_verification_due_hours: int = 24
    final_approval_cutoff_hours: int = 168
    overdue_final_approval_cutoff_hours: int = 96
    allowed_student_email_domains: tuple[str, ...] = DEFAULT_ALLOWED_STUDENT_EMAIL_DOMAINS

    @classmethod
    def defaults(
        cls,
        *,
        allowed_student_email_domains: tuple[str, ...] = DEFAULT_ALLOWED_STUDENT_EMAIL_DOMAINS,
    ) -> "BookingSettings":
        return cls(allowed_student_email_domains=allowed_student_email_domains)

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "allowed_student_email_domains",
            normalize_allowed_student_email_domains(self.allowed_student_email_domains),
        )
        self._validate()

    def _validate(self) -> None:
        errors: list[str] = []
        for field_name in (
            "min_booking_lead_hours",
            "max_booking_advance_hours",
            "document_upload_due_hours",
            "document_verification_due_hours",
            "payment_upload_due_hours",
            "payment_verification_due_hours",
            "final_approval_cutoff_hours",
            "overdue_final_approval_cutoff_hours",
        ):
            if getattr(self, field_name) <= 0:
                errors.append(f"{field_name} must be greater than 0")

        if not self.allowed_student_email_domains:
            errors.append("allowed_student_email_domains must contain at least one domain")

        if errors:
            raise InvalidBookingSettings(errors)

    @classmethod
    def setting_keys(cls) -> set[str]:
        return {field.name for field in fields(cls)}


class BookingSettingsModule:
    def __init__(self, *, session: Session, defaults: BookingSettings) -> None:
        self._session = session
        self._defaults = defaults

    def get_booking_settings(self) -> BookingSettings:
        setting_keys = BookingSettings.setting_keys()
        stored_values = {
            setting.key: self._decode(setting.value)
            for setting in self._session.query(SystemSetting).all()
            if setting.key in setting_keys
        }
        return BookingSettings(**(asdict(self._defaults) | stored_values))

    def update_booking_settings(self, booking_settings: BookingSettings) -> BookingSettings:
        for key, value in asdict(booking_settings).items():
            setting = self._session.get(SystemSetting, key)
            if setting is None:
                setting = SystemSetting(key=key, value=self._encode(value))
                self._session.add(setting)
            else:
                setting.value = self._encode(value)
        self._session.flush()
        return self.get_booking_settings()

    @staticmethod
    def _encode(value: Any) -> str:
        return json.dumps(value)

    @staticmethod
    def _decode(value: str) -> Any:
        decoded = json.loads(value)
        if isinstance(decoded, list):
            return tuple(decoded)
        return decoded
