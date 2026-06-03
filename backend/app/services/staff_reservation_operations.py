from dataclasses import dataclass
from datetime import UTC, date, datetime, time

from app.models import Reservation, ReservationRejectionSource, ReservationStatus
from app.repositories.staff_reservation_operations_repository import StaffReservationOperationsRepository
from app.services.accounts import UserAccount


@dataclass(frozen=True)
class StaffReservationParty:
    id: str | None
    name: str


@dataclass(frozen=True)
class StaffReservationDetailFacility(StaffReservationParty):
    cover_image_url: str | None


@dataclass(frozen=True)
class StaffReservationStudent:
    id: str
    full_name: str
    email: str


@dataclass(frozen=True)
class StaffReservationDocumentProjection:
    review_status: str
    due_at: datetime | None


@dataclass(frozen=True)
class StaffReservationPaymentProjection:
    required: bool
    review_status: str
    due_at: datetime | None


@dataclass(frozen=True)
class StaffReservationCancellationProjection:
    requested: bool
    review_status: str


@dataclass(frozen=True)
class StaffReservationOperationItem:
    id: str
    reservation_code: str
    facility: StaffReservationParty
    student: StaffReservationStudent
    organization_unit: StaffReservationParty
    activity_title: str
    starts_at: datetime
    ends_at: datetime
    status: str
    workflow_type: str
    review_status: str
    due_at: datetime | None
    document: StaffReservationDocumentProjection
    payment: StaffReservationPaymentProjection
    cancellation: StaffReservationCancellationProjection


@dataclass(frozen=True)
class StaffReservationFileMetadata:
    filename: str
    content_type: str
    size_bytes: int
    letter_number: str | None = None
    generated_at: datetime | None = None
    uploaded_at: datetime | None = None


@dataclass(frozen=True)
class StaffReservationSignedFileMetadata:
    id: str
    filename: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime
    download_url: str


@dataclass(frozen=True)
class StaffReservationExtraRequirements:
    av_support: bool
    logistics_coordination: bool
    extra_cleaning: bool
    security_personnel: bool
    notes: str | None


@dataclass(frozen=True)
class StaffReservationDetailDocument:
    approval_letter: StaffReservationFileMetadata | None
    signed_approval_letter: StaffReservationSignedFileMetadata | None
    signed_approval_letters: list[StaffReservationSignedFileMetadata]
    review_status: str
    rejection_reason: str | None
    due_at: datetime | None


@dataclass(frozen=True)
class StaffReservationDetailPayment:
    required: bool
    receipt: StaffReservationFileMetadata | None
    review_status: str
    rejection_reason: str | None
    due_at: datetime | None


@dataclass(frozen=True)
class StaffReservationDetailCancellation:
    requested: bool
    review_status: str
    reason: str | None
    rejection_reason: str | None


@dataclass(frozen=True)
class StaffReservationReviewActionUrls:
    approve_url: str
    reject_url: str
    download_url: str | None = None


@dataclass(frozen=True)
class StaffReservationReviewActions:
    document: StaffReservationReviewActionUrls
    payment: StaffReservationReviewActionUrls
    cancellation: StaffReservationReviewActionUrls


@dataclass(frozen=True)
class StaffReservationDetail:
    id: str
    reservation_code: str
    facility: StaffReservationDetailFacility
    student: StaffReservationStudent
    organization_unit: StaffReservationParty
    activity_title: str
    event_description: str
    participant_count: int
    contact_phone: str
    starts_at: datetime
    ends_at: datetime
    status: str
    price_rupiah: int
    extra_requirements: StaffReservationExtraRequirements
    document: StaffReservationDetailDocument
    payment: StaffReservationDetailPayment
    cancellation: StaffReservationDetailCancellation
    review_actions: StaffReservationReviewActions


@dataclass(frozen=True)
class StaffFacilityScheduleEntry:
    reservation_id: str
    reservation_code: str
    activity_title: str
    organization_unit: StaffReservationParty
    starts_at: datetime
    ends_at: datetime
    status: str
    workflow_type: str
    review_status: str
    detail_url: str


class StaffReservationNotFound(Exception):
    pass


class StaffFacilityScheduleNotFound(Exception):
    pass


class StaffReservationOperationsModule:
    def __init__(self, *, repository: StaffReservationOperationsRepository) -> None:
        self._repository = repository

    def list_verification_queue(self, staff: UserAccount) -> list[StaffReservationOperationItem]:
        return [_to_operation_item(reservation) for reservation in self._repository.list_actionable_queue(staff.id)]

    def list_assigned_reservations(
        self,
        staff: UserAccount,
        *,
        status: str | None = None,
        facility_id: str | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> list[StaffReservationOperationItem]:
        reservation_status = ReservationStatus(status) if status is not None else None
        starts_at_from = _start_of_day_utc(date_from)
        starts_at_to = _end_of_day_utc(date_to)
        return [
            _to_operation_item(reservation)
            for reservation in self._repository.list_assigned_reservations(
                staff.id,
                status=reservation_status,
                facility_id=facility_id,
                starts_at_from=starts_at_from,
                starts_at_to=starts_at_to,
            )
        ]

    def get_assigned_reservation_detail(self, staff: UserAccount, reservation_id: str) -> StaffReservationDetail:
        reservation = self._repository.get_assigned_reservation(staff.id, reservation_id)
        if reservation is None:
            raise StaffReservationNotFound
        return _to_detail(reservation)

    def list_facility_schedule(
        self,
        staff: UserAccount,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[StaffFacilityScheduleEntry]:
        if not self._repository.has_facility_assignment(staff.id, facility_id):
            raise StaffFacilityScheduleNotFound
        return [
            _to_schedule_entry(reservation)
            for reservation in self._repository.list_assigned_facility_schedule(
                staff.id,
                facility_id,
                starts_at=_as_utc(starts_at),
                ends_at=_as_utc(ends_at),
            )
        ]


def _to_operation_item(reservation: Reservation) -> StaffReservationOperationItem:
    workflow_type, review_status, due_at = _queue_workflow(reservation)
    return StaffReservationOperationItem(
        id=reservation.id,
        reservation_code=reservation.reservation_code,
        facility=StaffReservationParty(id=reservation.facility.id, name=reservation.facility.name),
        student=StaffReservationStudent(
            id=reservation.student.id,
            full_name=reservation.student.full_name,
            email=reservation.student.email,
        ),
        organization_unit=StaffReservationParty(
            id=reservation.organization_unit_id,
            name=_organization_unit_name(reservation),
        ),
        activity_title=reservation.activity_title,
        starts_at=_as_utc(reservation.starts_at),
        ends_at=_as_utc(reservation.ends_at),
        status=reservation.status.value,
        workflow_type=workflow_type,
        review_status=review_status,
        due_at=_optional_utc(due_at),
        document=_document_projection(reservation),
        payment=_payment_projection(reservation),
        cancellation=_cancellation_projection(reservation),
    )


def _to_detail(reservation: Reservation) -> StaffReservationDetail:
    return StaffReservationDetail(
        id=reservation.id,
        reservation_code=reservation.reservation_code,
        facility=StaffReservationDetailFacility(
            id=reservation.facility.id,
            name=reservation.facility.name,
            cover_image_url=_facility_cover_image_url(reservation.facility),
        ),
        student=StaffReservationStudent(
            id=reservation.student.id,
            full_name=reservation.student.full_name,
            email=reservation.student.email,
        ),
        organization_unit=StaffReservationParty(
            id=reservation.organization_unit_id,
            name=_organization_unit_name(reservation),
        ),
        activity_title=reservation.activity_title,
        event_description=reservation.event_description,
        participant_count=reservation.participant_count,
        contact_phone=reservation.contact_phone,
        starts_at=_as_utc(reservation.starts_at),
        ends_at=_as_utc(reservation.ends_at),
        status=reservation.status.value,
        price_rupiah=reservation.price_rupiah,
        extra_requirements=StaffReservationExtraRequirements(
            av_support=reservation.extra_requirement_av_support,
            logistics_coordination=reservation.extra_requirement_logistics_coordination,
            extra_cleaning=reservation.extra_requirement_extra_cleaning,
            security_personnel=reservation.extra_requirement_security_personnel,
            notes=reservation.extra_requirement_notes,
        ),
        document=StaffReservationDetailDocument(
            approval_letter=_approval_letter_metadata(reservation),
            signed_approval_letter=_signed_approval_letter_metadata(reservation),
            signed_approval_letters=_signed_approval_letter_history(reservation),
            review_status=_document_projection(reservation).review_status,
            rejection_reason=reservation.rejection_reason
            if reservation.rejection_source == ReservationRejectionSource.document
            else None,
            due_at=_optional_utc(reservation.document_verification_due_at),
        ),
        payment=StaffReservationDetailPayment(
            required=reservation.price_rupiah > 0,
            receipt=_payment_receipt_metadata(reservation),
            review_status=_payment_projection(reservation).review_status,
            rejection_reason=reservation.rejection_reason
            if reservation.rejection_source == ReservationRejectionSource.payment
            else None,
            due_at=_optional_utc(reservation.payment_verification_due_at),
        ),
        cancellation=StaffReservationDetailCancellation(
            requested=reservation.cancellation_reason is not None,
            review_status=_cancellation_projection(reservation).review_status,
            reason=reservation.cancellation_reason,
            rejection_reason=reservation.cancellation_rejection_reason,
        ),
        review_actions=_review_actions(reservation.id),
    )


def _to_schedule_entry(reservation: Reservation) -> StaffFacilityScheduleEntry:
    workflow_type, review_status, _ = _queue_workflow(reservation)
    return StaffFacilityScheduleEntry(
        reservation_id=reservation.id,
        reservation_code=reservation.reservation_code,
        activity_title=reservation.activity_title,
        organization_unit=StaffReservationParty(
            id=reservation.organization_unit_id,
            name=_organization_unit_name(reservation),
        ),
        starts_at=_as_utc(reservation.starts_at),
        ends_at=_as_utc(reservation.ends_at),
        status=reservation.status.value,
        workflow_type=workflow_type,
        review_status=review_status,
        detail_url=f"/staff/reservations/{reservation.id}",
    )


def _approval_letter_metadata(reservation: Reservation) -> StaffReservationFileMetadata | None:
    if reservation.approval_letter is None:
        return None
    return StaffReservationFileMetadata(
        filename=reservation.approval_letter.filename,
        content_type=reservation.approval_letter.content_type,
        size_bytes=reservation.approval_letter.size_bytes,
        letter_number=reservation.approval_letter.letter_number,
        generated_at=_optional_utc(reservation.approval_letter.generated_at),
    )


def _signed_approval_letter_metadata(reservation: Reservation) -> StaffReservationSignedFileMetadata | None:
    if reservation.signed_approval_letter is None:
        return None
    return _signed_file_metadata(reservation.id, reservation.signed_approval_letter)


def _signed_approval_letter_history(reservation: Reservation) -> list[StaffReservationSignedFileMetadata]:
    return [
        _signed_file_metadata(reservation.id, letter)
        for letter in sorted(
            reservation.signed_approval_letters,
            key=lambda item: (item.uploaded_at, item.version),
            reverse=True,
        )
    ]


def _signed_file_metadata(reservation_id: str, letter) -> StaffReservationSignedFileMetadata:
    return StaffReservationSignedFileMetadata(
        id=letter.id,
        filename=letter.filename,
        content_type=letter.content_type,
        size_bytes=letter.size_bytes,
        uploaded_at=_as_utc(letter.uploaded_at),
        download_url=f"/staff/reservations/{reservation_id}/signed-approval-letters/{letter.id}/download",
    )


def _payment_receipt_metadata(reservation: Reservation) -> StaffReservationFileMetadata | None:
    if reservation.payment_receipt is None:
        return None
    return StaffReservationFileMetadata(
        filename=reservation.payment_receipt.filename,
        content_type=reservation.payment_receipt.content_type,
        size_bytes=reservation.payment_receipt.size_bytes,
        uploaded_at=_optional_utc(reservation.payment_receipt.uploaded_at),
    )


def _facility_cover_image_url(facility) -> str | None:
    active_images = [image for image in getattr(facility, "images", []) if image.is_active]
    cover_image = next((image for image in active_images if image.is_cover), None) or next(iter(active_images), None)
    return cover_image.url if cover_image is not None else None


def _organization_unit_name(reservation: Reservation) -> str:
    if reservation.organization_unit_name:
        return reservation.organization_unit_name
    if reservation.organization_unit is not None:
        return reservation.organization_unit.name
    return ""


def _review_actions(reservation_id: str) -> StaffReservationReviewActions:
    return StaffReservationReviewActions(
        document=StaffReservationReviewActionUrls(
            approve_url=f"/staff/reservations/{reservation_id}/document-review/approve",
            reject_url=f"/staff/reservations/{reservation_id}/document-review/reject",
            download_url=f"/staff/reservations/{reservation_id}/signed-approval-letter/download",
        ),
        payment=StaffReservationReviewActionUrls(
            approve_url=f"/staff/reservations/{reservation_id}/payment-review/approve",
            reject_url=f"/staff/reservations/{reservation_id}/payment-review/reject",
            download_url=f"/staff/reservations/{reservation_id}/payment-receipt/download",
        ),
        cancellation=StaffReservationReviewActionUrls(
            approve_url=f"/staff/reservations/{reservation_id}/cancellation-review/approve",
            reject_url=f"/staff/reservations/{reservation_id}/cancellation-review/reject",
        ),
    )


def _queue_workflow(reservation: Reservation) -> tuple[str, str, datetime | None]:
    if reservation.status in {ReservationStatus.pending_document_review, ReservationStatus.overdue_verification}:
        return "document_review", "pending_review", reservation.document_verification_due_at
    if reservation.status == ReservationStatus.pending_payment:
        return "payment_review", "pending_review", reservation.payment_verification_due_at
    return "reservation", "not_actionable", None


def _document_projection(reservation: Reservation) -> StaffReservationDocumentProjection:
    if reservation.status == ReservationStatus.pending_document_upload:
        review_status = "awaiting_upload"
    elif reservation.status in {ReservationStatus.pending_document_review, ReservationStatus.overdue_verification}:
        review_status = "pending_review"
    elif reservation.rejection_source == ReservationRejectionSource.document:
        review_status = "rejected"
    else:
        review_status = "approved"
    return StaffReservationDocumentProjection(
        review_status=review_status,
        due_at=_optional_utc(reservation.document_verification_due_at),
    )


def _payment_projection(reservation: Reservation) -> StaffReservationPaymentProjection:
    required = reservation.price_rupiah > 0
    if not required:
        review_status = "not_required"
    elif reservation.rejection_source == ReservationRejectionSource.payment:
        review_status = "rejected"
    elif reservation.status == ReservationStatus.pending_payment and reservation.payment_receipt is None:
        review_status = "awaiting_upload"
    elif reservation.status == ReservationStatus.pending_payment:
        review_status = "pending_review"
    else:
        review_status = "approved"
    return StaffReservationPaymentProjection(
        required=required,
        review_status=review_status,
        due_at=_optional_utc(reservation.payment_verification_due_at),
    )


def _cancellation_projection(reservation: Reservation) -> StaffReservationCancellationProjection:
    if reservation.status == ReservationStatus.cancellation_requested:
        return StaffReservationCancellationProjection(requested=True, review_status="not_actionable")
    if reservation.status == ReservationStatus.cancelled:
        return StaffReservationCancellationProjection(requested=True, review_status="approved")
    if reservation.cancellation_rejection_reason is not None:
        return StaffReservationCancellationProjection(requested=True, review_status="rejected")
    return StaffReservationCancellationProjection(requested=False, review_status="not_requested")


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _optional_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    return _as_utc(value)


def _start_of_day_utc(value: date | None) -> datetime | None:
    if value is None:
        return None
    return datetime.combine(value, time.min, tzinfo=UTC)


def _end_of_day_utc(value: date | None) -> datetime | None:
    if value is None:
        return None
    return datetime.combine(value, time.max, tzinfo=UTC)
