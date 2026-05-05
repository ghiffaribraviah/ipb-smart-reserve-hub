from dataclasses import dataclass


DEFAULT_ALLOWED_STUDENT_EMAIL_DOMAINS = ("apps.ipb.ac.id",)


def normalize_allowed_student_email_domains(domains: tuple[str, ...]) -> tuple[str, ...]:
    return tuple(domain.strip().lower() for domain in domains if domain.strip())


@dataclass(frozen=True)
class AllowedStudentEmailDomains:
    domains: tuple[str, ...]

    def __post_init__(self) -> None:
        object.__setattr__(self, "domains", normalize_allowed_student_email_domains(self.domains))

    def allows(self, email: str) -> bool:
        normalized_email = email.lower().strip()
        email_domain = normalized_email.rsplit("@", 1)[-1] if "@" in normalized_email else ""
        return email_domain in self.domains
