from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import ReservationStatus, UserRole
from app.services.deadline_worker import DeadlineWorkerModule
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
async def test_student_views_reservation_notification_inbox_and_marks_item_read():
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
        student_token = await _register_and_login(client, email="budi@apps.ipb.ac.id")
        reservation = await _create_reservation(
            client,
            token=student_token,
            facility_id=facility_id,
            organization_unit_id=organization_unit_id,
        )

        inbox = await client.get("/notifications", headers={"Authorization": f"Bearer {student_token}"})
        read = await client.post(
            f"/notifications/{inbox.json()[0]['id']}/read",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        inbox_after_read = await client.get(
            "/notifications",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert inbox.status_code == 200
    assert inbox.json() == [
        {
            "id": inbox.json()[0]["id"],
            "reservation_id": reservation["id"],
            "title": "Reservasi diterima",
            "message": "Reservasi Seminar Karier menunggu unggah surat persetujuan.",
            "category": "reservation",
            "target": {
                "type": "student_reservation",
                "reservation_id": reservation["id"],
                "route": "/student/reservations/{reservation_id}",
            },
            "read_at": None,
            "created_at": "2026-05-01T00:00:00Z",
        }
    ]
    assert read.status_code == 200
    assert read.json()["read_at"] == "2026-05-01T00:00:00Z"
    assert inbox_after_read.json()[0]["read_at"] == "2026-05-01T00:00:00Z"


@pytest.mark.anyio
async def test_user_cannot_mark_another_users_notification_read():
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
        await _create_reservation(
            client,
            token=owner_token,
            facility_id=facility_id,
            organization_unit_id=organization_unit_id,
        )
        owner_inbox = await client.get("/notifications", headers={"Authorization": f"Bearer {owner_token}"})

        denied = await client.post(
            f"/notifications/{owner_inbox.json()[0]['id']}/read",
            headers={"Authorization": f"Bearer {other_token}"},
        )
        owner_inbox_after_denied_mark = await client.get(
            "/notifications",
            headers={"Authorization": f"Bearer {owner_token}"},
        )

    assert denied.status_code == 404
    assert denied.json()["detail"] == "Notifikasi tidak ditemukan."
    assert owner_inbox_after_denied_mark.json()[0]["read_at"] is None


@pytest.mark.anyio
async def test_signed_letter_upload_notifies_assigned_staff_and_super_admin_only():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    test_data.create_user(email="other-staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        other_staff_token = await _login(client, email="other-staff@ipb.ac.id")
        student_token = await _register_and_login(client, email="budi@apps.ipb.ac.id")
        await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        reservation = await _create_reservation(
            client,
            token=student_token,
            facility_id=facility_id,
            organization_unit_id=organization_unit_id,
        )
        await client.get(
            f"/student/reservations/{reservation['id']}/approval-letter",
            headers={"Authorization": f"Bearer {student_token}"},
        )

        await client.post(
            f"/student/reservations/{reservation['id']}/signed-approval-letter",
            headers={"Authorization": f"Bearer {student_token}"},
            files={"file": ("signed-letter.pdf", b"%PDF-1.4 signed letter", "application/pdf")},
        )
        staff_inbox = await client.get("/notifications", headers={"Authorization": f"Bearer {staff_token}"})
        admin_inbox = await client.get("/notifications", headers={"Authorization": f"Bearer {admin_token}"})
        other_staff_inbox = await client.get(
            "/notifications",
            headers={"Authorization": f"Bearer {other_staff_token}"},
        )

    assert staff_inbox.status_code == 200
    assert admin_inbox.status_code == 200
    assert staff_inbox.json()[0]["title"] == "Surat menunggu review"
    assert staff_inbox.json()[0]["reservation_id"] == reservation["id"]
    assert staff_inbox.json()[0]["category"] == "reservation"
    assert staff_inbox.json()[0]["target"] == {
        "type": "staff_reservation",
        "reservation_id": reservation["id"],
        "route": "/staff/reservations/{reservation_id}",
    }
    assert admin_inbox.json()[0]["title"] == "Surat menunggu review"
    assert admin_inbox.json()[0]["category"] == "reservation"
    assert admin_inbox.json()[0]["target"] == {
        "type": "super_admin_reservation",
        "reservation_id": reservation["id"],
        "route": "/super-admin/reservations/{reservation_id}",
    }
    assert other_staff_inbox.json() == []


@pytest.mark.anyio
async def test_overdue_verification_notification_includes_facility_tu_contact():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Missed Document Review",
        starts_at="2026-06-20T05:00:00+00:00",
        ends_at="2026-06-20T07:00:00+00:00",
        status=ReservationStatus.pending_document_review,
        document_verification_due_at="2026-06-01T00:00:00+00:00",
    )

    DeadlineWorkerModule(
        session_factory=app.state.session_factory,
        clock=lambda: datetime(2026, 6, 2, tzinfo=UTC),
    ).process_due_reservations()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        student_token = await _login(client, email="student-missed-document-review@apps.ipb.ac.id")
        inbox = await client.get("/notifications", headers={"Authorization": f"Bearer {student_token}"})

    assert inbox.status_code == 200
    assert inbox.json()[0]["title"] == "Verifikasi melewati batas waktu"
    assert "TU Fasilitas" in inbox.json()[0]["message"]
    assert "0251-8620000" in inbox.json()[0]["message"]
