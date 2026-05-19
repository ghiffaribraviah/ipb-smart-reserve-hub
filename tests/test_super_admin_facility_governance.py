import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import UserRole
from tests.data_builder import DataBuilder


async def _login(client: AsyncClient, *, email: str) -> str:
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


@pytest.mark.anyio
async def test_super_admin_lists_facility_governance_with_assignment_coverage_and_issue_flags():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    inactive_staff_id = test_data.create_user(email="inactive-staff@ipb.ac.id", role=UserRole.staff, is_active=False)
    assigned_facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    inactive_facility_id = test_data.create_facility(name="Ruang Arsip", is_active=False)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        await client.put(
            f"/admin/facilities/{assigned_facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        await client.put(
            f"/admin/facilities/{inactive_facility_id}/staff-assignments/{inactive_staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        response = await client.get(
            "/admin/facilities/governance",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    assert response.status_code == 200
    rows = {row["name"]: row for row in response.json()}
    assert rows["Auditorium Andi Hakim Nasoetion"] == {
        "id": assigned_facility_id,
        "name": "Auditorium Andi Hakim Nasoetion",
        "category": "Auditorium",
        "location": "Kampus IPB Dramaga",
        "capacity": 120,
        "is_active": True,
        "assigned_staff_count": 1,
        "active_assigned_staff_count": 1,
        "assigned_staff": [
            {
                "email": "staff@ipb.ac.id",
                "full_name": "Seed User",
                "id": staff_id,
                "is_active": True,
            }
        ],
        "assignment_coverage": "covered",
        "issue_flags": [],
    }
    assert rows["Ruang Arsip"] == {
        "id": inactive_facility_id,
        "name": "Ruang Arsip",
        "category": "Auditorium",
        "location": "Kampus IPB Dramaga",
        "capacity": 120,
        "is_active": False,
        "assigned_staff_count": 1,
        "active_assigned_staff_count": 0,
        "assigned_staff": [
            {
                "email": "inactive-staff@ipb.ac.id",
                "full_name": "Seed User",
                "id": inactive_staff_id,
                "is_active": False,
            }
        ],
        "assignment_coverage": "needs_staff",
        "issue_flags": ["needs_staff"],
    }


@pytest.mark.anyio
async def test_student_and_staff_cannot_access_super_admin_facility_governance():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    DataBuilder(app).create_user(email="staff@ipb.ac.id", role=UserRole.staff)
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

        staff_response = await client.get(
            "/admin/facilities/governance",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        student_response = await client.get(
            "/admin/facilities/governance",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert staff_response.status_code == 403
    assert student_response.status_code == 403
