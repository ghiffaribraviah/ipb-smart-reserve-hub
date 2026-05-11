from collections.abc import Callable

from fastapi import Depends, FastAPI, HTTPException, UploadFile, status

from app.api.responses import attachment_response
from app.core.access_policy import AccessPolicyAction
from app.schemas.reservation_schemas import (
    StaffDocumentRejectionRequest,
    StaffDocumentReviewResponse,
    StudentPaymentReceiptResponse,
    StudentReservationPaymentResponse,
)
from app.services.accounts import UserAccount
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
from app.services.reservations import ReservationNotFound


def register_payment_routes(
    app: FastAPI,
    *,
    get_payments: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
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

    @app.get("/student/reservations/{reservation_id}/payment-receipt/download")
    async def download_student_payment_receipt(
        reservation_id: str,
        payments: PaymentModule = Depends(get_payments),
        current_user: UserAccount = Depends(require_access(AccessPolicyAction.enter_student_shell)),
    ):
        try:
            download = payments.download_student_payment_receipt(current_user, reservation_id)
        except ReservationNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservasi tidak ditemukan.")
        except PaymentReceiptNotUploaded:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bukti pembayaran belum diunggah.")
        return attachment_response(download)

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
        return attachment_response(download)

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
