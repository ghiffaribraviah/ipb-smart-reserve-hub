from datetime import datetime

from pydantic import BaseModel

from app.services.reservation_time_selection import ReservationTimeSelection, ReservationTimeSelectionError


class ReservationTimeSelectionRequest(BaseModel):
    starts_at: datetime
    ends_at: datetime


class ReservationTimeSelectionErrorResponse(BaseModel):
    reason: str
    message: str

    @classmethod
    def from_error(cls, error: ReservationTimeSelectionError):
        return cls(reason=error.reason, message=error.message)


class ReservationTimeSelectionResponse(BaseModel):
    available: bool
    errors: list[ReservationTimeSelectionErrorResponse]

    @classmethod
    def from_time_selection(cls, time_selection: ReservationTimeSelection):
        return cls(
            available=time_selection.available,
            errors=[ReservationTimeSelectionErrorResponse.from_error(error) for error in time_selection.errors],
        )
