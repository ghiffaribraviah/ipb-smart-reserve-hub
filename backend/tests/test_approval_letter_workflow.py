from datetime import UTC, datetime
import subprocess
import tempfile

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import UserRole
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


async def _login(client: AsyncClient, *, email: str) -> str:
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


async def _upload_signed_approval_letter(client: AsyncClient, *, token: str, reservation_id: str) -> None:
    await client.get(
        f"/student/reservations/{reservation_id}/approval-letter",
        headers={"Authorization": f"Bearer {token}"},
    )
    await client.post(
        f"/student/reservations/{reservation_id}/signed-approval-letter",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("signed-letter.pdf", b"%PDF-1.4 signed letter", "application/pdf")},
    )


async def _upload_signed_approval_letter_named(
    client: AsyncClient,
    *,
    token: str,
    reservation_id: str,
    filename: str,
    content: bytes,
) -> None:
    await client.get(
        f"/student/reservations/{reservation_id}/approval-letter",
        headers={"Authorization": f"Bearer {token}"},
    )
    await client.post(
        f"/student/reservations/{reservation_id}/signed-approval-letter",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": (filename, content, "application/pdf")},
    )


async def _submit_signed_approval_letter(client: AsyncClient, *, token: str, reservation_id: str) -> None:
    await client.post(
        f"/student/reservations/{reservation_id}/signed-approval-letter/submit",
        headers={"Authorization": f"Bearer {token}"},
    )


async def _upload_and_submit_signed_approval_letter(client: AsyncClient, *, token: str, reservation_id: str) -> None:
    await _upload_signed_approval_letter(client, token=token, reservation_id=reservation_id)
    await _submit_signed_approval_letter(client, token=token, reservation_id=reservation_id)


def _pdf_text(content: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".pdf") as pdf:
        pdf.write(content)
        pdf.flush()
        extracted = subprocess.run(
            ["pdftotext", pdf.name, "-"],
            check=True,
            capture_output=True,
            text=True,
        )
    return extracted.stdout


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
    assert first_body["letter_number"] == "RSV/IPBSRH/2026/000001"
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
    text = _pdf_text(first.content)
    assert "Surat Permohonan Reservasi Fasilitas" in text
    assert "RSV/IPBSRH/2026/000001" in text
    assert reservation["reservation_code"] in text
    assert "Budi Santoso" in text
    assert "Auditorium Andi Hakim Nasoetion" in text
    assert "/staff/reservations/" not in text


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

    text = _pdf_text(download.content)
    assert "Tanggal" in text
    assert "1 Mei 2026" in text
    assert "Tanggal dan waktu" in text
    assert "1 Juni 2026" in text
    assert "09:00" in text
    assert "11:00 WIB" in text
    assert "NIM/NIP" in text
    assert "G64190001" in text
    assert "budi@apps.ipb.ac.id / 08123456789" in text
    assert "Organisasi pemohon" in text
    assert "BEM KM IPB" in text
    assert "Estimasi peserta" in text
    assert "80 orang" in text
    assert "Pemohon," in text
    assert "Mengetahui" not in text
    assert "Verifikasi internal" not in text
    assert "/staff/reservations/" not in text
    assert "Lampiran" in text
    assert "1 berkas" in text


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


@pytest.mark.anyio
async def test_student_uploads_signed_approval_letter_without_submitting_for_verification():
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
        await client.get(
            f"/student/reservations/{reservation_id}/approval-letter",
            headers={"Authorization": f"Bearer {token}"},
        )

        upload = await client.post(
            f"/student/reservations/{reservation_id}/signed-approval-letter",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("signed-letter.pdf", b"%PDF-1.4 signed letter", "application/pdf")},
        )
        updated = await client.get(
            f"/student/reservations/{reservation_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        reservation_list = await client.get("/student/reservations", headers={"Authorization": f"Bearer {token}"})

    assert upload.status_code == 201
    assert upload.json() == {
        "reservation_id": reservation_id,
        "filename": "signed-letter.pdf",
        "content_type": "application/pdf",
        "size_bytes": 22,
        "uploaded_at": "2026-05-01T03:00:00Z",
    }
    assert updated.json()["status"] == "pending_document_upload"
    assert updated.json()["document_verification_due_at"] is None
    assert updated.json()["document"] == {
        "approval_letter": {
            "filename": f"{reservation['reservation_code']}-surat-persetujuan.pdf",
            "content_type": "application/pdf",
            "size_bytes": updated.json()["document"]["approval_letter"]["size_bytes"],
            "generated_at": "2026-05-01T03:00:00Z",
            "letter_number": "RSV/IPBSRH/2026/000001",
            "uploaded_at": None,
        },
        "signed_approval_letter": {
            "filename": "signed-letter.pdf",
            "content_type": "application/pdf",
            "size_bytes": 22,
            "generated_at": None,
            "uploaded_at": "2026-05-01T03:00:00Z",
        },
        "review_status": "upload_needed",
        "rejection_reason": None,
    }
    assert reservation_list.json()[0]["document"] == updated.json()["document"]


@pytest.mark.anyio
async def test_student_submits_uploaded_signed_approval_letter_for_verification():
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
        await _upload_signed_approval_letter(client, token=token, reservation_id=reservation_id)

        submit = await client.post(
            f"/student/reservations/{reservation_id}/signed-approval-letter/submit",
            headers={"Authorization": f"Bearer {token}"},
        )
        updated = await client.get(
            f"/student/reservations/{reservation_id}",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert submit.status_code == 200
    assert submit.json() == {
        "reservation_id": reservation_id,
        "status": "pending_document_review",
        "document_verification_due_at": "2026-05-03T03:00:00Z",
    }
    assert updated.json()["status"] == "pending_document_review"
    assert updated.json()["document_verification_due_at"] == "2026-05-03T03:00:00Z"
    assert updated.json()["document"]["review_status"] == "waiting_review"


@pytest.mark.anyio
async def test_student_downloads_uploaded_signed_approval_letter():
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
        await _upload_signed_approval_letter(client, token=token, reservation_id=reservation["id"])

        download = await client.get(
            f"/student/reservations/{reservation['id']}/signed-approval-letter/download",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert download.status_code == 200
    assert download.headers["content-type"] == "application/pdf"
    assert download.headers["content-disposition"] == 'attachment; filename="signed-letter.pdf"'
    assert download.content == b"%PDF-1.4 signed letter"


@pytest.mark.anyio
async def test_student_replaces_uploaded_signed_approval_letter_before_staff_review():
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
        await _upload_signed_approval_letter(client, token=token, reservation_id=reservation["id"])

        replacement = await client.post(
            f"/student/reservations/{reservation['id']}/signed-approval-letter",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("replacement.pdf", b"%PDF-1.4 replacement", "application/pdf")},
        )
        download = await client.get(
            f"/student/reservations/{reservation['id']}/signed-approval-letter/download",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert replacement.status_code == 201
    assert replacement.json()["filename"] == "replacement.pdf"
    assert replacement.json()["size_bytes"] == 20
    assert download.headers["content-disposition"] == 'attachment; filename="replacement.pdf"'
    assert download.content == b"%PDF-1.4 replacement"


@pytest.mark.anyio
async def test_student_cannot_download_another_students_uploaded_signed_approval_letter():
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
        await _upload_signed_approval_letter(client, token=owner_token, reservation_id=reservation["id"])

        download = await client.get(
            f"/student/reservations/{reservation['id']}/signed-approval-letter/download",
            headers={"Authorization": f"Bearer {other_token}"},
        )

    assert download.status_code == 404
    assert download.json()["detail"] == "Reservasi tidak ditemukan."


@pytest.mark.anyio
async def test_student_signed_approval_letter_download_requires_uploaded_file():
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
            f"/student/reservations/{reservation['id']}/signed-approval-letter/download",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert download.status_code == 409
    assert download.json()["detail"] == "Surat bertanda tangan belum diunggah."


@pytest.mark.anyio
async def test_student_uploads_signed_approval_letter_immediately_after_reservation_creation():
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

        upload = await client.post(
            f"/student/reservations/{reservation['id']}/signed-approval-letter",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("signed-letter.pdf", b"%PDF-1.4 signed letter", "application/pdf")},
        )
        unchanged = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert upload.status_code == 201
    assert upload.json()["filename"] == "signed-letter.pdf"
    assert unchanged.json()["status"] == "pending_document_upload"


@pytest.mark.anyio
async def test_student_upload_signed_approval_letter_rejects_unsupported_file_type():
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
        await client.get(
            f"/student/reservations/{reservation['id']}/approval-letter",
            headers={"Authorization": f"Bearer {token}"},
        )

        upload = await client.post(
            f"/student/reservations/{reservation['id']}/signed-approval-letter",
            headers={"Authorization": f"Bearer {token}"},
            files={
                "file": (
                    "signed-letter.jpg",
                    b"not an accepted signed letter",
                    "image/jpeg",
                )
            },
        )
        unchanged = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert upload.status_code == 400
    assert upload.json()["detail"] == "Unggah surat bertanda tangan harus berupa PDF."
    assert unchanged.json()["status"] == "pending_document_upload"


@pytest.mark.anyio
async def test_student_upload_signed_approval_letter_rejects_pdf_without_pdf_header():
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

        upload = await client.post(
            f"/student/reservations/{reservation['id']}/signed-approval-letter",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("signed-letter.pdf", b"not really a pdf", "application/pdf")},
        )
        unchanged = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert upload.status_code == 400
    assert upload.json()["detail"] == "Unggah surat bertanda tangan harus berupa PDF."
    assert unchanged.json()["status"] == "pending_document_upload"


@pytest.mark.anyio
async def test_student_upload_signed_approval_letter_rejects_files_larger_than_five_mb():
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
        await client.get(
            f"/student/reservations/{reservation['id']}/approval-letter",
            headers={"Authorization": f"Bearer {token}"},
        )

        upload = await client.post(
            f"/student/reservations/{reservation['id']}/signed-approval-letter",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("signed-letter.pdf", b"x" * (5 * 1024 * 1024 + 1), "application/pdf")},
        )
        unchanged = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert upload.status_code == 400
    assert upload.json()["detail"] == "Ukuran surat bertanda tangan maksimal 5 MB."
    assert unchanged.json()["status"] == "pending_document_upload"


@pytest.mark.anyio
async def test_assigned_staff_approval_moves_free_facility_reservation_to_approved():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion", price_rupiah=0)
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
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
        await _upload_and_submit_signed_approval_letter(client, token=student_token, reservation_id=reservation["id"])

        review = await client.post(
            f"/staff/reservations/{reservation['id']}/document-review/approve",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        updated = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert review.status_code == 200
    assert review.json()["reservation_id"] == reservation["id"]
    assert review.json()["status"] == "approved"
    assert updated.json()["status"] == "approved"


@pytest.mark.anyio
async def test_assigned_staff_cannot_review_uploaded_letter_before_student_submits_it():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion", price_rupiah=0)
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
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
        await _upload_signed_approval_letter(client, token=student_token, reservation_id=reservation["id"])

        review = await client.post(
            f"/staff/reservations/{reservation['id']}/document-review/approve",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        unchanged = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert review.status_code == 409
    assert review.json()["detail"] == "Surat bertanda tangan belum dikirim untuk verifikasi."
    assert unchanged.json()["status"] == "pending_document_upload"


@pytest.mark.anyio
async def test_assigned_staff_downloads_uploaded_signed_approval_letter_for_review():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
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
        await _upload_and_submit_signed_approval_letter(client, token=student_token, reservation_id=reservation["id"])

        download = await client.get(
            f"/staff/reservations/{reservation['id']}/signed-approval-letter/download",
            headers={"Authorization": f"Bearer {staff_token}"},
        )

    assert download.status_code == 200
    assert download.headers["content-type"] == "application/pdf"
    assert download.headers["content-disposition"] == 'attachment; filename="signed-letter.pdf"'
    assert download.content == b"%PDF-1.4 signed letter"


@pytest.mark.anyio
async def test_staff_detail_exposes_and_downloads_all_signed_approval_letter_uploads_after_reupload():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion", price_rupiah=0)
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
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
        await _upload_signed_approval_letter_named(
            client,
            token=student_token,
            reservation_id=reservation["id"],
            filename="signed-letter-old.pdf",
            content=b"%PDF-1.4 old signed letter",
        )
        await _submit_signed_approval_letter(client, token=student_token, reservation_id=reservation["id"])
        await client.post(
            f"/staff/reservations/{reservation['id']}/document-review/reject",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"reason": "Tanda tangan belum jelas."},
        )
        await _upload_signed_approval_letter_named(
            client,
            token=student_token,
            reservation_id=reservation["id"],
            filename="signed-letter-new.pdf",
            content=b"%PDF-1.4 new signed letter",
        )
        await _submit_signed_approval_letter(client, token=student_token, reservation_id=reservation["id"])

        detail = await client.get(
            f"/staff/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        old_file = next(
            item for item in detail.json()["document"]["signed_approval_letters"] if item["filename"] == "signed-letter-old.pdf"
        )
        old_download = await client.get(
            old_file["download_url"],
            headers={"Authorization": f"Bearer {staff_token}"},
        )

    assert detail.status_code == 200
    document = detail.json()["document"]
    assert document["signed_approval_letter"]["filename"] == "signed-letter-new.pdf"
    assert [item["filename"] for item in document["signed_approval_letters"]] == [
        "signed-letter-new.pdf",
        "signed-letter-old.pdf",
    ]
    assert all(item["download_url"] for item in document["signed_approval_letters"])
    assert old_download.status_code == 200
    assert old_download.headers["content-disposition"] == 'attachment; filename="signed-letter-old.pdf"'
    assert old_download.content == b"%PDF-1.4 old signed letter"


@pytest.mark.anyio
async def test_assigned_staff_downloads_uploaded_signed_approval_letter_after_app_restart(tmp_path):
    database_url = f"sqlite+pysqlite:///{tmp_path / 'reservation-files.db'}"
    clock = lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC)
    app = create_app(database_url=database_url, clock=clock)
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
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
        await _upload_and_submit_signed_approval_letter(client, token=student_token, reservation_id=reservation["id"])

    restarted_app = create_app(database_url=database_url, clock=clock)
    async with AsyncClient(transport=ASGITransport(app=restarted_app), base_url="http://test") as client:
        restarted_staff_token = await _login(client, email="staff@ipb.ac.id")
        detail = await client.get(
            f"/staff/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {restarted_staff_token}"},
        )
        download = await client.get(
            detail.json()["review_actions"]["document"]["download_url"],
            headers={"Authorization": f"Bearer {restarted_staff_token}"},
        )

    assert detail.status_code == 200
    assert detail.json()["document"]["signed_approval_letter"]["filename"] == "signed-letter.pdf"
    assert download.status_code == 200
    assert download.headers["content-disposition"] == 'attachment; filename="signed-letter.pdf"'
    assert download.content == b"%PDF-1.4 signed letter"


@pytest.mark.anyio
async def test_unassigned_staff_cannot_approve_signed_approval_letter():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    assigned_staff_id = test_data.create_user(email="assigned-staff@ipb.ac.id", role=UserRole.staff)
    test_data.create_user(email="other-staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion", price_rupiah=0)
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        other_staff_token = await _login(client, email="other-staff@ipb.ac.id")
        student_token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
        await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{assigned_staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        reservation = await _create_reservation(
            client,
            token=student_token,
            facility_id=facility_id,
            organization_unit_id=organization_unit_id,
        )
        await _upload_and_submit_signed_approval_letter(client, token=student_token, reservation_id=reservation["id"])

        review = await client.post(
            f"/staff/reservations/{reservation['id']}/document-review/approve",
            headers={"Authorization": f"Bearer {other_staff_token}"},
        )
        unchanged = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert review.status_code == 403
    assert review.json()["detail"] == "Staff tidak ditugaskan ke fasilitas reservasi ini."
    assert unchanged.json()["status"] == "pending_document_review"


@pytest.mark.anyio
async def test_assigned_staff_approval_moves_paid_facility_reservation_to_pending_payment():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion", price_rupiah=250000)
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
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
        await _upload_and_submit_signed_approval_letter(client, token=student_token, reservation_id=reservation["id"])

        review = await client.post(
            f"/staff/reservations/{reservation['id']}/document-review/approve",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        updated = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert review.status_code == 200
    assert review.json()["reservation_id"] == reservation["id"]
    assert review.json()["status"] == "pending_payment"
    assert updated.json()["status"] == "pending_payment"
    assert updated.json()["payment_upload_due_at"] == "2026-05-02T03:00:00Z"


@pytest.mark.anyio
async def test_assigned_staff_rejection_requires_reason():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
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
        await _upload_and_submit_signed_approval_letter(client, token=student_token, reservation_id=reservation["id"])

        review = await client.post(
            f"/staff/reservations/{reservation['id']}/document-review/reject",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"reason": "   "},
        )
        unchanged = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert review.status_code == 400
    assert review.json()["detail"] == "Alasan penolakan wajib diisi."
    assert unchanged.json()["status"] == "pending_document_review"


@pytest.mark.anyio
async def test_assigned_staff_rejection_rejects_reservation_without_revision():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(
            client,
            email="budi@apps.ipb.ac.id",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
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
        await _upload_and_submit_signed_approval_letter(client, token=student_token, reservation_id=reservation["id"])

        review = await client.post(
            f"/staff/reservations/{reservation['id']}/document-review/reject",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"reason": "Tanda tangan penanggung jawab fasilitas tidak lengkap."},
        )
        updated = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert review.status_code == 200
    assert review.json() == {
        "reservation_id": reservation["id"],
        "status": "rejected",
        "rejection_reason": "Tanda tangan penanggung jawab fasilitas tidak lengkap.",
    }
    assert updated.json()["status"] == "rejected"
    assert updated.json()["document"]["review_status"] == "rejected"
    assert updated.json()["document"]["rejection_reason"] == "Tanda tangan penanggung jawab fasilitas tidak lengkap."
    assert updated.json()["rejection"] == {
        "source": "document",
        "reason": "Tanda tangan penanggung jawab fasilitas tidak lengkap.",
    }
