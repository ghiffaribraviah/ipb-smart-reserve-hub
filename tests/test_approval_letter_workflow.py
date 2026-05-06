from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from tests.data_builder import DataBuilder


async def _register_and_login(client: AsyncClient, *, email: str, full_name: str, nim: str, phone: str) -> str:
    await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "secret123",
            "full_name": full_name,
            "nim": nim,
            "phone": phone,
        },
    )
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


async def _create_reservation(client: AsyncClient, *, token: str, facility_id: str, organization_unit_id: str) -> dict:
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
async def test_student_accesses_stable_generated_approval_letter_metadata():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
        reservation = await _create_reservation(
            client,
            token=token,
            facility_id=facility_id,
            organization_unit_id=organization_unit_id,
        )
        reservation_id = reservation["id"]

        first = await client.get(
            f"/student/reservations/{reservation_id}/approval-letter",
            headers={"Authorization": f"Bearer {token}"},
        )
        second = await client.get(
            f"/student/reservations/{reservation_id}/approval-letter",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert first.status_code == 200
    assert second.status_code == 200
    first_body = first.json()
    assert second.json() == first_body
    assert first_body["reservation_id"] == reservation_id
    assert first_body["reservation_code"] == reservation["reservation_code"]
    assert first_body["filename"] == f"{reservation['reservation_code']}-surat-persetujuan.pdf"
    assert first_body["content_type"] == "application/pdf"
    assert first_body["size_bytes"] > 0
    assert first_body["generated_at"] == "2026-05-01T03:00:00Z"


@pytest.mark.anyio
async def test_student_downloads_generated_approval_letter_pdf_multiple_times():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
        reservation = await _create_reservation(
            client,
            token=token,
            facility_id=facility_id,
            organization_unit_id=organization_unit_id,
        )

        first = await client.get(
            f"/student/reservations/{reservation['id']}/approval-letter/download",
            headers={"Authorization": f"Bearer {token}"},
        )
        second = await client.get(
            f"/student/reservations/{reservation['id']}/approval-letter/download",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert first.status_code == 200
    assert first.headers["content-type"] == "application/pdf"
    assert (
        first.headers["content-disposition"]
        == f'attachment; filename="{reservation["reservation_code"]}-surat-persetujuan.pdf"'
    )
    assert second.status_code == 200
    assert second.content == first.content
    assert first.content.startswith(b"%PDF-")
    assert b"SURAT PERSETUJUAN RESERVASI FASILITAS" in first.content
    assert reservation["reservation_code"].encode() in first.content
    assert b"Budi Santoso" in first.content
    assert b"Auditorium Andi Hakim Nasoetion" in first.content
    assert b"/staff/reservations/" in first.content


@pytest.mark.anyio
async def test_generated_approval_letter_pdf_includes_official_reservation_details():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
        reservation = await _create_reservation(
            client,
            token=token,
            facility_id=facility_id,
            organization_unit_id=organization_unit_id,
        )

        download = await client.get(
            f"/student/reservations/{reservation['id']}/approval-letter/download",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert b"Tanggal generate: 2026-05-01" in download.content
    assert b"Tanggal reservasi: 2026-06-01" in download.content
    assert b"Waktu reservasi: 09:00-11:00 WIB" in download.content
    assert b"NIM: G64190001" in download.content
    assert b"Telepon/WhatsApp: 08123456789" in download.content
    assert b"Organisasi: BEM KM IPB" in download.content
    assert b"Jumlah peserta: 80" in download.content
    assert b"Tanda tangan mahasiswa/perwakilan organisasi:" in download.content
    assert b"Persetujuan pihak fasilitas/TU:" in download.content
    assert b"Kontak TU: TU Fasilitas - 0251-8620000" in download.content


@pytest.mark.anyio
async def test_student_cannot_access_another_students_approval_letter():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        owner_token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
        other_token = await _register_and_login(
            client,
            email="sari@apps.ipb.ac.id",
            full_name="Sari Wulandari",
            nim="G64190002",
            phone="08111111111",
        )
        reservation = await _create_reservation(
            client,
            token=owner_token,
            facility_id=facility_id,
            organization_unit_id=organization_unit_id,
        )
        reservation_id = reservation["id"]
        await client.get(
            f"/student/reservations/{reservation_id}/approval-letter",
            headers={"Authorization": f"Bearer {owner_token}"},
        )

        metadata = await client.get(
            f"/student/reservations/{reservation_id}/approval-letter",
            headers={"Authorization": f"Bearer {other_token}"},
        )
        download = await client.get(
            f"/student/reservations/{reservation_id}/approval-letter/download",
            headers={"Authorization": f"Bearer {other_token}"},
        )

    assert metadata.status_code == 404
    assert metadata.json()["detail"] == "Reservasi tidak ditemukan."
    assert download.status_code == 404
    assert download.json()["detail"] == "Reservasi tidak ditemukan."
