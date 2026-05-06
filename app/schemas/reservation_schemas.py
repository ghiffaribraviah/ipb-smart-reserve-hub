from datetime import datetime

from pydantic import BaseModel


class ReservationSubmissionRequest(BaseModel):
    activity_title: str
    event_description: str
    participant_count: int
    organization_unit_id: str
    contact_phone: str
    starts_at: datetime
    ends_at: datetime


class ReservationFacilityResponse(BaseModel):
    id: str
    name: str


class ReservationOrganizationUnitResponse(BaseModel):
    id: str
    name: str


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


class StudentApprovalLetterResponse(BaseModel):
    reservation_id: str
    reservation_code: str
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


class StudentSignedApprovalLetterResponse(BaseModel):
    reservation_id: str
    filename: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime


class StaffDocumentReviewResponse(BaseModel):
    reservation_id: str
    status: str
    rejection_reason: str | None = None


class StaffDocumentRejectionRequest(BaseModel):
    reason: str
