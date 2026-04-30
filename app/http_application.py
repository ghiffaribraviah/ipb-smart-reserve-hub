from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.access_policy import AccessDenied, AccessPolicyModule
from app.accounts import (
    AccountInactive,
    AccountTokenInvalid,
    UserAccountModule,
)
from app.account_routes import register_account_routes
from app.database import Base, build_session_factory
from app.facilities import FacilityCatalogModule
from app.facility_repository import SqlAlchemyFacilityRepository
from app.facility_routes import register_facility_routes
from app.models import User, UserRole
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

        async def get_facility_catalog(session: Session = Depends(get_session)) -> FacilityCatalogModule:
            return FacilityCatalogModule(facility_repository=SqlAlchemyFacilityRepository(session))

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

        register_account_routes(
            app,
            get_bearer_credentials=self._bearer_scheme,
            get_user_accounts=get_user_accounts,
            require_role=require_role,
        )
        register_facility_routes(app, get_facility_catalog=get_facility_catalog)

        app.state.session_factory = session_factory
        return app
