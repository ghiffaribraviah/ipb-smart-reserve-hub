from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
import uuid

from app.models import ReservationPaymentReceipt, ReservationStatus
from app.repositories.reservation_repository import ReservationRepository
from app.services.accounts import UserAccount
from app.services.reservations import ReservationNotFound
from app.storage import PrivateStorage


@dataclass(frozen=True)
class StudentReservationPayment:
    reservation_id: str
    reservation_code: str
    amount_rupiah: int
    payment_instructions: str


@dataclass(frozen=True)
class PaymentReceiptUpload:
    filename: str
    content_type: str
    content: bytes


@dataclass(frozen=True)
class StudentPaymentReceipt:
    reservation_id: str
    filename: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime


@dataclass(frozen=True)
class StaffPaymentReceiptDownload:
    filename: str
    content_type: str
    content: bytes


@dataclass(frozen=True)
class StaffPaymentReview:
    reservation_id: str
    status: ReservationStatus
    rejection_reason: str | None = None


class ReservationPaymentUnavailable(Exception):
    pass


class PaymentReceiptNotUploaded(Exception):
    pass


class StaffPaymentReviewAccessDenied(Exception):
    pass


class InvalidPaymentReceiptFile(Exception):
    pass


class PaymentReceiptFileTooLarge(Exception):
    pass


class PaymentRejectionReasonRequired(Exception):
    pass


class PaymentModule:
    def __init__(
        self,
        *,
        reservation_repository: ReservationRepository,
        storage: PrivateStorage,
        clock: Callable[[], datetime],
    ) -> None:
        self._reservation_repository = reservation_repository
        self._storage = storage
        self._clock = clock

    def get_student_payment(self, student: UserAccount, reservation_id: str) -> StudentReservationPayment:
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        if reservation.status != ReservationStatus.pending_payment or reservation.price_rupiah <= 0:
            raise ReservationPaymentUnavailable
        instructions = (reservation.facility.payment_instructions or "").strip()
        if not instructions:
            raise ReservationPaymentUnavailable
        return StudentReservationPayment(
            reservation_id=reservation.id,
            reservation_code=reservation.reservation_code,
            amount_rupiah=reservation.price_rupiah,
            payment_instructions=instructions,
        )

    def upload_student_payment_receipt(
        self,
        student: UserAccount,
        reservation_id: str,
        upload: PaymentReceiptUpload,
    ) -> StudentPaymentReceipt:
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        if reservation.status != ReservationStatus.pending_payment or reservation.price_rupiah <= 0:
            raise ReservationPaymentUnavailable
        if not _is_allowed_payment_receipt_file(upload):
            raise InvalidPaymentReceiptFile
        if len(upload.content) > 5 * 1024 * 1024:
            raise PaymentReceiptFileTooLarge

        uploaded_at = _as_utc(self._clock())
        storage_key = f"payment-receipts/{reservation.id}/{uuid.uuid4().hex}-{upload.filename}"
        self._storage.put(storage_key, upload.content, content_type=upload.content_type)
        reservation.payment_receipt = ReservationPaymentReceipt(
            reservation_id=reservation.id,
            storage_key=storage_key,
            filename=upload.filename,
            content_type=upload.content_type,
            size_bytes=len(upload.content),
            uploaded_at=uploaded_at,
        )
        return _to_student_payment_receipt(reservation.payment_receipt)

    def download_staff_payment_receipt(self, staff: UserAccount, reservation_id: str) -> StaffPaymentReceiptDownload:
        reservation = self._get_staff_payment_review_reservation(staff, reservation_id)
        if reservation.payment_receipt is None:
            raise PaymentReceiptNotUploaded
        receipt = reservation.payment_receipt
        return StaffPaymentReceiptDownload(
            filename=receipt.filename,
            content_type=receipt.content_type,
            content=self._storage.get(receipt.storage_key),
        )

    def approve_payment_receipt(self, staff: UserAccount, reservation_id: str) -> StaffPaymentReview:
        reservation = self._get_staff_payment_review_reservation(staff, reservation_id)
        if reservation.payment_receipt is None:
            raise PaymentReceiptNotUploaded
        reservation.status = ReservationStatus.approved
        return StaffPaymentReview(reservation_id=reservation.id, status=reservation.status)

    def reject_payment_receipt(self, staff: UserAccount, reservation_id: str, *, reason: str) -> StaffPaymentReview:
        reason = reason.strip()
        if not reason:
            raise PaymentRejectionReasonRequired
        reservation = self._get_staff_payment_review_reservation(staff, reservation_id)
        if reservation.payment_receipt is None:
            raise PaymentReceiptNotUploaded
        reservation.status = ReservationStatus.rejected
        reservation.rejection_reason = reason
        return StaffPaymentReview(
            reservation_id=reservation.id,
            status=reservation.status,
            rejection_reason=reservation.rejection_reason,
        )

    def _get_staff_payment_review_reservation(self, staff: UserAccount, reservation_id: str):
        reservation = self._reservation_repository.get_for_assigned_staff_review(reservation_id, staff.id)
        if reservation is not None:
            return reservation
        if self._reservation_repository.get_by_id_for_review(reservation_id) is not None:
            raise StaffPaymentReviewAccessDenied
        raise ReservationNotFound


def _to_student_payment_receipt(receipt: ReservationPaymentReceipt) -> StudentPaymentReceipt:
    return StudentPaymentReceipt(
        reservation_id=receipt.reservation_id,
        filename=receipt.filename,
        content_type=receipt.content_type,
        size_bytes=receipt.size_bytes,
        uploaded_at=_as_utc(receipt.uploaded_at),
    )


def _is_allowed_payment_receipt_file(upload: PaymentReceiptUpload) -> bool:
    allowed_content_types = {"image/jpeg", "image/png"}
    allowed_extensions = (".jpg", ".jpeg", ".png")
    return upload.content_type.lower() in allowed_content_types and upload.filename.lower().endswith(allowed_extensions)


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
