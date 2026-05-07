from app.models import ReservationStatus
from app.services.public_facility_calendar import PublicFacilityCalendarModule


def test_public_facility_calendar_exposes_holding_and_approved_reservation_statuses():
    calendar = PublicFacilityCalendarModule()

    assert calendar.public_reservation_statuses() == (
        ReservationStatus.pending_document_upload,
        ReservationStatus.pending_document_review,
        ReservationStatus.pending_payment,
        ReservationStatus.overdue_verification,
        ReservationStatus.approved,
        ReservationStatus.cancellation_requested,
    )


def test_public_facility_calendar_hides_terminal_reservation_statuses():
    calendar = PublicFacilityCalendarModule()

    public_statuses = calendar.public_reservation_statuses()

    assert ReservationStatus.completed not in public_statuses
    assert ReservationStatus.cancelled not in public_statuses
    assert ReservationStatus.rejected not in public_statuses
    assert ReservationStatus.expired not in public_statuses
