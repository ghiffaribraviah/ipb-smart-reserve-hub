import pytest
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.security import HTTPBearer

from app.api.http_application import AccountRouteDependencies
from app.api.http_application import ApprovalLetterRouteDependencies
from app.api.http_application import AuditLogRouteDependencies
from app.api.http_application import BookingSettingRouteDependencies
from app.api.http_application import FacilityManagementRouteDependencies
from app.api.http_application import FacilityRouteDependencies
from app.api.http_application import HttpApplicationModule
from app.api.http_application import HttpRuntimeModule
from app.api.http_application import NotificationRouteDependencies
from app.api.http_application import OrganizationUnitRouteDependencies
from app.api.http_application import PaymentRouteDependencies
from app.api.http_application import ReservationRouteDependencies
from app.api.http_application import ReviewRouteDependencies
from app.api.http_application import StaffReservationOperationRouteDependencies
from app.api.http_application import SuperAdminDashboardRouteDependencies
from app.api.http_application import SuperAdminReportRouteDependencies
from app.api.http_application import SystemStatusRouteDependencies
from app.core.database import Base, build_session_factory
from app.core.module_factories import FacilityReservationWorkflowAssembly
from app.core.settings import SettingsModule
from app.models import SystemSetting
from app.services.booking_settings import BookingSettings
from app.storage import InMemoryPrivateStorage


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
            get_current_user=placeholder_dependency,
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
            require_access=placeholder_require_access,
        )

    def approval_letter_routes(self):
        return ApprovalLetterRouteDependencies(
            get_approval_letters=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def payment_routes(self):
        return PaymentRouteDependencies(
            get_payments=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def review_routes(self):
        return ReviewRouteDependencies(
            get_reviews=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def notification_routes(self):
        return NotificationRouteDependencies(
            get_notifications=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def audit_log_routes(self):
        return AuditLogRouteDependencies(
            get_audit_logs=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def facility_management_routes(self):
        return FacilityManagementRouteDependencies(
            get_facility_management=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def staff_reservation_operation_routes(self):
        return StaffReservationOperationRouteDependencies(
            get_staff_reservation_operations=placeholder_dependency,
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

    def super_admin_dashboard_routes(self):
        return SuperAdminDashboardRouteDependencies(
            get_super_admin_dashboard=placeholder_dependency,
            require_access=placeholder_require_access,
        )

    def super_admin_report_routes(self):
        return SuperAdminReportRouteDependencies(
            get_super_admin_reports=placeholder_dependency,
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
    assert "/student/reservations/{reservation_id}/review" in route_paths
    assert "/staff/facilities/{facility_id}/reviews" in route_paths
    assert "/admin/reviews" in route_paths
    assert "/notifications" in route_paths
    assert "/admin/audit-logs" in route_paths
    assert "/admin/system-status" in route_paths
    assert "/admin/dashboard" in route_paths
    assert "/admin/reports/aggregate" in route_paths
    assert "/staff/reservations" in route_paths
    assert "/staff/reservations/verification-queue" in route_paths
    assert "/staff/reservations/{reservation_id}" in route_paths
    assert "/staff/facilities/{facility_id}/schedule" in route_paths


def test_http_application_enables_cors_middleware():
    from starlette.middleware.cors import CORSMiddleware

    app = HttpApplicationModule(settings=SettingsModule(database_url="sqlite+pysqlite:///:memory:")).build()
    cors_middlewares = [m for m in app.user_middleware if m.cls is CORSMiddleware]

    assert len(cors_middlewares) == 1
    assert cors_middlewares[0].kwargs["allow_methods"] == ["*"]
    assert cors_middlewares[0].kwargs["allow_headers"] == ["*"]
    assert cors_middlewares[0].kwargs["allow_credentials"] is True
    assert cors_middlewares[0].kwargs["expose_headers"] == ["Content-Disposition"]


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
    assert "/student/reservations/{reservation_id}/review" in route_paths
    assert "/student/reviews/{review_id}" in route_paths
    assert "/staff/facilities/{facility_id}/reviews" in route_paths
    assert "/staff/facilities/{facility_id}/statistics" in route_paths
    assert "/admin/reviews" in route_paths
    assert "/admin/reviews/{review_id}/delete" in route_paths
    assert "/admin/reviews/{review_id}/restore" in route_paths
    assert "/notifications" in route_paths
    assert "/admin/audit-logs" in route_paths
    assert "/student/reservations" in route_paths
    assert "/student/reservations/{reservation_id}" in route_paths
    assert "/admin/facilities/{facility_id}/staff-assignments/{staff_id}" in route_paths
    assert "/admin/facilities/governance" in route_paths
    assert "/admin/facilities" in route_paths
    assert "/admin/facilities/import" not in route_paths
    assert "/staff/facilities" in route_paths
    assert "/staff/facilities/{facility_id}" in route_paths
    assert "/staff/facilities/{facility_id}/images" in route_paths
    assert "/staff/facilities/{facility_id}/images/{image_id}/cover" in route_paths
    assert "/staff/facilities/{facility_id}/open-hours" in route_paths
    assert "/staff/facilities/{facility_id}/blackouts" in route_paths
    assert "/staff/reservations" in route_paths
    assert "/staff/reservations/verification-queue" in route_paths
    assert "/staff/reservations/{reservation_id}" in route_paths
    assert "/staff/facilities/{facility_id}/schedule" in route_paths
    assert "/organization-units" in route_paths
    assert "/admin/users" in route_paths
    assert "/admin/users/{user_id}/activate" in route_paths
    assert "/admin/users/{user_id}/deactivate" in route_paths
    assert "/admin/users/{user_id}/role" not in route_paths
    assert "/admin/organization-units" in route_paths
    assert "/admin/organization-units/{organization_unit_id}" in route_paths
    assert "/admin/organization-units/{organization_unit_id}/activate" in route_paths
    assert "/admin/organization-units/{organization_unit_id}/deactivate" in route_paths
    assert "/admin/system-status" in route_paths
    assert "/admin/dashboard" in route_paths
    assert "/admin/reports/aggregate" in route_paths
    assert "/admin/reports/export" not in route_paths
    assert "/student/shell" in route_paths
    assert "/staff/shell" in route_paths
    assert "/admin/shell" in route_paths
    assert app.state.session_factory is not None


def test_http_application_groups_openapi_operations_by_domain_tags():
    app = HttpApplicationModule(settings=SettingsModule(database_url="sqlite+pysqlite:///:memory:")).build()

    schema = app.openapi()
    tags = {tag["name"] for tag in schema["tags"]}

    assert "Authentication" in tags
    assert "Facilities" in tags
    assert "Reservations" in tags
    assert "Payments" in tags
    assert "System Status" in tags
    assert schema["paths"]["/auth/login"]["post"]["tags"] == ["Authentication"]
    assert schema["paths"]["/facilities"]["get"]["tags"] == ["Facilities"]
    assert schema["paths"]["/student/reservations"]["get"]["tags"] == ["Reservations"]
    assert schema["paths"]["/student/reservations/{reservation_id}/payment"]["get"]["tags"] == ["Payments"]
    assert schema["paths"]["/health"]["get"]["tags"] == ["System Status"]


def test_facility_reservation_workflow_assembly_loads_shared_booking_settings():
    session_factory = build_session_factory("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(bind=session_factory.kw["bind"])
    session = session_factory()
    session.add(SystemSetting(key="document_upload_due_hours", value="24"))
    session.commit()

    try:
        workflow = FacilityReservationWorkflowAssembly(
            session=session,
            default_booking_settings=BookingSettings.defaults(),
            clock=lambda: None,
            private_storage=InMemoryPrivateStorage(),
        )

        assert workflow.booking_settings.document_upload_due_hours == 24
    finally:
        session.close()
