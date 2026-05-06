from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import ReservationStatus, UserRole
from tests.data_builder import DataBuilder


async def _register_and_login(client: AsyncClient, *, email: str) -> str:
    await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "secret123",
            "full_name": "Budi Santoso",
            "nim": "G64190001",
            "phone": "08123456789",
        },
    )
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


async def _login(client: AsyncClient, *, email: str) -> str:
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


async def _create_reservation(
    client: AsyncClient,
    *,
    token: str,
    facility_id: str,
    organization_unit_id: str,
) -> dict:
    created = await client.post(
        f"/facilities/{facility_id}/reservations",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "activity_title": "Seminar Karier",
            "event_description": "Seminar persiapan karier untuk mahasiswa tingkat akhir.",
            "participant_count": 80,
            "organization_unit_id": organization_unit_id,
            "contact_phone": "08123456789",
            "starts_at": "2026-06-01T02:00:00+00:00",
            "ends_at": "2026-06-01T04:00:00+00:00",
        },
    )
    return created.json()


@pytest.mark.anyio
async def test_student_can_cancel_own_pre_approval_reservation_but_not_another_students():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        owner_token = await _register_and_login(client, email="owner@apps.ipb.ac.id")
        other_token = await _register_and_login(client, email="other@apps.ipb.ac.id")
        reservation = await _create_reservation(
            client,
            token=owner_token,
            facility_id=facility_id,
            organization_unit_id=organization_unit_id,
        )

        other_cancel = await client.post(
            f"/student/reservations/{reservation['id']}/cancel",
            headers={"Authorization": f"Bearer {other_token}"},
        )
        owner_cancel = await client.post(
            f"/student/reservations/{reservation['id']}/cancel",
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        after_cancel = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {owner_token}"},
        )

    assert other_cancel.status_code == 404
    assert owner_cancel.status_code == 200
    assert owner_cancel.json()["status"] == "cancelled"
    assert after_cancel.json()["status"] == "cancelled"


@pytest.mark.anyio
async def test_approved_paid_reservation_requires_cancellation_request_reason_and_returns_refund_warning():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion", price_rupiah=250000)
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    reservation_id = test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Approved Paid",
        starts_at="2026-06-01T02:00:00+00:00",
        ends_at="2026-06-01T04:00:00+00:00",
        status=ReservationStatus.approved,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        student_token = await _login(client, email="student-approved-paid@apps.ipb.ac.id")
        immediate_cancel = await client.post(
            f"/student/reservations/{reservation_id}/cancel",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        missing_reason = await client.post(
            f"/student/reservations/{reservation_id}/cancellation-request",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"reason": "   "},
        )
        requested = await client.post(
            f"/student/reservations/{reservation_id}/cancellation-request",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"reason": "Kegiatan dipindahkan."},
        )

    assert immediate_cancel.status_code == 409
    assert missing_reason.status_code == 400
    assert requested.status_code == 200
    assert requested.json()["status"] == "cancellation_requested"
    assert requested.json()["cancellation_reason"] == "Kegiatan dipindahkan."
    assert requested.json()["refund_warning"] == (
        "Sistem tidak memproses refund. Silakan hubungi TU fasilitas untuk tindak lanjut refund."
    )


@pytest.mark.anyio
async def test_assigned_staff_reviews_cancellation_request_while_slot_stays_blocked():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    test_data.create_user(email="other-staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    reservation_id = test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Approved Free",
        starts_at="2026-06-01T02:00:00+00:00",
        ends_at="2026-06-01T04:00:00+00:00",
        status=ReservationStatus.approved,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        other_staff_token = await _login(client, email="other-staff@ipb.ac.id")
        student_token = await _login(client, email="student-approved-free@apps.ipb.ac.id")
        await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        requested = await client.post(
            f"/student/reservations/{reservation_id}/cancellation-request",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"reason": "Kegiatan batal."},
        )
        availability = await client.get(
            f"/facilities/{facility_id}/availability",
            params={"start": "2026-06-01T02:00:00+00:00", "end": "2026-06-01T04:00:00+00:00"},
        )
        calendar = await client.get(
            f"/facilities/{facility_id}/calendar",
            params={"start": "2026-06-01T00:00:00+00:00", "end": "2026-06-02T00:00:00+00:00"},
        )
        unassigned_approve = await client.post(
            f"/staff/reservations/{reservation_id}/cancellation-review/approve",
            headers={"Authorization": f"Bearer {other_staff_token}"},
        )
        reject_without_reason = await client.post(
            f"/staff/reservations/{reservation_id}/cancellation-review/reject",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"reason": "   "},
        )
        rejected = await client.post(
            f"/staff/reservations/{reservation_id}/cancellation-review/reject",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"reason": "Fasilitas sudah disiapkan."},
        )
        await client.post(
            f"/student/reservations/{reservation_id}/cancellation-request",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"reason": "Tetap batal."},
        )
        approved = await client.post(
            f"/staff/reservations/{reservation_id}/cancellation-review/approve",
            headers={"Authorization": f"Bearer {staff_token}"},
        )

    assert requested.json()["status"] == "cancellation_requested"
    assert availability.json() == {"available": False, "reasons": ["reserved_time"]}
    assert len(calendar.json()) == 1
    assert unassigned_approve.status_code == 403
    assert reject_without_reason.status_code == 400
    assert rejected.json()["status"] == "approved"
    assert rejected.json()["cancellation_rejection_reason"] == "Fasilitas sudah disiapkan."
    assert approved.json()["status"] == "cancelled"
