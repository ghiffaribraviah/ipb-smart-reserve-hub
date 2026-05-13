import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import ReservationStatus, UserRole
from tests.data_builder import DataBuilder


async def _login(client: AsyncClient, *, email: str) -> str:
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


@pytest.mark.anyio
async def test_super_admin_fetches_report_aggregate_with_date_range_status_trends_and_revenue():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    paid_facility_id = test_data.create_facility(
        name="Auditorium Andi Hakim Nasoetion",
        price_rupiah=500000,
        payment_instructions="Transfer ke rekening IPB.",
    )
    free_facility_id = test_data.create_facility(
        name="Ruang Seminar Gratis",
        category_name="Ruang Seminar",
        category_slug="ruang-seminar",
    )
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    test_data.create_reservation(
        facility_id=paid_facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Paid Approved",
        starts_at="2026-06-10T02:00:00+00:00",
        ends_at="2026-06-10T04:00:00+00:00",
        status=ReservationStatus.approved,
    )
    test_data.create_reservation(
        facility_id=paid_facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Paid Completed",
        starts_at="2026-06-11T02:00:00+00:00",
        ends_at="2026-06-11T04:00:00+00:00",
        status=ReservationStatus.completed,
    )
    test_data.create_reservation(
        facility_id=free_facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Free Rejected",
        starts_at="2026-06-11T05:00:00+00:00",
        ends_at="2026-06-11T07:00:00+00:00",
        status=ReservationStatus.rejected,
    )
    test_data.create_reservation(
        facility_id=paid_facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Outside Range",
        starts_at="2026-07-10T02:00:00+00:00",
        ends_at="2026-07-10T04:00:00+00:00",
        status=ReservationStatus.approved,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        response = await client.get(
            "/admin/reports/aggregate",
            params={"start": "2026-06-01T00:00:00+00:00", "end": "2026-06-30T23:59:59+00:00"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    assert response.status_code == 200
    assert response.json() == {
        "kpis": {
            "total_reservations": 3,
            "approved_reservations": 1,
            "completed_reservations": 1,
            "rejected_reservations": 1,
            "paid_reservation_total_rupiah": 1000000,
        },
        "status_counts": {
            "approved": 1,
            "completed": 1,
            "rejected": 1,
        },
        "trend": [
            {
                "date": "2026-06-10",
                "reservation_count": 1,
                "paid_total_rupiah": 500000,
            },
            {
                "date": "2026-06-11",
                "reservation_count": 2,
                "paid_total_rupiah": 500000,
            },
        ],
    }


@pytest.mark.anyio
async def test_student_and_staff_cannot_access_report_aggregate():
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
            "/admin/reports/aggregate",
            params={"start": "2026-06-01T00:00:00+00:00", "end": "2026-06-30T23:59:59+00:00"},
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        student_response = await client.get(
            "/admin/reports/aggregate",
            params={"start": "2026-06-01T00:00:00+00:00", "end": "2026-06-30T23:59:59+00:00"},
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert staff_response.status_code == 403
    assert student_response.status_code == 403
