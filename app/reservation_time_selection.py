from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import enum
from typing import Callable

from app.booking_settings import BookingSettings
from app.facility_availability import BUSINESS_TIMEZONE, FacilityAvailabilityModule, FacilityNotFound


@dataclass(frozen=True)
class ReservationTimeSelectionError:
    reason: str
    message: str


@dataclass(frozen=True)
class ReservationTimeSelection:
    available: bool
    errors: list[ReservationTimeSelectionError]


class ReservationTimeSelectionReason(str, enum.Enum):
    invalid_time_increment = "invalid_time_increment"
    minimum_duration = "minimum_duration"
    crosses_midnight = "crosses_midnight"
    below_minimum_lead_time = "below_minimum_lead_time"
    beyond_maximum_advance_window = "beyond_maximum_advance_window"
    outside_open_hours = "outside_open_hours"
    blackout_period = "blackout_period"
    reserved_time = "reserved_time"


class ReservationTimeSelectionPolicy:
    def __init__(self, *, booking_settings: BookingSettings, clock: Callable[[], datetime]) -> None:
        self._booking_settings = booking_settings
        self._clock = clock

    def validate_local_rules(self, *, starts_at: datetime, ends_at: datetime) -> list[ReservationTimeSelectionError]:
        starts_at_utc = _as_utc(starts_at)
        ends_at_utc = _as_utc(ends_at)
        now_utc = _as_utc(self._clock())
        errors: list[ReservationTimeSelectionError] = []

        if not (_is_five_minute_increment(starts_at) and _is_five_minute_increment(ends_at)):
            errors.append(_error_for_reason(ReservationTimeSelectionReason.invalid_time_increment))
        if ends_at_utc - starts_at_utc < timedelta(hours=1):
            errors.append(_error_for_reason(ReservationTimeSelectionReason.minimum_duration))
        if _local_date(starts_at_utc) != _local_date(ends_at_utc):
            errors.append(_error_for_reason(ReservationTimeSelectionReason.crosses_midnight))
        if starts_at_utc - now_utc < timedelta(hours=self._booking_settings.min_booking_lead_hours):
            errors.append(_minimum_lead_time_error(self._booking_settings.min_booking_lead_hours))
        if starts_at_utc - now_utc > timedelta(hours=self._booking_settings.max_booking_advance_hours):
            errors.append(_maximum_advance_window_error(self._booking_settings.max_booking_advance_hours))

        return errors


class ReservationTimeSelectionModule:
    def __init__(
        self,
        *,
        facility_availability: FacilityAvailabilityModule,
        booking_settings: BookingSettings,
        clock: Callable[[], datetime],
    ) -> None:
        self._facility_availability = facility_availability
        self._policy = ReservationTimeSelectionPolicy(booking_settings=booking_settings, clock=clock)

    def validate_time_selection(
        self,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> ReservationTimeSelection:
        starts_at_utc = _as_utc(starts_at)
        ends_at_utc = _as_utc(ends_at)
        errors = self._policy.validate_local_rules(starts_at=starts_at, ends_at=ends_at)

        if errors:
            self._facility_availability.check_availability(
                facility_id,
                starts_at=starts_at_utc,
                ends_at=ends_at_utc,
            )
            return ReservationTimeSelection(available=False, errors=errors)

        availability = self._facility_availability.check_availability(
            facility_id,
            starts_at=starts_at_utc,
            ends_at=ends_at_utc,
        )
        errors.extend(_error_for_reason(reason) for reason in availability.reasons)
        return ReservationTimeSelection(
            available=not errors,
            errors=errors,
        )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _is_five_minute_increment(value: datetime) -> bool:
    return value.minute % 5 == 0 and value.second == 0 and value.microsecond == 0


def _local_date(value: datetime):
    return _as_utc(value).astimezone(BUSINESS_TIMEZONE).date()


def _error_for_reason(reason: str | ReservationTimeSelectionReason) -> ReservationTimeSelectionError:
    normalized_reason = reason.value if isinstance(reason, enum.Enum) else reason
    return ReservationTimeSelectionError(reason=normalized_reason, message=_message_for_reason(reason))


def _minimum_lead_time_error(hours: int) -> ReservationTimeSelectionError:
    return ReservationTimeSelectionError(
        reason=ReservationTimeSelectionReason.below_minimum_lead_time.value,
        message=f"Reservasi harus diajukan minimal {_format_hours_as_days(hours)} sebelum waktu mulai.",
    )


def _maximum_advance_window_error(hours: int) -> ReservationTimeSelectionError:
    return ReservationTimeSelectionError(
        reason=ReservationTimeSelectionReason.beyond_maximum_advance_window.value,
        message=f"Reservasi hanya dapat diajukan maksimal {_format_hours_as_days(hours)} sebelum waktu mulai.",
    )


def _format_hours_as_days(hours: int) -> str:
    if hours % 24 == 0:
        return f"{hours // 24} hari"
    return f"{hours} jam"


def _message_for_reason(reason: str | ReservationTimeSelectionReason) -> str:
    normalized_reason = reason.value if isinstance(reason, enum.Enum) else reason
    return {
        ReservationTimeSelectionReason.invalid_time_increment.value: (
            "Waktu reservasi harus mengikuti kelipatan 5 menit."
        ),
        ReservationTimeSelectionReason.minimum_duration.value: "Durasi reservasi minimal 1 jam.",
        ReservationTimeSelectionReason.crosses_midnight.value: "Waktu reservasi harus berada pada hari yang sama.",
        ReservationTimeSelectionReason.outside_open_hours.value: (
            "Waktu reservasi berada di luar jam operasional fasilitas."
        ),
        ReservationTimeSelectionReason.blackout_period.value: (
            "Waktu reservasi berada pada periode fasilitas tidak tersedia."
        ),
        ReservationTimeSelectionReason.reserved_time.value: "Waktu reservasi sudah dipesan.",
    }.get(normalized_reason, "Waktu reservasi tidak valid.")
