from dataclasses import dataclass
from datetime import UTC, datetime

from app.models import Facility
from app.facility_repository import FacilityRepository


class FacilityNotFound(Exception):
    pass


@dataclass(frozen=True)
class FacilityCatalogItem:
    id: str
    name: str
    location: str
    capacity: int
    category: str
    cover_image_url: str | None
    rating_average: float | None
    review_count: int
    price_summary: str
    open_hours_summary: str


@dataclass(frozen=True)
class FacilityContact:
    name: str
    phone: str
    email: str | None


@dataclass(frozen=True)
class FacilityPublicImage:
    url: str
    alt_text: str
    is_cover: bool


@dataclass(frozen=True)
class FacilityPrice:
    is_free: bool
    amount_rupiah: int
    summary: str


@dataclass(frozen=True)
class FacilityReviewSummary:
    rating_average: float | None
    review_count: int


@dataclass(frozen=True)
class FacilityPublicDetail:
    id: str
    name: str
    location: str
    capacity: int
    category: str
    description: str
    contact: FacilityContact
    images: list[FacilityPublicImage]
    price: FacilityPrice
    open_hours_summary: str
    review_summary: FacilityReviewSummary


@dataclass(frozen=True)
class FacilityCalendarEntry:
    facility_name: str
    activity_title: str
    organization_unit: str
    starts_at: datetime
    ends_at: datetime


def summarize_price(price_rupiah: int) -> str:
    if price_rupiah == 0:
        return "Gratis"
    return f"Rp{price_rupiah:,}".replace(",", ".")


class FacilityCatalogModule:
    def __init__(self, *, facility_repository: FacilityRepository) -> None:
        self._facility_repository = facility_repository

    def list_active_facilities(self) -> list[FacilityCatalogItem]:
        facilities = self._facility_repository.list_active_facilities()
        return [self._catalog_item(facility) for facility in facilities]

    def get_public_detail(self, facility_id: str) -> FacilityPublicDetail:
        facility = self._facility_repository.get_active_facility_by_id(facility_id)
        if facility is None:
            raise FacilityNotFound

        active_images = [image for image in facility.images if image.is_active]
        return FacilityPublicDetail(
            id=facility.id,
            name=facility.name,
            location=facility.location,
            capacity=facility.capacity,
            category=facility.category.name,
            description=facility.description,
            contact=FacilityContact(
                name=facility.contact_name,
                phone=facility.contact_phone,
                email=facility.contact_email,
            ),
            images=[
                FacilityPublicImage(
                    url=image.url,
                    alt_text=image.alt_text,
                    is_cover=image.is_cover,
                )
                for image in active_images
            ],
            price=FacilityPrice(
                is_free=facility.price_rupiah == 0,
                amount_rupiah=facility.price_rupiah,
                summary=summarize_price(facility.price_rupiah),
            ),
            open_hours_summary=facility.open_hours_summary,
            review_summary=FacilityReviewSummary(
                rating_average=facility.rating_average,
                review_count=facility.review_count,
            ),
        )

    def list_public_calendar_entries(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[FacilityCalendarEntry]:
        facility = self._facility_repository.get_active_facility_by_id(facility_id)
        if facility is None:
            raise FacilityNotFound

        return [
            FacilityCalendarEntry(
                facility_name=reservation.facility.name,
                activity_title=reservation.activity_title,
                organization_unit=reservation.organization_unit.name,
                starts_at=_as_utc(reservation.starts_at),
                ends_at=_as_utc(reservation.ends_at),
            )
            for reservation in self._facility_repository.list_public_calendar_reservations(
                facility_id,
                starts_at=starts_at,
                ends_at=ends_at,
            )
        ]

    def _catalog_item(self, facility: Facility) -> FacilityCatalogItem:
        cover_image = next((image for image in facility.images if image.is_active and image.is_cover), None)
        return FacilityCatalogItem(
            id=facility.id,
            name=facility.name,
            location=facility.location,
            capacity=facility.capacity,
            category=facility.category.name,
            cover_image_url=cover_image.url if cover_image else None,
            rating_average=facility.rating_average,
            review_count=facility.review_count,
            price_summary=summarize_price(facility.price_rupiah),
            open_hours_summary=facility.open_hours_summary,
        )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
