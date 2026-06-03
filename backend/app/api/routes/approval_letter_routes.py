from collections.abc import Callable

from fastapi import Depends, FastAPI, HTTPException, UploadFile, status

from app.api.responses import attachment_response
from app.core.access_policy import AccessPolicyAction
from app.schemas.reservation_schemas import (
    StaffDocumentRejectionRequest,
    StaffDocumentReviewResponse,
    StudentApprovalLetterResponse,
    StudentSignedApprovalLetterSubmissionResponse,
    StudentSignedApprovalLetterResponse,
)
from app.services.accounts import UserAccount
from app.services.approval_letters import (
    ApprovalLetterModule,
    ApprovalLetterNotGenerated,
    DocumentRejectionReasonRequired,
    InvalidSignedApprovalLetterFile,
    SignedApprovalLetterSubmissionUnavailable,
    SignedApprovalLetterFileTooLarge,
    SignedApprovalLetterUpload,
    SignedApprovalLetterUploadUnavailable,
    StaffDocumentReviewUnavailable,
    StaffDocumentReviewAccessDenied,
)
from app.services.reservations import ReservationNotFound


def register_approval_letter_routes(
    app: FastAPI,
    *,
    get_approval_letters: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.get(
        "/student/reservations/{reservation_id}/approval-letter",
        response_model=StudentApprovalLetterResponse,
    )
    async def get_student_approval_letter(
        reservation_id: str,
        approval_letters: ApprovalLetterModule = Depends(get_approval_letters),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            return approval_letters.get_student_approval_letter(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")

    @app.get("/student/reservations/{reservation_id}/approval-letter/download")
    async def download_student_approval_letter(
        reservation_id: str,
        approval_letters: ApprovalLetterModule = Depends(get_approval_letters),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            download = approval_letters.download_student_approval_letter(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        return attachment_response(download)

    @app.post(
        "/student/reservations/{reservation_id}/signed-approval-letter",
        status_code=status.HTTP_201_CREATED,
        response_model=StudentSignedApprovalLetterResponse,
    )
    async def upload_student_signed_approval_letter(
        reservation_id: str,
        file: UploadFile,
        approval_letters: ApprovalLetterModule = Depends(get_approval_letters),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            return approval_letters.upload_student_signed_approval_letter(
                current_user,
                reservation_id,
                SignedApprovalLetterUpload(
                    filename=file.filename or "signed-approval-letter",
                    content_type=file.content_type or "application/octet-stream",
                    content=await file.read(),
                ),
            )
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except ApprovalLetterNotGenerated:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surat persetujuan harus dibuat sebelum unggah surat bertanda tangan.",
            )
        except InvalidSignedApprovalLetterFile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unggah surat bertanda tangan harus berupa PDF.",
            )
        except SignedApprovalLetterFileTooLarge:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ukuran surat bertanda tangan maksimal 5 MB.",
            )
        except SignedApprovalLetterUploadUnavailable:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surat bertanda tangan hanya dapat diunggah sebelum review dokumen selesai.",
            )

    @app.post(
        "/student/reservations/{reservation_id}/signed-approval-letter/submit",
        response_model=StudentSignedApprovalLetterSubmissionResponse,
    )
    async def submit_student_signed_approval_letter(
        reservation_id: str,
        approval_letters: ApprovalLetterModule = Depends(get_approval_letters),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            return approval_letters.submit_student_signed_approval_letter(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except ApprovalLetterNotGenerated:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surat bertanda tangan belum diunggah.",
            )
        except SignedApprovalLetterSubmissionUnavailable:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surat bertanda tangan tidak dapat dikirim untuk verifikasi pada status reservasi saat ini.",
            )

    @app.get("/student/reservations/{reservation_id}/signed-approval-letter/download")
    async def download_student_signed_approval_letter(
        reservation_id: str,
        approval_letters: ApprovalLetterModule = Depends(get_approval_letters),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            download = approval_letters.download_student_signed_approval_letter(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except ApprovalLetterNotGenerated:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surat bertanda tangan belum diunggah.",
            )
        return attachment_response(download)

    @app.post(
        "/staff/reservations/{reservation_id}/document-review/approve",
        response_model=StaffDocumentReviewResponse,
    )
    async def approve_staff_document_review(
        reservation_id: str,
        approval_letters: ApprovalLetterModule = Depends(get_approval_letters),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return approval_letters.approve_signed_approval_letter(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except StaffDocumentReviewAccessDenied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff tidak ditugaskan ke fasilitas reservasi ini.",
            )
        except ApprovalLetterNotGenerated:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surat bertanda tangan belum diunggah.",
            )
        except StaffDocumentReviewUnavailable:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surat bertanda tangan belum dikirim untuk verifikasi.",
            )

    @app.get("/staff/reservations/{reservation_id}/signed-approval-letter/download")
    async def download_staff_signed_approval_letter(
        reservation_id: str,
        approval_letters: ApprovalLetterModule = Depends(get_approval_letters),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            download = approval_letters.download_staff_signed_approval_letter(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except StaffDocumentReviewAccessDenied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff tidak ditugaskan ke fasilitas reservasi ini.",
            )
        except ApprovalLetterNotGenerated:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surat bertanda tangan belum diunggah.",
            )
        except StaffDocumentReviewUnavailable:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surat bertanda tangan belum dikirim untuk verifikasi.",
            )
        return attachment_response(download)

    @app.get("/staff/reservations/{reservation_id}/signed-approval-letters/{signed_letter_id}/download")
    async def download_staff_signed_approval_letter_version(
        reservation_id: str,
        signed_letter_id: str,
        approval_letters: ApprovalLetterModule = Depends(get_approval_letters),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            download = approval_letters.download_staff_signed_approval_letter_version(
                current_user,
                reservation_id,
                signed_letter_id,
            )
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except StaffDocumentReviewAccessDenied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff tidak ditugaskan ke fasilitas reservasi ini.",
            )
        except ApprovalLetterNotGenerated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Surat bertanda tangan tidak ditemukan.",
            )
        return attachment_response(download)

    @app.post(
        "/staff/reservations/{reservation_id}/document-review/reject",
        response_model=StaffDocumentReviewResponse,
    )
    async def reject_staff_document_review(
        reservation_id: str,
        payload: StaffDocumentRejectionRequest,
        approval_letters: ApprovalLetterModule = Depends(get_approval_letters),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return approval_letters.reject_signed_approval_letter(
                current_user,
                reservation_id,
                reason=payload.reason,
            )
        except DocumentRejectionReasonRequired:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Alasan penolakan wajib diisi.")
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except StaffDocumentReviewAccessDenied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff tidak ditugaskan ke fasilitas reservasi ini.",
            )
        except ApprovalLetterNotGenerated:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surat bertanda tangan belum diunggah.",
            )
        except StaffDocumentReviewUnavailable:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surat bertanda tangan belum dikirim untuk verifikasi.",
            )
