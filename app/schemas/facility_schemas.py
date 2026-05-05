from datetime import datetime

from pydantic import BaseModel


class FacilityCatalogItemResponse(BaseModel):
    id: str
    name: str
    location: str
    capacity: int
    category: str
    cover_image_url: str | None
    rating_average: float | None
    review_count: int
    price_summary: str
    open_hours_summary: str


class FacilityContactResponse(BaseModel):
    name: str
    phone: str
    email: str | None


class FacilityImageResponse(BaseModel):
    url: str
    alt_text: str
    is_cover: bool


class FacilityPriceResponse(BaseModel):
    is_free: bool
    amount_rupiah: int
    summary: str


class FacilityReviewSummaryResponse(BaseModel):
    rating_average: float | None
    review_count: int


class FacilityDetailResponse(BaseModel):
    id: str
    name: str
    location: str
    capacity: int
    category: str
    description: str
    contact: FacilityContactResponse
    images: list[FacilityImageResponse]
    price: FacilityPriceResponse
    open_hours_summary: str
    review_summary: FacilityReviewSummaryResponse


class FacilityCalendarEntryResponse(BaseModel):
    facility_name: str
    activity_title: str
    organization_unit: str
    starts_at: datetime
    ends_at: datetime


class FacilityAvailabilityResponse(BaseModel):
    available: bool
    reasons: list[str]
