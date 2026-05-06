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


@dataclass(frozen=True)
class FacilityAvailabilityFacts:
    active_facility_exists: bool
    open_hours: list[FacilityOpenHourRecord]
    has_overlapping_blackout: bool
    has_overlapping_reservation: bool


class FacilityAvailabilityReader(Protocol):
    def load_availability_facts(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
        blocking_statuses: tuple[ReservationStatus, ...],
    ) -> FacilityAvailabilityFacts:
        raise NotImplementedError


class SqlAlchemyFacilityAvailabilityReader:
    def __init__(self, session: Session) -> None:
        self._session = session

    def load_availability_facts(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
        blocking_statuses: tuple[ReservationStatus, ...],
    ) -> FacilityAvailabilityFacts:
        return FacilityAvailabilityFacts(
            active_facility_exists=self._active_facility_exists(facility_id),
            open_hours=self._list_facility_open_hours(facility_id),
            has_overlapping_blackout=self._has_overlapping_blackout(
                facility_id,
                starts_at=starts_at,
                ends_at=ends_at,
            ),
            has_overlapping_reservation=self._has_overlapping_reservation(
                facility_id,
                starts_at=starts_at,
                ends_at=ends_at,
                statuses=blocking_statuses,
            ),
        )

    def _active_facility_exists(self, facility_id: str) -> bool:
        return self._session.scalar(
            select(exists().where(Facility.id == facility_id, Facility.is_active.is_(True)))
        )

    def _list_facility_open_hours(self, facility_id: str) -> list[FacilityOpenHourRecord]:
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

    def _has_overlapping_blackout(self, facility_id: str, *, starts_at: datetime, ends_at: datetime) -> bool:
        return self._session.scalar(
            select(
                exists().where(
                    FacilityBlackout.facility_id == facility_id,
                    FacilityBlackout.starts_at < ends_at,
                    FacilityBlackout.ends_at > starts_at,
                )
            )
        )

    def _has_overlapping_reservation(
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
