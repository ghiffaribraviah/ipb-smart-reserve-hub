from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
import uuid

from app.models import ReservationApprovalLetter, ReservationSignedApprovalLetter, ReservationStatus
from app.pdf import ApprovalLetterInput, ApprovalLetterPdfGenerator
from app.repositories.reservation_repository import ReservationRepository
from app.services.accounts import UserAccount
from app.services.audit_logs import AuditLogModule, AuditLogRecorder
from app.services.booking_settings import BookingSettings
from app.services.notifications import NotificationModule
from app.services.reservation_private_files import (
    PrivateFileTooLarge,
    PrivateFileUpload,
    ReservationPrivateFileModule,
    UnsupportedPrivateFileType,
)
from app.services.reservation_lifecycle import FacilityReservationLifecycleModule
from app.services.reservations import ReservationNotFound
from app.services.staff_reservation_review_access import (
    StaffReservationReviewAccessDenied,
    StaffReservationReviewAccessModule,
    StaffReservationReviewReservationNotFound,
)
from app.storage import PrivateStorage


@dataclass(frozen=True)
class StudentApprovalLetter:
    reservation_id: str
    reservation_code: str
    filename: str
    content_type: str
    size_bytes: int
    generated_at: datetime


@dataclass(frozen=True)
class StudentApprovalLetterDownload:
    filename: str
    content_type: str
    content: bytes


@dataclass(frozen=True)
class StudentSignedApprovalLetterDownload:
    filename: str
    content_type: str
    content: bytes


@dataclass(frozen=True)
class StaffSignedApprovalLetterDownload:
    filename: str
    content_type: str
    content: bytes


@dataclass(frozen=True)
class SignedApprovalLetterUpload:
    filename: str
    content_type: str
    content: bytes


@dataclass(frozen=True)
class StudentSignedApprovalLetter:
    reservation_id: str
    filename: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime


@dataclass(frozen=True)
class StaffDocumentReview:
    reservation_id: str
    status: ReservationStatus
    rejection_reason: str | None = None


class ApprovalLetterNotGenerated(Exception):
    pass


class InvalidSignedApprovalLetterFile(Exception):
    pass


class SignedApprovalLetterFileTooLarge(Exception):
    pass


class StaffDocumentReviewAccessDenied(Exception):
    pass


class DocumentRejectionReasonRequired(Exception):
    pass


class ApprovalLetterModule:
    def __init__(
        self,
        *,
        reservation_repository: ReservationRepository,
        storage: PrivateStorage,
        pdf_generator: ApprovalLetterPdfGenerator,
        booking_settings: BookingSettings,
        clock: Callable[[], datetime],
        reservation_lifecycle: FacilityReservationLifecycleModule | None = None,
        staff_review_access: StaffReservationReviewAccessModule | None = None,
        notifications: NotificationModule | None = None,
        audit_logs: AuditLogModule | None = None,
    ) -> None:
        self._reservation_repository = reservation_repository
        self._storage = storage
        self._pdf_generator = pdf_generator
        self._clock = clock
        self._reservation_lifecycle = reservation_lifecycle or FacilityReservationLifecycleModule(
            booking_settings=booking_settings,
            clock=clock,
        )
        self._private_files = ReservationPrivateFileModule(storage=storage, clock=clock)
        self._staff_review_access = staff_review_access or StaffReservationReviewAccessModule(
            reservation_repository=reservation_repository
        )
        self._notifications = notifications
        self._audit_recorder = AuditLogRecorder(audit_logs)

    def get_student_approval_letter(self, student: UserAccount, reservation_id: str) -> StudentApprovalLetter:
        letter = self._get_or_create_student_approval_letter(student, reservation_id)
        return _to_student_approval_letter(letter)

    def download_student_approval_letter(
        self,
        student: UserAccount,
        reservation_id: str,
    ) -> StudentApprovalLetterDownload:
        letter = self._get_or_create_student_approval_letter(student, reservation_id)
        return StudentApprovalLetterDownload(
            filename=letter.filename,
            content_type=letter.content_type,
            content=self._storage.get(letter.storage_key),
        )

    def upload_student_signed_approval_letter(
        self,
        student: UserAccount,
        reservation_id: str,
        upload: SignedApprovalLetterUpload,
    ) -> StudentSignedApprovalLetter:
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        if reservation.approval_letter is None:
            raise ApprovalLetterNotGenerated

        try:
            file_metadata = self._private_files.store_upload(
                reservation_id=reservation.id,
                folder="signed-approval-letters",
                upload=PrivateFileUpload(
                    filename=upload.filename,
                    content_type=upload.content_type,
                    content=upload.content,
                ),
                allowed_content_types={"application/pdf", "image/jpeg", "image/png"},
                allowed_extensions=(".pdf", ".jpg", ".jpeg", ".png"),
                max_size_bytes=5 * 1024 * 1024,
            )
        except UnsupportedPrivateFileType:
            raise InvalidSignedApprovalLetterFile
        except PrivateFileTooLarge:
            raise SignedApprovalLetterFileTooLarge

        reservation.signed_approval_letter = ReservationSignedApprovalLetter(
            reservation_id=reservation.id,
            storage_key=file_metadata.storage_key,
            filename=file_metadata.filename,
            content_type=file_metadata.content_type,
            size_bytes=file_metadata.size_bytes,
            uploaded_at=file_metadata.uploaded_at,
        )
        self._reservation_lifecycle.record_signed_document_uploaded(reservation)
        if self._notifications is not None:
            self._notifications.student_action_recorded(
                reservation,
                title="Surat berhasil diunggah",
                message=f"Surat persetujuan {reservation.activity_title} sedang menunggu review.",
            )
            self._notifications.staff_action_needed(
                reservation,
                title="Surat menunggu review",
                message=f"Surat persetujuan {reservation.activity_title} menunggu verifikasi.",
            )
        return _to_student_signed_approval_letter(reservation.signed_approval_letter)

    def download_student_signed_approval_letter(
        self,
        student: UserAccount,
        reservation_id: str,
    ) -> StudentSignedApprovalLetterDownload:
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        if reservation.signed_approval_letter is None:
            raise ApprovalLetterNotGenerated
        download = self._private_files.download(reservation.signed_approval_letter)
        return StudentSignedApprovalLetterDownload(
            filename=download.filename,
            content_type=download.content_type,
            content=download.content,
        )

    def approve_signed_approval_letter(self, staff: UserAccount, reservation_id: str) -> StaffDocumentReview:
        reservation = self._get_staff_review_reservation(staff, reservation_id)
        if reservation.signed_approval_letter is None:
            raise ApprovalLetterNotGenerated

        self._reservation_lifecycle.approve_document(reservation)
        if reservation.status == ReservationStatus.approved:
            title = "Reservasi disetujui"
            message = f"Reservasi {reservation.activity_title} sudah disetujui."
        else:
            title = "Pembayaran diperlukan"
            message = f"Reservasi {reservation.activity_title} disetujui dokumennya dan menunggu pembayaran."
        if self._notifications is not None:
            self._notifications.student_action_recorded(reservation, title=title, message=message)
        self._audit_recorder.record(
            actor=staff,
            action_type="document.approved",
            target_type="reservation",
            target_id=reservation.id,
            facility_id=reservation.facility_id,
            student_id=reservation.student_id,
            reservation_id=reservation.id,
        )
        return StaffDocumentReview(reservation_id=reservation.id, status=reservation.status)

    def download_staff_signed_approval_letter(
        self,
        staff: UserAccount,
        reservation_id: str,
    ) -> StaffSignedApprovalLetterDownload:
        reservation = self._get_staff_review_reservation(staff, reservation_id)
        if reservation.signed_approval_letter is None:
            raise ApprovalLetterNotGenerated
        download = self._private_files.download(reservation.signed_approval_letter)
        return StaffSignedApprovalLetterDownload(
            filename=download.filename,
            content_type=download.content_type,
            content=download.content,
        )

    def reject_signed_approval_letter(
        self,
        staff: UserAccount,
        reservation_id: str,
        *,
        reason: str,
    ) -> StaffDocumentReview:
        reason = reason.strip()
        if not reason:
            raise DocumentRejectionReasonRequired

        reservation = self._get_staff_review_reservation(staff, reservation_id)
        if reservation.signed_approval_letter is None:
            raise ApprovalLetterNotGenerated

        self._reservation_lifecycle.reject_document(reservation, reason=reason)
        if self._notifications is not None:
            self._notifications.student_action_recorded(
                reservation,
                title="Surat ditolak",
                message=f"Surat persetujuan {reservation.activity_title} ditolak: {reason}",
            )
        self._audit_recorder.record(
            actor=staff,
            action_type="document.rejected",
            target_type="reservation",
            target_id=reservation.id,
            facility_id=reservation.facility_id,
            student_id=reservation.student_id,
            reservation_id=reservation.id,
        )
        return StaffDocumentReview(
            reservation_id=reservation.id,
            status=reservation.status,
            rejection_reason=reservation.rejection_reason,
        )

    def _get_staff_review_reservation(self, staff: UserAccount, reservation_id: str):
        try:
            return self._staff_review_access.require_assigned_reservation(reservation_id, staff_id=staff.id)
        except StaffReservationReviewAccessDenied:
            raise StaffDocumentReviewAccessDenied
        except StaffReservationReviewReservationNotFound:
            raise ReservationNotFound

    def _get_or_create_student_approval_letter(
        self,
        student: UserAccount,
        reservation_id: str,
    ) -> ReservationApprovalLetter:
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        if reservation.approval_letter is None:
            generated_at = _as_utc(self._clock())
            pdf = self._pdf_generator.generate(
                ApprovalLetterInput(
                    reservation=reservation,
                    generated_at=generated_at,
                )
            )
            filename = f"{reservation.reservation_code}-surat-persetujuan.pdf"
            storage_key = f"approval-letters/{reservation.id}/{uuid.uuid4().hex}.pdf"
            self._storage.put(storage_key, pdf, content_type="application/pdf")
            reservation.approval_letter = ReservationApprovalLetter(
                reservation_id=reservation.id,
                storage_key=storage_key,
                filename=filename,
                content_type="application/pdf",
                size_bytes=len(pdf),
                generated_at=generated_at,
            )
        return reservation.approval_letter


def _to_student_approval_letter(letter: ReservationApprovalLetter) -> StudentApprovalLetter:
    return StudentApprovalLetter(
        reservation_id=letter.reservation_id,
        reservation_code=letter.reservation.reservation_code,
        filename=letter.filename,
        content_type=letter.content_type,
        size_bytes=letter.size_bytes,
        generated_at=_as_utc(letter.generated_at),
    )


def _to_student_signed_approval_letter(letter: ReservationSignedApprovalLetter) -> StudentSignedApprovalLetter:
    return StudentSignedApprovalLetter(
        reservation_id=letter.reservation_id,
        filename=letter.filename,
        content_type=letter.content_type,
        size_bytes=letter.size_bytes,
        uploaded_at=_as_utc(letter.uploaded_at),
    )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
