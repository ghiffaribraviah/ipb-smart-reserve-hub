from datetime import UTC, datetime

import pytest

from app.models import Reservation, ReservationStatus
from app.services.staff_reservation_review_access import (
    StaffReservationReviewAccessDenied,
    StaffReservationReviewAccessModule,
    StaffReservationReviewReservationNotFound,
)


class StubStaffReviewReservationRepository:
    def __init__(
        self,
        *,
        assigned_reservation: Reservation | None = None,
        existing_reservation: Reservation | None = None,
    ) -> None:
        self.assigned_reservation = assigned_reservation
        self.existing_reservation = existing_reservation

    def get_for_assigned_staff_review(self, reservation_id: str, staff_id: str) -> Reservation | None:
        return self.assigned_reservation

    def get_by_id_for_review(self, reservation_id: str) -> Reservation | None:
        return self.existing_reservation


def test_staff_reservation_review_access_returns_assigned_reservation():
    reservation = _reservation()
    access = StaffReservationReviewAccessModule(
        reservation_repository=StubStaffReviewReservationRepository(assigned_reservation=reservation)
    )

    assert access.require_assigned_reservation("reservation-1", staff_id="staff-1") is reservation


def test_staff_reservation_review_access_denies_existing_unassigned_reservation():
    access = StaffReservationReviewAccessModule(
        reservation_repository=StubStaffReviewReservationRepository(existing_reservation=_reservation())
    )

    with pytest.raises(StaffReservationReviewAccessDenied):
        access.require_assigned_reservation("reservation-1", staff_id="staff-1")


def test_staff_reservation_review_access_reports_missing_reservation():
    access = StaffReservationReviewAccessModule(
        reservation_repository=StubStaffReviewReservationRepository()
    )

    with pytest.raises(StaffReservationReviewReservationNotFound):
        access.require_assigned_reservation("reservation-1", staff_id="staff-1")


def _reservation() -> Reservation:
    return Reservation(
        id="reservation-1",
        facility_id="facility-1",
        student_id="student-1",
        organization_unit_id="organization-unit-1",
        reservation_code="RSV-REVIEW",
        activity_title="Seminar Karier",
        event_description="Seminar persiapan karier.",
        participant_count=80,
        contact_phone="08123456789",
        price_rupiah=0,
        organization_unit_name="BEM KM IPB",
        starts_at=datetime(2026, 6, 1, 2, tzinfo=UTC),
        ends_at=datetime(2026, 6, 1, 4, tzinfo=UTC),
        status=ReservationStatus.pending_document_review,
    )
