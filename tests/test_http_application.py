from fastapi import FastAPI

from app.http_application import HttpApplicationModule
from app.settings import SettingsModule


def test_http_application_module_builds_app_with_foundation_routes():
    app = HttpApplicationModule(settings=SettingsModule(database_url="sqlite+pysqlite:///:memory:")).build()
    route_paths = {route.path for route in app.routes}

    assert isinstance(app, FastAPI)
    assert "/auth/register" in route_paths
    assert "/auth/login" in route_paths
    assert "/auth/refresh" in route_paths
    assert "/admin/users" in route_paths
    assert "/student/shell" in route_paths
    assert "/staff/shell" in route_paths
    assert "/admin/shell" in route_paths
    assert app.state.session_factory is not None
