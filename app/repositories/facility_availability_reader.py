from dataclasses import dataclass
from datetime import datetime, time
from typing import Protocol

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from app.models import Facility, FacilityBlackout, FacilityOpenHour, Reservation, ReservationStatus


@dataclass(frozen=True)
class FacilityOpenHourRecord:
    day_of_week: int
    opens_at: time
    closes_at: time


class FacilityAvailabilityReader(Protocol):
    def active_facility_exists(self, facility_id: str) -> bool:
        raise NotImplementedError

    def list_facility_open_hours(self, facility_id: str) -> list[FacilityOpenHourRecord]:
        raise NotImplementedError

    def has_overlapping_blackout(self, facility_id: str, *, starts_at: datetime, ends_at: datetime) -> bool:
        raise NotImplementedError

    def has_overlapping_reservation(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
        statuses: tuple[ReservationStatus, ...],
    ) -> bool:
        raise NotImplementedError


class SqlAlchemyFacilityAvailabilityReader:
    def __init__(self, session: Session) -> None:
        self._session = session

    def active_facility_exists(self, facility_id: str) -> bool:
        return self._session.scalar(
            select(exists().where(Facility.id == facility_id, Facility.is_active.is_(True)))
        )

    def list_facility_open_hours(self, facility_id: str) -> list[FacilityOpenHourRecord]:
        open_hours = self._session.scalars(
            select(FacilityOpenHour)
            .where(FacilityOpenHour.facility_id == facility_id)
            .order_by(FacilityOpenHour.day_of_week, FacilityOpenHour.opens_at)
        )
        return [
            FacilityOpenHourRecord(
                day_of_week=open_hour.day_of_week,
                opens_at=open_hour.opens_at,
                closes_at=open_hour.closes_at,
            )
            for open_hour in open_hours
        ]

    def has_overlapping_blackout(self, facility_id: str, *, starts_at: datetime, ends_at: datetime) -> bool:
        return self._session.scalar(
            select(
                exists().where(
                    FacilityBlackout.facility_id == facility_id,
                    FacilityBlackout.starts_at < ends_at,
                    FacilityBlackout.ends_at > starts_at,
                )
            )
        )

    def has_overlapping_reservation(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
        statuses: tuple[ReservationStatus, ...],
    ) -> bool:
        return self._session.scalar(
            select(
                exists().where(
                    Reservation.facility_id == facility_id,
                    Reservation.status.in_(statuses),
                    Reservation.starts_at < ends_at,
                    Reservation.ends_at > starts_at,
                )
            )
        )
