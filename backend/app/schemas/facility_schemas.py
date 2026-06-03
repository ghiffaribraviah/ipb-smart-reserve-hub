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


class FacilityCatalogPageResponse(BaseModel):
    items: list[FacilityCatalogItemResponse]
    page: int
    page_size: int
    total_items: int
    total_pages: int


class FacilityCategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    icon_hint: str | None
    facility_count: int


class FacilityContactResponse(BaseModel):
    name: str
    phone: str
    email: str | None


class FacilityImageResponse(BaseModel):
    url: str
    alt_text: str
    is_cover: bool


class FacilityOpenHourResponse(BaseModel):
    day_of_week: int
    opens_at: str
    closes_at: str


class FacilityPriceResponse(BaseModel):
    is_free: bool
    amount_rupiah: int
    summary: str


class FacilityReviewSummaryResponse(BaseModel):
    rating_average: float | None
    review_count: int


class FacilityPublicReviewResponse(BaseModel):
    id: str
    rating: int
    comment: str | None
    author_name: str
    created_at: datetime


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
    open_hours: list[FacilityOpenHourResponse] = []
    review_summary: FacilityReviewSummaryResponse
    reviews: list[FacilityPublicReviewResponse]


class FacilityCalendarEntryResponse(BaseModel):
    starts_at: datetime
    ends_at: datetime
    status: str


class FacilityAvailabilityResponse(BaseModel):
    available: bool
    reasons: list[str]
