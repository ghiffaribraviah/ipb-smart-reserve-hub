from collections.abc import Callable
from dataclasses import asdict

from fastapi import Depends, FastAPI, HTTPException, status

from app.core.access_policy import AccessPolicyAction
from app.schemas.reservation_schemas import (
    ReservationSubmissionRequest,
    StudentCancellationRequestBody,
    StudentCancellationRequestResponse,
    StaffDocumentRejectionRequest,
    StudentReservationResponse,
)
from app.services.accounts import UserAccount
from app.services.reservations import (
    CancellationRequestNotFound,
    FacilityNotFound,
    OrganizationUnitNotFound,
    ReservationModule,
    ReservationCancellationUnavailable,
    ReservationCancellationReasonRequired,
    ReservationNotFound,
    ReservationExtraRequirements,
    ParticipantCountExceedsFacilityCapacity,
    ReservationSubmission,
    ReservationTimeUnavailable,
    StaffCancellationReviewAccessDenied,
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
                    organization_unit_name=payload.organization_unit_name or "",
                    organization_unit_id=payload.organization_unit_id,
                    contact_phone=payload.contact_phone,
                    starts_at=payload.starts_at,
                    ends_at=payload.ends_at,
                    extra_requirements=ReservationExtraRequirements(
                        av_support=payload.extra_requirements.av_support,
                        logistics_coordination=payload.extra_requirements.logistics_coordination,
                        extra_cleaning=payload.extra_requirements.extra_cleaning,
                        security_personnel=payload.extra_requirements.security_personnel,
                        notes=payload.extra_requirements.notes,
                    ),
                ),
            )
        except FacilityNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fasilitas tidak ditemukan.")
        except OrganizationUnitNotFound:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unit organisasi tidak aktif.")
        except ParticipantCountExceedsFacilityCapacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Jumlah peserta melebihi kapasitas fasilitas.",
            )
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

    @app.post("/student/reservations/{reservation_id}/cancel", response_model=StudentReservationResponse)
    async def cancel_student_reservation(
        reservation_id: str,
        reservations: ReservationModule = Depends(get_reservations),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            return reservations.cancel_student_reservation(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except ReservationCancellationUnavailable:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Reservasi yang sudah disetujui harus diajukan pembatalannya.",
            )

    @app.post(
        "/student/reservations/{reservation_id}/cancellation-request",
        response_model=StudentCancellationRequestResponse,
    )
    async def request_student_cancellation(
        reservation_id: str,
        payload: StudentCancellationRequestBody,
        reservations: ReservationModule = Depends(get_reservations),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            cancellation = reservations.request_student_cancellation(
                current_user,
                reservation_id,
                reason=payload.reason,
            )
            return {
                **asdict(cancellation.reservation),
                "refund_warning": cancellation.refund_warning,
            }
        except ReservationCancellationReasonRequired:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Alasan pembatalan wajib diisi.")
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except ReservationCancellationUnavailable:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Pembatalan hanya dapat diajukan untuk reservasi yang sudah disetujui.",
            )

    @app.post(
        "/staff/reservations/{reservation_id}/cancellation-review/approve",
        response_model=StudentReservationResponse,
    )
    async def approve_staff_cancellation_review(
        reservation_id: str,
        reservations: ReservationModule = Depends(get_reservations),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return reservations.approve_cancellation_request(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except StaffCancellationReviewAccessDenied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff tidak ditugaskan ke fasilitas reservasi ini.",
            )
        except CancellationRequestNotFound:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Pengajuan pembatalan tidak ditemukan.")

    @app.post(
        "/staff/reservations/{reservation_id}/cancellation-review/reject",
        response_model=StudentReservationResponse,
    )
    async def reject_staff_cancellation_review(
        reservation_id: str,
        payload: StaffDocumentRejectionRequest,
        reservations: ReservationModule = Depends(get_reservations),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return reservations.reject_cancellation_request(current_user, reservation_id, reason=payload.reason)
        except ReservationCancellationReasonRequired:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Alasan penolakan wajib diisi.")
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except StaffCancellationReviewAccessDenied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff tidak ditugaskan ke fasilitas reservasi ini.",
            )
        except CancellationRequestNotFound:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Pengajuan pembatalan tidak ditemukan.")
