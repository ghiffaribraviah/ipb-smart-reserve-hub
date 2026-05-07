from collections.abc import Callable

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.access_policy import AccessPolicyAction
from app.services.accounts import (
    AccountInactive,
    AccountTokenInvalid,
    AdminManagedUserCreation,
    EmailAlreadyRegistered,
    EmailDomainNotAllowed,
    InvalidCredentials,
    LoginCredentials,
    StudentMustSelfRegister,
    StudentRegistration,
    UserAccount,
    UserAccountModule,
)
from app.schemas.account_schemas import (
    AdminCreateUserRequest,
    LoginRequest,
    StudentRegistrationRequest,
    TokenResponse,
    UserResponse,
)


def register_account_routes(
    app: FastAPI,
    *,
    get_bearer_credentials: Callable,
    get_current_user: Callable,
    get_user_accounts: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.post("/auth/register", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
    async def register_student(
        payload: StudentRegistrationRequest,
        user_accounts: UserAccountModule = Depends(get_user_accounts),
    ) -> UserAccount:
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
        credentials: HTTPAuthorizationCredentials | None = Depends(get_bearer_credentials),
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

    @app.get("/auth/me", response_model=UserResponse)
    async def get_current_user_identity(
        current_user: UserAccount = Depends(get_current_user),
    ) -> UserAccount:
        return current_user

    @app.post("/admin/users", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
    async def create_admin_managed_user(
        payload: AdminCreateUserRequest,
        user_accounts: UserAccountModule = Depends(get_user_accounts),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_user_accounts)),
    ) -> UserAccount:
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
    async def student_shell(
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        return {"shell": "student", "email": current_user.email}

    @app.get("/staff/shell")
    async def staff_shell(current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_staff_shell))):
        return {"shell": "staff", "email": current_user.email}

    @app.get("/admin/shell")
    async def admin_shell(current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_admin_shell))):
        return {"shell": "admin", "email": current_user.email}
