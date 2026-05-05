from dataclasses import dataclass
from typing import Protocol

from app.models import User, UserRole
from app.security import (
    InvalidTokenError,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.user_repository import DuplicateUserEmail, UserRepository


@dataclass(frozen=True)
class StudentRegistration:
    email: str
    password: str
    full_name: str
    nim: str
    phone: str


@dataclass(frozen=True)
class AdminManagedUserCreation:
    email: str
    password: str
    full_name: str
    role: UserRole
    is_active: bool = True


@dataclass(frozen=True)
class LoginCredentials:
    email: str
    password: str


@dataclass(frozen=True)
class AccountSession:
    access_token: str


@dataclass(frozen=True)
class UserAccount:
    id: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool


class StudentEmailPolicy(Protocol):
    def allows(self, email: str) -> bool:
        raise NotImplementedError


@dataclass(frozen=True)
class AllowedStudentEmailDomains:
    domains: tuple[str, ...]

    def __post_init__(self) -> None:
        object.__setattr__(self, "domains", tuple(domain.strip().lower() for domain in self.domains if domain.strip()))

    def allows(self, email: str) -> bool:
        normalized_email = email.lower().strip()
        email_domain = normalized_email.rsplit("@", 1)[-1] if "@" in normalized_email else ""
        return email_domain in self.domains


class UserAccountError(Exception):
    pass


class EmailDomainNotAllowed(UserAccountError):
    pass


class EmailAlreadyRegistered(UserAccountError):
    pass


class StudentMustSelfRegister(UserAccountError):
    pass


class InvalidCredentials(UserAccountError):
    pass


class AccountInactive(UserAccountError):
    pass


class AccountTokenInvalid(UserAccountError):
    pass


class UserAccountModule:
    def __init__(
        self,
        *,
        user_repository: UserRepository,
        secret_key: str,
        student_email_policy: StudentEmailPolicy,
    ) -> None:
        self._user_repository = user_repository
        self._secret_key = secret_key
        self._student_email_policy = student_email_policy

    def register_student(self, registration: StudentRegistration) -> UserAccount:
        email = self._normalize_email(registration.email)
        if not self._student_email_policy.allows(email):
            raise EmailDomainNotAllowed

        user = User(
            email=email,
            password_hash=hash_password(registration.password),
            full_name=registration.full_name,
            role=UserRole.student,
            nim=registration.nim,
            phone=registration.phone,
        )
        return self._to_user_account(self._add_user(user))

    def create_admin_managed_user(self, creation: AdminManagedUserCreation) -> UserAccount:
        if creation.role == UserRole.student:
            raise StudentMustSelfRegister

        user = User(
            email=self._normalize_email(creation.email),
            password_hash=hash_password(creation.password),
            full_name=creation.full_name,
            role=creation.role,
            is_active=creation.is_active,
        )
        return self._to_user_account(self._add_user(user))

    def login(self, credentials: LoginCredentials) -> AccountSession:
        user = self._user_repository.find_by_email(self._normalize_email(credentials.email))
        if user is None or not verify_password(credentials.password, user.password_hash):
            raise InvalidCredentials
        if not user.is_active:
            raise AccountInactive

        return self._issue_session(user)

    def refresh_session(self, access_token: str) -> AccountSession:
        user = self.resolve_active_user(access_token)
        return self._issue_session(user)

    def resolve_active_user(self, access_token: str) -> UserAccount:
        try:
            user_id = decode_access_token(access_token, self._secret_key)
        except InvalidTokenError as exc:
            raise AccountTokenInvalid from exc

        user = self._user_repository.get_by_id(user_id)
        if user is None or not user.is_active:
            raise AccountInactive
        return self._to_user_account(user)

    def _add_user(self, user: User) -> User:
        try:
            return self._user_repository.add(user)
        except DuplicateUserEmail as exc:
            raise EmailAlreadyRegistered from exc

    def _issue_session(self, user: User | UserAccount) -> AccountSession:
        return AccountSession(access_token=create_access_token(user.id, self._secret_key))

    def _to_user_account(self, user: User) -> UserAccount:
        return UserAccount(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
        )

    def _normalize_email(self, email: str) -> str:
        return email.lower().strip()
