import pytest
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.security import HTTPBearer

from app.api.http_application import AccountRouteDependencies
from app.api.http_application import BookingSettingRouteDependencies
from app.api.http_application import FacilityManagementRouteDependencies
from app.api.http_application import FacilityRouteDependencies
from app.api.http_application import HttpApplicationModule
from app.api.http_application import HttpRuntimeModule
from app.api.http_application import OrganizationUnitRouteDependencies
from app.api.http_application import ReservationRouteDependencies
from app.api.http_application import SystemStatusRouteDependencies
from app.core.settings import SettingsModule


async def placeholder_dependency():
    return None


def placeholder_require_access(action):
    async def dependency():
        return None

    return dependency


class StubHttpRuntimeDependencyRegistry:
    def __init__(self) -> None:
        self.schema_created = False
        self.session_factory = object()
        self.bearer_scheme = HTTPBearer(auto_error=False)

    def create_schema(self) -> None:
        self.schema_created = True

    def account_routes(self):
        return AccountRouteDependencies(
            get_bearer_credentials=self.bearer_scheme,
            get_user_accounts=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def facility_routes(self):
        return FacilityRouteDependencies(
            get_facility_catalog=placeholder_dependency,
            get_facility_availability=placeholder_dependency,
            get_reservation_time_selection=placeholder_dependency,
        )

    def reservation_routes(self):
        return ReservationRouteDependencies(
            get_reservations=placeholder_dependency,
            get_approval_letters=placeholder_dependency,
            get_payments=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def facility_management_routes(self):
        return FacilityManagementRouteDependencies(
            get_facility_management=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def organization_unit_routes(self):
        return OrganizationUnitRouteDependencies(
            get_organization_unit_management=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def booking_setting_routes(self):
        return BookingSettingRouteDependencies(
            get_booking_settings=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def system_status_routes(self):
        return SystemStatusRouteDependencies(
            get_system_status=placeholder_dependency,
            require_access=placeholder_require_access,
        )


@pytest.mark.anyio
async def test_http_runtime_module_translates_missing_credentials_to_http_error():
    runtime = HttpRuntimeModule(
        settings=SettingsModule(database_url="sqlite+pysqlite:///:memory:"),
        bearer_scheme=HTTPBearer(auto_error=False),
    )

    with pytest.raises(HTTPException) as exc_info:
        await runtime.get_current_user(credentials=None, user_accounts=None)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Autentikasi diperlukan."


def test_http_application_module_uses_runtime_dependency_registry_for_route_wiring():
    registry = StubHttpRuntimeDependencyRegistry()

    app = HttpApplicationModule(
        settings=SettingsModule(database_url="sqlite+pysqlite:///:memory:"),
        runtime_dependency_registry=registry,
    ).build()
    route_paths = {route.path for route in app.routes}

    assert registry.schema_created is True
    assert app.state.session_factory is registry.session_factory
    assert "/auth/login" in route_paths
    assert "/facilities/{facility_id}/reservations" in route_paths
    assert "/admin/system-status" in route_paths


def test_http_application_module_builds_app_with_foundation_routes():
    app = HttpApplicationModule(settings=SettingsModule(database_url="sqlite+pysqlite:///:memory:")).build()
    route_paths = {route.path for route in app.routes}

    assert isinstance(app, FastAPI)
    assert "/auth/register" in route_paths
    assert "/auth/login" in route_paths
    assert "/auth/refresh" in route_paths
    assert "/facilities" in route_paths
    assert "/facilities/{facility_id}" in route_paths
    assert "/facilities/{facility_id}/reservations" in route_paths
    assert "/student/reservations" in route_paths
    assert "/student/reservations/{reservation_id}" in route_paths
    assert "/admin/facilities/{facility_id}/staff-assignments/{staff_id}" in route_paths
    assert "/staff/facilities" in route_paths
    assert "/staff/facilities/{facility_id}" in route_paths
    assert "/staff/facilities/{facility_id}/images" in route_paths
    assert "/staff/facilities/{facility_id}/open-hours" in route_paths
    assert "/staff/facilities/{facility_id}/blackouts" in route_paths
    assert "/organization-units" in route_paths
    assert "/admin/users" in route_paths
    assert "/admin/organization-units" in route_paths
    assert "/admin/organization-units/{organization_unit_id}" in route_paths
    assert "/admin/organization-units/{organization_unit_id}/activate" in route_paths
    assert "/admin/organization-units/{organization_unit_id}/deactivate" in route_paths
    assert "/admin/system-status" in route_paths
    assert "/student/shell" in route_paths
    assert "/staff/shell" in route_paths
    assert "/admin/shell" in route_paths
    assert app.state.session_factory is not None
