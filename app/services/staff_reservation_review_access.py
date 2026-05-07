from typing import Protocol

from app.models import Reservation


class StaffReservationReviewAccessError(Exception):
    pass


class StaffReservationReviewAccessDenied(StaffReservationReviewAccessError):
    pass


class StaffReservationReviewReservationNotFound(StaffReservationReviewAccessError):
    pass


class StaffReservationReviewRepository(Protocol):
    def get_for_assigned_staff_review(self, reservation_id: str, staff_id: str) -> Reservation | None:
        raise NotImplementedError

    def get_by_id_for_review(self, reservation_id: str) -> Reservation | None:
        raise NotImplementedError


class StaffReservationReviewAccessModule:
    def __init__(self, *, reservation_repository: StaffReservationReviewRepository) -> None:
        self._reservation_repository = reservation_repository

    def require_assigned_reservation(self, reservation_id: str, *, staff_id: str) -> Reservation:
        reservation = self._reservation_repository.get_for_assigned_staff_review(reservation_id, staff_id)
        if reservation is not None:
            return reservation
        if self._reservation_repository.get_by_id_for_review(reservation_id) is not None:
            raise StaffReservationReviewAccessDenied
        raise StaffReservationReviewReservationNotFound
