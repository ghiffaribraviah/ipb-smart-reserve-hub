from datetime import UTC, datetime

from app.models import Reservation, ReservationRejectionSource, ReservationStatus
from app.services.booking_settings import BookingSettings
from app.services.reservation_lifecycle import DeadlineTransition, FacilityReservationLifecycleModule


def test_document_approval_moves_free_reservation_to_approved_without_payment_deadline():
    lifecycle = FacilityReservationLifecycleModule(
        booking_settings=BookingSettings.defaults(),
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    reservation = Reservation(
        facility_id="facility-1",
        student_id="student-1",
        organization_unit_id="organization-unit-1",
        reservation_code="RSV-FREE",
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

    lifecycle.approve_document(reservation)

    assert reservation.status == ReservationStatus.approved
    assert reservation.payment_upload_due_at is None


def test_document_approval_moves_paid_reservation_to_payment_with_upload_deadline():
    lifecycle = FacilityReservationLifecycleModule(
        booking_settings=BookingSettings.defaults(),
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    reservation = Reservation(
        facility_id="facility-1",
        student_id="student-1",
        organization_unit_id="organization-unit-1",
        reservation_code="RSV-PAID",
        activity_title="Seminar Karier",
        event_description="Seminar persiapan karier.",
        participant_count=80,
        contact_phone="08123456789",
        price_rupiah=250000,
        organization_unit_name="BEM KM IPB",
        starts_at=datetime(2026, 6, 1, 2, tzinfo=UTC),
        ends_at=datetime(2026, 6, 1, 4, tzinfo=UTC),
        status=ReservationStatus.pending_document_review,
    )

    lifecycle.approve_document(reservation)

    assert reservation.status == ReservationStatus.pending_payment
    assert reservation.payment_upload_due_at == datetime(2026, 5, 2, 3, 0, tzinfo=UTC)


def test_signed_document_upload_moves_reservation_to_document_review_with_verification_deadline():
    lifecycle = FacilityReservationLifecycleModule(
        booking_settings=BookingSettings.defaults(),
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    reservation = _reservation(status=ReservationStatus.pending_document_upload)

    lifecycle.record_signed_document_uploaded(reservation)

    assert reservation.status == ReservationStatus.pending_document_review
    assert reservation.document_verification_due_at == datetime(2026, 5, 3, 3, 0, tzinfo=UTC)


def test_submission_hold_sets_initial_document_upload_status_and_deadline():
    lifecycle = FacilityReservationLifecycleModule(
        booking_settings=BookingSettings.defaults(),
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    reservation = _reservation(status=ReservationStatus.rejected)

    lifecycle.record_submission_held(reservation)

    assert reservation.status == ReservationStatus.pending_document_upload
    assert reservation.document_upload_due_at == datetime(2026, 5, 4, 3, 0, tzinfo=UTC)


def test_document_rejection_records_reason_and_rejects_reservation():
    lifecycle = FacilityReservationLifecycleModule(
        booking_settings=BookingSettings.defaults(),
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    reservation = _reservation(status=ReservationStatus.pending_document_review)

    lifecycle.reject_document(reservation, reason="Dokumen tidak lengkap.")

    assert reservation.status == ReservationStatus.rejected
    assert reservation.rejection_reason == "Dokumen tidak lengkap."
    assert reservation.rejection_source == ReservationRejectionSource.document


def test_payment_receipt_upload_records_verification_deadline_without_changing_payment_status():
    lifecycle = FacilityReservationLifecycleModule(
        booking_settings=BookingSettings.defaults(),
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    reservation = _reservation(status=ReservationStatus.pending_payment, price_rupiah=250000)

    lifecycle.record_payment_receipt_uploaded(reservation)

    assert reservation.status == ReservationStatus.pending_payment
    assert reservation.payment_verification_due_at == datetime(2026, 5, 2, 3, 0, tzinfo=UTC)


def test_payment_review_approves_or_rejects_reservation():
    lifecycle = FacilityReservationLifecycleModule(
        booking_settings=BookingSettings.defaults(),
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    approved = _reservation(status=ReservationStatus.pending_payment, price_rupiah=250000)
    rejected = _reservation(status=ReservationStatus.pending_payment, price_rupiah=250000)

    lifecycle.approve_payment(approved)
    lifecycle.reject_payment(rejected, reason="Bukti pembayaran tidak valid.")

    assert approved.status == ReservationStatus.approved
    assert rejected.status == ReservationStatus.rejected
    assert rejected.rejection_reason == "Bukti pembayaran tidak valid."
    assert rejected.rejection_source == ReservationRejectionSource.payment


def test_cancellation_transitions_record_request_and_review_decisions():
    lifecycle = FacilityReservationLifecycleModule(
        booking_settings=BookingSettings.defaults(),
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    requested = _reservation(status=ReservationStatus.approved)
    approved = _reservation(status=ReservationStatus.cancellation_requested)
    rejected = _reservation(status=ReservationStatus.cancellation_requested)

    lifecycle.request_cancellation(requested, reason="Kegiatan dibatalkan.")
    lifecycle.approve_cancellation(approved)
    lifecycle.reject_cancellation(rejected, reason="Sudah terlalu dekat dengan jadwal.")

    assert requested.status == ReservationStatus.cancellation_requested
    assert requested.cancellation_reason == "Kegiatan dibatalkan."
    assert requested.cancellation_rejection_reason is None
    assert approved.status == ReservationStatus.cancelled
    assert rejected.status == ReservationStatus.approved
    assert rejected.cancellation_rejection_reason == "Sudah terlalu dekat dengan jadwal."
    assert rejected.rejection_source is None


def test_effective_status_treats_past_approved_reservation_as_completed():
    lifecycle = FacilityReservationLifecycleModule(
        booking_settings=BookingSettings.defaults(),
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    reservation = _reservation(
        status=ReservationStatus.approved,
        ends_at=datetime(2026, 5, 1, 2, 0, tzinfo=UTC),
    )

    assert lifecycle.effective_status(reservation) == ReservationStatus.completed


def test_deadline_processing_expires_student_delay_and_marks_staff_overdue():
    lifecycle = FacilityReservationLifecycleModule(
        booking_settings=BookingSettings.defaults(),
        clock=lambda: datetime(2026, 6, 2, tzinfo=UTC),
    )
    missed_document_upload = _reservation(
        status=ReservationStatus.pending_document_upload,
        starts_at=datetime(2026, 6, 20, 2, tzinfo=UTC),
        ends_at=datetime(2026, 6, 20, 4, tzinfo=UTC),
        document_upload_due_at=datetime(2026, 6, 1, tzinfo=UTC),
    )
    missed_document_review = _reservation(
        status=ReservationStatus.pending_document_review,
        starts_at=datetime(2026, 6, 20, 5, tzinfo=UTC),
        ends_at=datetime(2026, 6, 20, 7, tzinfo=UTC),
        document_verification_due_at=datetime(2026, 6, 1, tzinfo=UTC),
    )

    expired = lifecycle.process_deadline(missed_document_upload)
    overdue = lifecycle.process_deadline(missed_document_review)

    assert expired == DeadlineTransition.expired
    assert missed_document_upload.status == ReservationStatus.expired
    assert overdue == DeadlineTransition.overdue_verification
    assert missed_document_review.status == ReservationStatus.overdue_verification


def _reservation(
    *,
    status: ReservationStatus,
    price_rupiah: int = 0,
    starts_at: datetime | None = None,
    ends_at: datetime | None = None,
    document_upload_due_at: datetime | None = None,
    document_verification_due_at: datetime | None = None,
) -> Reservation:
    return Reservation(
        facility_id="facility-1",
        student_id="student-1",
        organization_unit_id="organization-unit-1",
        reservation_code="RSV-LIFE",
        activity_title="Seminar Karier",
        event_description="Seminar persiapan karier.",
        participant_count=80,
        contact_phone="08123456789",
        price_rupiah=price_rupiah,
        organization_unit_name="BEM KM IPB",
        starts_at=starts_at or datetime(2026, 6, 1, 2, tzinfo=UTC),
        ends_at=ends_at or datetime(2026, 6, 1, 4, tzinfo=UTC),
        document_upload_due_at=document_upload_due_at,
        document_verification_due_at=document_verification_due_at,
        status=status,
    )
