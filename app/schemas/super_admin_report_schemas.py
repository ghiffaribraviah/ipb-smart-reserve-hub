from pydantic import BaseModel


class SuperAdminReportKpisResponse(BaseModel):
    total_reservations: int
    approved_reservations: int
    completed_reservations: int
    rejected_reservations: int
    paid_reservation_total_rupiah: int


class SuperAdminReportTrendPointResponse(BaseModel):
    date: str
    reservation_count: int
    paid_total_rupiah: int


class SuperAdminReportAggregateResponse(BaseModel):
    kpis: SuperAdminReportKpisResponse
    status_counts: dict[str, int]
    trend: list[SuperAdminReportTrendPointResponse]
