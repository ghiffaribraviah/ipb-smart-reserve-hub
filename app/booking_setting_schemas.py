from pydantic import BaseModel


class BookingSettingsUpdateRequest(BaseModel):
    min_booking_lead_hours: int
    max_booking_advance_hours: int
    document_upload_due_hours: int
    document_verification_due_hours: int
    payment_upload_due_hours: int
    payment_verification_due_hours: int
    final_approval_cutoff_hours: int
    overdue_final_approval_cutoff_hours: int
    allowed_student_email_domains: list[str]


class BookingSettingsResponse(BaseModel):
    min_booking_lead_hours: int
    max_booking_advance_hours: int
    document_upload_due_hours: int
    document_verification_due_hours: int
    payment_upload_due_hours: int
    payment_verification_due_hours: int
    final_approval_cutoff_hours: int
    overdue_final_approval_cutoff_hours: int
    allowed_student_email_domains: list[str]
