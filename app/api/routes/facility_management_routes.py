from collections.abc import Callable

from fastapi import Depends, FastAPI, HTTPException, Response, status

from app.core.access_policy import AccessPolicyAction
from app.schemas.facility_management_schemas import (
    FacilityBlackoutCreateRequest,
    FacilityBlackoutResponse,
    FacilityGovernanceResponse,
    FacilityImageCreateRequest,
    FacilityImageManagementResponse,
    FacilityManagementProfileResponse,
    FacilityOpenHourCreateRequest,
    FacilityOpenHourResponse,
    FacilityProfileUpdateRequest,
    StaffAssignmentResponse,
)
from app.services.accounts import UserAccount
from app.services.facility_management import (
    FacilityBlackoutCreation,
    FacilityImageCreation,
    FacilityCategoryNotFound,
    FacilityManagementModule,
    FacilityNotFound,
    FacilityOpenHourInvalid,
    FacilityOpenHourCreation,
    FacilityProfileUpdate,
    StaffFacilityAccessDenied,
    StaffUserNotFound,
)


def register_facility_management_routes(
    app: FastAPI,
    *,
    get_facility_management: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.get("/admin/facilities/governance", response_model=list[FacilityGovernanceResponse])
    async def list_facility_governance(
        facility_management: FacilityManagementModule = Depends(get_facility_management),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_facility_staff_assignments)),
    ):
        return facility_management.list_facility_governance()

    @app.put(
        "/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
        response_model=StaffAssignmentResponse,
    )
    async def assign_staff(
        facility_id: str,
        staff_id: str,
        facility_management: FacilityManagementModule = Depends(get_facility_management),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_facility_staff_assignments)),
    ):
        try:
            return facility_management.assign_staff(facility_id, staff_id, actor=current_user)
        except FacilityNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fasilitas tidak ditemukan.")
        except StaffUserNotFound:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hanya akun staff yang dapat ditugaskan ke fasilitas.",
            )

    @app.delete(
        "/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
        status_code=status.HTTP_204_NO_CONTENT,
    )
    async def unassign_staff(
        facility_id: str,
        staff_id: str,
        facility_management: FacilityManagementModule = Depends(get_facility_management),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_facility_staff_assignments)),
    ):
        facility_management.unassign_staff(facility_id, staff_id, actor=current_user)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @app.get("/staff/facilities", response_model=list[FacilityManagementProfileResponse])
    async def list_staff_facilities(
        facility_management: FacilityManagementModule = Depends(get_facility_management),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        return facility_management.list_assigned_facilities(current_user)

    @app.patch("/staff/facilities/{facility_id}", response_model=FacilityManagementProfileResponse)
    async def update_staff_facility(
        facility_id: str,
        payload: FacilityProfileUpdateRequest,
        facility_management: FacilityManagementModule = Depends(get_facility_management),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return facility_management.update_assigned_facility(
                current_user,
                facility_id,
                FacilityProfileUpdate(**payload.model_dump()),
            )
        except FacilityNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fasilitas tidak ditemukan.")
        except FacilityCategoryNotFound:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Kategori fasilitas tidak ditemukan.")
        except FacilityOpenHourInvalid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Jam tutup harus setelah jam buka.")
        except StaffFacilityAccessDenied:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff tidak ditugaskan ke fasilitas ini.")

    @app.post("/staff/facilities/{facility_id}/deactivate", response_model=FacilityManagementProfileResponse)
    async def deactivate_staff_facility(
        facility_id: str,
        facility_management: FacilityManagementModule = Depends(get_facility_management),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return facility_management.deactivate_assigned_facility(current_user, facility_id)
        except FacilityNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fasilitas tidak ditemukan.")
        except StaffFacilityAccessDenied:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff tidak ditugaskan ke fasilitas ini.")
        except FacilityOpenHourInvalid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Jam tutup harus setelah jam buka.")

    @app.post(
        "/staff/facilities/{facility_id}/images",
        status_code=status.HTTP_201_CREATED,
        response_model=FacilityImageManagementResponse,
    )
    async def add_staff_facility_image(
        facility_id: str,
        payload: FacilityImageCreateRequest,
        facility_management: FacilityManagementModule = Depends(get_facility_management),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return facility_management.add_assigned_facility_image(
                current_user,
                facility_id,
                FacilityImageCreation(**payload.model_dump()),
            )
        except StaffFacilityAccessDenied:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff tidak ditugaskan ke fasilitas ini.")

    @app.post(
        "/staff/facilities/{facility_id}/open-hours",
        status_code=status.HTTP_201_CREATED,
        response_model=FacilityOpenHourResponse,
    )
    async def add_staff_facility_open_hour(
        facility_id: str,
        payload: FacilityOpenHourCreateRequest,
        facility_management: FacilityManagementModule = Depends(get_facility_management),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return facility_management.add_assigned_facility_open_hour(
                current_user,
                facility_id,
                FacilityOpenHourCreation(**payload.model_dump()),
            )
        except StaffFacilityAccessDenied:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff tidak ditugaskan ke fasilitas ini.")

    @app.post(
        "/staff/facilities/{facility_id}/blackouts",
        status_code=status.HTTP_201_CREATED,
        response_model=FacilityBlackoutResponse,
    )
    async def add_staff_facility_blackout(
        facility_id: str,
        payload: FacilityBlackoutCreateRequest,
        facility_management: FacilityManagementModule = Depends(get_facility_management),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return facility_management.add_assigned_facility_blackout(
                current_user,
                facility_id,
                FacilityBlackoutCreation(**payload.model_dump()),
            )
        except StaffFacilityAccessDenied:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff tidak ditugaskan ke fasilitas ini.")
