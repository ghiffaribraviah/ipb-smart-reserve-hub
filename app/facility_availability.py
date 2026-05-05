from dataclasses import dataclass
from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from app.facility_repository import FacilityRepository


class FacilityNotFound(Exception):
    pass


@dataclass(frozen=True)
class FacilityAvailability:
    available: bool
    reasons: list[str]


BUSINESS_TIMEZONE = ZoneInfo("Asia/Jakarta")


class FacilityAvailabilityModule:
    def __init__(self, *, facility_repository: FacilityRepository) -> None:
        self._facility_repository = facility_repository

    def check_availability(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> FacilityAvailability:
        facility = self._facility_repository.get_active_facility_by_id(facility_id)
        if facility is None:
            raise FacilityNotFound

        reasons: list[str] = []
        if not self._is_within_open_hours(facility_id, starts_at=starts_at, ends_at=ends_at):
            reasons.append("outside_open_hours")
        if self._facility_repository.list_overlapping_blackouts(facility_id, starts_at=starts_at, ends_at=ends_at):
            reasons.append("blackout_period")
        if self._facility_repository.list_public_calendar_reservations(
            facility_id,
            starts_at=starts_at,
            ends_at=ends_at,
        ):
            reasons.append("reserved_time")

        return FacilityAvailability(available=not reasons, reasons=reasons)

    def _is_within_open_hours(self, facility_id: str, *, starts_at: datetime, ends_at: datetime) -> bool:
        local_start = _as_utc(starts_at).astimezone(BUSINESS_TIMEZONE)
        local_end = _as_utc(ends_at).astimezone(BUSINESS_TIMEZONE)
        if local_start.date() != local_end.date():
            return False

        return any(
            open_hour.day_of_week == local_start.weekday()
            and open_hour.opens_at <= local_start.time()
            and local_end.time() <= open_hour.closes_at
            for open_hour in self._facility_repository.list_facility_open_hours(facility_id)
        )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
