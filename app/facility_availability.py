from dataclasses import dataclass
from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from app.facility_availability_reader import FacilityAvailabilityReader
from app.models import ReservationStatus


class FacilityNotFound(Exception):
    pass


@dataclass(frozen=True)
class FacilityAvailability:
    available: bool
    reasons: list[str]


BUSINESS_TIMEZONE = ZoneInfo("Asia/Jakarta")
BLOCKING_RESERVATION_STATUSES = (
    ReservationStatus.pending_document_upload,
    ReservationStatus.pending_document_review,
    ReservationStatus.pending_payment,
    ReservationStatus.approved,
)


class FacilityAvailabilityModule:
    def __init__(self, *, facility_availability_reader: FacilityAvailabilityReader) -> None:
        self._facility_availability_reader = facility_availability_reader

    def check_availability(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> FacilityAvailability:
        if not self._facility_availability_reader.active_facility_exists(facility_id):
            raise FacilityNotFound

        reasons: list[str] = []
        if not self._is_within_open_hours(facility_id, starts_at=starts_at, ends_at=ends_at):
            reasons.append("outside_open_hours")
        if self._facility_availability_reader.has_overlapping_blackout(
            facility_id,
            starts_at=starts_at,
            ends_at=ends_at,
        ):
            reasons.append("blackout_period")
        if self._facility_availability_reader.has_overlapping_reservation(
            facility_id,
            starts_at=starts_at,
            ends_at=ends_at,
            statuses=BLOCKING_RESERVATION_STATUSES,
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
            for open_hour in self._facility_availability_reader.list_facility_open_hours(facility_id)
        )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
