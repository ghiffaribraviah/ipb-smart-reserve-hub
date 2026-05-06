from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Protocol

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.access_policy import AccessDenied, AccessPolicyAction, AccessPolicyModule
from app.services.accounts import (
    AccountInactive,
    AccountTokenInvalid,
    UserAccount,
    UserAccountModule,
)
from app.api.routes.account_routes import register_account_routes
from app.api.routes.booking_setting_routes import register_booking_setting_routes
from app.services.booking_settings import BookingSettings
from app.core.database import Base, build_session_factory
from app.api.routes.facility_management_routes import register_facility_management_routes
from app.api.routes.facility_routes import register_facility_routes
from app.api.routes.organization_unit_routes import register_organization_unit_routes
from app.api.routes.reservation_routes import register_reservation_routes
from app.api.routes.system_status_routes import register_system_status_routes
from app.core.module_factories import (
    BookingSettingsModuleFactory,
    FacilityModuleFactory,
    OrganizationUnitModuleFactory,
    SystemStatusModuleFactory,
    UserAccountModuleFactory,
)
from app.core.settings import SettingsModule
from app.storage import InMemoryPrivateStorage


@dataclass(frozen=True)
class AccountRouteDependencies:
    get_bearer_credentials: Callable
    get_user_accounts: Callable
    require_access: Callable[[AccessPolicyAction], Callable]


@dataclass(frozen=True)
class FacilityRouteDependencies:
    get_facility_catalog: Callable
    get_facility_availability: Callable
    get_reservation_time_selection: Callable


@dataclass(frozen=True)
class ReservationRouteDependencies:
    get_reservations: Callable
    get_approval_letters: Callable
    require_access: Callable[[AccessPolicyAction], Callable]


@dataclass(frozen=True)
class FacilityManagementRouteDependencies:
    get_facility_management: Callable
    require_access: Callable[[AccessPolicyAction], Callable]


@dataclass(frozen=True)
class OrganizationUnitRouteDependencies:
    get_organization_unit_management: Callable
    require_access: Callable[[AccessPolicyAction], Callable]


@dataclass(frozen=True)
class BookingSettingRouteDependencies:
    get_booking_settings: Callable
    require_access: Callable[[AccessPolicyAction], Callable]


@dataclass(frozen=True)
class SystemStatusRouteDependencies:
    get_system_status: Callable
    require_access: Callable[[AccessPolicyAction], Callable]


class HttpRuntimeDependencyRegistry(Protocol):
    session_factory: Callable

    def create_schema(self) -> None:
        raise NotImplementedError

    def account_routes(self) -> AccountRouteDependencies:
        raise NotImplementedError

    def facility_routes(self) -> FacilityRouteDependencies:
        raise NotImplementedError

    def reservation_routes(self) -> ReservationRouteDependencies:
        raise NotImplementedError

    def facility_management_routes(self) -> FacilityManagementRouteDependencies:
        raise NotImplementedError

    def organization_unit_routes(self) -> OrganizationUnitRouteDependencies:
        raise NotImplementedError

    def booking_setting_routes(self) -> BookingSettingRouteDependencies:
        raise NotImplementedError

    def system_status_routes(self) -> SystemStatusRouteDependencies:
        raise NotImplementedError


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
        self._private_storage = InMemoryPrivateStorage()
        self._user_account_factory = UserAccountModuleFactory(
            settings=self._settings,
            default_booking_settings=self._default_booking_settings,
        )
        self._facility_factory = FacilityModuleFactory(
            default_booking_settings=self._default_booking_settings,
            clock=self._clock,
            private_storage=self._private_storage,
        )
        self._organization_unit_factory = OrganizationUnitModuleFactory()
        self._booking_settings_factory = BookingSettingsModuleFactory(
            default_booking_settings=self._default_booking_settings
        )
        self._system_status_factory = SystemStatusModuleFactory()
        self._bearer_scheme = bearer_scheme or HTTPBearer(auto_error=False)
        self.session_factory = build_session_factory(self._settings.database_url)
        self.get_user_accounts = self._build_get_user_accounts()
        self.get_facility_catalog = self._build_get_facility_catalog()
        self.get_facility_availability = self._build_get_facility_availability()
        self.get_reservation_time_selection = self._build_get_reservation_time_selection()
        self.get_reservations = self._build_get_reservations()
        self.get_approval_letters = self._build_get_approval_letters()
        self.get_facility_management = self._build_get_facility_management()
        self.get_organization_unit_management = self._build_get_organization_unit_management()
        self.get_booking_settings = self._build_get_booking_settings()
        self.get_system_status = self._build_get_system_status()
        self.get_current_user = self._build_get_current_user()

    @property
    def bearer_scheme(self) -> HTTPBearer:
        return self._bearer_scheme

    def create_schema(self) -> None:
        Base.metadata.create_all(bind=self.session_factory.kw["bind"])

    def account_routes(self) -> AccountRouteDependencies:
        return AccountRouteDependencies(
            get_bearer_credentials=self.bearer_scheme,
            get_user_accounts=self.get_user_accounts,
            require_access=self.require_access,
        )

    def facility_routes(self) -> FacilityRouteDependencies:
        return FacilityRouteDependencies(
            get_facility_catalog=self.get_facility_catalog,
            get_facility_availability=self.get_facility_availability,
            get_reservation_time_selection=self.get_reservation_time_selection,
        )

    def reservation_routes(self) -> ReservationRouteDependencies:
        return ReservationRouteDependencies(
            get_reservations=self.get_reservations,
            get_approval_letters=self.get_approval_letters,
            require_access=self.require_access,
        )

    def facility_management_routes(self) -> FacilityManagementRouteDependencies:
        return FacilityManagementRouteDependencies(
            get_facility_management=self.get_facility_management,
            require_access=self.require_access,
        )

    def organization_unit_routes(self) -> OrganizationUnitRouteDependencies:
        return OrganizationUnitRouteDependencies(
            get_organization_unit_management=self.get_organization_unit_management,
            require_access=self.require_access,
        )

    def booking_setting_routes(self) -> BookingSettingRouteDependencies:
        return BookingSettingRouteDependencies(
            get_booking_settings=self.get_booking_settings,
            require_access=self.require_access,
        )

    def system_status_routes(self) -> SystemStatusRouteDependencies:
        return SystemStatusRouteDependencies(
            get_system_status=self.get_system_status,
            require_access=self.require_access,
        )

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

    def _build_get_reservations(self):
        async def dependency(session: Session = Depends(self.get_session)):
            return self._facility_factory.build_reservations(session)

        return dependency

    def _build_get_approval_letters(self):
        async def dependency(session: Session = Depends(self.get_session)):
            return self._facility_factory.build_approval_letters(session)

        return dependency

    def _build_get_facility_management(self):
        async def dependency(session: Session = Depends(self.get_session)):
            return self._facility_factory.build_management(session)

        return dependency

    def _build_get_organization_unit_management(self):
        async def dependency(session: Session = Depends(self.get_session)):
            return self._organization_unit_factory.build_management(session)

        return dependency

    def _build_get_booking_settings(self):
        async def dependency(session: Session = Depends(self.get_session)):
            return self._booking_settings_factory.build(session)

        return dependency

    def _build_get_system_status(self):
        async def dependency(session: Session = Depends(self.get_session)):
            return self._system_status_factory.build(session)

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
    def __init__(
        self,
        *,
        settings: SettingsModule,
        clock: Callable[[], datetime] | None = None,
        runtime_dependency_registry: HttpRuntimeDependencyRegistry | None = None,
    ) -> None:
        self._settings = settings
        self._clock = clock
        self._runtime_dependency_registry = runtime_dependency_registry

    def build(self) -> FastAPI:
        app = FastAPI(title="IPB Smart Reserve Hub")
        runtime = self._runtime_dependency_registry or HttpRuntimeModule(settings=self._settings, clock=self._clock)
        runtime.create_schema()
        account_dependencies = runtime.account_routes()
        register_account_routes(
            app,
            get_bearer_credentials=account_dependencies.get_bearer_credentials,
            get_user_accounts=account_dependencies.get_user_accounts,
            require_access=account_dependencies.require_access,
        )
        facility_dependencies = runtime.facility_routes()
        register_facility_routes(
            app,
            get_facility_catalog=facility_dependencies.get_facility_catalog,
            get_facility_availability=facility_dependencies.get_facility_availability,
            get_reservation_time_selection=facility_dependencies.get_reservation_time_selection,
        )
        reservation_dependencies = runtime.reservation_routes()
        register_reservation_routes(
            app,
            get_reservations=reservation_dependencies.get_reservations,
            get_approval_letters=reservation_dependencies.get_approval_letters,
            require_access=reservation_dependencies.require_access,
        )
        facility_management_dependencies = runtime.facility_management_routes()
        register_facility_management_routes(
            app,
            get_facility_management=facility_management_dependencies.get_facility_management,
            require_access=facility_management_dependencies.require_access,
        )
        organization_unit_dependencies = runtime.organization_unit_routes()
        register_organization_unit_routes(
            app,
            get_organization_unit_management=organization_unit_dependencies.get_organization_unit_management,
            require_access=organization_unit_dependencies.require_access,
        )
        booking_setting_dependencies = runtime.booking_setting_routes()
        register_booking_setting_routes(
            app,
            get_booking_settings=booking_setting_dependencies.get_booking_settings,
            require_access=booking_setting_dependencies.require_access,
        )
        system_status_dependencies = runtime.system_status_routes()
        register_system_status_routes(
            app,
            get_system_status=system_status_dependencies.get_system_status,
            require_access=system_status_dependencies.require_access,
        )

        app.state.session_factory = runtime.session_factory
        return app
