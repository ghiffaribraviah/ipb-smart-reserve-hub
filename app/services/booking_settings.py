from dataclasses import asdict, dataclass, fields

from app.core.student_email_policy import (
    DEFAULT_ALLOWED_STUDENT_EMAIL_DOMAINS,
    normalize_allowed_student_email_domains,
)
from app.repositories.booking_settings_repository import BookingSettingsRepository


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
    def __init__(self, *, booking_settings_repository: BookingSettingsRepository, defaults: BookingSettings) -> None:
        self._booking_settings_repository = booking_settings_repository
        self._defaults = defaults

    def get_booking_settings(self) -> BookingSettings:
        stored_values = self._booking_settings_repository.load_booking_setting_values(BookingSettings.setting_keys())
        return BookingSettings(**(asdict(self._defaults) | stored_values))

    def update_booking_settings(self, booking_settings: BookingSettings) -> BookingSettings:
        self._booking_settings_repository.save_booking_setting_values(asdict(booking_settings))
        return self.get_booking_settings()
