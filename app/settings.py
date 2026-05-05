import os
from collections.abc import Mapping
from dataclasses import dataclass


DEFAULT_DATABASE_URL = "sqlite+pysqlite:///./ipb_smart_reserve_hub.db"
DEFAULT_SECRET_KEY = "dev-secret-change-me"
DEFAULT_ALLOWED_STUDENT_EMAIL_DOMAINS = ("apps.ipb.ac.id",)


def normalize_allowed_student_email_domains(domains: tuple[str, ...]) -> tuple[str, ...]:
    return tuple(domain.strip().lower() for domain in domains if domain.strip())


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

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "allowed_student_email_domains",
            normalize_allowed_student_email_domains(self.allowed_student_email_domains),
        )


@dataclass(frozen=True)
class SettingsModule:
    database_url: str = DEFAULT_DATABASE_URL
    secret_key: str = DEFAULT_SECRET_KEY
    allowed_student_email_domains: tuple[str, ...] = DEFAULT_ALLOWED_STUDENT_EMAIL_DOMAINS

    @property
    def booking_settings(self) -> BookingSettings:
        return BookingSettings(allowed_student_email_domains=self.allowed_student_email_domains)

    @classmethod
    def from_environment(cls, environ: Mapping[str, str] | None = None) -> "SettingsModule":
        source = environ if environ is not None else os.environ
        return cls(
            database_url=source.get("IPB_DATABASE_URL", DEFAULT_DATABASE_URL),
            secret_key=source.get("IPB_SECRET_KEY", DEFAULT_SECRET_KEY),
            allowed_student_email_domains=cls._parse_allowed_domains(
                source.get("IPB_ALLOWED_STUDENT_EMAIL_DOMAINS")
            ),
        )

    def with_overrides(
        self,
        *,
        database_url: str | None = None,
        secret_key: str | None = None,
        allowed_student_email_domains: tuple[str, ...] | None = None,
    ) -> "SettingsModule":
        return SettingsModule(
            database_url=database_url or self.database_url,
            secret_key=secret_key or self.secret_key,
            allowed_student_email_domains=self._normalize_allowed_domains(
                allowed_student_email_domains or self.allowed_student_email_domains
            ),
        )

    @staticmethod
    def _parse_allowed_domains(raw_domains: str | None) -> tuple[str, ...]:
        if raw_domains is None:
            return DEFAULT_ALLOWED_STUDENT_EMAIL_DOMAINS
        return SettingsModule._normalize_allowed_domains(tuple(raw_domains.split(",")))

    @staticmethod
    def _normalize_allowed_domains(domains: tuple[str, ...]) -> tuple[str, ...]:
        return normalize_allowed_student_email_domains(domains)
