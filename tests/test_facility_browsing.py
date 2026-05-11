from dataclasses import dataclass
from datetime import datetime, time

import pytest
from httpx import ASGITransport, AsyncClient

from app.services.facility_availability import FacilityAvailabilityModule
from app.repositories.facility_availability_reader import FacilityAvailabilityFacts, FacilityOpenHourRecord
from app.repositories.facility_catalog_reader import (
    FacilityCatalogImageRecord,
    FacilityCatalogQuery,
    FacilityCatalogRecord,
    FacilityReviewRecord,
)
from app.services.facilities import FacilityCatalogModule
from app.main import create_app
from app.models import Facility, FacilityCategory, FacilityImage, ReservationStatus, UserRole
from tests.data_builder import DataBuilder


class StubFacilityCatalogReader:
    def __init__(self, facilities: list[FacilityCatalogRecord]) -> None:
        self._facilities = facilities

    def list_active_facilities(self, query: FacilityCatalogQuery):
        from app.repositories.facility_catalog_reader import apply_facility_catalog_query

        return apply_facility_catalog_query(self._facilities, query)

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
                    category_slug="auditorium",
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

    catalog_page = facility_catalog.list_active_facilities()

    assert catalog_page.page == 1
    assert catalog_page.page_size == 12
    assert catalog_page.total_items == 1
    assert catalog_page.items[0].name == "Auditorium Andi Hakim Nasoetion"
    assert catalog_page.items[0].cover_image_url == "https://cdn.example.test/auditorium-cover.jpg"
    assert catalog_page.items[0].price_summary == "Gratis"


def test_facility_catalog_module_sorts_by_public_rating_descending():
    lower_rated = FacilityCatalogRecord(
        id="facility-lower",
        name="Alpha Lower Rated Facility",
        location="Kampus IPB Dramaga",
        capacity=120,
        category="Auditorium",
        category_slug="auditorium",
        description="Ruang kegiatan mahasiswa",
        contact_name="TU Fasilitas",
        contact_phone="0251-8620000",
        contact_email=None,
        price_rupiah=0,
        open_hours_summary="Senin-Jumat 08.00-16.00",
        rating_average=None,
        review_count=0,
        images=[],
        reviews=[
            FacilityReviewRecord(
                id="review-lower",
                rating=3,
                comment=None,
                author_name="Student",
                created_at=datetime.fromisoformat("2026-01-01T00:00:00+00:00"),
                is_deleted=False,
            )
        ],
    )
    higher_rated = FacilityCatalogRecord(
        id="facility-higher",
        name="Zulu Higher Rated Facility",
        location="Kampus IPB Dramaga",
        capacity=120,
        category="Auditorium",
        category_slug="auditorium",
        description="Ruang kegiatan mahasiswa",
        contact_name="TU Fasilitas",
        contact_phone="0251-8620000",
        contact_email=None,
        price_rupiah=0,
        open_hours_summary="Senin-Jumat 08.00-16.00",
        rating_average=None,
        review_count=0,
        images=[],
        reviews=[
            FacilityReviewRecord(
                id="review-higher",
                rating=5,
                comment=None,
                author_name="Student",
                created_at=datetime.fromisoformat("2026-01-01T00:00:00+00:00"),
                is_deleted=False,
            )
        ],
    )
    facility_catalog = FacilityCatalogModule(
        facility_catalog_reader=StubFacilityCatalogReader([lower_rated, higher_rated])
    )

    page = facility_catalog.list_active_facilities(sort="rating_desc")

    assert [item.id for item in page.items] == ["facility-higher", "facility-lower"]
    assert [item.rating_average for item in page.items] == [5.0, 3.0]


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
    assert response.json() == {
        "items": [
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
        ],
        "page": 1,
        "page_size": 12,
        "total_items": 1,
        "total_pages": 1,
    }


@pytest.mark.anyio
async def test_facility_catalog_paginates_with_requested_page_and_caps_page_size():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    facility_ids = [
        test_data.create_facility(name=f"Facility {index:02d}")
        for index in range(1, 62)
    ]
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/facilities?page=2&page_size=60")

    assert response.status_code == 200
    payload = response.json()
    assert payload["page"] == 2
    assert payload["page_size"] == 50
    assert payload["total_items"] == 61
    assert payload["total_pages"] == 2
    assert [item["id"] for item in payload["items"]] == facility_ids[50:]


@pytest.mark.anyio
async def test_facility_catalog_filters_by_keyword_and_category_slug():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_facility(
        name="Auditorium Andi Hakim Nasoetion",
        category_name="Auditorium",
        category_slug="auditorium",
    )
    classroom_id = test_data.create_facility(
        name="Ruang Kelas CCR",
        category_name="Ruang Kelas",
        category_slug="ruang-kelas",
        category_icon_hint="school",
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/facilities?q=kelas&category=ruang-kelas")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total_items"] == 1
    assert [item["id"] for item in payload["items"]] == [classroom_id]


@pytest.mark.anyio
async def test_facility_catalog_filters_by_minimum_capacity():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_facility(name="Ruang Seminar", capacity=80)
    auditorium_id = test_data.create_facility(name="Auditorium Besar", capacity=450)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/facilities?min_capacity=200")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total_items"] == 1
    assert [item["id"] for item in payload["items"]] == [auditorium_id]


@pytest.mark.anyio
async def test_facility_catalog_sorts_by_name_capacity_and_price():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    small_paid_id = test_data.create_facility(name="Beta Room", capacity=40, price_rupiah=200000)
    large_free_id = test_data.create_facility(name="Alpha Hall", capacity=300, price_rupiah=0)
    medium_paid_id = test_data.create_facility(name="Gamma Studio", capacity=120, price_rupiah=100000)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        by_name = await client.get("/facilities?sort=name_asc")
        by_capacity = await client.get("/facilities?sort=capacity_desc")
        by_price_asc = await client.get("/facilities?sort=price_asc")
        by_price_desc = await client.get("/facilities?sort=price_desc")

    assert [item["id"] for item in by_name.json()["items"]] == [large_free_id, small_paid_id, medium_paid_id]
    assert [item["id"] for item in by_capacity.json()["items"]] == [large_free_id, medium_paid_id, small_paid_id]
    assert [item["id"] for item in by_price_asc.json()["items"]] == [large_free_id, medium_paid_id, small_paid_id]
    assert [item["id"] for item in by_price_desc.json()["items"]] == [small_paid_id, medium_paid_id, large_free_id]


@pytest.mark.anyio
async def test_featured_facility_catalog_returns_paginated_public_ranking():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    no_cover_id = test_data.create_facility(name="Alpha No Cover", include_cover_image=False)
    lower_review_count_id = test_data.create_facility(name="Beta One Review")
    higher_rating_id = test_data.create_facility(name="Delta Higher Rating")
    higher_review_count_id = test_data.create_facility(name="Zulu More Reviews")
    test_data.create_facility(name="Inactive Featured Candidate", is_active=False)
    test_data.add_facility_review(no_cover_id, rating=5, activity_title="No Cover Review")
    test_data.add_facility_review(lower_review_count_id, rating=4, activity_title="One Review")
    test_data.add_facility_review(lower_review_count_id, rating=5, activity_title="Deleted Review", is_deleted=True)
    test_data.add_facility_review(higher_rating_id, rating=5, activity_title="Higher Rating Review")
    test_data.add_facility_review(higher_review_count_id, rating=3, activity_title="More Reviews One")
    test_data.add_facility_review(higher_review_count_id, rating=3, activity_title="More Reviews Two")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/facilities?featured=true")

    assert response.status_code == 200
    payload = response.json()
    assert payload["page"] == 1
    assert payload["page_size"] == 12
    assert payload["total_items"] == 4
    assert payload["total_pages"] == 1
    assert [item["id"] for item in payload["items"]] == [
        higher_review_count_id,
        higher_rating_id,
        lower_review_count_id,
        no_cover_id,
    ]


@pytest.mark.anyio
async def test_featured_facility_catalog_accepts_limit_as_page_size_alias():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    facility_ids = [
        test_data.create_facility(name=f"Featured Facility {index:02d}")
        for index in range(1, 5)
    ]
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/facilities?featured=true&limit=2")

    assert response.status_code == 200
    payload = response.json()
    assert payload["page"] == 1
    assert payload["page_size"] == 2
    assert payload["total_items"] == 4
    assert payload["total_pages"] == 2
    assert [item["id"] for item in payload["items"]] == facility_ids[:2]


@pytest.mark.anyio
async def test_facility_catalog_rejects_unknown_sort_values():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/facilities?sort=distance_asc")

    assert response.status_code == 422


@pytest.mark.anyio
async def test_public_facility_categories_include_slugs_icon_hints_and_active_facility_counts():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    auditorium_id = test_data.create_facility_category(
        name="Auditorium",
        slug="auditorium",
        icon_hint="presentation",
    )
    classroom_id = test_data.create_facility_category(
        name="Ruang Kelas",
        slug="ruang-kelas",
        icon_hint="school",
    )
    test_data.create_facility_category(
        name="Kategori Lama",
        slug="kategori-lama",
        icon_hint="archive",
        is_active=False,
    )
    test_data.create_facility(
        name="Auditorium Andi Hakim Nasoetion",
        category_name="Auditorium",
        category_slug="auditorium",
        category_icon_hint="presentation",
    )
    test_data.create_facility(
        name="Auditorium Nonaktif",
        category_name="Auditorium",
        category_slug="auditorium",
        category_icon_hint="presentation",
        is_active=False,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/facility-categories")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": auditorium_id,
            "name": "Auditorium",
            "slug": "auditorium",
            "icon_hint": "presentation",
            "facility_count": 1,
        },
        {
            "id": classroom_id,
            "name": "Ruang Kelas",
            "slug": "ruang-kelas",
            "icon_hint": "school",
            "facility_count": 0,
        },
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
        "reviews": [],
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
