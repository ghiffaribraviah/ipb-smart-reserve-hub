import pytest

from app.models import Facility, FacilityCategory
from app.services.assigned_facility_access import (
    AssignedFacilityAccessDenied,
    AssignedFacilityAccessModule,
    AssignedFacilityNotFound,
)


class StubAssignedFacilityRepository:
    def __init__(self, *, facility: Facility | None = None, assigned: bool = False) -> None:
        self.facility = facility
        self.assigned = assigned

    def get_facility(self, facility_id: str) -> Facility | None:
        return self.facility

    def staff_is_assigned(self, facility_id: str, staff_id: str) -> bool:
        return self.assigned


def test_assigned_facility_access_returns_facility_for_assigned_staff():
    facility = _facility()
    access = AssignedFacilityAccessModule(
        facility_repository=StubAssignedFacilityRepository(facility=facility, assigned=True)
    )

    assert access.require_assigned_facility("facility-1", staff_id="staff-1") is facility


def test_assigned_facility_access_denies_unassigned_staff():
    access = AssignedFacilityAccessModule(
        facility_repository=StubAssignedFacilityRepository(facility=_facility(), assigned=False)
    )

    with pytest.raises(AssignedFacilityAccessDenied):
        access.require_assigned_facility("facility-1", staff_id="staff-1")


def test_assigned_facility_access_reports_missing_facility():
    access = AssignedFacilityAccessModule(facility_repository=StubAssignedFacilityRepository())

    with pytest.raises(AssignedFacilityNotFound):
        access.require_assigned_facility("facility-1", staff_id="staff-1")


def _facility() -> Facility:
    return Facility(
        id="facility-1",
        category=FacilityCategory(name="Auditorium"),
        name="Auditorium Andi Hakim Nasoetion",
        location="Kampus IPB Dramaga",
        capacity=120,
        description="Ruang kegiatan mahasiswa",
        contact_name="TU Fasilitas",
        contact_phone="0251-8620000",
        price_rupiah=0,
        open_hours_summary="Senin-Jumat 08.00-16.00",
        is_active=True,
    )
