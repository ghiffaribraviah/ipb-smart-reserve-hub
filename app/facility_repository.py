from typing import Protocol
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Facility, FacilityBlackout, FacilityOpenHour, Reservation, ReservationStatus


PUBLIC_BLOCKING_RESERVATION_STATUSES = (
    ReservationStatus.pending_document_upload,
    ReservationStatus.pending_document_review,
    ReservationStatus.pending_payment,
    ReservationStatus.approved,
)


class FacilityRepository(Protocol):
    def list_active_facilities(self) -> list[Facility]:
        raise NotImplementedError

    def get_active_facility_by_id(self, facility_id: str) -> Facility | None:
        raise NotImplementedError

    def list_public_calendar_reservations(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[Reservation]:
        raise NotImplementedError

    def list_facility_open_hours(self, facility_id: str) -> list[FacilityOpenHour]:
        raise NotImplementedError

    def list_overlapping_blackouts(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[FacilityBlackout]:
        raise NotImplementedError


class SqlAlchemyFacilityRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_active_facilities(self) -> list[Facility]:
        return list(
            self._session.scalars(
                select(Facility)
                .options(joinedload(Facility.category), joinedload(Facility.images))
                .where(Facility.is_active.is_(True))
                .order_by(Facility.name)
            ).unique()
        )

    def get_active_facility_by_id(self, facility_id: str) -> Facility | None:
        return self._session.scalar(
            select(Facility)
            .options(joinedload(Facility.category), joinedload(Facility.images))
            .where(Facility.id == facility_id, Facility.is_active.is_(True))
        )

    def list_public_calendar_reservations(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[Reservation]:
        return list(
            self._session.scalars(
                select(Reservation)
                .options(joinedload(Reservation.facility), joinedload(Reservation.organization_unit))
                .where(
                    Reservation.facility_id == facility_id,
                    Reservation.status.in_(PUBLIC_BLOCKING_RESERVATION_STATUSES),
                    Reservation.starts_at < ends_at,
                    Reservation.ends_at > starts_at,
                )
                .order_by(Reservation.starts_at)
            )
        )

    def list_facility_open_hours(self, facility_id: str) -> list[FacilityOpenHour]:
        return list(
            self._session.scalars(
                select(FacilityOpenHour)
                .where(FacilityOpenHour.facility_id == facility_id)
                .order_by(FacilityOpenHour.day_of_week, FacilityOpenHour.opens_at)
            )
        )

    def list_overlapping_blackouts(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[FacilityBlackout]:
        return list(
            self._session.scalars(
                select(FacilityBlackout).where(
                    FacilityBlackout.facility_id == facility_id,
                    FacilityBlackout.starts_at < ends_at,
                    FacilityBlackout.ends_at > starts_at,
                )
            )
        )
