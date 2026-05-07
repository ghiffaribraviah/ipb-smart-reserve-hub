from dataclasses import dataclass
from datetime import datetime
from typing import Protocol


class PublicFacilityReviewRecord(Protocol):
    id: str
    rating: int
    comment: str | None
    author_name: str
    created_at: datetime
    is_deleted: bool


@dataclass(frozen=True)
class PublicFacilityReview:
    id: str
    rating: int
    comment: str | None
    author_name: str
    created_at: datetime


@dataclass(frozen=True)
class PublicFacilityReviewSummary:
    rating_average: float | None
    review_count: int


@dataclass(frozen=True)
class PublicFacilityReviewProjection:
    summary: PublicFacilityReviewSummary
    reviews: list[PublicFacilityReview]


class PublicFacilityReviewModule:
    def project(self, reviews: list[PublicFacilityReviewRecord]) -> PublicFacilityReviewProjection:
        visible_reviews = [review for review in reviews if not review.is_deleted]
        return PublicFacilityReviewProjection(
            summary=PublicFacilityReviewSummary(
                rating_average=_rating_average(visible_reviews),
                review_count=len(visible_reviews),
            ),
            reviews=[
                PublicFacilityReview(
                    id=review.id,
                    rating=review.rating,
                    comment=review.comment,
                    author_name=review.author_name,
                    created_at=review.created_at,
                )
                for review in visible_reviews
            ],
        )


def _rating_average(reviews: list[PublicFacilityReviewRecord]) -> float | None:
    if not reviews:
        return None
    return round(sum(review.rating for review in reviews) / len(reviews), 1)
