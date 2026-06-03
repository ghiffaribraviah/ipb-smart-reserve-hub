from dataclasses import dataclass, field
from datetime import datetime, time
from typing import Literal, Protocol

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models import Facility, FacilityCategory, FacilityReview, Reservation
from app.services.public_facility_calendar import PublicFacilityCalendarModule


FacilityCatalogSort = Literal["name_asc", "capacity_desc", "rating_desc", "price_asc", "price_desc"]


@dataclass(frozen=True)
class FacilityCatalogImageRecord:
    url: str
    alt_text: str
    is_cover: bool
    is_active: bool


@dataclass(frozen=True)
class FacilityOpenHourRecord:
    day_of_week: int
    opens_at: time
    closes_at: time


@dataclass(frozen=True)
class FacilityCatalogRecord:
    id: str
    name: str
    location: str
    capacity: int
    category: str
    category_slug: str
    description: str
    contact_name: str
    contact_phone: str
    contact_email: str | None
    price_rupiah: int
    open_hours_summary: str
    rating_average: float | None
    review_count: int
    images: list[FacilityCatalogImageRecord]
    open_hours: list[FacilityOpenHourRecord] = field(default_factory=list)
    reviews: list["FacilityReviewRecord"] = field(default_factory=list)


@dataclass(frozen=True)
class FacilityCategoryRecord:
    id: str
    name: str
    slug: str
    icon_hint: str | None
    facility_count: int


@dataclass(frozen=True)
class FacilityReviewRecord:
    id: str
    rating: int
    comment: str | None
    author_name: str
    created_at: datetime
    is_deleted: bool


@dataclass(frozen=True)
class FacilityCalendarReservationRecord:
    facility_name: str
    activity_title: str
    organization_unit: str
    starts_at: datetime
    ends_at: datetime


@dataclass(frozen=True)
class FacilityCatalogQuery:
    q: str | None = None
    category_slug: str | None = None
    min_capacity: int | None = None
    featured: bool = False
    sort: FacilityCatalogSort = "name_asc"
    page: int = 1
    page_size: int = 12


@dataclass(frozen=True)
class FacilityCatalogResult:
    records: list[FacilityCatalogRecord]
    page: int
    page_size: int
    total_items: int
    total_pages: int


class FacilityCatalogReader(Protocol):
    def list_public_categories(self) -> list[FacilityCategoryRecord]:
        raise NotImplementedError

    def list_active_facilities(self, query: FacilityCatalogQuery) -> FacilityCatalogResult:
        raise NotImplementedError

    def get_active_facility_by_id(self, facility_id: str) -> FacilityCatalogRecord | None:
        raise NotImplementedError

    def list_public_calendar_reservations(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[FacilityCalendarReservationRecord]:
        raise NotImplementedError


class SqlAlchemyFacilityCatalogReader:
    def __init__(
        self,
        session: Session,
        public_facility_calendar: PublicFacilityCalendarModule | None = None,
    ) -> None:
        self._session = session
        self._public_facility_calendar = public_facility_calendar or PublicFacilityCalendarModule()

    def list_public_categories(self) -> list[FacilityCategoryRecord]:
        active_facility_count = func.count(Facility.id)
        rows = self._session.execute(
            select(FacilityCategory, active_facility_count)
            .outerjoin(
                Facility,
                (Facility.category_id == FacilityCategory.id) & Facility.is_active.is_(True),
            )
            .where(FacilityCategory.is_active.is_(True))
            .group_by(FacilityCategory.id)
            .order_by(FacilityCategory.name)
        )
        return [
            FacilityCategoryRecord(
                id=category.id,
                name=category.name,
                slug=category.slug,
                icon_hint=category.icon_hint,
                facility_count=facility_count,
            )
            for category, facility_count in rows
        ]

    def list_active_facilities(self, query: FacilityCatalogQuery) -> FacilityCatalogResult:
        facilities = self._session.scalars(
            select(Facility)
            .options(
                joinedload(Facility.category),
                joinedload(Facility.images),
                joinedload(Facility.open_hours),
                joinedload(Facility.reviews).joinedload(FacilityReview.student),
            )
            .where(Facility.is_active.is_(True))
            .order_by(Facility.name)
        ).unique()
        records = [self._to_catalog_record(facility) for facility in facilities]
        return apply_facility_catalog_query(records, query)

    def get_active_facility_by_id(self, facility_id: str) -> FacilityCatalogRecord | None:
        facility = self._session.scalar(
            select(Facility)
            .options(
                joinedload(Facility.category),
                joinedload(Facility.images),
                joinedload(Facility.open_hours),
                joinedload(Facility.reviews).joinedload(FacilityReview.student),
            )
            .where(Facility.id == facility_id, Facility.is_active.is_(True))
        )
        if facility is None:
            return None
        return self._to_catalog_record(facility)

    def list_public_calendar_reservations(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[FacilityCalendarReservationRecord]:
        reservations = self._session.scalars(
            select(Reservation)
            .options(joinedload(Reservation.facility), joinedload(Reservation.organization_unit))
            .where(
                Reservation.facility_id == facility_id,
                Reservation.status.in_(self._public_facility_calendar.public_reservation_statuses()),
                Reservation.starts_at < ends_at,
                Reservation.ends_at > starts_at,
            )
            .order_by(Reservation.starts_at)
        )
        return [
            FacilityCalendarReservationRecord(
                facility_name=reservation.facility.name,
                activity_title=reservation.activity_title,
                organization_unit=_organization_unit_name(reservation),
                starts_at=reservation.starts_at,
                ends_at=reservation.ends_at,
            )
            for reservation in reservations
        ]

    def _to_catalog_record(self, facility: Facility) -> FacilityCatalogRecord:
        return FacilityCatalogRecord(
            id=facility.id,
            name=facility.name,
            location=facility.location,
            capacity=facility.capacity,
            category=facility.category.name,
            category_slug=facility.category.slug,
            description=facility.description,
            contact_name=facility.contact_name,
            contact_phone=facility.contact_phone,
            contact_email=facility.contact_email,
            price_rupiah=facility.price_rupiah,
            open_hours_summary=facility.open_hours_summary,
            open_hours=[
                FacilityOpenHourRecord(
                    day_of_week=open_hour.day_of_week,
                    opens_at=open_hour.opens_at,
                    closes_at=open_hour.closes_at,
                )
                for open_hour in sorted(facility.open_hours, key=lambda item: (item.day_of_week, item.opens_at))
            ],
            rating_average=None,
            review_count=0,
            images=[
                FacilityCatalogImageRecord(
                    url=image.url,
                    alt_text=image.alt_text,
                    is_cover=image.is_cover,
                    is_active=image.is_active,
                )
                for image in facility.images
            ],
            reviews=[
                FacilityReviewRecord(
                    id=review.id,
                    rating=review.rating,
                    comment=review.comment,
                    author_name=review.student.full_name,
                    created_at=review.created_at,
                    is_deleted=review.is_deleted,
                )
                for review in facility.reviews
            ],
        )


def _organization_unit_name(reservation: Reservation) -> str:
    if reservation.organization_unit_name:
        return reservation.organization_unit_name
    if reservation.organization_unit is not None:
        return reservation.organization_unit.name
    return ""


def apply_facility_catalog_query(
    facilities: list[FacilityCatalogRecord],
    query: FacilityCatalogQuery,
) -> FacilityCatalogResult:
    page_size = min(query.page_size, 50)
    if query.q:
        normalized_q = query.q.casefold()
        facilities = [
            facility
            for facility in facilities
            if normalized_q in facility.name.casefold() or normalized_q in facility.location.casefold()
        ]
    if query.category_slug:
        facilities = [facility for facility in facilities if facility.category_slug == query.category_slug]
    if query.min_capacity is not None:
        facilities = [facility for facility in facilities if facility.capacity >= query.min_capacity]

    facilities = _sort_featured_facilities(facilities) if query.featured else _sort_facilities(facilities, query.sort)
    total_items = len(facilities)
    total_pages = (total_items + page_size - 1) // page_size if total_items else 0
    start = (query.page - 1) * page_size
    end = start + page_size
    return FacilityCatalogResult(
        records=facilities[start:end],
        page=query.page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
    )


def _sort_facilities(
    facilities: list[FacilityCatalogRecord],
    sort: FacilityCatalogSort,
) -> list[FacilityCatalogRecord]:
    if sort == "capacity_desc":
        return sorted(facilities, key=lambda facility: (-facility.capacity, facility.name.casefold()))
    if sort == "rating_desc":
        return sorted(facilities, key=lambda facility: (-_public_rating_average(facility), facility.name.casefold()))
    if sort == "price_asc":
        return sorted(facilities, key=lambda facility: (facility.price_rupiah, facility.name.casefold()))
    if sort == "price_desc":
        return sorted(facilities, key=lambda facility: (-facility.price_rupiah, facility.name.casefold()))
    return sorted(facilities, key=lambda facility: facility.name.casefold())


def _sort_featured_facilities(facilities: list[FacilityCatalogRecord]) -> list[FacilityCatalogRecord]:
    return sorted(
        facilities,
        key=lambda facility: (
            not _has_active_cover_image(facility),
            -_public_review_count(facility),
            -_public_rating_average(facility),
            facility.name.casefold(),
        ),
    )


def _has_active_cover_image(facility: FacilityCatalogRecord) -> bool:
    return any(image.is_active and image.is_cover for image in facility.images)


def _public_review_count(facility: FacilityCatalogRecord) -> int:
    return len([review for review in facility.reviews if not review.is_deleted])


def _public_rating_average(facility: FacilityCatalogRecord) -> float:
    visible_reviews = [review for review in facility.reviews if not review.is_deleted]
    if not visible_reviews:
        return 0
    return round(sum(review.rating for review in visible_reviews) / len(visible_reviews), 1)
