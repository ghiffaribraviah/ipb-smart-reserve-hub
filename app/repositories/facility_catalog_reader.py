from dataclasses import dataclass, field
from datetime import datetime
from typing import Protocol

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Facility, FacilityReview, Reservation
from app.services.public_facility_calendar import PublicFacilityCalendarModule


@dataclass(frozen=True)
class FacilityCatalogImageRecord:
    url: str
    alt_text: str
    is_cover: bool
    is_active: bool


@dataclass(frozen=True)
class FacilityCatalogRecord:
    id: str
    name: str
    location: str
    capacity: int
    category: str
    description: str
    contact_name: str
    contact_phone: str
    contact_email: str | None
    price_rupiah: int
    open_hours_summary: str
    rating_average: float | None
    review_count: int
    images: list[FacilityCatalogImageRecord]
    reviews: list["FacilityReviewRecord"] = field(default_factory=list)


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


class FacilityCatalogReader(Protocol):
    def list_active_facilities(self) -> list[FacilityCatalogRecord]:
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

    def list_active_facilities(self) -> list[FacilityCatalogRecord]:
        facilities = self._session.scalars(
            select(Facility)
            .options(
                joinedload(Facility.category),
                joinedload(Facility.images),
                joinedload(Facility.reviews).joinedload(FacilityReview.student),
            )
            .where(Facility.is_active.is_(True))
            .order_by(Facility.name)
        ).unique()
        return [self._to_catalog_record(facility) for facility in facilities]

    def get_active_facility_by_id(self, facility_id: str) -> FacilityCatalogRecord | None:
        facility = self._session.scalar(
            select(Facility)
            .options(
                joinedload(Facility.category),
                joinedload(Facility.images),
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
                organization_unit=reservation.organization_unit_name or reservation.organization_unit.name,
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
            description=facility.description,
            contact_name=facility.contact_name,
            contact_phone=facility.contact_phone,
            contact_email=facility.contact_email,
            price_rupiah=facility.price_rupiah,
            open_hours_summary=facility.open_hours_summary,
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
