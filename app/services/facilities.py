from dataclasses import dataclass
from datetime import UTC, datetime

from app.repositories.facility_catalog_reader import FacilityCatalogReader, FacilityCatalogRecord
from app.services.public_facility_reviews import PublicFacilityReviewModule


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
class FacilityPublicReview:
    id: str
    rating: int
    comment: str | None
    author_name: str
    created_at: datetime


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
    reviews: list[FacilityPublicReview]


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
    def __init__(
        self,
        *,
        facility_catalog_reader: FacilityCatalogReader,
        public_facility_reviews: PublicFacilityReviewModule | None = None,
    ) -> None:
        self._facility_catalog_reader = facility_catalog_reader
        self._public_facility_reviews = public_facility_reviews or PublicFacilityReviewModule()

    def list_active_facilities(self) -> list[FacilityCatalogItem]:
        facilities = self._facility_catalog_reader.list_active_facilities()
        return [self._catalog_item(facility) for facility in facilities]

    def get_public_detail(self, facility_id: str) -> FacilityPublicDetail:
        facility = self._facility_catalog_reader.get_active_facility_by_id(facility_id)
        if facility is None:
            raise FacilityNotFound

        active_images = [image for image in facility.images if image.is_active]
        review_projection = self._public_facility_reviews.project(facility.reviews)
        return FacilityPublicDetail(
            id=facility.id,
            name=facility.name,
            location=facility.location,
            capacity=facility.capacity,
            category=facility.category,
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
                rating_average=review_projection.summary.rating_average,
                review_count=review_projection.summary.review_count,
            ),
            reviews=[
                FacilityPublicReview(
                    id=review.id,
                    rating=review.rating,
                    comment=review.comment,
                    author_name=review.author_name,
                    created_at=_as_utc(review.created_at),
                )
                for review in review_projection.reviews
            ],
        )

    def list_public_calendar_entries(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[FacilityCalendarEntry]:
        facility = self._facility_catalog_reader.get_active_facility_by_id(facility_id)
        if facility is None:
            raise FacilityNotFound

        return [
            FacilityCalendarEntry(
                facility_name=reservation.facility_name,
                activity_title=reservation.activity_title,
                organization_unit=reservation.organization_unit,
                starts_at=_as_utc(reservation.starts_at),
                ends_at=_as_utc(reservation.ends_at),
            )
            for reservation in self._facility_catalog_reader.list_public_calendar_reservations(
                facility_id,
                starts_at=starts_at,
                ends_at=ends_at,
            )
        ]

    def _catalog_item(self, facility: FacilityCatalogRecord) -> FacilityCatalogItem:
        cover_image = next((image for image in facility.images if image.is_active and image.is_cover), None)
        review_projection = self._public_facility_reviews.project(facility.reviews)
        return FacilityCatalogItem(
            id=facility.id,
            name=facility.name,
            location=facility.location,
            capacity=facility.capacity,
            category=facility.category,
            cover_image_url=cover_image.url if cover_image else None,
            rating_average=review_projection.summary.rating_average,
            review_count=review_projection.summary.review_count,
            price_summary=summarize_price(facility.price_rupiah),
            open_hours_summary=facility.open_hours_summary,
        )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
