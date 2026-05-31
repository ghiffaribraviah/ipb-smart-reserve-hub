from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints, field_validator


ReservationTitle = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
ReservationText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
ReservationContactPhone = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=32)]


class ReservationExtraRequirementsRequest(BaseModel):
    av_support: bool = False
    logistics_coordination: bool = False
    extra_cleaning: bool = False
    security_personnel: bool = False
    notes: str | None = None

    @field_validator("notes")
    @classmethod
    def normalize_notes(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if not normalized:
            return None
        if len(normalized) > 180:
            raise ValueError("String should have at most 180 characters")
        return normalized


class ReservationSubmissionRequest(BaseModel):
    activity_title: ReservationTitle
    event_description: ReservationText
    participant_count: int = Field(gt=0)
    organization_unit_id: str
    contact_phone: ReservationContactPhone
    starts_at: datetime
    ends_at: datetime
    extra_requirements: ReservationExtraRequirementsRequest = ReservationExtraRequirementsRequest()


class ReservationFacilityResponse(BaseModel):
    id: str
    name: str
    cover_image_url: str | None = None


class ReservationOrganizationUnitResponse(BaseModel):
    id: str
    name: str


class StudentReservationReviewResponse(BaseModel):
    id: str
    is_deleted: bool
    deleted_by: str | None
    deleted_at: datetime | None
    admin_removal_reason: str | None


class ReservationExtraRequirementsResponse(BaseModel):
    av_support: bool
    logistics_coordination: bool
    extra_cleaning: bool
    security_personnel: bool
    notes: str | None


class ReservationDocumentMetadataResponse(BaseModel):
    filename: str
    content_type: str
    size_bytes: int
    generated_at: datetime | None = None
    uploaded_at: datetime | None = None


class ApprovalLetterDocumentMetadataResponse(ReservationDocumentMetadataResponse):
    letter_number: str


class StudentReservationDocumentProjectionResponse(BaseModel):
    approval_letter: ApprovalLetterDocumentMetadataResponse | None
    signed_approval_letter: ReservationDocumentMetadataResponse | None
    review_status: str
    rejection_reason: str | None = None


class StudentReservationPaymentProjectionResponse(BaseModel):
    required: bool
    receipt: ReservationDocumentMetadataResponse | None
    review_status: str
    rejection_reason: str | None = None


class StudentReservationRejectionProjectionResponse(BaseModel):
    source: str
    reason: str | None


class StudentReservationResponse(BaseModel):
    id: str
    reservation_code: str
    status: str
    facility: ReservationFacilityResponse
    organization_unit: ReservationOrganizationUnitResponse
    activity_title: str
    event_description: str
    participant_count: int
    contact_phone: str
    starts_at: datetime
    ends_at: datetime
    price_rupiah: int
    extra_requirements: ReservationExtraRequirementsResponse
    document: StudentReservationDocumentProjectionResponse
    payment: StudentReservationPaymentProjectionResponse
    rejection: StudentReservationRejectionProjectionResponse | None = None
    document_upload_due_at: datetime | None = None
    document_verification_due_at: datetime | None = None
    payment_upload_due_at: datetime | None = None
    payment_verification_due_at: datetime | None = None
    cancellation_reason: str | None = None
    cancellation_rejection_reason: str | None = None
    review: StudentReservationReviewResponse | None = None


class StudentCancellationRequestBody(BaseModel):
    reason: str


class StudentCancellationRequestResponse(StudentReservationResponse):
    refund_warning: str | None = None


class StudentApprovalLetterResponse(BaseModel):
    reservation_id: str
    reservation_code: str
    letter_number: str
    filename: str
    content_type: str
    size_bytes: int
    generated_at: datetime


class StudentReservationPaymentResponse(BaseModel):
    reservation_id: str
    reservation_code: str
    amount_rupiah: int
    payment_instructions: str


class StudentPaymentReceiptResponse(BaseModel):
    reservation_id: str
    filename: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime


class StudentPaymentReceiptSubmissionResponse(BaseModel):
    reservation_id: str
    status: str
    payment_verification_due_at: datetime


class StudentSignedApprovalLetterResponse(BaseModel):
    reservation_id: str
    filename: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime


class StudentSignedApprovalLetterSubmissionResponse(BaseModel):
    reservation_id: str
    status: str
    document_verification_due_at: datetime


class StaffDocumentReviewResponse(BaseModel):
    reservation_id: str
    status: str
    rejection_reason: str | None = None


class StaffDocumentRejectionRequest(BaseModel):
    reason: str


class StaffReservationFacilityResponse(BaseModel):
    id: str
    name: str


class StaffReservationDetailFacilityResponse(StaffReservationFacilityResponse):
    cover_image_url: str | None = None


class StaffReservationStudentResponse(BaseModel):
    id: str
    full_name: str
    email: str


class StaffReservationOrganizationUnitResponse(BaseModel):
    id: str
    name: str


class StaffReservationDocumentProjectionResponse(BaseModel):
    review_status: str
    due_at: datetime | None = None


class StaffReservationPaymentProjectionResponse(BaseModel):
    required: bool
    review_status: str
    due_at: datetime | None = None


class StaffReservationCancellationProjectionResponse(BaseModel):
    requested: bool
    review_status: str


class StaffReservationOperationItemResponse(BaseModel):
    id: str
    reservation_code: str
    facility: StaffReservationFacilityResponse
    student: StaffReservationStudentResponse
    organization_unit: StaffReservationOrganizationUnitResponse
    activity_title: str
    starts_at: datetime
    ends_at: datetime
    status: str
    workflow_type: str
    review_status: str
    due_at: datetime | None = None
    document: StaffReservationDocumentProjectionResponse
    payment: StaffReservationPaymentProjectionResponse
    cancellation: StaffReservationCancellationProjectionResponse


class StaffReservationFileMetadataResponse(BaseModel):
    filename: str
    content_type: str
    size_bytes: int
    generated_at: datetime | None = None
    uploaded_at: datetime | None = None


class StaffApprovalLetterFileMetadataResponse(StaffReservationFileMetadataResponse):
    letter_number: str


class StaffReservationDetailDocumentResponse(BaseModel):
    approval_letter: StaffApprovalLetterFileMetadataResponse | None
    signed_approval_letter: StaffReservationFileMetadataResponse | None
    review_status: str
    rejection_reason: str | None = None
    due_at: datetime | None = None


class StaffReservationDetailPaymentResponse(BaseModel):
    required: bool
    receipt: StaffReservationFileMetadataResponse | None
    review_status: str
    rejection_reason: str | None = None
    due_at: datetime | None = None


class StaffReservationDetailCancellationResponse(BaseModel):
    requested: bool
    review_status: str
    reason: str | None = None
    rejection_reason: str | None = None


class StaffReservationReviewActionUrlsResponse(BaseModel):
    approve_url: str
    reject_url: str
    download_url: str | None = None


class StaffReservationReviewActionsResponse(BaseModel):
    document: StaffReservationReviewActionUrlsResponse
    payment: StaffReservationReviewActionUrlsResponse
    cancellation: StaffReservationReviewActionUrlsResponse


class StaffReservationDetailResponse(BaseModel):
    id: str
    reservation_code: str
    facility: StaffReservationDetailFacilityResponse
    student: StaffReservationStudentResponse
    organization_unit: StaffReservationOrganizationUnitResponse
    activity_title: str
    event_description: str
    participant_count: int
    contact_phone: str
    starts_at: datetime
    ends_at: datetime
    status: str
    price_rupiah: int
    extra_requirements: ReservationExtraRequirementsResponse
    document: StaffReservationDetailDocumentResponse
    payment: StaffReservationDetailPaymentResponse
    cancellation: StaffReservationDetailCancellationResponse
    review_actions: StaffReservationReviewActionsResponse


class StaffFacilityScheduleEntryResponse(BaseModel):
    reservation_id: str
    reservation_code: str
    activity_title: str
    organization_unit: StaffReservationOrganizationUnitResponse
    starts_at: datetime
    ends_at: datetime
    status: str
    workflow_type: str
    review_status: str
    detail_url: str
