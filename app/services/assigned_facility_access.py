from typing import Protocol

from app.models import Facility


class AssignedFacilityAccessError(Exception):
    pass


class AssignedFacilityNotFound(AssignedFacilityAccessError):
    pass


class AssignedFacilityAccessDenied(AssignedFacilityAccessError):
    pass


class AssignedFacilityRepository(Protocol):
    def get_facility(self, facility_id: str) -> Facility | None:
        raise NotImplementedError

    def staff_is_assigned(self, facility_id: str, staff_id: str) -> bool:
        raise NotImplementedError


class AssignedFacilityAccessModule:
    def __init__(self, *, facility_repository: AssignedFacilityRepository) -> None:
        self._facility_repository = facility_repository

    def require_assigned_facility(self, facility_id: str, *, staff_id: str) -> Facility:
        facility = self._facility_repository.get_facility(facility_id)
        if facility is None:
            raise AssignedFacilityNotFound
        if not self._facility_repository.staff_is_assigned(facility_id, staff_id):
            raise AssignedFacilityAccessDenied
        return facility
