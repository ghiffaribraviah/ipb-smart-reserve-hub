from dataclasses import dataclass
from datetime import datetime, time

import pytest
from httpx import ASGITransport, AsyncClient

from app.services.facility_availability import FacilityAvailabilityModule
from app.repositories.facility_availability_reader import FacilityAvailabilityFacts, FacilityOpenHourRecord
from app.repositories.facility_catalog_reader import FacilityCatalogImageRecord, FacilityCatalogRecord
from app.services.facilities import FacilityCatalogModule
from app.main import create_app
from app.models import Facility, FacilityCategory, FacilityImage, ReservationStatus, UserRole
from tests.data_builder import DataBuilder


class StubFacilityCatalogReader:
    def __init__(self, facilities: list[FacilityCatalogRecord]) -> None:
        self._facilities = facilities

    def list_active_facilities(self) -> list[FacilityCatalogRecord]:
        return self._facilities

    def get_active_facility_by_id(self, facility_id: str) -> FacilityCatalogRecord | None:
        return next((facility for facility in self._facilities if facility.id == facility_id), None)

    def list_public_calendar_reservations(self, facility_id: str, *, starts_at: datetime, ends_at: datetime) -> list:
        return []


class StubFacilityAvailabilityRepository:
    def load_availability_facts(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
        blocking_statuses: tuple,
    ):
        return FacilityAvailabilityFacts(
            active_facility_exists=facility_id == "facility-1",
            open_hours=[FacilityOpenHourRecord(day_of_week=0, opens_at=time(8, 0), closes_at=time(16, 0))],
            has_overlapping_blackout=False,
            has_overlapping_reservation=True,
        )


def build_facility_record(*, name: str = "Auditorium Andi Hakim Nasoetion", price_rupiah: int = 0) -> Facility:
    category = FacilityCategory(name="Auditorium")
    facility = Facility(
        id="facility-1",
        name=name,
        category=category,
        location="Kampus IPB Dramaga",
        capacity=120,
        description="Ruang kegiatan mahasiswa",
        contact_name="TU Fasilitas",
        contact_phone="0251-8620000",
        price_rupiah=price_rupiah,
        open_hours_summary="Senin-Jumat 08.00-16.00",
        rating_average=None,
        review_count=0,
        is_active=True,
    )
    facility.images.append(
        FacilityImage(
            url="https://cdn.example.test/auditorium-cover.jpg",
            alt_text="Auditorium cover",
            display_order=1,
            is_cover=True,
            is_active=True,
        )
    )
    return facility


def test_facility_catalog_module_projects_public_catalog_items_through_repository_seam():
    facility_catalog = FacilityCatalogModule(
        facility_catalog_reader=StubFacilityCatalogReader(
            [
                FacilityCatalogRecord(
                    id="facility-1",
                    name="Auditorium Andi Hakim Nasoetion",
                    location="Kampus IPB Dramaga",
                    capacity=120,
                    category="Auditorium",
                    description="Ruang kegiatan mahasiswa",
                    contact_name="TU Fasilitas",
                    contact_phone="0251-8620000",
                    contact_email=None,
                    price_rupiah=0,
                    open_hours_summary="Senin-Jumat 08.00-16.00",
                    rating_average=None,
                    review_count=0,
                    images=[
                        FacilityCatalogImageRecord(
                            url="https://cdn.example.test/auditorium-cover.jpg",
                            alt_text="Auditorium cover",
                            is_cover=True,
                            is_active=True,
                        )
                    ],
                )
            ]
        )
    )

    catalog_items = facility_catalog.list_active_facilities()

    assert catalog_items[0].name == "Auditorium Andi Hakim Nasoetion"
    assert catalog_items[0].cover_image_url == "https://cdn.example.test/auditorium-cover.jpg"
    assert catalog_items[0].price_summary == "Gratis"


def test_facility_availability_module_concentrates_reservation_time_rules():
    facility_availability = FacilityAvailabilityModule(
        facility_availability_reader=StubFacilityAvailabilityRepository()
    )

    availability = facility_availability.check_availability(
        "facility-1",
        starts_at=datetime.fromisoformat("2026-06-01T02:00:00+00:00"),
        ends_at=datetime.fromisoformat("2026-06-01T04:00:00+00:00"),
    )

    assert availability.available is False
    assert availability.reasons == ["reserved_time"]


@pytest.mark.anyio
async def test_students_browse_active_facilities_from_catalog():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    active_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.create_facility(name="Ruang Tidak Aktif", is_active=False)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/facilities")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": active_id,
            "name": "Auditorium Andi Hakim Nasoetion",
            "location": "Kampus IPB Dramaga",
            "capacity": 120,
            "category": "Auditorium",
            "cover_image_url": "https://cdn.example.test/auditorium-cover.jpg",
            "rating_average": None,
            "review_count": 0,
            "price_summary": "Gratis",
            "open_hours_summary": "Senin-Jumat 08.00-16.00",
        }
    ]


@pytest.mark.anyio
async def test_students_view_facility_detail_public_information():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Gedung Graha Widya Wisuda")
    test_data.add_facility_image(
        facility_id,
        url="https://cdn.example.test/gww-stage.jpg",
        display_order=2,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(f"/facilities/{facility_id}")

    assert response.status_code == 200
    assert response.json() == {
        "id": facility_id,
        "name": "Gedung Graha Widya Wisuda",
        "location": "Kampus IPB Dramaga",
        "capacity": 120,
        "category": "Auditorium",
        "description": "Ruang kegiatan mahasiswa",
        "contact": {
            "name": "TU Fasilitas",
            "phone": "0251-8620000",
            "email": None,
        },
        "images": [
            {
                "url": "https://cdn.example.test/auditorium-cover.jpg",
                "alt_text": "Auditorium cover",
                "is_cover": True,
            },
            {
                "url": "https://cdn.example.test/gww-stage.jpg",
                "alt_text": "Facility image 2",
                "is_cover": False,
            },
        ],
        "price": {
            "is_free": True,
            "amount_rupiah": 0,
            "summary": "Gratis",
        },
        "open_hours_summary": "Senin-Jumat 08.00-16.00",
        "review_summary": {
            "rating_average": None,
            "review_count": 0,
        },
    }


@pytest.mark.anyio
async def test_paid_facility_detail_shows_price_status_and_summary():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    facility_id = DataBuilder(app).create_facility(name="Lapangan Tenis Indoor", price_rupiah=250000)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(f"/facilities/{facility_id}")

    assert response.status_code == 200
    assert response.json()["price"] == {
        "is_free": False,
        "amount_rupiah": 250000,
        "summary": "Rp250.000",
    }


@pytest.mark.anyio
async def test_students_view_public_facility_calendar_without_private_reservation_data():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Seminar Karier",
        starts_at="2026-06-01T02:00:00+00:00",
        ends_at="2026-06-01T04:00:00+00:00",
        status=ReservationStatus.pending_document_upload,
    )
    test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Workshop Kewirausahaan",
        starts_at="2026-06-02T03:00:00+00:00",
        ends_at="2026-06-02T05:00:00+00:00",
        status=ReservationStatus.approved,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            f"/facilities/{facility_id}/calendar",
            params={
                "start": "2026-06-01T00:00:00+00:00",
                "end": "2026-06-03T00:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == [
        {
            "facility_name": "Auditorium Andi Hakim Nasoetion",
            "activity_title": "Seminar Karier",
            "organization_unit": "BEM KM IPB",
            "starts_at": "2026-06-01T02:00:00Z",
            "ends_at": "2026-06-01T04:00:00Z",
        },
        {
            "facility_name": "Auditorium Andi Hakim Nasoetion",
            "activity_title": "Workshop Kewirausahaan",
            "organization_unit": "BEM KM IPB",
            "starts_at": "2026-06-02T03:00:00Z",
            "ends_at": "2026-06-02T05:00:00Z",
        },
    ]


@pytest.mark.anyio
async def test_students_check_facility_availability_against_open_hours():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        inside_hours = await client.get(
            f"/facilities/{facility_id}/availability",
            params={
                "start": "2026-06-01T02:00:00+00:00",
                "end": "2026-06-01T04:00:00+00:00",
            },
        )
        outside_hours = await client.get(
            f"/facilities/{facility_id}/availability",
            params={
                "start": "2026-06-01T11:30:00+00:00",
                "end": "2026-06-01T12:30:00+00:00",
            },
        )

    assert inside_hours.status_code == 200
    assert inside_hours.json() == {"available": True, "reasons": []}
    assert outside_hours.status_code == 200
    assert outside_hours.json() == {"available": False, "reasons": ["outside_open_hours"]}


@pytest.mark.anyio
async def test_students_check_facility_availability_against_blackout_periods():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
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
        response = await client.get(
            f"/facilities/{facility_id}/availability",
            params={
                "start": "2026-06-01T02:00:00+00:00",
                "end": "2026-06-01T04:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {"available": False, "reasons": ["blackout_period"]}


@pytest.mark.anyio
async def test_students_check_facility_availability_against_blocking_reservations():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Seminar Karier",
        starts_at="2026-06-01T02:30:00+00:00",
        ends_at="2026-06-01T03:30:00+00:00",
        status=ReservationStatus.approved,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            f"/facilities/{facility_id}/availability",
            params={
                "start": "2026-06-01T02:00:00+00:00",
                "end": "2026-06-01T04:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {"available": False, "reasons": ["reserved_time"]}


@pytest.mark.anyio
async def test_students_validate_available_reservation_time_selection():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-01T00:00:00+00:00"),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {"available": True, "errors": []}


@pytest.mark.anyio
async def test_reservation_time_selection_accepts_jakarta_local_timestamps_for_open_hours():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-01T07:00:00+07:00"),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-06-01T09:00:00+07:00",
                "ends_at": "2026-06-01T11:00:00+07:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {"available": True, "errors": []}


@pytest.mark.anyio
async def test_reservation_time_selection_rejects_times_outside_five_minute_increments():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-01T00:00:00+00:00"),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-06-01T02:03:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "available": False,
        "errors": [
            {
                "reason": "invalid_time_increment",
                "message": "Waktu reservasi harus mengikuti kelipatan 5 menit.",
            }
        ],
    }


@pytest.mark.anyio
async def test_reservation_time_selection_rejects_duration_below_one_hour():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-01T00:00:00+00:00"),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T02:55:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "available": False,
        "errors": [
            {
                "reason": "minimum_duration",
                "message": "Durasi reservasi minimal 1 jam.",
            }
        ],
    }


@pytest.mark.anyio
async def test_reservation_time_selection_rejects_ranges_crossing_midnight_in_jakarta():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-01T00:00:00+00:00"),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="00:00", closes_at="23:59")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-06-01T16:00:00+00:00",
                "ends_at": "2026-06-01T17:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "available": False,
        "errors": [
            {
                "reason": "crosses_midnight",
                "message": "Waktu reservasi harus berada pada hari yang sama.",
            }
        ],
    }


@pytest.mark.anyio
async def test_reservation_time_selection_rejects_times_outside_facility_open_hours():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-01T00:00:00+00:00"),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-06-01T11:30:00+00:00",
                "ends_at": "2026-06-01T12:30:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "available": False,
        "errors": [
            {
                "reason": "outside_open_hours",
                "message": "Waktu reservasi berada di luar jam operasional fasilitas.",
            }
        ],
    }


@pytest.mark.anyio
async def test_reservation_time_selection_rejects_blackout_periods():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-01T00:00:00+00:00"),
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
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "available": False,
        "errors": [
            {
                "reason": "blackout_period",
                "message": "Waktu reservasi berada pada periode fasilitas tidak tersedia.",
            }
        ],
    }


@pytest.mark.anyio
async def test_reservation_time_selection_rejects_blocking_reservations():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-01T00:00:00+00:00"),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Seminar Karier",
        starts_at="2026-06-01T02:30:00+00:00",
        ends_at="2026-06-01T03:30:00+00:00",
        status=ReservationStatus.approved,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "available": False,
        "errors": [
            {
                "reason": "reserved_time",
                "message": "Waktu reservasi sudah dipesan.",
            }
        ],
    }


@pytest.mark.anyio
async def test_reservation_time_selection_rejects_start_less_than_default_lead_time():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-20T00:00:00+00:00"),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "available": False,
        "errors": [
            {
                "reason": "below_minimum_lead_time",
                "message": "Reservasi harus diajukan minimal 14 hari sebelum waktu mulai.",
            }
        ],
    }


@pytest.mark.anyio
async def test_reservation_time_selection_rejects_start_beyond_default_advance_window():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-01T00:00:00+00:00"),
    )
    test_data = DataBuilder(app)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=2, opens_at="08:00", closes_at="16:00")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-07-01T02:00:00+00:00",
                "ends_at": "2026-07-01T04:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "available": False,
        "errors": [
            {
                "reason": "beyond_maximum_advance_window",
                "message": "Reservasi hanya dapat diajukan maksimal 60 hari sebelum waktu mulai.",
            }
        ],
    }


@pytest.mark.anyio
async def test_reservation_time_selection_uses_configured_minimum_lead_time():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-30T00:00:00+00:00"),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_login = await client.post(
            "/auth/login",
            json={"email": "admin@ipb.ac.id", "password": "secret123"},
        )
        admin_token = admin_login.json()["access_token"]
        await client.patch(
            "/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "min_booking_lead_hours": 72,
                "max_booking_advance_hours": 1440,
                "document_upload_due_hours": 72,
                "document_verification_due_hours": 48,
                "payment_upload_due_hours": 24,
                "payment_verification_due_hours": 24,
                "final_approval_cutoff_hours": 168,
                "overdue_final_approval_cutoff_hours": 96,
                "allowed_student_email_domains": ["apps.ipb.ac.id"],
            },
        )
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "available": False,
        "errors": [
            {
                "reason": "below_minimum_lead_time",
                "message": "Reservasi harus diajukan minimal 3 hari sebelum waktu mulai.",
            }
        ],
    }


@pytest.mark.anyio
async def test_reservation_time_selection_uses_configured_maximum_advance_window():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime.fromisoformat("2026-05-01T00:00:00+00:00"),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_login = await client.post(
            "/auth/login",
            json={"email": "admin@ipb.ac.id", "password": "secret123"},
        )
        admin_token = admin_login.json()["access_token"]
        await client.patch(
            "/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "min_booking_lead_hours": 336,
                "max_booking_advance_hours": 720,
                "document_upload_due_hours": 72,
                "document_verification_due_hours": 48,
                "payment_upload_due_hours": 24,
                "payment_verification_due_hours": 24,
                "final_approval_cutoff_hours": 168,
                "overdue_final_approval_cutoff_hours": 96,
                "allowed_student_email_domains": ["apps.ipb.ac.id"],
            },
        )
        response = await client.post(
            f"/facilities/{facility_id}/reservation-time-selection",
            json={
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "available": False,
        "errors": [
            {
                "reason": "beyond_maximum_advance_window",
                "message": "Reservasi hanya dapat diajukan maksimal 30 hari sebelum waktu mulai.",
            }
        ],
    }
