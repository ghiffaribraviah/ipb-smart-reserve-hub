import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import UserRole
from tests.data_builder import DataBuilder


async def _login(client: AsyncClient, *, email: str) -> str:
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


@pytest.mark.anyio
async def test_super_admin_lists_users_with_pagination_and_identity_filters():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    test_data.create_user(email="tu-auditorium@ipb.ac.id", role=UserRole.staff)
    test_data.create_user(email="inactive-tu@ipb.ac.id", role=UserRole.staff, is_active=False)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post(
            "/auth/register",
            json={
                "email": "student@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Student Aktif",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        admin_token = await _login(client, email="admin@ipb.ac.id")

        response = await client.get(
            "/admin/users",
            params={"role": "staff", "is_active": "true", "search": "auditorium", "page": "1", "page_size": "10"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        student_response = await client.get(
            "/admin/users",
            params={"role": "student", "search": "student", "page": "1", "page_size": "10"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "id": response.json()["items"][0]["id"],
                "email": "tu-auditorium@ipb.ac.id",
                "full_name": "Seed User",
                "role": "staff",
                "is_active": True,
                "nim": None,
                "phone": None,
                "academic_profile": None,
            }
        ],
        "total": 1,
        "page": 1,
        "page_size": 10,
    }
    assert student_response.status_code == 200
    assert student_response.json()["items"][0]["nim"] == "G64190001"
    assert student_response.json()["items"][0]["phone"] == "08123456789"
    assert student_response.json()["items"][0]["academic_profile"] is not None


@pytest.mark.anyio
async def test_super_admin_deactivates_and_reactivates_user_accounts_and_sessions_follow_active_status():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")

        deactivated = await client.post(
            f"/admin/users/{staff_id}/deactivate",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        login_while_inactive = await client.post(
            "/auth/login",
            json={"email": "staff@ipb.ac.id", "password": "secret123"},
        )
        refresh_while_inactive = await client.post(
            "/auth/refresh",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        current_user_while_inactive = await client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        reactivated = await client.post(
            f"/admin/users/{staff_id}/activate",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        login_after_reactivation = await client.post(
            "/auth/login",
            json={"email": "staff@ipb.ac.id", "password": "secret123"},
        )

    assert deactivated.status_code == 200
    assert deactivated.json()["is_active"] is False
    assert login_while_inactive.status_code == 401
    assert refresh_while_inactive.status_code == 401
    assert current_user_while_inactive.status_code == 401
    assert reactivated.status_code == 200
    assert reactivated.json()["is_active"] is True
    assert login_after_reactivation.status_code == 200


@pytest.mark.anyio
async def test_student_and_staff_cannot_access_super_admin_user_management_endpoints():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post(
            "/auth/register",
            json={
                "email": "student@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Student",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _login(client, email="student@apps.ipb.ac.id")

        staff_list = await client.get("/admin/users", headers={"Authorization": f"Bearer {staff_token}"})
        student_list = await client.get("/admin/users", headers={"Authorization": f"Bearer {student_token}"})
        staff_deactivate = await client.post(
            f"/admin/users/{staff_id}/deactivate",
            headers={"Authorization": f"Bearer {staff_token}"},
        )

    assert staff_list.status_code == 403
    assert student_list.status_code == 403
    assert staff_deactivate.status_code == 403
