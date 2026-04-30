from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.access_policy import AccessDenied, AccessPolicyModule
from app.accounts import (
    AccountInactive,
    AccountTokenInvalid,
    AdminManagedUserCreation,
    EmailAlreadyRegistered,
    EmailDomainNotAllowed,
    InvalidCredentials,
    LoginCredentials,
    StudentMustSelfRegister,
    StudentRegistration,
    UserAccountModule,
)
from app.database import Base, build_session_factory
from app.models import User, UserRole
from app.schemas import AdminCreateUserRequest, LoginRequest, StudentRegistrationRequest, TokenResponse, UserResponse
from app.settings import SettingsModule
from app.user_repository import SqlAlchemyUserRepository


class HttpApplicationModule:
    def __init__(self, *, settings: SettingsModule) -> None:
        self._settings = settings
        self._bearer_scheme = HTTPBearer(auto_error=False)

    def build(self) -> FastAPI:
        app = FastAPI(title="IPB Smart Reserve Hub")
        session_factory = build_session_factory(self._settings.database_url)
        Base.metadata.create_all(bind=session_factory.kw["bind"])

        async def get_session():
            session = session_factory()
            try:
                yield session
                session.commit()
            except Exception:
                session.rollback()
                raise
            finally:
                session.close()

        async def get_user_accounts(session: Session = Depends(get_session)) -> UserAccountModule:
            return UserAccountModule(
                user_repository=SqlAlchemyUserRepository(session),
                secret_key=self._settings.secret_key,
                allowed_student_email_domains=self._settings.allowed_student_email_domains,
            )

        async def get_access_policy() -> AccessPolicyModule:
            return AccessPolicyModule()

        async def get_current_user(
            credentials: HTTPAuthorizationCredentials | None = Depends(self._bearer_scheme),
            user_accounts: UserAccountModule = Depends(get_user_accounts),
        ) -> User:
            if credentials is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Autentikasi diperlukan.")
            try:
                return user_accounts.resolve_active_user(credentials.credentials)
            except AccountTokenInvalid:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token tidak valid.")
            except AccountInactive:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Akun tidak aktif.")

        def require_role(role: UserRole):
            async def dependency(
                current_user: User = Depends(get_current_user),
                access_policy: AccessPolicyModule = Depends(get_access_policy),
            ) -> User:
                try:
                    return access_policy.require_role(current_user, role)
                except AccessDenied:
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses role tidak diizinkan.")

            return dependency

        @app.post("/auth/register", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
        async def register_student(
            payload: StudentRegistrationRequest,
            user_accounts: UserAccountModule = Depends(get_user_accounts),
        ) -> User:
            try:
                return user_accounts.register_student(
                    StudentRegistration(
                        email=payload.email,
                        password=payload.password,
                        full_name=payload.full_name,
                        nim=payload.nim,
                        phone=payload.phone,
                    )
                )
            except EmailDomainNotAllowed:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email harus menggunakan domain institusi yang diizinkan.",
                )
            except EmailAlreadyRegistered:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email sudah terdaftar.")

        @app.post("/auth/login", response_model=TokenResponse)
        async def login(
            payload: LoginRequest,
            user_accounts: UserAccountModule = Depends(get_user_accounts),
        ) -> TokenResponse:
            try:
                account_session = user_accounts.login(LoginCredentials(email=payload.email, password=payload.password))
            except InvalidCredentials:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email atau password salah.")
            except AccountInactive:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Akun tidak aktif.")
            return TokenResponse(access_token=account_session.access_token)

        @app.post("/auth/refresh", response_model=TokenResponse)
        async def refresh_session(
            credentials: HTTPAuthorizationCredentials | None = Depends(self._bearer_scheme),
            user_accounts: UserAccountModule = Depends(get_user_accounts),
        ) -> TokenResponse:
            if credentials is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Autentikasi diperlukan.")
            try:
                account_session = user_accounts.refresh_session(credentials.credentials)
            except AccountTokenInvalid:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token tidak valid.")
            except AccountInactive:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Akun tidak aktif.")
            return TokenResponse(access_token=account_session.access_token)

        @app.post("/admin/users", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
        async def create_admin_managed_user(
            payload: AdminCreateUserRequest,
            user_accounts: UserAccountModule = Depends(get_user_accounts),
            _: User = Depends(require_role(UserRole.super_admin)),
        ) -> User:
            try:
                return user_accounts.create_admin_managed_user(
                    AdminManagedUserCreation(
                        email=payload.email,
                        password=payload.password,
                        full_name=payload.full_name,
                        role=payload.role,
                        is_active=payload.is_active,
                    )
                )
            except StudentMustSelfRegister:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Akun mahasiswa dibuat melalui registrasi mandiri.",
                )
            except EmailAlreadyRegistered:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email sudah terdaftar.")

        @app.get("/student/shell")
        async def student_shell(current_user: User = Depends(require_role(UserRole.student))):
            return {"shell": "student", "email": current_user.email}

        @app.get("/staff/shell")
        async def staff_shell(current_user: User = Depends(require_role(UserRole.staff))):
            return {"shell": "staff", "email": current_user.email}

        @app.get("/admin/shell")
        async def admin_shell(current_user: User = Depends(require_role(UserRole.super_admin))):
            return {"shell": "admin", "email": current_user.email}

        app.state.session_factory = session_factory
        return app
