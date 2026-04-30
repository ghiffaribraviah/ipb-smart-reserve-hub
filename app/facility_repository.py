from typing import Protocol

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Facility


class FacilityRepository(Protocol):
    def list_active_facilities(self) -> list[Facility]:
        raise NotImplementedError

    def get_active_facility_by_id(self, facility_id: str) -> Facility | None:
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
