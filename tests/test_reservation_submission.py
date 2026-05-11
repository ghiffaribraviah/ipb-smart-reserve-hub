from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import Reservation, ReservationStatus, UserRole
from app.repositories.reservation_repository import ReservationFacilityRecord, ReservationOrganizationUnitRecord
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
        return ReservationFacilityRecord(id=facility_id, name="Auditorium Andi Hakim Nasoetion", price_rupiah=0)

    def get_active_organization_unit(self, organization_unit_id: str) -> ReservationOrganizationUnitRecord | None:
        return ReservationOrganizationUnitRecord(id=organization_unit_id, name="BEM KM IPB")

    def add(self, reservation: Reservation) -> Reservation:
        self.added_reservations.append(reservation)
        return reservation

    def list_for_student(self, student_id: str) -> list[Reservation]:
        return []

    def get_for_student(self, reservation_id: str, student_id: str) -> Reservation | None:
        return None


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
                organization_unit_id="organization-unit-1",
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
        "approval_letter": None,
        "signed_approval_letter": None,
        "review_status": "upload_needed",
        "rejection_reason": None,
    }
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
