from dataclasses import dataclass

from app.models import OrganizationUnit
from app.organization_unit_repository import DuplicateOrganizationUnitName, OrganizationUnitRepository


@dataclass(frozen=True)
class OrganizationUnitCreation:
    name: str
    type: str
    code: str | None = None


@dataclass(frozen=True)
class OrganizationUnitUpdate:
    name: str
    type: str
    code: str | None = None


@dataclass(frozen=True)
class OrganizationUnitProfile:
    id: str
    name: str
    type: str
    code: str | None
    is_active: bool


class OrganizationUnitNotFound(Exception):
    pass


class OrganizationUnitNameAlreadyExists(Exception):
    pass


class OrganizationUnitManagementModule:
    def __init__(self, *, organization_unit_repository: OrganizationUnitRepository) -> None:
        self._organization_unit_repository = organization_unit_repository

    def create_organization_unit(self, creation: OrganizationUnitCreation) -> OrganizationUnitProfile:
        try:
            return self._to_profile(
                self._organization_unit_repository.add(
                    OrganizationUnit(
                        name=creation.name,
                        type=creation.type,
                        code=creation.code,
                        is_active=True,
                    )
                )
            )
        except DuplicateOrganizationUnitName as exc:
            raise OrganizationUnitNameAlreadyExists from exc

    def list_active_organization_units(self) -> list[OrganizationUnitProfile]:
        return [
            self._to_profile(organization_unit)
            for organization_unit in self._organization_unit_repository.list_active()
        ]

    def update_organization_unit(
        self,
        organization_unit_id: str,
        update: OrganizationUnitUpdate,
    ) -> OrganizationUnitProfile:
        organization_unit = self._organization_unit_repository.get_by_id(organization_unit_id)
        if organization_unit is None:
            raise OrganizationUnitNotFound

        organization_unit.name = update.name
        organization_unit.type = update.type
        organization_unit.code = update.code
        return self._to_profile(organization_unit)

    def set_organization_unit_active_status(
        self,
        organization_unit_id: str,
        *,
        is_active: bool,
    ) -> OrganizationUnitProfile:
        organization_unit = self._organization_unit_repository.get_by_id(organization_unit_id)
        if organization_unit is None:
            raise OrganizationUnitNotFound

        organization_unit.is_active = is_active
        return self._to_profile(organization_unit)

    def _to_profile(self, organization_unit: OrganizationUnit) -> OrganizationUnitProfile:
        return OrganizationUnitProfile(
            id=organization_unit.id,
            name=organization_unit.name,
            type=organization_unit.type,
            code=organization_unit.code,
            is_active=organization_unit.is_active,
        )
