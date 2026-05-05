import pytest
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.security import HTTPBearer

from app.api.http_application import HttpApplicationModule
from app.api.http_application import HttpRuntimeModule
from app.core.settings import SettingsModule


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


def test_http_application_module_builds_app_with_foundation_routes():
    app = HttpApplicationModule(settings=SettingsModule(database_url="sqlite+pysqlite:///:memory:")).build()
    route_paths = {route.path for route in app.routes}

    assert isinstance(app, FastAPI)
    assert "/auth/register" in route_paths
    assert "/auth/login" in route_paths
    assert "/auth/refresh" in route_paths
    assert "/facilities" in route_paths
    assert "/facilities/{facility_id}" in route_paths
    assert "/organization-units" in route_paths
    assert "/admin/users" in route_paths
    assert "/admin/organization-units" in route_paths
    assert "/admin/organization-units/{organization_unit_id}" in route_paths
    assert "/admin/organization-units/{organization_unit_id}/activate" in route_paths
    assert "/admin/organization-units/{organization_unit_id}/deactivate" in route_paths
    assert "/student/shell" in route_paths
    assert "/staff/shell" in route_paths
    assert "/admin/shell" in route_paths
    assert app.state.session_factory is not None
