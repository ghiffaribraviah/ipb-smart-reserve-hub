from app.models import ReservationStatus


class PublicFacilityCalendarModule:
    def public_reservation_statuses(self) -> tuple[ReservationStatus, ...]:
        return (
            ReservationStatus.pending_document_upload,
            ReservationStatus.pending_document_review,
            ReservationStatus.pending_payment,
            ReservationStatus.overdue_verification,
            ReservationStatus.approved,
            ReservationStatus.cancellation_requested,
        )
