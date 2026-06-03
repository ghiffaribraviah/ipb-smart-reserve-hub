from dataclasses import dataclass
from typing import Protocol

from app.core.security import (
    InvalidTokenError,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.core.student_email_policy import AllowedStudentEmailDomains
from app.models import User, UserRole
from app.repositories.user_repository import DuplicateUserEmail, UserRepository
from app.services.academic_profiles import AcademicProfile, AcademicProfileDeriver


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
    nim: str | None = None
    phone: str | None = None


@dataclass(frozen=True)
class AdminManagedUserUpdate:
    email: str
    full_name: str


@dataclass(frozen=True)
class AdminManagedPasswordReset:
    password: str


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
    nim: str | None = None
    phone: str | None = None
    academic_profile: AcademicProfile | None = None


@dataclass(frozen=True)
class UserAccountPage:
    items: list[UserAccount]
    total: int
    page: int
    page_size: int


class StudentEmailPolicy(Protocol):
    def allows(self, email: str) -> bool:
        raise NotImplementedError


class PasswordHasher(Protocol):
    def hash(self, password: str) -> str:
        raise NotImplementedError

    def verify(self, password: str, password_hash: str) -> bool:
        raise NotImplementedError


class AccountSessionCodec(Protocol):
    def issue(self, user_id: str) -> str:
        raise NotImplementedError

    def resolve_user_id(self, access_token: str) -> str:
        raise NotImplementedError


class SecurityPasswordHasher:
    def hash(self, password: str) -> str:
        return hash_password(password)

    def verify(self, password: str, password_hash: str) -> bool:
        return verify_password(password, password_hash)


class JwtAccountSessionCodec:
    def __init__(self, *, secret_key: str) -> None:
        self._secret_key = secret_key

    def issue(self, user_id: str) -> str:
        return create_access_token(user_id, self._secret_key)

    def resolve_user_id(self, access_token: str) -> str:
        return decode_access_token(access_token, self._secret_key)


class UserAccountError(Exception):
    pass


class EmailDomainNotAllowed(UserAccountError):
    pass


class EmailAlreadyRegistered(UserAccountError):
    pass


class StudentIdentityRequired(UserAccountError):
    pass


class InvalidCredentials(UserAccountError):
    pass


class AccountInactive(UserAccountError):
    pass


class AccountTokenInvalid(UserAccountError):
    pass


class ManagedUserNotFound(UserAccountError):
    pass


class ManagedUserReferenced(UserAccountError):
    pass


class UserAccountModule:
    def __init__(
        self,
        *,
        user_repository: UserRepository,
        secret_key: str,
        student_email_policy: StudentEmailPolicy,
        password_hasher: PasswordHasher | None = None,
        account_session_codec: AccountSessionCodec | None = None,
        academic_profile_deriver: AcademicProfileDeriver | None = None,
    ) -> None:
        self._user_repository = user_repository
        self._student_email_policy = student_email_policy
        self._password_hasher = password_hasher or SecurityPasswordHasher()
        self._account_session_codec = account_session_codec or JwtAccountSessionCodec(secret_key=secret_key)
        self._academic_profile_deriver = academic_profile_deriver or AcademicProfileDeriver()

    def register_student(self, registration: StudentRegistration) -> UserAccount:
        email = self._normalize_email(registration.email)
        if not self._student_email_policy.allows(email):
            raise EmailDomainNotAllowed

        user = User(
            email=email,
            password_hash=self._password_hasher.hash(registration.password),
            full_name=registration.full_name,
            role=UserRole.student,
            nim=registration.nim,
            phone=registration.phone,
        )
        return self._to_user_account(self._add_user(user))

    def create_admin_managed_user(self, creation: AdminManagedUserCreation) -> UserAccount:
        nim = creation.nim.strip() if creation.nim else None
        phone = creation.phone.strip() if creation.phone else None
        if creation.role == UserRole.student and (not nim or not phone):
            raise StudentIdentityRequired

        user = User(
            email=self._normalize_email(creation.email),
            password_hash=self._password_hasher.hash(creation.password),
            full_name=creation.full_name,
            role=creation.role,
            is_active=creation.is_active,
            nim=nim if creation.role == UserRole.student else None,
            phone=phone if creation.role == UserRole.student else None,
        )
        return self._to_user_account(self._add_user(user))

    def list_user_accounts(
        self,
        *,
        role: UserRole | None = None,
        is_active: bool | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> UserAccountPage:
        safe_page = max(page, 1)
        safe_page_size = min(max(page_size, 1), 100)
        users, total = self._user_repository.list_users(
            role=role,
            is_active=is_active,
            search=search,
            offset=(safe_page - 1) * safe_page_size,
            limit=safe_page_size,
        )
        return UserAccountPage(
            items=[self._to_user_account(user) for user in users],
            total=total,
            page=safe_page,
            page_size=safe_page_size,
        )

    def set_user_active_status(self, user_id: str, *, is_active: bool) -> UserAccount:
        user = self._user_repository.set_active_status(user_id, is_active=is_active)
        if user is None:
            raise ManagedUserNotFound
        return self._to_user_account(user)

    def update_admin_managed_user(self, user_id: str, update: AdminManagedUserUpdate) -> UserAccount:
        try:
            user = self._user_repository.update_basic_profile(
                user_id,
                email=self._normalize_email(update.email),
                full_name=update.full_name.strip(),
            )
        except DuplicateUserEmail as exc:
            raise EmailAlreadyRegistered from exc
        if user is None:
            raise ManagedUserNotFound
        return self._to_user_account(user)

    def reset_admin_managed_user_password(self, user_id: str, reset: AdminManagedPasswordReset) -> UserAccount:
        user = self._user_repository.reset_password(
            user_id,
            password_hash=self._password_hasher.hash(reset.password),
        )
        if user is None:
            raise ManagedUserNotFound
        return self._to_user_account(user)

    def delete_admin_managed_user(self, user_id: str) -> None:
        if self._user_repository.user_has_references(user_id):
            raise ManagedUserReferenced
        user = self._user_repository.delete_user(user_id)
        if user is None:
            raise ManagedUserNotFound

    def login(self, credentials: LoginCredentials) -> AccountSession:
        user = self._user_repository.find_by_email(self._normalize_email(credentials.email))
        if user is None or not self._password_hasher.verify(credentials.password, user.password_hash):
            raise InvalidCredentials
        if not user.is_active:
            raise AccountInactive

        return self._issue_session(user)

    def refresh_session(self, access_token: str) -> AccountSession:
        user = self.resolve_active_user(access_token)
        return self._issue_session(user)

    def resolve_active_user(self, access_token: str) -> UserAccount:
        try:
            user_id = self._account_session_codec.resolve_user_id(access_token)
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
        return AccountSession(access_token=self._account_session_codec.issue(user.id))

    def _to_user_account(self, user: User) -> UserAccount:
        nim = user.nim if user.role == UserRole.student else None
        phone = user.phone if user.role == UserRole.student else None
        return UserAccount(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            nim=nim,
            phone=phone,
            academic_profile=self._academic_profile_deriver.derive(nim) if user.role == UserRole.student else None,
        )

    def _normalize_email(self, email: str) -> str:
        return email.lower().strip()
