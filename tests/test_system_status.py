import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import UserRole
from tests.data_builder import DataBuilder


@pytest.mark.anyio
async def test_super_admin_views_read_only_system_status():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    DataBuilder(app).create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login = await client.post("/auth/login", json={"email": "admin@ipb.ac.id", "password": "secret123"})
        token = login.json()["access_token"]

        response = await client.get("/admin/system-status", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json() == {
        "backend": {"status": "ok"},
        "database": {"status": "ok"},
        "storage": {"status": "not_configured"},
        "application": {"name": "ipb-smart-reserve-hub", "version": "0.1.0"},
        "worker": {"status": "not_configured"},
    }


@pytest.mark.anyio
async def test_non_admin_users_cannot_view_system_status():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    DataBuilder(app).create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login = await client.post("/auth/login", json={"email": "staff@ipb.ac.id", "password": "secret123"})
        token = login.json()["access_token"]

        response = await client.get("/admin/system-status", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 403
