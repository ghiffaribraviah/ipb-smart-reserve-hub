from datetime import datetime

from pydantic import BaseModel, Field


class StaffAssignmentResponse(BaseModel):
    facility_id: str
    staff_id: str


class FacilityManagementProfileResponse(BaseModel):
    id: str
    name: str
    location: str
    capacity: int
    category_id: str
    category: str
    description: str
    contact_name: str
    contact_phone: str
    contact_email: str | None
    price_rupiah: int
    price_summary: str
    payment_instructions: str | None
    open_hours_summary: str
    open_hours: list["FacilityOpenHourResponse"] = []
    is_active: bool


class FacilityGovernanceResponse(BaseModel):
    id: str
    name: str
    category: str
    location: str
    capacity: int
    is_active: bool
    assigned_staff_count: int
    active_assigned_staff_count: int
    assignment_coverage: str
    issue_flags: list[str]


class FacilityProfileUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    location: str | None = Field(default=None, min_length=1)
    capacity: int | None = Field(default=None, ge=1)
    category_id: str | None = Field(default=None, min_length=1)
    description: str | None = Field(default=None, min_length=1)
    contact_name: str | None = Field(default=None, min_length=1)
    contact_phone: str | None = Field(default=None, min_length=1)
    contact_email: str | None = None
    price_rupiah: int | None = Field(default=None, ge=0)
    payment_instructions: str | None = None
    open_hours_summary: str | None = Field(default=None, min_length=1)
    open_hours: list["FacilityOpenHourCreateRequest"] | None = None
    is_active: bool | None = None


class FacilityImageCreateRequest(BaseModel):
    url: str = Field(min_length=1)
    alt_text: str = Field(min_length=1)
    display_order: int = 0
    is_cover: bool = False


class FacilityImageManagementResponse(BaseModel):
    id: str
    url: str
    alt_text: str
    display_order: int
    is_cover: bool
    is_active: bool


class FacilityOpenHourCreateRequest(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    opens_at: str = Field(min_length=1)
    closes_at: str = Field(min_length=1)


class FacilityOpenHourResponse(BaseModel):
    id: str
    day_of_week: int
    opens_at: str
    closes_at: str


class FacilityBlackoutCreateRequest(BaseModel):
    starts_at: datetime
    ends_at: datetime
    reason: str = Field(min_length=1)


class FacilityBlackoutResponse(BaseModel):
    id: str
    starts_at: datetime
    ends_at: datetime
    reason: str
