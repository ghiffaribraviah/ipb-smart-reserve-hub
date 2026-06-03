from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
import uuid

from app.models import (
    ReservationApprovalLetter,
    ReservationRejectionSource,
    ReservationSignedApprovalLetter,
    ReservationStatus,
)
from app.pdf import ApprovalLetterInput, ApprovalLetterPdfGenerator
from app.repositories.approval_letter_number_repository import ApprovalLetterNumberRepository
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
    letter_number: str
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
class StudentSignedApprovalLetterSubmission:
    reservation_id: str
    status: ReservationStatus
    document_verification_due_at: datetime


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


class SignedApprovalLetterUploadUnavailable(Exception):
    pass


class SignedApprovalLetterSubmissionUnavailable(Exception):
    pass


class StaffDocumentReviewAccessDenied(Exception):
    pass


class StaffDocumentReviewUnavailable(Exception):
    pass


class DocumentRejectionReasonRequired(Exception):
    pass


class ApprovalLetterAlreadyIssued(Exception):
    pass


class ApprovalLetterIssuer:
    def __init__(
        self,
        *,
        number_repository: ApprovalLetterNumberRepository,
        storage: PrivateStorage,
        pdf_generator: ApprovalLetterPdfGenerator,
        clock: Callable[[], datetime],
    ) -> None:
        self._number_repository = number_repository
        self._storage = storage
        self._pdf_generator = pdf_generator
        self._clock = clock

    def issue_for_new_reservation(self, reservation) -> ReservationApprovalLetter:
        if reservation.approval_letter is not None:
            raise ApprovalLetterAlreadyIssued
        return self._issue(reservation)

    def ensure_issued(self, reservation) -> ReservationApprovalLetter:
        if reservation.approval_letter is not None:
            return reservation.approval_letter
        return self._issue(reservation)

    def _issue(self, reservation) -> ReservationApprovalLetter:
        generated_at = _as_utc(self._clock())
        serial = self._number_repository.next_serial_for_year(generated_at.year)
        letter_number = f"RSV/IPBSRH/{generated_at.year}/{serial:06d}"
        pdf = self._pdf_generator.generate(
            ApprovalLetterInput(
                reservation=reservation,
                generated_at=generated_at,
                letter_number=letter_number,
            )
        )
        filename = f"{reservation.reservation_code}-surat-persetujuan.pdf"
        storage_key = f"approval-letters/{reservation.id}/{uuid.uuid4().hex}.pdf"
        self._storage.put(storage_key, pdf, content_type="application/pdf")
        reservation.approval_letter = ReservationApprovalLetter(
            reservation_id=reservation.id,
            storage_key=storage_key,
            letter_number=letter_number,
            filename=filename,
            content_type="application/pdf",
            size_bytes=len(pdf),
            generated_at=generated_at,
        )
        return reservation.approval_letter


class ApprovalLetterModule:
    def __init__(
        self,
        *,
        reservation_repository: ReservationRepository,
        storage: PrivateStorage,
        pdf_generator: ApprovalLetterPdfGenerator,
        approval_letter_issuer: ApprovalLetterIssuer,
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
        self._approval_letter_issuer = approval_letter_issuer
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
        if not _can_upload_signed_approval_letter(reservation):
            raise SignedApprovalLetterUploadUnavailable
        if len(upload.content) > 5 * 1024 * 1024:
            raise SignedApprovalLetterFileTooLarge
        if not upload.content.startswith(b"%PDF-"):
            raise InvalidSignedApprovalLetterFile

        try:
            file_metadata = self._private_files.store_upload(
                reservation_id=reservation.id,
                folder="signed-approval-letters",
                upload=PrivateFileUpload(
                    filename=upload.filename,
                    content_type=upload.content_type,
                    content=upload.content,
                ),
                allowed_content_types={"application/pdf"},
                allowed_extensions=(".pdf",),
                max_size_bytes=5 * 1024 * 1024,
            )
        except UnsupportedPrivateFileType:
            raise InvalidSignedApprovalLetterFile
        except PrivateFileTooLarge:
            raise SignedApprovalLetterFileTooLarge

        signed_letter = ReservationSignedApprovalLetter(
            reservation_id=reservation.id,
            storage_key=file_metadata.storage_key,
            filename=file_metadata.filename,
            content_type=file_metadata.content_type,
            size_bytes=file_metadata.size_bytes,
            uploaded_at=file_metadata.uploaded_at,
            version=len(reservation.signed_approval_letters) + 1,
        )
        reservation.signed_approval_letters.append(signed_letter)
        if self._notifications is not None:
            self._notifications.student_action_recorded(
                reservation,
                title="Surat berhasil diunggah",
                message=f"Surat persetujuan {reservation.activity_title} berhasil disimpan.",
            )
        return _to_student_signed_approval_letter(signed_letter)

    def submit_student_signed_approval_letter(
        self,
        student: UserAccount,
        reservation_id: str,
    ) -> StudentSignedApprovalLetterSubmission:
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        if reservation.signed_approval_letter is None:
            raise ApprovalLetterNotGenerated
        if reservation.status == ReservationStatus.pending_document_review:
            if reservation.document_verification_due_at is None:
                raise SignedApprovalLetterSubmissionUnavailable
            return StudentSignedApprovalLetterSubmission(
                reservation_id=reservation.id,
                status=reservation.status,
                document_verification_due_at=_as_utc(reservation.document_verification_due_at),
            )
        if reservation.status != ReservationStatus.pending_document_upload and not _is_document_rejected(reservation):
            raise SignedApprovalLetterSubmissionUnavailable

        self._reservation_lifecycle.record_signed_document_uploaded(reservation)
        if reservation.document_verification_due_at is None:
            raise SignedApprovalLetterSubmissionUnavailable
        if self._notifications is not None:
            self._notifications.student_action_recorded(
                reservation,
                title="Surat dikirim untuk verifikasi",
                message=f"Surat persetujuan {reservation.activity_title} sedang menunggu review.",
            )
            self._notifications.staff_action_needed(
                reservation,
                title="Surat menunggu review",
                message=f"Surat persetujuan {reservation.activity_title} menunggu verifikasi.",
            )
        return StudentSignedApprovalLetterSubmission(
            reservation_id=reservation.id,
            status=reservation.status,
            document_verification_due_at=_as_utc(reservation.document_verification_due_at),
        )

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
        self._ensure_document_submitted_for_review(reservation)

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
        self._ensure_document_submitted_for_review(reservation)
        download = self._private_files.download(reservation.signed_approval_letter)
        return StaffSignedApprovalLetterDownload(
            filename=download.filename,
            content_type=download.content_type,
            content=download.content,
        )

    def download_staff_signed_approval_letter_version(
        self,
        staff: UserAccount,
        reservation_id: str,
        signed_letter_id: str,
    ) -> StaffSignedApprovalLetterDownload:
        reservation = self._get_staff_review_reservation(staff, reservation_id)
        signed_letter = next(
            (letter for letter in reservation.signed_approval_letters if letter.id == signed_letter_id),
            None,
        )
        if signed_letter is None:
            raise ApprovalLetterNotGenerated
        download = self._private_files.download(signed_letter)
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
        self._ensure_document_submitted_for_review(reservation)

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

    def _ensure_document_submitted_for_review(self, reservation) -> None:
        if reservation.status != ReservationStatus.pending_document_review:
            raise StaffDocumentReviewUnavailable

    def _get_or_create_student_approval_letter(
        self,
        student: UserAccount,
        reservation_id: str,
    ) -> ReservationApprovalLetter:
        reservation = self._reservation_repository.get_for_student(reservation_id, student.id)
        if reservation is None:
            raise ReservationNotFound
        return self._approval_letter_issuer.ensure_issued(reservation)


def _to_student_approval_letter(letter: ReservationApprovalLetter) -> StudentApprovalLetter:
    return StudentApprovalLetter(
        reservation_id=letter.reservation_id,
        reservation_code=letter.reservation.reservation_code,
        letter_number=letter.letter_number,
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


def _can_upload_signed_approval_letter(reservation) -> bool:
    return reservation.status in {
        ReservationStatus.pending_document_upload,
        ReservationStatus.pending_document_review,
    } or _is_document_rejected(reservation)


def _is_document_rejected(reservation) -> bool:
    return (
        reservation.status == ReservationStatus.rejected
        and reservation.rejection_source == ReservationRejectionSource.document
    )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
