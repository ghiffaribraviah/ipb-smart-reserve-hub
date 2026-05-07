from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime

from app.models import FacilityReview, ReservationStatus
from app.repositories.review_repository import ReviewRepository
from app.services.accounts import UserAccount
from app.services.audit_logs import AuditLogModule
from app.services.booking_settings import BookingSettings
from app.services.reservation_lifecycle import FacilityReservationLifecycleModule


class ReviewError(Exception):
    pass


class ReviewReservationNotFound(ReviewError):
    pass


class ReviewReservationNotCompleted(ReviewError):
    pass


class ReviewAlreadySubmitted(ReviewError):
    pass


class ReviewNotFound(ReviewError):
    pass


class StaffReviewAccessDenied(ReviewError):
    pass


class AdminReviewRemovalReasonRequired(ReviewError):
    pass


EDIT_WARNING = "Review tidak dapat diedit setelah dikirim."


@dataclass(frozen=True)
class ReviewSubmission:
    rating: int
    comment: str | None = None


@dataclass(frozen=True)
class StudentReview:
    id: str
    reservation_id: str
    facility_id: str
    rating: int
    comment: str | None
    author_name: str
    is_deleted: bool
    edit_warning: str = EDIT_WARNING


@dataclass(frozen=True)
class StaffFacilityReview:
    id: str
    reservation_id: str
    rating: int
    comment: str | None
    author_name: str
    created_at: datetime


@dataclass(frozen=True)
class StaffFacilityStatistics:
    facility_id: str
    review_count: int
    rating_average: float | None
    total_reservation_count: int
    completed_reservation_count: int


@dataclass(frozen=True)
class AdminReview:
    id: str
    reservation_id: str
    facility_id: str
    facility_name: str
    student_id: str
    student_name: str
    rating: int
    comment: str | None
    is_deleted: bool
    deleted_by: str | None
    deleted_at: datetime | None
    admin_removal_reason: str | None
    created_at: datetime


class ReviewModule:
    def __init__(
        self,
        *,
        review_repository: ReviewRepository,
        clock: Callable[[], datetime],
        reservation_lifecycle: FacilityReservationLifecycleModule | None = None,
        audit_logs: AuditLogModule | None = None,
    ) -> None:
        self._review_repository = review_repository
        self._clock = clock
        self._reservation_lifecycle = reservation_lifecycle or FacilityReservationLifecycleModule(
            booking_settings=BookingSettings.defaults(),
            clock=clock,
        )
        self._audit_logs = audit_logs

    def submit_student_review(
        self,
        student: UserAccount,
        reservation_id: str,
        submission: ReviewSubmission,
    ) -> StudentReview:
        reservation = self._review_repository.get_student_reservation(reservation_id, student.id)
        if reservation is None:
            raise ReviewReservationNotFound
        if self._reservation_lifecycle.effective_status(reservation) != ReservationStatus.completed:
            raise ReviewReservationNotCompleted
        if reservation.review is not None:
            raise ReviewAlreadySubmitted

        review = FacilityReview(
            reservation_id=reservation.id,
            facility_id=reservation.facility_id,
            student_id=student.id,
            rating=submission.rating,
            comment=_optional_comment(submission.comment),
        )
        review = self._review_repository.add(review)
        self._record_audit(
            actor=student,
            action_type="review.created",
            target_type="review",
            target_id=review.id,
            facility_id=review.facility_id,
            student_id=review.student_id,
            reservation_id=review.reservation_id,
        )
        return _to_student_review(review, author_name=reservation.student.full_name)

    def delete_student_review(self, student: UserAccount, review_id: str) -> StudentReview:
        review = self._review_repository.get_for_student(review_id, student.id)
        if review is None:
            raise ReviewNotFound
        review.is_deleted = True
        review.deleted_by = "student"
        review.deleted_at = _as_utc(self._clock())
        self._record_audit(
            actor=student,
            action_type="review.student_deleted",
            target_type="review",
            target_id=review.id,
            facility_id=review.facility_id,
            student_id=review.student_id,
            reservation_id=review.reservation_id,
        )
        return _to_student_review(review, author_name=review.student.full_name)

    def list_admin_reviews(
        self,
        *,
        facility_id: str | None = None,
        student_id: str | None = None,
        reservation_id: str | None = None,
        is_deleted: bool | None = None,
        deleted_by: str | None = None,
    ) -> list[AdminReview]:
        reviews = self._review_repository.list_all()
        if facility_id is not None:
            reviews = [review for review in reviews if review.facility_id == facility_id]
        if student_id is not None:
            reviews = [review for review in reviews if review.student_id == student_id]
        if reservation_id is not None:
            reviews = [review for review in reviews if review.reservation_id == reservation_id]
        if is_deleted is not None:
            reviews = [review for review in reviews if review.is_deleted is is_deleted]
        if deleted_by is not None:
            reviews = [review for review in reviews if review.deleted_by == deleted_by]
        return [_to_admin_review(review) for review in reviews]

    def delete_admin_review(self, admin: UserAccount, review_id: str, *, reason: str) -> AdminReview:
        normalized_reason = reason.strip()
        if not normalized_reason:
            raise AdminReviewRemovalReasonRequired
        review = self._review_repository.get_by_id(review_id)
        if review is None:
            raise ReviewNotFound
        review.is_deleted = True
        review.deleted_by = "admin"
        review.deleted_at = _as_utc(self._clock())
        review.admin_removal_reason = normalized_reason
        self._record_audit(
            actor=admin,
            action_type="review.admin_deleted",
            target_type="review",
            target_id=review.id,
            facility_id=review.facility_id,
            student_id=review.student_id,
            reservation_id=review.reservation_id,
        )
        return _to_admin_review(review)

    def restore_admin_review(self, admin: UserAccount, review_id: str) -> AdminReview:
        review = self._review_repository.get_by_id(review_id)
        if review is None:
            raise ReviewNotFound
        review.is_deleted = False
        review.deleted_by = None
        review.deleted_at = None
        review.admin_removal_reason = None
        self._record_audit(
            actor=admin,
            action_type="review.admin_restored",
            target_type="review",
            target_id=review.id,
            facility_id=review.facility_id,
            student_id=review.student_id,
            reservation_id=review.reservation_id,
        )
        return _to_admin_review(review)

    def list_staff_facility_reviews(self, staff: UserAccount, facility_id: str) -> list[StaffFacilityReview]:
        self._require_staff_assignment(staff, facility_id)
        return [
            StaffFacilityReview(
                id=review.id,
                reservation_id=review.reservation_id,
                rating=review.rating,
                comment=review.comment,
                author_name=review.student.full_name,
                created_at=_as_utc(review.created_at),
            )
            for review in self._review_repository.list_visible_for_facility(facility_id)
        ]

    def get_staff_facility_statistics(self, staff: UserAccount, facility_id: str) -> StaffFacilityStatistics:
        self._require_staff_assignment(staff, facility_id)
        reviews = self._review_repository.list_visible_for_facility(facility_id)
        reservations = self._review_repository.list_reservations_for_facility(facility_id)
        return StaffFacilityStatistics(
            facility_id=facility_id,
            review_count=len(reviews),
            rating_average=_rating_average(reviews),
            total_reservation_count=len(reservations),
            completed_reservation_count=sum(
                1
                for reservation in reservations
                if self._reservation_lifecycle.effective_status(reservation) == ReservationStatus.completed
            ),
        )

    def _require_staff_assignment(self, staff: UserAccount, facility_id: str) -> None:
        if not self._review_repository.staff_is_assigned(facility_id, staff.id):
            raise StaffReviewAccessDenied

    def _record_audit(
        self,
        *,
        actor: UserAccount | None,
        action_type: str,
        target_type: str,
        target_id: str,
        facility_id: str | None = None,
        student_id: str | None = None,
        reservation_id: str | None = None,
    ) -> None:
        if self._audit_logs is not None:
            self._audit_logs.record(
                actor=actor,
                action_type=action_type,
                target_type=target_type,
                target_id=target_id,
                facility_id=facility_id,
                student_id=student_id,
                reservation_id=reservation_id,
            )


def _to_student_review(review: FacilityReview, *, author_name: str) -> StudentReview:
    return StudentReview(
        id=review.id,
        reservation_id=review.reservation_id,
        facility_id=review.facility_id,
        rating=review.rating,
        comment=review.comment,
        author_name=author_name,
        is_deleted=review.is_deleted,
    )


def _to_admin_review(review: FacilityReview) -> AdminReview:
    return AdminReview(
        id=review.id,
        reservation_id=review.reservation_id,
        facility_id=review.facility_id,
        facility_name=review.facility.name,
        student_id=review.student_id,
        student_name=review.student.full_name,
        rating=review.rating,
        comment=review.comment,
        is_deleted=review.is_deleted,
        deleted_by=review.deleted_by,
        deleted_at=_as_utc(review.deleted_at) if review.deleted_at is not None else None,
        admin_removal_reason=review.admin_removal_reason,
        created_at=_as_utc(review.created_at),
    )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _optional_comment(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    return value or None


def _rating_average(reviews: list[FacilityReview]) -> float | None:
    if not reviews:
        return None
    return round(sum(review.rating for review in reviews) / len(reviews), 1)
