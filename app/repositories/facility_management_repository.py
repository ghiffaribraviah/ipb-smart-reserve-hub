from datetime import datetime, time
from typing import Protocol

from sqlalchemy import delete, exists, select
from sqlalchemy.orm import Session, joinedload

from app.models import (
    Facility,
    FacilityBlackout,
    FacilityCategory,
    FacilityImage,
    FacilityOpenHour,
    FacilityStaffAssignment,
    User,
    UserRole,
)


class FacilityManagementRepository(Protocol):
    def get_facility(self, facility_id: str) -> Facility | None:
        raise NotImplementedError

    def get_staff_user(self, staff_id: str) -> User | None:
        raise NotImplementedError

    def get_active_category(self, category_id: str) -> FacilityCategory | None:
        raise NotImplementedError

    def add_staff_assignment(self, facility_id: str, staff_id: str) -> FacilityStaffAssignment:
        raise NotImplementedError

    def remove_staff_assignment(self, facility_id: str, staff_id: str) -> None:
        raise NotImplementedError

    def staff_is_assigned(self, facility_id: str, staff_id: str) -> bool:
        raise NotImplementedError

    def list_assigned_facilities(self, staff_id: str) -> list[Facility]:
        raise NotImplementedError

    def list_all_facilities_for_governance(self) -> list[Facility]:
        raise NotImplementedError

    def add_image(self, image: FacilityImage) -> FacilityImage:
        raise NotImplementedError

    def clear_cover_images(self, facility_id: str) -> None:
        raise NotImplementedError

    def add_open_hour(self, open_hour: FacilityOpenHour) -> FacilityOpenHour:
        raise NotImplementedError

    def replace_open_hours(self, facility_id: str, open_hours: list[FacilityOpenHour]) -> list[FacilityOpenHour]:
        raise NotImplementedError

    def add_blackout(self, blackout: FacilityBlackout) -> FacilityBlackout:
        raise NotImplementedError


class SqlAlchemyFacilityManagementRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_facility(self, facility_id: str) -> Facility | None:
        return self._session.scalar(
            select(Facility)
            .options(joinedload(Facility.category), joinedload(Facility.images), joinedload(Facility.open_hours))
            .where(Facility.id == facility_id)
        )

    def get_staff_user(self, staff_id: str) -> User | None:
        user = self._session.get(User, staff_id)
        if user is None or user.role != UserRole.staff:
            return None
        return user

    def get_active_category(self, category_id: str) -> FacilityCategory | None:
        return self._session.scalar(
            select(FacilityCategory).where(
                FacilityCategory.id == category_id,
                FacilityCategory.is_active.is_(True),
            )
        )

    def add_staff_assignment(self, facility_id: str, staff_id: str) -> FacilityStaffAssignment:
        assignment = self._session.scalar(
            select(FacilityStaffAssignment).where(
                FacilityStaffAssignment.facility_id == facility_id,
                FacilityStaffAssignment.staff_id == staff_id,
            )
        )
        if assignment is not None:
            return assignment

        assignment = FacilityStaffAssignment(facility_id=facility_id, staff_id=staff_id)
        self._session.add(assignment)
        self._session.flush()
        return assignment

    def remove_staff_assignment(self, facility_id: str, staff_id: str) -> None:
        self._session.execute(
            delete(FacilityStaffAssignment).where(
                FacilityStaffAssignment.facility_id == facility_id,
                FacilityStaffAssignment.staff_id == staff_id,
            )
        )
        self._session.flush()

    def staff_is_assigned(self, facility_id: str, staff_id: str) -> bool:
        return self._session.scalar(
            select(
                exists().where(
                    FacilityStaffAssignment.facility_id == facility_id,
                    FacilityStaffAssignment.staff_id == staff_id,
                )
            )
        )

    def list_assigned_facilities(self, staff_id: str) -> list[Facility]:
        return list(
            self._session.scalars(
                select(Facility)
                .join(FacilityStaffAssignment)
                .options(joinedload(Facility.category), joinedload(Facility.images), joinedload(Facility.open_hours))
                .where(FacilityStaffAssignment.staff_id == staff_id)
                .order_by(Facility.name)
            ).unique()
        )

    def list_all_facilities_for_governance(self) -> list[Facility]:
        return list(
            self._session.scalars(
                select(Facility)
                .options(
                    joinedload(Facility.category),
                    joinedload(Facility.staff_assignments).joinedload(FacilityStaffAssignment.staff),
                )
                .order_by(Facility.name)
            ).unique()
        )

    def add_image(self, image: FacilityImage) -> FacilityImage:
        self._session.add(image)
        self._session.flush()
        return image

    def clear_cover_images(self, facility_id: str) -> None:
        for image in self._session.scalars(select(FacilityImage).where(FacilityImage.facility_id == facility_id)):
            image.is_cover = False

    def add_open_hour(self, open_hour: FacilityOpenHour) -> FacilityOpenHour:
        self._session.add(open_hour)
        self._session.flush()
        return open_hour

    def replace_open_hours(self, facility_id: str, open_hours: list[FacilityOpenHour]) -> list[FacilityOpenHour]:
        self._session.execute(delete(FacilityOpenHour).where(FacilityOpenHour.facility_id == facility_id))
        for open_hour in open_hours:
            self._session.add(open_hour)
        self._session.flush()
        return list(
            self._session.scalars(
                select(FacilityOpenHour)
                .where(FacilityOpenHour.facility_id == facility_id)
                .order_by(FacilityOpenHour.day_of_week, FacilityOpenHour.opens_at)
            )
        )

    def add_blackout(self, blackout: FacilityBlackout) -> FacilityBlackout:
        self._session.add(blackout)
        self._session.flush()
        return blackout


def open_hour_from_strings(*, facility_id: str, day_of_week: int, opens_at: str, closes_at: str) -> FacilityOpenHour:
    return FacilityOpenHour(
        facility_id=facility_id,
        day_of_week=day_of_week,
        opens_at=time.fromisoformat(opens_at),
        closes_at=time.fromisoformat(closes_at),
    )


def blackout_from_datetimes(
    *,
    facility_id: str,
    starts_at: datetime,
    ends_at: datetime,
    reason: str,
) -> FacilityBlackout:
    return FacilityBlackout(facility_id=facility_id, starts_at=starts_at, ends_at=ends_at, reason=reason)
