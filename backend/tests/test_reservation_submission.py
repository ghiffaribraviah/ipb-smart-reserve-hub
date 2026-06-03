from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

from app.core.database import build_engine
from app.main import create_app
from app.models import Reservation, ReservationStatus, UserRole
from app.pdf import ApprovalLetterPdfGenerator
from app.repositories.reservation_repository import ReservationFacilityRecord
from app.services.accounts import UserAccount
from app.services.booking_settings import BookingSettings
from app.services.reservation_time_selection import ReservationTimeSelection
from app.services.reservations import (
    ReservationModule,
    ReservationSubmission,
    ReservationSubmissionConflict,
    ReservationTimeUnavailable,
)
from tests.data_builder import DataBuilder


class AvailableTimeSelection:
    def validate_time_selection(self, facility_id: str, *, starts_at: datetime, ends_at: datetime):
        return ReservationTimeSelection(available=True, errors=[])


class RejectingSubmissionConflictGuard:
    def ensure_reservation_can_be_held(self, facility_id: str, *, starts_at: datetime, ends_at: datetime) -> None:
        raise ReservationSubmissionConflict


class StubReservationRepository:
    def __init__(self) -> None:
        self.added_reservations: list[Reservation] = []

    def get_active_facility(self, facility_id: str) -> ReservationFacilityRecord | None:
        return ReservationFacilityRecord(id=facility_id, name="Auditorium Andi Hakim Nasoetion", capacity=120, price_rupiah=0)

    def add(self, reservation: Reservation) -> Reservation:
        self.added_reservations.append(reservation)
        return reservation

    def list_for_student(self, student_id: str) -> list[Reservation]:
        return []

    def get_for_student(self, reservation_id: str, student_id: str) -> Reservation | None:
        return None


def _create_legacy_reservations_table_with_required_organization_unit(database_url: str) -> None:
    engine = build_engine(database_url)
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE reservations (
                    id VARCHAR(36) PRIMARY KEY,
                    facility_id VARCHAR(36) NOT NULL,
                    student_id VARCHAR(36) NOT NULL,
                    organization_unit_id VARCHAR(36) NOT NULL,
                    reservation_code VARCHAR(32) NOT NULL UNIQUE,
                    activity_title VARCHAR(255) NOT NULL,
                    event_description TEXT NOT NULL,
                    participant_count INTEGER NOT NULL,
                    contact_phone VARCHAR(32) NOT NULL,
                    price_rupiah INTEGER NOT NULL,
                    organization_unit_name VARCHAR(255) NOT NULL,
                    extra_requirement_av_support BOOLEAN NOT NULL DEFAULT 0,
                    extra_requirement_logistics_coordination BOOLEAN NOT NULL DEFAULT 0,
                    extra_requirement_extra_cleaning BOOLEAN NOT NULL DEFAULT 0,
                    extra_requirement_security_personnel BOOLEAN NOT NULL DEFAULT 0,
                    extra_requirement_notes TEXT,
                    starts_at DATETIME NOT NULL,
                    ends_at DATETIME NOT NULL,
                    document_upload_due_at DATETIME,
                    document_verification_due_at DATETIME,
                    payment_upload_due_at DATETIME,
                    payment_verification_due_at DATETIME,
                    status VARCHAR(32) NOT NULL,
                    rejection_reason TEXT,
                    rejection_source VARCHAR(32),
                    cancellation_reason TEXT,
                    cancellation_rejection_reason TEXT,
                    created_at DATETIME NOT NULL
                )
                """
            )
        )


def test_reservation_submission_rejects_commit_time_conflict_after_available_time_selection():
    reservation_repository = StubReservationRepository()
    reservations = ReservationModule(
        reservation_repository=reservation_repository,
        reservation_time_selection=AvailableTimeSelection(),
        submission_conflict_guard=RejectingSubmissionConflictGuard(),
        booking_settings=BookingSettings.defaults(),
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )

    with pytest.raises(ReservationTimeUnavailable):
        reservations.submit_reservation(
            UserAccount(
                id="student-1",
                email="budi@apps.ipb.ac.id",
                full_name="Budi Santoso",
                role=UserRole.student,
                is_active=True,
            ),
            ReservationSubmission(
                facility_id="facility-1",
                activity_title="Seminar Karier",
                event_description="Seminar persiapan karier untuk mahasiswa tingkat akhir.",
                participant_count=80,
                organization_unit_name="Himpunan Mahasiswa Ilmu Komputer",
                contact_phone="08123456789",
                starts_at=datetime(2026, 6, 1, 2, tzinfo=UTC),
                ends_at=datetime(2026, 6, 1, 4, tzinfo=UTC),
            ),
        )

    assert reservation_repository.added_reservations == []


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
    assert created_body["document_upload_due_at"] == "2026-05-04T00:00:00Z"
    assert created_body["document"] == {
        "approval_letter": {
            "filename": f"{created_body['reservation_code']}-surat-persetujuan.pdf",
            "content_type": "application/pdf",
            "size_bytes": created_body["document"]["approval_letter"]["size_bytes"],
            "generated_at": "2026-05-01T00:00:00Z",
            "uploaded_at": None,
            "letter_number": "RSV/IPBSRH/2026/000001",
        },
        "signed_approval_letter": None,
        "review_status": "upload_needed",
        "rejection_reason": None,
    }
    assert created_body["document"]["approval_letter"]["size_bytes"] > 0
    assert created_body["payment"] == {
        "required": True,
        "receipt": None,
        "review_status": "not_ready",
        "rejection_reason": None,
    }
    assert created_body["rejection"] is None
    assert created_body["extra_requirements"] == {
        "av_support": False,
        "logistics_coordination": False,
        "extra_cleaning": False,
        "security_personnel": False,
        "notes": None,
    }

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
async def test_student_submits_reservation_with_free_form_organization_name(monkeypatch):
    monkeypatch.setattr(ApprovalLetterPdfGenerator, "generate", lambda self, letter_input: b"%PDF-1.4\n")
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
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
                "organization_unit_name": "  Himpunan Mahasiswa Ilmu Komputer  ",
                "contact_phone": "08123456789",
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )
        detail = await client.get(
            f"/student/reservations/{created.json().get('id', 'missing')}",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert created.status_code == 201
    assert created.json()["organization_unit"] == {
        "id": None,
        "name": "Himpunan Mahasiswa Ilmu Komputer",
    }
    assert detail.status_code == 200
    assert detail.json()["organization_unit"] == created.json()["organization_unit"]


@pytest.mark.anyio
async def test_student_cannot_submit_reservation_during_facility_blackout():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    test_data.add_facility_blackout(
        facility_id,
        starts_at="2026-06-01T02:30:00+00:00",
        ends_at="2026-06-01T03:30:00+00:00",
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

        created = await client.post(
            f"/facilities/{facility_id}/reservations",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "activity_title": "Seminar Karier",
                "event_description": "Seminar persiapan karier untuk mahasiswa tingkat akhir.",
                "participant_count": 80,
                "organization_unit_name": "BEM KM IPB",
                "contact_phone": "08123456789",
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert created.status_code == 409
    assert created.json()["detail"] == "Waktu reservasi tidak tersedia."


@pytest.mark.anyio
async def test_student_submits_free_form_organization_after_existing_schema_is_migrated(tmp_path, monkeypatch):
    monkeypatch.setattr(ApprovalLetterPdfGenerator, "generate", lambda self, letter_input: b"%PDF-1.4\n")
    database_url = f"sqlite+pysqlite:///{tmp_path / 'legacy.db'}"
    _create_legacy_reservations_table_with_required_organization_unit(database_url)
    app = create_app(
        database_url=database_url,
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
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
                "organization_unit_name": "Himpunan Mahasiswa Ilmu Komputer",
                "contact_phone": "08123456789",
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert created.status_code == 201
    assert created.json()["organization_unit"] == {
        "id": None,
        "name": "Himpunan Mahasiswa Ilmu Komputer",
    }


@pytest.mark.anyio
async def test_student_cannot_submit_reservation_with_participant_count_above_facility_capacity():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Ruang Rapat Senat", capacity=50)
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
                "activity_title": "Rapat Kerja",
                "event_description": "Rapat evaluasi tengah semester.",
                "participant_count": 51,
                "organization_unit_id": organization_unit_id,
                "contact_phone": "08123456789",
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

        reservation_list = await client.get("/student/reservations", headers={"Authorization": f"Bearer {token}"})

    assert created.status_code == 400
    assert created.json()["detail"] == "Jumlah peserta melebihi kapasitas fasilitas."
    assert reservation_list.status_code == 200
    assert reservation_list.json() == []


@pytest.mark.anyio
async def test_student_cannot_submit_reservation_with_whitespace_only_required_text_fields():
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

        created = await client.post(
            f"/facilities/{facility_id}/reservations",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "activity_title": "   ",
                "event_description": "\n\t  ",
                "participant_count": 80,
                "organization_unit_id": organization_unit_id,
                "contact_phone": "   ",
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert created.status_code == 422
    details = created.json()["detail"]
    assert any(issue["loc"][-1] == "activity_title" for issue in details)
    assert any(issue["loc"][-1] == "event_description" for issue in details)
    assert any(issue["loc"][-1] == "contact_phone" for issue in details)


@pytest.mark.anyio
async def test_student_cannot_submit_reservation_when_title_or_contact_phone_exceed_model_limits():
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

        created = await client.post(
            f"/facilities/{facility_id}/reservations",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "activity_title": "A" * 256,
                "event_description": "Deskripsi valid untuk reservasi.",
                "participant_count": 80,
                "organization_unit_id": organization_unit_id,
                "contact_phone": "0" * 33,
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert created.status_code == 422
    details = created.json()["detail"]
    assert any(issue["loc"][-1] == "activity_title" for issue in details)
    assert any(issue["loc"][-1] == "contact_phone" for issue in details)


@pytest.mark.anyio
async def test_student_submits_extra_requirements_and_views_them_in_reservation_responses():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    extra_requirements = {
        "av_support": True,
        "logistics_coordination": True,
        "extra_cleaning": False,
        "security_personnel": True,
        "notes": "Butuh dua mic wireless dan meja registrasi.",
    }

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
                "extra_requirements": extra_requirements,
            },
        )

        reservation_list = await client.get("/student/reservations", headers={"Authorization": f"Bearer {token}"})
        detail = await client.get(
            f"/student/reservations/{created.json()['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert created.status_code == 201
    assert created.json()["extra_requirements"] == extra_requirements
    assert reservation_list.status_code == 200
    assert reservation_list.json()[0]["extra_requirements"] == extra_requirements
    assert detail.status_code == 200
    assert detail.json()["extra_requirements"] == extra_requirements


@pytest.mark.anyio
async def test_student_rejected_reservation_without_persisted_source_exposes_unknown_rejection_source():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    reservation_id = test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Legacy Rejection",
        starts_at="2026-06-01T02:00:00+00:00",
        ends_at="2026-06-01T04:00:00+00:00",
        status=ReservationStatus.rejected,
        rejection_reason="Data lama tidak memiliki sumber penolakan.",
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login = await client.post(
            "/auth/login",
            json={"email": "student-legacy-rejection@apps.ipb.ac.id", "password": "secret123"},
        )
        token = login.json()["access_token"]

        reservation_list = await client.get("/student/reservations", headers={"Authorization": f"Bearer {token}"})
        detail = await client.get(
            f"/student/reservations/{reservation_id}",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert reservation_list.status_code == 200
    assert detail.status_code == 200
    assert reservation_list.json()[0]["rejection"] == {
        "source": "unknown",
        "reason": "Data lama tidak memiliki sumber penolakan.",
    }
    assert detail.json()["rejection"] == {
        "source": "unknown",
        "reason": "Data lama tidak memiliki sumber penolakan.",
    }


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
    assert first.json()["document"]["approval_letter"]["letter_number"] == "RSV/IPBSRH/2026/000001"
    assert second.json()["document"]["approval_letter"]["letter_number"] == "RSV/IPBSRH/2026/000002"
