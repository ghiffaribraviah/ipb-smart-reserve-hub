from dataclasses import dataclass
from datetime import UTC, datetime

from app.services.public_facility_reviews import PublicFacilityReviewModule


@dataclass(frozen=True)
class ReviewRecord:
    id: str
    rating: int
    comment: str | None
    author_name: str
    created_at: datetime
    is_deleted: bool


def test_public_facility_reviews_exclude_deleted_reviews_and_summarize_visible_ratings():
    public_reviews = PublicFacilityReviewModule()

    projection = public_reviews.project(
        [
            ReviewRecord(
                id="review-1",
                rating=5,
                comment="Sangat baik.",
                author_name="Budi Santoso",
                created_at=datetime(2026, 5, 1, tzinfo=UTC),
                is_deleted=False,
            ),
            ReviewRecord(
                id="review-2",
                rating=1,
                comment="Dihapus.",
                author_name="Sari Wulandari",
                created_at=datetime(2026, 5, 2, tzinfo=UTC),
                is_deleted=True,
            ),
            ReviewRecord(
                id="review-3",
                rating=4,
                comment=None,
                author_name="Andi Pratama",
                created_at=datetime(2026, 5, 3, tzinfo=UTC),
                is_deleted=False,
            ),
        ]
    )

    assert projection.summary.rating_average == 4.5
    assert projection.summary.review_count == 2
    assert [review.id for review in projection.reviews] == ["review-1", "review-3"]
