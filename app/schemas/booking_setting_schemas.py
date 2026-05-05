from dataclasses import asdict

from pydantic import BaseModel

from app.services.booking_settings import BookingSettings


class BookingSettingsSchema(BaseModel):
    min_booking_lead_hours: int
    max_booking_advance_hours: int
    document_upload_due_hours: int
    document_verification_due_hours: int
    payment_upload_due_hours: int
    payment_verification_due_hours: int
    final_approval_cutoff_hours: int
    overdue_final_approval_cutoff_hours: int
    allowed_student_email_domains: list[str]

    def to_booking_settings(self) -> BookingSettings:
        return BookingSettings(
            **{
                **self.model_dump(exclude={"allowed_student_email_domains"}),
                "allowed_student_email_domains": tuple(self.allowed_student_email_domains),
            }
        )

    @classmethod
    def from_booking_settings(cls, booking_settings: BookingSettings):
        return cls(
            **{
                **asdict(booking_settings),
                "allowed_student_email_domains": list(booking_settings.allowed_student_email_domains),
            }
        )


class BookingSettingsUpdateRequest(BookingSettingsSchema):
    pass


class BookingSettingsResponse(BookingSettingsSchema):
    pass
