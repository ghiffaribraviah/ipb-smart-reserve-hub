from dataclasses import dataclass
from datetime import UTC, datetime

from app.models import Reservation, ReservationRejectionSource, ReservationStatus


@dataclass(frozen=True)
class ReservationExtraRequirements:
    av_support: bool = False
    logistics_coordination: bool = False
    extra_cleaning: bool = False
    security_personnel: bool = False
    notes: str | None = None


@dataclass(frozen=True)
class ReservationFacilitySummary:
    id: str
    name: str
    cover_image_url: str | None = None


@dataclass(frozen=True)
class ReservationOrganizationUnitSummary:
    id: str
    name: str


@dataclass(frozen=True)
class StudentReservationReviewSummary:
    id: str
    is_deleted: bool
    deleted_by: str | None
    deleted_at: datetime | None
    admin_removal_reason: str | None


@dataclass(frozen=True)
class ReservationDocumentMetadata:
    filename: str
    content_type: str
    size_bytes: int
    letter_number: str | None = None
    generated_at: datetime | None = None
    uploaded_at: datetime | None = None


@dataclass(frozen=True)
class StudentReservationDocumentProjection:
    approval_letter: ReservationDocumentMetadata | None
    signed_approval_letter: ReservationDocumentMetadata | None
    review_status: str
    rejection_reason: str | None = None


@dataclass(frozen=True)
class StudentReservationPaymentProjection:
    required: bool
    receipt: ReservationDocumentMetadata | None
    review_status: str
    rejection_reason: str | None = None


@dataclass(frozen=True)
class StudentReservationRejectionProjection:
    source: str
    reason: str | None


@dataclass(frozen=True)
class StudentReservation:
    id: str
    reservation_code: str
    status: ReservationStatus
    facility: ReservationFacilitySummary
    organization_unit: ReservationOrganizationUnitSummary
    activity_title: str
    event_description: str
    participant_count: int
    contact_phone: str
    starts_at: datetime
    ends_at: datetime
    price_rupiah: int
    extra_requirements: ReservationExtraRequirements
    document: StudentReservationDocumentProjection
    payment: StudentReservationPaymentProjection
    rejection: StudentReservationRejectionProjection | None = None
    document_upload_due_at: datetime | None = None
    document_verification_due_at: datetime | None = None
    payment_upload_due_at: datetime | None = None
    payment_verification_due_at: datetime | None = None
    cancellation_reason: str | None = None
    cancellation_rejection_reason: str | None = None
    review: StudentReservationReviewSummary | None = None


class StudentReservationWorkflowProjectionModule:
    def project(self, reservation: Reservation, *, effective_status: ReservationStatus) -> StudentReservation:
        return StudentReservation(
            id=reservation.id,
            reservation_code=reservation.reservation_code,
            status=effective_status,
            facility=ReservationFacilitySummary(
                id=reservation.facility_id,
                name=reservation.facility.name,
                cover_image_url=_facility_cover_image_url(reservation.facility),
            ),
            organization_unit=ReservationOrganizationUnitSummary(
                id=reservation.organization_unit_id,
                name=reservation.organization_unit_name or reservation.organization_unit.name,
            ),
            activity_title=reservation.activity_title,
            event_description=reservation.event_description,
            participant_count=reservation.participant_count,
            contact_phone=reservation.contact_phone,
            starts_at=_as_utc(reservation.starts_at),
            ends_at=_as_utc(reservation.ends_at),
            price_rupiah=reservation.price_rupiah,
            extra_requirements=ReservationExtraRequirements(
                av_support=reservation.extra_requirement_av_support,
                logistics_coordination=reservation.extra_requirement_logistics_coordination,
                extra_cleaning=reservation.extra_requirement_extra_cleaning,
                security_personnel=reservation.extra_requirement_security_personnel,
                notes=reservation.extra_requirement_notes,
            ),
            document=_to_student_reservation_document_projection(reservation),
            payment=_to_student_reservation_payment_projection(reservation),
            rejection=_to_student_reservation_rejection_projection(reservation),
            document_upload_due_at=_optional_utc(reservation.document_upload_due_at),
            document_verification_due_at=_optional_utc(reservation.document_verification_due_at),
            payment_upload_due_at=_optional_utc(reservation.payment_upload_due_at),
            payment_verification_due_at=_optional_utc(reservation.payment_verification_due_at),
            cancellation_reason=reservation.cancellation_reason,
            cancellation_rejection_reason=reservation.cancellation_rejection_reason,
            review=_to_student_reservation_review(reservation),
        )


def _to_student_reservation_document_projection(reservation: Reservation) -> StudentReservationDocumentProjection:
    rejection_reason = None
    if reservation.status == ReservationStatus.rejected and reservation.rejection_source == ReservationRejectionSource.document:
        rejection_reason = reservation.rejection_reason
    return StudentReservationDocumentProjection(
        approval_letter=_approval_letter_metadata(reservation),
        signed_approval_letter=_signed_approval_letter_metadata(reservation),
        review_status=_document_review_status(reservation),
        rejection_reason=rejection_reason,
    )


def _facility_cover_image_url(facility) -> str | None:
    active_images = [image for image in getattr(facility, "images", []) if image.is_active]
    cover_image = next((image for image in active_images if image.is_cover), None) or next(iter(active_images), None)
    return cover_image.url if cover_image is not None else None


def _to_student_reservation_payment_projection(reservation: Reservation) -> StudentReservationPaymentProjection:
    rejection_reason = None
    if reservation.status == ReservationStatus.rejected and reservation.rejection_source == ReservationRejectionSource.payment:
        rejection_reason = reservation.rejection_reason
    return StudentReservationPaymentProjection(
        required=reservation.price_rupiah > 0,
        receipt=_payment_receipt_metadata(reservation),
        review_status=_payment_review_status(reservation),
        rejection_reason=rejection_reason,
    )


def _to_student_reservation_rejection_projection(reservation: Reservation) -> StudentReservationRejectionProjection | None:
    if reservation.status != ReservationStatus.rejected:
        return None
    source = reservation.rejection_source.value if reservation.rejection_source is not None else "unknown"
    return StudentReservationRejectionProjection(source=source, reason=reservation.rejection_reason)


def _approval_letter_metadata(reservation: Reservation) -> ReservationDocumentMetadata | None:
    if reservation.approval_letter is None:
        return None
    return ReservationDocumentMetadata(
        filename=reservation.approval_letter.filename,
        content_type=reservation.approval_letter.content_type,
        size_bytes=reservation.approval_letter.size_bytes,
        letter_number=reservation.approval_letter.letter_number,
        generated_at=_as_utc(reservation.approval_letter.generated_at),
    )


def _signed_approval_letter_metadata(reservation: Reservation) -> ReservationDocumentMetadata | None:
    if reservation.signed_approval_letter is None:
        return None
    return ReservationDocumentMetadata(
        filename=reservation.signed_approval_letter.filename,
        content_type=reservation.signed_approval_letter.content_type,
        size_bytes=reservation.signed_approval_letter.size_bytes,
        uploaded_at=_as_utc(reservation.signed_approval_letter.uploaded_at),
    )


def _payment_receipt_metadata(reservation: Reservation) -> ReservationDocumentMetadata | None:
    if reservation.payment_receipt is None:
        return None
    return ReservationDocumentMetadata(
        filename=reservation.payment_receipt.filename,
        content_type=reservation.payment_receipt.content_type,
        size_bytes=reservation.payment_receipt.size_bytes,
        uploaded_at=_as_utc(reservation.payment_receipt.uploaded_at),
    )


def _document_review_status(reservation: Reservation) -> str:
    if reservation.status == ReservationStatus.pending_document_upload:
        return "upload_needed"
    if reservation.status == ReservationStatus.pending_document_review:
        return "waiting_review"
    if reservation.status == ReservationStatus.rejected and reservation.rejection_source == ReservationRejectionSource.document:
        return "rejected"
    if reservation.status in (
        ReservationStatus.pending_payment,
        ReservationStatus.approved,
        ReservationStatus.cancellation_requested,
        ReservationStatus.completed,
    ):
        return "approved"
    return "not_ready"


def _payment_review_status(reservation: Reservation) -> str:
    if reservation.price_rupiah <= 0:
        return "not_required"
    if reservation.status == ReservationStatus.pending_payment:
        if reservation.payment_receipt is None or reservation.payment_verification_due_at is None:
            return "upload_needed"
        return "waiting_review"
    if reservation.status == ReservationStatus.rejected and reservation.rejection_source == ReservationRejectionSource.payment:
        return "rejected"
    if reservation.status in (
        ReservationStatus.approved,
        ReservationStatus.cancellation_requested,
        ReservationStatus.completed,
    ):
        return "approved"
    return "not_ready"


def _to_student_reservation_review(reservation: Reservation) -> StudentReservationReviewSummary | None:
    if reservation.review is None:
        return None
    return StudentReservationReviewSummary(
        id=reservation.review.id,
        is_deleted=reservation.review.is_deleted,
        deleted_by=reservation.review.deleted_by,
        deleted_at=_optional_utc(reservation.review.deleted_at),
        admin_removal_reason=reservation.review.admin_removal_reason,
    )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _optional_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    return _as_utc(value)
