from collections.abc import Callable

from fastapi import Depends, FastAPI, HTTPException, status

from app.core.access_policy import AccessPolicyAction
from app.schemas.reservation_schemas import ReservationSubmissionRequest, StudentReservationResponse
from app.services.accounts import UserAccount
from app.services.reservations import (
    FacilityNotFound,
    OrganizationUnitNotFound,
    ReservationModule,
    ReservationNotFound,
    ReservationSubmission,
    ReservationTimeUnavailable,
)


def register_reservation_routes(
    app: FastAPI,
    *,
    get_reservations: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.post(
        "/facilities/{facility_id}/reservations",
        status_code=status.HTTP_201_CREATED,
        response_model=StudentReservationResponse,
    )
    async def submit_reservation(
        facility_id: str,
        payload: ReservationSubmissionRequest,
        reservations: ReservationModule = Depends(get_reservations),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            return reservations.submit_reservation(
                current_user,
                ReservationSubmission(
                    facility_id=facility_id,
                    activity_title=payload.activity_title,
                    event_description=payload.event_description,
                    participant_count=payload.participant_count,
                    organization_unit_id=payload.organization_unit_id,
                    contact_phone=payload.contact_phone,
                    starts_at=payload.starts_at,
                    ends_at=payload.ends_at,
                ),
            )
        except FacilityNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fasilitas tidak ditemukan.")
        except OrganizationUnitNotFound:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unit organisasi tidak aktif.")
        except ReservationTimeUnavailable:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Waktu reservasi tidak tersedia.")

    @app.get("/student/reservations", response_model=list[StudentReservationResponse])
    async def list_student_reservations(
        reservations: ReservationModule = Depends(get_reservations),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        return reservations.list_student_reservations(current_user)

    @app.get("/student/reservations/{reservation_id}", response_model=StudentReservationResponse)
    async def get_student_reservation(
        reservation_id: str,
        reservations: ReservationModule = Depends(get_reservations),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            return reservations.get_student_reservation(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
