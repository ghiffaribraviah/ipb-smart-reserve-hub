from typing import Protocol

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import OrganizationUnit


class OrganizationUnitRepositoryError(Exception):
    pass


class DuplicateOrganizationUnitName(OrganizationUnitRepositoryError):
    pass


class OrganizationUnitRepository(Protocol):
    def add(self, organization_unit: OrganizationUnit) -> OrganizationUnit:
        raise NotImplementedError

    def get_by_id(self, organization_unit_id: str) -> OrganizationUnit | None:
        raise NotImplementedError

    def list_active(self) -> list[OrganizationUnit]:
        raise NotImplementedError


class SqlAlchemyOrganizationUnitRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, organization_unit: OrganizationUnit) -> OrganizationUnit:
        self._session.add(organization_unit)
        try:
            self._session.flush()
        except IntegrityError as exc:
            raise DuplicateOrganizationUnitName from exc
        return organization_unit

    def get_by_id(self, organization_unit_id: str) -> OrganizationUnit | None:
        return self._session.get(OrganizationUnit, organization_unit_id)

    def list_active(self) -> list[OrganizationUnit]:
        return list(
            self._session.scalars(
                select(OrganizationUnit)
                .where(OrganizationUnit.is_active.is_(True))
                .order_by(OrganizationUnit.name)
            )
        )
