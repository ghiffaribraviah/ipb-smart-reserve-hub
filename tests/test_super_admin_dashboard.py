from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import ReservationStatus, UserRole
from tests.data_builder import DataBuilder


async def _login(client: AsyncClient, *, email: str) -> str:
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


@pytest.mark.anyio
async def test_super_admin_fetches_dashboard_aggregate_with_kpis_admins_and_activity():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    test_data.create_user(email="other-admin@ipb.ac.id", role=UserRole.super_admin, is_active=False)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    inactive_facility_id = test_data.create_facility(name="Ruang Arsip", is_active=False)
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Dashboard Reservation",
        starts_at="2026-06-10T02:00:00+00:00",
        ends_at="2026-06-10T04:00:00+00:00",
        status=ReservationStatus.approved,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        response = await client.get("/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})

    assert response.status_code == 200
    body = response.json()
    assert body["kpis"] == {
        "total_users": 4,
        "active_facilities": 1,
        "total_reservations": 1,
        "system_health": "ok",
    }
    assert body["system_status"]["database"]["status"] == "ok"
    assert body["administrators"] == [
        {
            "id": body["administrators"][0]["id"],
            "email": "other-admin@ipb.ac.id",
            "full_name": "Seed User",
            "role": "super_admin",
            "is_active": False,
        },
        {
            "id": body["administrators"][1]["id"],
            "email": "admin@ipb.ac.id",
            "full_name": "Seed User",
            "role": "super_admin",
            "is_active": True,
        },
    ]
    assert body["facility_governance"] == [
        {
            "id": facility_id,
            "name": "Auditorium Andi Hakim Nasoetion",
            "category": "Auditorium",
            "location": "Kampus IPB Dramaga",
            "capacity": 120,
            "is_active": True,
            "assigned_staff_count": 1,
            "active_assigned_staff_count": 1,
            "assignment_coverage": "covered",
            "issue_flags": [],
        },
        {
            "id": inactive_facility_id,
            "name": "Ruang Arsip",
            "category": "Auditorium",
            "location": "Kampus IPB Dramaga",
            "capacity": 120,
            "is_active": False,
            "assigned_staff_count": 0,
            "active_assigned_staff_count": 0,
            "assignment_coverage": "needs_staff",
            "issue_flags": ["needs_staff"],
        },
    ]
    assert body["recent_activity"][0]["action_type"] == "staff_assignment.created"


@pytest.mark.anyio
async def test_student_and_staff_cannot_access_super_admin_dashboard_aggregate():
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

        staff_response = await client.get("/admin/dashboard", headers={"Authorization": f"Bearer {staff_token}"})
        student_response = await client.get("/admin/dashboard", headers={"Authorization": f"Bearer {student_token}"})

    assert staff_response.status_code == 403
    assert student_response.status_code == 403
