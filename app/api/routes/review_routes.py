from collections.abc import Callable

from fastapi import Depends, FastAPI, HTTPException, status

from app.core.access_policy import AccessPolicyAction
from app.schemas.review_schemas import (
    AdminReviewRemovalRequest,
    AdminReviewResponse,
    ReviewSubmissionRequest,
    StaffFacilityReviewResponse,
    StaffFacilityStatisticsResponse,
    StudentReviewResponse,
)
from app.services.accounts import UserAccount
from app.services.reviews import (
    AdminReviewRemovalReasonRequired,
    ReviewAlreadySubmitted,
    ReviewModule,
    ReviewNotFound,
    ReviewReservationNotCompleted,
    ReviewReservationNotFound,
    ReviewSubmission,
    StaffReviewAccessDenied,
)


def register_review_routes(
    app: FastAPI,
    *,
    get_reviews: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.post(
        "/student/reservations/{reservation_id}/review",
        status_code=status.HTTP_201_CREATED,
        response_model=StudentReviewResponse,
    )
    async def submit_student_review(
        reservation_id: str,
        payload: ReviewSubmissionRequest,
        reviews: ReviewModule = Depends(get_reviews),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            return reviews.submit_student_review(
                current_user,
                reservation_id,
                ReviewSubmission(rating=payload.rating, comment=payload.comment),
            )
        except ReviewReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except ReviewReservationNotCompleted:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Reservasi belum selesai.")
        except ReviewAlreadySubmitted:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Review untuk reservasi ini sudah dikirim.")

    @app.delete("/student/reviews/{review_id}", response_model=StudentReviewResponse)
    async def delete_student_review(
        review_id: str,
        reviews: ReviewModule = Depends(get_reviews),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            return reviews.delete_student_review(current_user, review_id)
        except ReviewNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review tidak ditemukan.")

    @app.get("/staff/facilities/{facility_id}/reviews", response_model=list[StaffFacilityReviewResponse])
    async def list_staff_facility_reviews(
        facility_id: str,
        reviews: ReviewModule = Depends(get_reviews),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return reviews.list_staff_facility_reviews(current_user, facility_id)
        except StaffReviewAccessDenied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff tidak ditugaskan ke fasilitas ini.",
            )

    @app.get("/staff/facilities/{facility_id}/statistics", response_model=StaffFacilityStatisticsResponse)
    async def get_staff_facility_statistics(
        facility_id: str,
        reviews: ReviewModule = Depends(get_reviews),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return reviews.get_staff_facility_statistics(current_user, facility_id)
        except StaffReviewAccessDenied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff tidak ditugaskan ke fasilitas ini.",
            )

    @app.get("/admin/reviews", response_model=list[AdminReviewResponse])
    async def list_admin_reviews(
        facility_id: str | None = None,
        student_id: str | None = None,
        reservation_id: str | None = None,
        is_deleted: bool | None = None,
        deleted_by: str | None = None,
        reviews: ReviewModule = Depends(get_reviews),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_reviews)),
    ):
        return reviews.list_admin_reviews(
            facility_id=facility_id,
            student_id=student_id,
            reservation_id=reservation_id,
            is_deleted=is_deleted,
            deleted_by=deleted_by,
        )

    @app.post("/admin/reviews/{review_id}/delete", response_model=AdminReviewResponse)
    async def delete_admin_review(
        review_id: str,
        payload: AdminReviewRemovalRequest,
        reviews: ReviewModule = Depends(get_reviews),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_reviews)),
    ):
        try:
            return reviews.delete_admin_review(current_user, review_id, reason=payload.reason)
        except AdminReviewRemovalReasonRequired:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Alasan penghapusan review wajib diisi.")
        except ReviewNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review tidak ditemukan.")

    @app.post("/admin/reviews/{review_id}/restore", response_model=AdminReviewResponse)
    async def restore_admin_review(
        review_id: str,
        reviews: ReviewModule = Depends(get_reviews),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_reviews)),
    ):
        try:
            return reviews.restore_admin_review(current_user, review_id)
        except ReviewNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review tidak ditemukan.")
