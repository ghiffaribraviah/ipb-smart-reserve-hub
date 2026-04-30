import os
from collections.abc import Mapping
from dataclasses import dataclass


DEFAULT_DATABASE_URL = "sqlite+pysqlite:///./ipb_smart_reserve_hub.db"
DEFAULT_SECRET_KEY = "dev-secret-change-me"
DEFAULT_ALLOWED_STUDENT_EMAIL_DOMAINS = ("apps.ipb.ac.id", "ipb.ac.id")


@dataclass(frozen=True)
class SettingsModule:
    database_url: str = DEFAULT_DATABASE_URL
    secret_key: str = DEFAULT_SECRET_KEY
    allowed_student_email_domains: tuple[str, ...] = DEFAULT_ALLOWED_STUDENT_EMAIL_DOMAINS

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
        return tuple(domain.strip().lower() for domain in domains if domain.strip())
