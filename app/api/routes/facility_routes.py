from collections.abc import Callable
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException, status

from app.services.facility_availability import FacilityAvailabilityModule
from app.services.facility_availability import FacilityNotFound as FacilityAvailabilityNotFound
from app.services.facilities import FacilityCatalogModule, FacilityNotFound
from app.schemas.facility_schemas import (
    FacilityAvailabilityResponse,
    FacilityCalendarEntryResponse,
    FacilityCatalogItemResponse,
    FacilityDetailResponse,
)
from app.services.reservation_time_selection import FacilityNotFound as ReservationTimeSelectionFacilityNotFound
from app.services.reservation_time_selection import ReservationTimeSelectionModule
from app.schemas.reservation_time_selection_schemas import (
    ReservationTimeSelectionRequest,
    ReservationTimeSelectionResponse,
)


def register_facility_routes(
    app: FastAPI,
    *,
    get_facility_catalog: Callable,
    get_facility_availability: Callable,
    get_reservation_time_selection: Callable,
) -> None:
    @app.get("/facilities", response_model=list[FacilityCatalogItemResponse])
    async def list_facilities(
        facility_catalog: FacilityCatalogModule = Depends(get_facility_catalog),
    ) -> list:
        return facility_catalog.list_active_facilities()

    @app.get("/facilities/{facility_id}", response_model=FacilityDetailResponse)
    async def get_facility_detail(
        facility_id: str,
        facility_catalog: FacilityCatalogModule = Depends(get_facility_catalog),
    ):
        try:
            return facility_catalog.get_public_detail(facility_id)
        except FacilityNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fasilitas tidak ditemukan.")

    @app.get("/facilities/{facility_id}/calendar", response_model=list[FacilityCalendarEntryResponse])
    async def get_facility_calendar(
        facility_id: str,
        start: datetime,
        end: datetime,
        facility_catalog: FacilityCatalogModule = Depends(get_facility_catalog),
    ) -> list:
        try:
            return facility_catalog.list_public_calendar_entries(facility_id, starts_at=start, ends_at=end)
        except FacilityNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fasilitas tidak ditemukan.")

    @app.get("/facilities/{facility_id}/availability", response_model=FacilityAvailabilityResponse)
    async def get_facility_availability(
        facility_id: str,
        start: datetime,
        end: datetime,
        facility_availability: FacilityAvailabilityModule = Depends(get_facility_availability),
    ):
        try:
            return facility_availability.check_availability(facility_id, starts_at=start, ends_at=end)
        except FacilityAvailabilityNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fasilitas tidak ditemukan.")

    @app.post(
        "/facilities/{facility_id}/reservation-time-selection",
        response_model=ReservationTimeSelectionResponse,
    )
    async def validate_reservation_time_selection(
        facility_id: str,
        payload: ReservationTimeSelectionRequest,
        reservation_time_selection: ReservationTimeSelectionModule = Depends(get_reservation_time_selection),
    ):
        try:
            return ReservationTimeSelectionResponse.from_time_selection(
                reservation_time_selection.validate_time_selection(
                    facility_id,
                    starts_at=payload.starts_at,
                    ends_at=payload.ends_at,
                )
            )
        except ReservationTimeSelectionFacilityNotFound:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fasilitas tidak ditemukan.")
