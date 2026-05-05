from collections.abc import Callable

from fastapi import Depends, FastAPI, HTTPException, status

from app.access_policy import AccessPolicyAction
from app.accounts import UserAccount
from app.organization_unit_schemas import (
    OrganizationUnitCreateRequest,
    OrganizationUnitResponse,
    OrganizationUnitUpdateRequest,
)
from app.organization_units import (
    OrganizationUnitCreation,
    OrganizationUnitManagementModule,
    OrganizationUnitNameAlreadyExists,
    OrganizationUnitNotFound,
    OrganizationUnitUpdate,
)


def register_organization_unit_routes(
    app: FastAPI,
    *,
    get_organization_unit_management: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.get("/organization-units", response_model=list[OrganizationUnitResponse])
    async def list_active_organization_units(
        organization_unit_management: OrganizationUnitManagementModule = Depends(get_organization_unit_management),
    ) -> list:
        return organization_unit_management.list_active_organization_units()

    @app.post(
        "/admin/organization-units",
        status_code=status.HTTP_201_CREATED,
        response_model=OrganizationUnitResponse,
    )
    async def create_organization_unit(
        payload: OrganizationUnitCreateRequest,
        organization_unit_management: OrganizationUnitManagementModule = Depends(get_organization_unit_management),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_organization_units)),
    ):
        try:
            return organization_unit_management.create_organization_unit(
                OrganizationUnitCreation(name=payload.name, type=payload.type, code=payload.code)
            )
        except OrganizationUnitNameAlreadyExists:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nama unit organisasi sudah digunakan.")

    @app.patch("/admin/organization-units/{organization_unit_id}", response_model=OrganizationUnitResponse)
    async def update_organization_unit(
        organization_unit_id: str,
        payload: OrganizationUnitUpdateRequest,
        organization_unit_management: OrganizationUnitManagementModule = Depends(get_organization_unit_management),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_organization_units)),
    ):
        try:
            return organization_unit_management.update_organization_unit(
                organization_unit_id,
                OrganizationUnitUpdate(name=payload.name, type=payload.type, code=payload.code),
            )
        except OrganizationUnitNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit organisasi tidak ditemukan.")

    @app.post("/admin/organization-units/{organization_unit_id}/deactivate", response_model=OrganizationUnitResponse)
    async def deactivate_organization_unit(
        organization_unit_id: str,
        organization_unit_management: OrganizationUnitManagementModule = Depends(get_organization_unit_management),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_organization_units)),
    ):
        try:
            return organization_unit_management.set_organization_unit_active_status(
                organization_unit_id,
                is_active=False,
            )
        except OrganizationUnitNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit organisasi tidak ditemukan.")

    @app.post("/admin/organization-units/{organization_unit_id}/activate", response_model=OrganizationUnitResponse)
    async def activate_organization_unit(
        organization_unit_id: str,
        organization_unit_management: OrganizationUnitManagementModule = Depends(get_organization_unit_management),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_organization_units)),
    ):
        try:
            return organization_unit_management.set_organization_unit_active_status(
                organization_unit_id,
                is_active=True,
            )
        except OrganizationUnitNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit organisasi tidak ditemukan.")
