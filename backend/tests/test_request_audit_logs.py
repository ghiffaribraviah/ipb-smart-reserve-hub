from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import UserRole
from tests.data_builder import DataBuilder


@pytest.mark.anyio
async def test_super_admin_audit_logs_include_login_and_endpoint_access_events():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 6, 4, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login = await client.post("/auth/login", json={"email": "admin@ipb.ac.id", "password": "secret123"})
        token = login.json()["access_token"]
        await client.get("/admin/system-status", headers={"Authorization": f"Bearer {token}"})
        dashboard = await client.get("/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
        audit_logs = await client.get(
            "/admin/audit-logs",
            headers={"Authorization": f"Bearer {token}"},
            params={"target_type": "endpoint"},
        )

    assert login.status_code == 200
    assert dashboard.status_code == 200
    assert audit_logs.status_code == 200
    assert {
        (entry["action_type"], entry["target_id"])
        for entry in audit_logs.json()
    } == {
        ("request.200", "GET /admin/system-status"),
        ("auth.login", "POST /auth/login"),
        ("request.200", "GET /admin/dashboard"),
    }
    assert dashboard.json()["recent_activity"] == []
