from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from sqlalchemy import exists, select
from sqlalchemy.orm import Session, joinedload

from app.models import Facility, OrganizationUnit, Reservation, ReservationStatus
from app.services.facility_availability import BLOCKING_RESERVATION_STATUSES


@dataclass(frozen=True)
class ReservationFacilityRecord:
    id: str
    name: str
    price_rupiah: int


@dataclass(frozen=True)
class ReservationOrganizationUnitRecord:
    id: str
    name: str


class ReservationRepository(Protocol):
    def get_active_facility(self, facility_id: str) -> ReservationFacilityRecord | None:
        raise NotImplementedError

    def get_active_organization_unit(self, organization_unit_id: str) -> ReservationOrganizationUnitRecord | None:
        raise NotImplementedError

    def has_overlapping_blocking_reservation(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> bool:
        raise NotImplementedError

    def add(self, reservation: Reservation) -> Reservation:
        raise NotImplementedError

    def list_for_student(self, student_id: str) -> list[Reservation]:
        raise NotImplementedError

    def get_for_student(self, reservation_id: str, student_id: str) -> Reservation | None:
        raise NotImplementedError


class SqlAlchemyReservationRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_active_facility(self, facility_id: str) -> ReservationFacilityRecord | None:
        facility = self._session.get(Facility, facility_id)
        if facility is None or not facility.is_active:
            return None
        return ReservationFacilityRecord(
            id=facility.id,
            name=facility.name,
            price_rupiah=facility.price_rupiah,
        )

    def get_active_organization_unit(self, organization_unit_id: str) -> ReservationOrganizationUnitRecord | None:
        organization_unit = self._session.get(OrganizationUnit, organization_unit_id)
        if organization_unit is None or not organization_unit.is_active:
            return None
        return ReservationOrganizationUnitRecord(
            id=organization_unit.id,
            name=organization_unit.name,
        )

    def has_overlapping_blocking_reservation(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> bool:
        return self._session.scalar(
            select(
                exists().where(
                    Reservation.facility_id == facility_id,
                    Reservation.status.in_(BLOCKING_RESERVATION_STATUSES),
                    Reservation.starts_at < ends_at,
                    Reservation.ends_at > starts_at,
                )
            )
        )

    def add(self, reservation: Reservation) -> Reservation:
        self._session.add(reservation)
        self._session.flush()
        return reservation

    def list_for_student(self, student_id: str) -> list[Reservation]:
        return list(
            self._session.scalars(
                select(Reservation)
                .options(joinedload(Reservation.facility), joinedload(Reservation.organization_unit))
                .where(Reservation.student_id == student_id)
                .order_by(Reservation.created_at.desc())
            )
        )

    def get_for_student(self, reservation_id: str, student_id: str) -> Reservation | None:
        return self._session.scalar(
            select(Reservation)
            .options(joinedload(Reservation.facility), joinedload(Reservation.organization_unit))
            .where(Reservation.id == reservation_id, Reservation.student_id == student_id)
        )
