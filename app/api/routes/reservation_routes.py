from collections.abc import Callable
from dataclasses import asdict

from fastapi import Depends, FastAPI, HTTPException, Response, UploadFile, status

from app.core.access_policy import AccessPolicyAction
from app.schemas.reservation_schemas import (
    ReservationSubmissionRequest,
    StudentCancellationRequestBody,
    StudentCancellationRequestResponse,
    StaffDocumentRejectionRequest,
    StaffDocumentReviewResponse,
    StudentApprovalLetterResponse,
    StudentPaymentReceiptResponse,
    StudentReservationPaymentResponse,
    StudentReservationResponse,
    StudentSignedApprovalLetterResponse,
)
from app.services.approval_letters import (
    ApprovalLetterModule,
    ApprovalLetterNotGenerated,
    DocumentRejectionReasonRequired,
    InvalidSignedApprovalLetterFile,
    SignedApprovalLetterFileTooLarge,
    SignedApprovalLetterUpload,
    StaffDocumentReviewAccessDenied,
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
    ReservationSubmission,
    ReservationTimeUnavailable,
    StaffCancellationReviewAccessDenied,
)
from app.services.payments import (
    InvalidPaymentReceiptFile,
    PaymentModule,
    PaymentReceiptFileTooLarge,
    PaymentReceiptNotUploaded,
    PaymentReceiptUpload,
    PaymentRejectionReasonRequired,
    ReservationPaymentUnavailable,
    StaffPaymentReviewAccessDenied,
)


def register_reservation_routes(
    app: FastAPI,
    *,
    get_reservations: Callable,
    get_approval_letters: Callable,
    get_payments: Callable,
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

    @app.get(
        "/student/reservations/{reservation_id}/payment",
        response_model=StudentReservationPaymentResponse,
    )
    async def get_student_reservation_payment(
        reservation_id: str,
        payments: PaymentModule = Depends(get_payments),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            return payments.get_student_payment(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except ReservationPaymentUnavailable:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Pembayaran hanya tersedia untuk reservasi berbayar yang menunggu pembayaran.",
            )

    @app.post(
        "/student/reservations/{reservation_id}/payment-receipt",
        status_code=status.HTTP_201_CREATED,
        response_model=StudentPaymentReceiptResponse,
    )
    async def upload_student_payment_receipt(
        reservation_id: str,
        file: UploadFile,
        payments: PaymentModule = Depends(get_payments),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            return payments.upload_student_payment_receipt(
                current_user,
                reservation_id,
                PaymentReceiptUpload(
                    filename=file.filename or "payment-receipt",
                    content_type=file.content_type or "application/octet-stream",
                    content=await file.read(),
                ),
            )
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except ReservationPaymentUnavailable:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Pembayaran hanya tersedia untuk reservasi berbayar yang menunggu pembayaran.",
            )
        except InvalidPaymentReceiptFile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bukti pembayaran harus berupa JPG, JPEG, atau PNG.",
            )
        except PaymentReceiptFileTooLarge:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ukuran bukti pembayaran maksimal 5 MB.",
            )

    @app.get("/staff/reservations/{reservation_id}/payment-receipt/download")
    async def download_staff_payment_receipt(
        reservation_id: str,
        payments: PaymentModule = Depends(get_payments),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            download = payments.download_staff_payment_receipt(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except StaffPaymentReviewAccessDenied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff tidak ditugaskan ke fasilitas reservasi ini.",
            )
        except PaymentReceiptNotUploaded:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bukti pembayaran belum diunggah.")
        return Response(
            content=download.content,
            media_type=download.content_type,
            headers={"Content-Disposition": f'attachment; filename="{download.filename}"'},
        )

    @app.post(
        "/staff/reservations/{reservation_id}/payment-review/approve",
        response_model=StaffDocumentReviewResponse,
    )
    async def approve_staff_payment_review(
        reservation_id: str,
        payments: PaymentModule = Depends(get_payments),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return payments.approve_payment_receipt(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except StaffPaymentReviewAccessDenied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff tidak ditugaskan ke fasilitas reservasi ini.",
            )
        except PaymentReceiptNotUploaded:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bukti pembayaran belum diunggah.")

    @app.post(
        "/staff/reservations/{reservation_id}/payment-review/reject",
        response_model=StaffDocumentReviewResponse,
    )
    async def reject_staff_payment_review(
        reservation_id: str,
        payload: StaffDocumentRejectionRequest,
        payments: PaymentModule = Depends(get_payments),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.manage_assigned_facilities)),
    ):
        try:
            return payments.reject_payment_receipt(current_user, reservation_id, reason=payload.reason)
        except PaymentRejectionReasonRequired:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Alasan penolakan wajib diisi.")
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except StaffPaymentReviewAccessDenied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff tidak ditugaskan ke fasilitas reservasi ini.",
            )
        except PaymentReceiptNotUploaded:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bukti pembayaran belum diunggah.")

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
        return Response(
            content=download.content,
            media_type=download.content_type,
            headers={"Content-Disposition": f'attachment; filename="{download.filename}"'},
        )

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
                detail="Unggah surat bertanda tangan harus berupa PDF, JPG, JPEG, atau PNG.",
            )
        except SignedApprovalLetterFileTooLarge:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ukuran surat bertanda tangan maksimal 5 MB.",
            )

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
        return Response(
            content=download.content,
            media_type=download.content_type,
            headers={"Content-Disposition": f'attachment; filename="{download.filename}"'},
        )

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
