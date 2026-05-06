from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
import uuid

from app.models import ReservationApprovalLetter
from app.pdf import ApprovalLetterInput, ApprovalLetterPdfGenerator
from app.repositories.reservation_repository import ReservationRepository
from app.services.accounts import UserAccount
from app.services.reservations import ReservationNotFound
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


class ApprovalLetterModule:
    def __init__(
        self,
        *,
        reservation_repository: ReservationRepository,
        storage: PrivateStorage,
        pdf_generator: ApprovalLetterPdfGenerator,
        clock: Callable[[], datetime],
    ) -> None:
        self._reservation_repository = reservation_repository
        self._storage = storage
        self._pdf_generator = pdf_generator
        self._clock = clock

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


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
