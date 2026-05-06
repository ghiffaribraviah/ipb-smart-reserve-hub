from dataclasses import dataclass

from app.repositories.organization_unit_repository import (
    DuplicateOrganizationUnitName,
    NewOrganizationUnitRecord,
    OrganizationUnitProfileUpdateRecord,
    OrganizationUnitRecord,
    OrganizationUnitRepository,
)


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
                    NewOrganizationUnitRecord(
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
        updated_organization_unit = self._organization_unit_repository.update_profile(
            organization_unit_id,
            OrganizationUnitProfileUpdateRecord(
                name=update.name,
                type=update.type,
                code=update.code,
            ),
        )
        if updated_organization_unit is None:
            raise OrganizationUnitNotFound
        return self._to_profile(updated_organization_unit)

    def set_organization_unit_active_status(
        self,
        organization_unit_id: str,
        *,
        is_active: bool,
    ) -> OrganizationUnitProfile:
        updated_organization_unit = self._organization_unit_repository.set_active_status(
            organization_unit_id,
            is_active=is_active,
        )
        if updated_organization_unit is None:
            raise OrganizationUnitNotFound
        return self._to_profile(updated_organization_unit)

    def _to_profile(self, organization_unit: OrganizationUnitRecord) -> OrganizationUnitProfile:
        return OrganizationUnitProfile(
            id=organization_unit.id,
            name=organization_unit.name,
            type=organization_unit.type,
            code=organization_unit.code,
            is_active=organization_unit.is_active,
        )
