from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import ReservationStatus
from tests.data_builder import DataBuilder


@pytest.mark.anyio
async def test_student_submits_reservation_details_and_views_held_reservation():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion", price_rupiah=150000)
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post(
            "/auth/register",
            json={
                "email": "budi@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Budi Santoso",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        login = await client.post("/auth/login", json={"email": "budi@apps.ipb.ac.id", "password": "secret123"})
        token = login.json()["access_token"]

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

        reservation_list = await client.get("/student/reservations", headers={"Authorization": f"Bearer {token}"})

    assert created.status_code == 201
    created_body = created.json()
    assert created_body["reservation_code"].startswith("RSV-")
    assert created_body["status"] == "pending_document_upload"
    assert created_body["facility"]["name"] == "Auditorium Andi Hakim Nasoetion"
    assert created_body["price_rupiah"] == 150000
    assert created_body["organization_unit"]["name"] == "BEM KM IPB"
    assert created_body["participant_count"] == 80

    assert reservation_list.status_code == 200
    assert reservation_list.json() == [created_body]

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        detail = await client.get(
            f"/student/reservations/{created_body['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert detail.status_code == 200
    assert detail.json() == created_body


@pytest.mark.anyio
async def test_student_reservation_submission_rejects_overlapping_blocking_reservation():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Reservasi Lama",
        starts_at="2026-06-01T02:00:00+00:00",
        ends_at="2026-06-01T04:00:00+00:00",
        status=ReservationStatus.pending_document_upload,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post(
            "/auth/register",
            json={
                "email": "budi@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Budi Santoso",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        login = await client.post("/auth/login", json={"email": "budi@apps.ipb.ac.id", "password": "secret123"})
        token = login.json()["access_token"]

        rejected = await client.post(
            f"/facilities/{facility_id}/reservations",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "activity_title": "Seminar Karier",
                "event_description": "Seminar persiapan karier untuk mahasiswa tingkat akhir.",
                "participant_count": 80,
                "organization_unit_id": organization_unit_id,
                "contact_phone": "08123456789",
                "starts_at": "2026-06-01T03:00:00+00:00",
                "ends_at": "2026-06-01T05:00:00+00:00",
            },
        )
        reservation_list = await client.get("/student/reservations", headers={"Authorization": f"Bearer {token}"})

    assert rejected.status_code == 409
    assert rejected.json()["detail"] == "Waktu reservasi tidak tersedia."
    assert reservation_list.json() == []


@pytest.mark.anyio
async def test_student_reservation_submission_rejects_inactive_facility_and_organization_unit():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    inactive_facility_id = test_data.create_facility(name="Ruang Tidak Aktif", is_active=False)
    active_facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(active_facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    active_organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    inactive_organization_unit_id = test_data.create_organization_unit(name="Unit Nonaktif", is_active=False)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post(
            "/auth/register",
            json={
                "email": "budi@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Budi Santoso",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        login = await client.post("/auth/login", json={"email": "budi@apps.ipb.ac.id", "password": "secret123"})
        token = login.json()["access_token"]

        inactive_facility = await client.post(
            f"/facilities/{inactive_facility_id}/reservations",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "activity_title": "Seminar Karier",
                "event_description": "Seminar persiapan karier untuk mahasiswa tingkat akhir.",
                "participant_count": 80,
                "organization_unit_id": active_organization_unit_id,
                "contact_phone": "08123456789",
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )
        inactive_organization_unit = await client.post(
            f"/facilities/{active_facility_id}/reservations",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "activity_title": "Workshop Kewirausahaan",
                "event_description": "Workshop kewirausahaan untuk mahasiswa.",
                "participant_count": 80,
                "organization_unit_id": inactive_organization_unit_id,
                "contact_phone": "08123456789",
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert inactive_facility.status_code == 404
    assert inactive_facility.json()["detail"] == "Fasilitas tidak ditemukan."
    assert inactive_organization_unit.status_code == 400
    assert inactive_organization_unit.json()["detail"] == "Unit organisasi tidak aktif."


@pytest.mark.anyio
async def test_student_reservation_submission_creates_unique_human_readable_codes():
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
        await client.post(
            "/auth/register",
            json={
                "email": "budi@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Budi Santoso",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        login = await client.post("/auth/login", json={"email": "budi@apps.ipb.ac.id", "password": "secret123"})
        token = login.json()["access_token"]

        first = await client.post(
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
        second = await client.post(
            f"/facilities/{facility_id}/reservations",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "activity_title": "Workshop Kewirausahaan",
                "event_description": "Workshop kewirausahaan untuk mahasiswa.",
                "participant_count": 60,
                "organization_unit_id": organization_unit_id,
                "contact_phone": "08123456789",
                "starts_at": "2026-06-01T05:00:00+00:00",
                "ends_at": "2026-06-01T07:00:00+00:00",
            },
        )

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["reservation_code"].startswith("RSV-")
    assert second.json()["reservation_code"].startswith("RSV-")
    assert first.json()["reservation_code"] != second.json()["reservation_code"]
