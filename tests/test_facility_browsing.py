import pytest
from httpx import ASGITransport, AsyncClient

from app.facilities import FacilityCatalogModule
from app.main import create_app
from app.models import Facility, FacilityCategory, FacilityImage
from tests.data_builder import DataBuilder


class StubFacilityRepository:
    def __init__(self, facilities: list[Facility]) -> None:
        self._facilities = facilities

    def list_active_facilities(self) -> list[Facility]:
        return self._facilities

    def get_active_facility_by_id(self, facility_id: str) -> Facility | None:
        return next((facility for facility in self._facilities if facility.id == facility_id), None)


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
        facility_repository=StubFacilityRepository([build_facility_record()])
    )

    catalog_items = facility_catalog.list_active_facilities()

    assert catalog_items[0].name == "Auditorium Andi Hakim Nasoetion"
    assert catalog_items[0].cover_image_url == "https://cdn.example.test/auditorium-cover.jpg"
    assert catalog_items[0].price_summary == "Gratis"


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
