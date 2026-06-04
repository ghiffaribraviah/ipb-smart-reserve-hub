from collections.abc import Callable

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.access_policy import AccessPolicyAction
from app.services.accounts import (
    AccountInactive,
    AccountTokenInvalid,
    AdminManagedUserCreation,
    AdminManagedPasswordReset,
    AdminManagedUserUpdate,
    EmailAlreadyRegistered,
    EmailDomainNotAllowed,
    InvalidCredentials,
    LoginCredentials,
    ManagedUserReferenced,
    ManagedUserNotFound,
    StudentIdentityRequired,
    StudentRegistration,
    UserAccount,
    UserAccountModule,
)
from app.services.audit_logs import AuditLogModule
from app.schemas.account_schemas import (
    AdminCreateUserRequest,
    AdminResetPasswordRequest,
    AdminUpdateUserRequest,
    LoginRequest,
    StudentRegistrationRequest,
    TokenResponse,
    UserListResponse,
    UserResponse,
)
from app.models import UserRole


def register_account_routes(
    app: FastAPI,
    *,
    get_audit_logs: Callable,
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
        audit_logs: AuditLogModule = Depends(get_audit_logs),
        user_accounts: UserAccountModule = Depends(get_user_accounts),
    ) -> TokenResponse:
        try:
            account_session = user_accounts.login(LoginCredentials(email=payload.email, password=payload.password))
        except InvalidCredentials:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email atau password salah.")
        except AccountInactive:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Akun tidak aktif.")
        actor = user_accounts.resolve_active_user(account_session.access_token)
        audit_logs.record(
            actor=actor,
            action_type="auth.login",
            target_type="endpoint",
            target_id="POST /auth/login",
        )
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

    @app.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
    async def logout(
        current_user: UserAccount = Depends(get_current_user),
        audit_logs: AuditLogModule = Depends(get_audit_logs),
    ) -> None:
        audit_logs.record(
            actor=current_user,
            action_type="auth.logout",
            target_type="endpoint",
            target_id="POST /auth/logout",
        )

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
                    nim=payload.nim,
                    phone=payload.phone,
                )
            )
        except StudentIdentityRequired:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="NIM dan nomor telepon wajib diisi untuk akun mahasiswa.",
            )
        except EmailAlreadyRegistered:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email sudah terdaftar.")

    @app.get("/admin/users", response_model=UserListResponse)
    async def list_admin_managed_users(
        role: UserRole | None = None,
        is_active: bool | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 50,
        user_accounts: UserAccountModule = Depends(get_user_accounts),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_user_accounts)),
    ):
        return user_accounts.list_user_accounts(
            role=role,
            is_active=is_active,
            search=search,
            page=page,
            page_size=page_size,
        )

    @app.post("/admin/users/{user_id}/deactivate", response_model=UserResponse)
    async def deactivate_admin_managed_user(
        user_id: str,
        user_accounts: UserAccountModule = Depends(get_user_accounts),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_user_accounts)),
    ) -> UserAccount:
        try:
            return user_accounts.set_user_active_status(user_id, is_active=False)
        except ManagedUserNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")

    @app.post("/admin/users/{user_id}/activate", response_model=UserResponse)
    async def activate_admin_managed_user(
        user_id: str,
        user_accounts: UserAccountModule = Depends(get_user_accounts),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_user_accounts)),
    ) -> UserAccount:
        try:
            return user_accounts.set_user_active_status(user_id, is_active=True)
        except ManagedUserNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")

    @app.patch("/admin/users/{user_id}", response_model=UserResponse)
    async def update_admin_managed_user(
        user_id: str,
        payload: AdminUpdateUserRequest,
        user_accounts: UserAccountModule = Depends(get_user_accounts),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_user_accounts)),
    ) -> UserAccount:
        try:
            return user_accounts.update_admin_managed_user(
                user_id,
                AdminManagedUserUpdate(email=payload.email, full_name=payload.full_name),
            )
        except ManagedUserNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")
        except EmailAlreadyRegistered:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email sudah terdaftar.")

    @app.post("/admin/users/{user_id}/reset-password", response_model=UserResponse)
    async def reset_admin_managed_user_password(
        user_id: str,
        payload: AdminResetPasswordRequest,
        user_accounts: UserAccountModule = Depends(get_user_accounts),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_user_accounts)),
    ) -> UserAccount:
        try:
            return user_accounts.reset_admin_managed_user_password(
                user_id,
                AdminManagedPasswordReset(password=payload.password),
            )
        except ManagedUserNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")

    @app.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_admin_managed_user(
        user_id: str,
        user_accounts: UserAccountModule = Depends(get_user_accounts),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_user_accounts)),
    ) -> None:
        try:
            user_accounts.delete_admin_managed_user(user_id)
        except ManagedUserNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")
        except ManagedUserReferenced:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Pengguna masih dipakai data lain dan tidak dapat dihapus.",
            )

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
