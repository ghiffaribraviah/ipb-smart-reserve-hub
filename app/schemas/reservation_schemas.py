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
