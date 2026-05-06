from dataclasses import dataclass
from typing import Protocol

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import OrganizationUnit


class OrganizationUnitRepositoryError(Exception):
    pass


class DuplicateOrganizationUnitName(OrganizationUnitRepositoryError):
    pass


@dataclass(frozen=True)
class NewOrganizationUnitRecord:
    name: str
    type: str
    code: str | None
    is_active: bool


@dataclass(frozen=True)
class OrganizationUnitRecord:
    id: str
    name: str
    type: str
    code: str | None
    is_active: bool


@dataclass(frozen=True)
class OrganizationUnitProfileUpdateRecord:
    name: str
    type: str
    code: str | None


class OrganizationUnitRepository(Protocol):
    def add(self, organization_unit: NewOrganizationUnitRecord) -> OrganizationUnitRecord:
        raise NotImplementedError

    def get_by_id(self, organization_unit_id: str) -> OrganizationUnitRecord | None:
        raise NotImplementedError

    def list_active(self) -> list[OrganizationUnitRecord]:
        raise NotImplementedError

    def update_profile(
        self,
        organization_unit_id: str,
        update: OrganizationUnitProfileUpdateRecord,
    ) -> OrganizationUnitRecord | None:
        raise NotImplementedError

    def set_active_status(self, organization_unit_id: str, *, is_active: bool) -> OrganizationUnitRecord | None:
        raise NotImplementedError


class SqlAlchemyOrganizationUnitRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, organization_unit: NewOrganizationUnitRecord) -> OrganizationUnitRecord:
        model = OrganizationUnit(
            name=organization_unit.name,
            type=organization_unit.type,
            code=organization_unit.code,
            is_active=organization_unit.is_active,
        )
        self._session.add(model)
        try:
            self._session.flush()
        except IntegrityError as exc:
            raise DuplicateOrganizationUnitName from exc
        return self._to_record(model)

    def get_by_id(self, organization_unit_id: str) -> OrganizationUnitRecord | None:
        organization_unit = self._session.get(OrganizationUnit, organization_unit_id)
        if organization_unit is None:
            return None
        return self._to_record(organization_unit)

    def list_active(self) -> list[OrganizationUnitRecord]:
        return [
            self._to_record(organization_unit)
            for organization_unit in self._session.scalars(
                select(OrganizationUnit).where(OrganizationUnit.is_active.is_(True)).order_by(OrganizationUnit.name)
            )
        ]

    def update_profile(
        self,
        organization_unit_id: str,
        update: OrganizationUnitProfileUpdateRecord,
    ) -> OrganizationUnitRecord | None:
        organization_unit = self._session.get(OrganizationUnit, organization_unit_id)
        if organization_unit is None:
            return None
        organization_unit.name = update.name
        organization_unit.type = update.type
        organization_unit.code = update.code
        return self._to_record(organization_unit)

    def set_active_status(self, organization_unit_id: str, *, is_active: bool) -> OrganizationUnitRecord | None:
        organization_unit = self._session.get(OrganizationUnit, organization_unit_id)
        if organization_unit is None:
            return None
        organization_unit.is_active = is_active
        return self._to_record(organization_unit)

    def _to_record(self, organization_unit: OrganizationUnit) -> OrganizationUnitRecord:
        return OrganizationUnitRecord(
            id=organization_unit.id,
            name=organization_unit.name,
            type=organization_unit.type,
            code=organization_unit.code,
            is_active=organization_unit.is_active,
        )
