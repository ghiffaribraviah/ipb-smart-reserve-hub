from collections.abc import Callable
from datetime import date, datetime

from fastapi import Depends, FastAPI, HTTPException, status

from app.core.access_policy import AccessPolicyAction
from app.schemas.reservation_schemas import (
    StaffFacilityScheduleEntryResponse,
    StaffReservationDetailResponse,
    StaffReservationOperationItemResponse,
)
from app.services.accounts import UserAccount
from app.services.staff_reservation_operations import (
    StaffFacilityScheduleNotFound,
    StaffReservationNotFound,
    StaffReservationOperationsModule,
)


def register_staff_reservation_operation_routes(
    app: FastAPI,
    *,
    get_staff_reservation_operations: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.get(
        "/staff/reservations",
        response_model=list[StaffReservationOperationItemResponse],
    )
    async def list_staff_reservations(
        status: str | None = None,
        facility_id: str | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        staff_reservation_operations: StaffReservationOperationsModule = Depends(get_staff_reservation_operations),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        return staff_reservation_operations.list_assigned_reservations(
            current_user,
            status=status,
            facility_id=facility_id,
            date_from=date_from,
            date_to=date_to,
        )

    @app.get(
        "/staff/reservations/verification-queue",
        response_model=list[StaffReservationOperationItemResponse],
    )
    async def list_staff_verification_queue(
        staff_reservation_operations: StaffReservationOperationsModule = Depends(get_staff_reservation_operations),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        return staff_reservation_operations.list_verification_queue(current_user)

    @app.get(
        "/staff/reservations/{reservation_id}",
        response_model=StaffReservationDetailResponse,
    )
    async def get_staff_reservation_detail(
        reservation_id: str,
        staff_reservation_operations: StaffReservationOperationsModule = Depends(get_staff_reservation_operations),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return staff_reservation_operations.get_assigned_reservation_detail(current_user, reservation_id)
        except StaffReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")

    @app.get(
        "/staff/facilities/{facility_id}/schedule",
        response_model=list[StaffFacilityScheduleEntryResponse],
    )
    async def list_staff_facility_schedule(
        facility_id: str,
        start: datetime,
        end: datetime,
        staff_reservation_operations: StaffReservationOperationsModule = Depends(get_staff_reservation_operations),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return staff_reservation_operations.list_facility_schedule(
                current_user,
                facility_id,
                starts_at=start,
                ends_at=end,
            )
        except StaffFacilityScheduleNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jadwal fasilitas tidak ditemukan.")
