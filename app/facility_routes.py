from collections.abc import Callable

from fastapi import Depends, FastAPI, HTTPException, status

from app.facilities import FacilityCatalogModule, FacilityNotFound
from app.facility_schemas import FacilityCatalogItemResponse, FacilityDetailResponse


def register_facility_routes(app: FastAPI, *, get_facility_catalog: Callable) -> None:
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
