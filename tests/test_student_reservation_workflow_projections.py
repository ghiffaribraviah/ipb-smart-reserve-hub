from datetime import UTC, datetime

from app.models import (
    Facility,
    OrganizationUnit,
    Reservation,
    ReservationPaymentReceipt,
    ReservationRejectionSource,
    ReservationStatus,
)
from app.services.student_reservation_workflow_projections import StudentReservationWorkflowProjectionModule


def test_student_reservation_workflow_projection_exposes_payment_rejection_state():
    reservation = Reservation(
        id="reservation-1",
        facility_id="facility-1",
        student_id="student-1",
        organization_unit_id="organization-unit-1",
        reservation_code="RSV-REJECT",
        activity_title="Seminar Karier",
        event_description="Seminar persiapan karier.",
        participant_count=80,
        contact_phone="08123456789",
        price_rupiah=250000,
        organization_unit_name="BEM KM IPB",
        starts_at=datetime(2026, 6, 1, 2, tzinfo=UTC),
        ends_at=datetime(2026, 6, 1, 4, tzinfo=UTC),
        status=ReservationStatus.rejected,
        rejection_source=ReservationRejectionSource.payment,
        rejection_reason="Nominal transfer tidak sesuai.",
    )
    reservation.facility = Facility(id="facility-1", name="Auditorium Andi Hakim Nasoetion")
    reservation.organization_unit = OrganizationUnit(id="organization-unit-1", name="BEM KM IPB")
    reservation.payment_receipt = ReservationPaymentReceipt(
        reservation_id="reservation-1",
        storage_key="payment-receipts/reservation-1/receipt.png",
        filename="receipt.png",
        content_type="image/png",
        size_bytes=128,
        uploaded_at=datetime(2026, 5, 2, 3, tzinfo=UTC),
    )

    projection = StudentReservationWorkflowProjectionModule().project(
        reservation,
        effective_status=ReservationStatus.rejected,
    )

    assert projection.id == "reservation-1"
    assert projection.facility.name == "Auditorium Andi Hakim Nasoetion"
    assert projection.payment.review_status == "rejected"
    assert projection.payment.rejection_reason == "Nominal transfer tidak sesuai."
    assert projection.payment.receipt is not None
    assert projection.payment.receipt.filename == "receipt.png"
    assert projection.rejection is not None
    assert projection.rejection.source == "payment"
    assert projection.rejection.reason == "Nominal transfer tidak sesuai."
