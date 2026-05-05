from collections.abc import Callable
from datetime import UTC, datetime

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.access_policy import AccessDenied, AccessPolicyAction, AccessPolicyModule
from app.accounts import (
    AccountInactive,
    AccountTokenInvalid,
    UserAccount,
    UserAccountModule,
)
from app.account_routes import register_account_routes
from app.booking_setting_routes import register_booking_setting_routes
from app.booking_settings import BookingSettings
from app.database import Base, build_session_factory
from app.facility_routes import register_facility_routes
from app.organization_unit_routes import register_organization_unit_routes
from app.module_factories import (
    BookingSettingsModuleFactory,
    FacilityModuleFactory,
    OrganizationUnitModuleFactory,
    UserAccountModuleFactory,
)
from app.settings import SettingsModule


class HttpRuntimeModule:
    def __init__(
        self,
        *,
        settings: SettingsModule,
        bearer_scheme: HTTPBearer | None = None,
        clock: Callable[[], datetime] | None = None,
    ) -> None:
        self._settings = settings
        self._clock = clock or (lambda: datetime.now(UTC))
        self._default_booking_settings = BookingSettings.defaults(
            allowed_student_email_domains=self._settings.allowed_student_email_domains
        )
        self._user_account_factory = UserAccountModuleFactory(
            settings=self._settings,
            default_booking_settings=self._default_booking_settings,
        )
        self._facility_factory = FacilityModuleFactory(
            default_booking_settings=self._default_booking_settings,
            clock=self._clock,
        )
        self._organization_unit_factory = OrganizationUnitModuleFactory()
        self._booking_settings_factory = BookingSettingsModuleFactory(
            default_booking_settings=self._default_booking_settings
        )
        self._bearer_scheme = bearer_scheme or HTTPBearer(auto_error=False)
        self.session_factory = build_session_factory(self._settings.database_url)
        self.get_user_accounts = self._build_get_user_accounts()
        self.get_facility_catalog = self._build_get_facility_catalog()
        self.get_facility_availability = self._build_get_facility_availability()
        self.get_reservation_time_selection = self._build_get_reservation_time_selection()
        self.get_organization_unit_management = self._build_get_organization_unit_management()
        self.get_booking_settings = self._build_get_booking_settings()
        self.get_current_user = self._build_get_current_user()

    @property
    def bearer_scheme(self) -> HTTPBearer:
        return self._bearer_scheme

    async def get_session(self):
        session = self.session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    async def get_access_policy(self) -> AccessPolicyModule:
        return AccessPolicyModule()

    def _build_get_user_accounts(self):
        async def dependency(session: Session = Depends(self.get_session)) -> UserAccountModule:
            return self._user_account_factory.build(session)

        return dependency

    def _build_get_facility_catalog(self):
        async def dependency(session: Session = Depends(self.get_session)):
            return self._facility_factory.build_catalog(session)

        return dependency

    def _build_get_facility_availability(self):
        async def dependency(session: Session = Depends(self.get_session)):
            return self._facility_factory.build_availability(session)

        return dependency

    def _build_get_reservation_time_selection(self):
        async def dependency(session: Session = Depends(self.get_session)):
            return self._facility_factory.build_reservation_time_selection(session)

        return dependency

    def _build_get_organization_unit_management(self):
        async def dependency(session: Session = Depends(self.get_session)):
            return self._organization_unit_factory.build_management(session)

        return dependency

    def _build_get_booking_settings(self):
        async def dependency(session: Session = Depends(self.get_session)):
            return self._booking_settings_factory.build(session)

        return dependency

    def _build_get_current_user(self):
        async def dependency(
            credentials: HTTPAuthorizationCredentials | None = Depends(self._bearer_scheme),
            user_accounts: UserAccountModule | None = Depends(self.get_user_accounts),
        ) -> UserAccount:
            if credentials is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Autentikasi diperlukan.")
            if user_accounts is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Autentikasi diperlukan.")
            try:
                return user_accounts.resolve_active_user(credentials.credentials)
            except AccountTokenInvalid:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token tidak valid.")
            except AccountInactive:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Akun tidak aktif.")

        return dependency

    def require_access(self, action: AccessPolicyAction):
        async def dependency(
            current_user: UserAccount = Depends(self.get_current_user),
            access_policy: AccessPolicyModule = Depends(self.get_access_policy),
        ) -> UserAccount:
            try:
                return access_policy.require_action(current_user, action)
            except AccessDenied:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses role tidak diizinkan.")

        return dependency


class HttpApplicationModule:
    def __init__(self, *, settings: SettingsModule, clock: Callable[[], datetime] | None = None) -> None:
        self._settings = settings
        self._clock = clock

    def build(self) -> FastAPI:
        app = FastAPI(title="IPB Smart Reserve Hub")
        runtime = HttpRuntimeModule(settings=self._settings, clock=self._clock)
        Base.metadata.create_all(bind=runtime.session_factory.kw["bind"])
        register_account_routes(
            app,
            get_bearer_credentials=runtime.bearer_scheme,
            get_user_accounts=runtime.get_user_accounts,
            require_access=runtime.require_access,
        )
        register_facility_routes(
            app,
            get_facility_catalog=runtime.get_facility_catalog,
            get_facility_availability=runtime.get_facility_availability,
            get_reservation_time_selection=runtime.get_reservation_time_selection,
        )
        register_organization_unit_routes(
            app,
            get_organization_unit_management=runtime.get_organization_unit_management,
            require_access=runtime.require_access,
        )
        register_booking_setting_routes(
            app,
            get_booking_settings=runtime.get_booking_settings,
            require_access=runtime.require_access,
        )

        app.state.session_factory = runtime.session_factory
        return app
