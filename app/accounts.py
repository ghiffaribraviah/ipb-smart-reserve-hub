from dataclasses import dataclass

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
        allowed_student_email_domains: tuple[str, ...],
    ) -> None:
        self._user_repository = user_repository
        self._secret_key = secret_key
        self._allowed_student_email_domains = allowed_student_email_domains

    def register_student(self, registration: StudentRegistration) -> User:
        email = self._normalize_email(registration.email)
        if self._email_domain(email) not in self._allowed_student_email_domains:
            raise EmailDomainNotAllowed

        user = User(
            email=email,
            password_hash=hash_password(registration.password),
            full_name=registration.full_name,
            role=UserRole.student,
            nim=registration.nim,
            phone=registration.phone,
        )
        return self._add_user(user)

    def create_admin_managed_user(self, creation: AdminManagedUserCreation) -> User:
        if creation.role == UserRole.student:
            raise StudentMustSelfRegister

        user = User(
            email=self._normalize_email(creation.email),
            password_hash=hash_password(creation.password),
            full_name=creation.full_name,
            role=creation.role,
            is_active=creation.is_active,
        )
        return self._add_user(user)

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

    def resolve_active_user(self, access_token: str) -> User:
        try:
            user_id = decode_access_token(access_token, self._secret_key)
        except InvalidTokenError as exc:
            raise AccountTokenInvalid from exc

        user = self._user_repository.get_by_id(user_id)
        if user is None or not user.is_active:
            raise AccountInactive
        return user

    def _add_user(self, user: User) -> User:
        try:
            return self._user_repository.add(user)
        except DuplicateUserEmail as exc:
            raise EmailAlreadyRegistered from exc

    def _issue_session(self, user: User) -> AccountSession:
        return AccountSession(access_token=create_access_token(user.id, self._secret_key))

    def _normalize_email(self, email: str) -> str:
        return email.lower().strip()

    def _email_domain(self, email: str) -> str:
        return email.rsplit("@", 1)[-1] if "@" in email else ""
