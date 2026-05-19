from dataclasses import dataclass
from datetime import UTC, datetime, time

from app.models import Facility, FacilityBlackout, FacilityImage, FacilityOpenHour
from app.repositories.facility_management_repository import FacilityManagementRepository
from app.services.accounts import UserAccount
from app.services.assigned_facility_access import (
    AssignedFacilityAccessDenied,
    AssignedFacilityAccessModule,
    AssignedFacilityNotFound,
)
from app.services.audit_logs import AuditLogModule, AuditLogRecorder
from app.services.facilities import summarize_price


class FacilityManagementError(Exception):
    pass


class FacilityNotFound(FacilityManagementError):
    pass


class FacilityCategoryNotFound(FacilityManagementError):
    pass


class FacilityOpenHourInvalid(FacilityManagementError):
    pass


class StaffUserNotFound(FacilityManagementError):
    pass


class StaffFacilityAccessDenied(FacilityManagementError):
    pass


@dataclass(frozen=True)
class StaffAssignment:
    facility_id: str
    staff_id: str


@dataclass(frozen=True)
class FacilityManagementProfile:
    id: str
    name: str
    location: str
    capacity: int
    category_id: str
    category: str
    description: str
    contact_name: str
    contact_phone: str
    contact_email: str | None
    price_rupiah: int
    price_summary: str
    payment_instructions: str | None
    open_hours_summary: str
    open_hours: list["FacilityOpenHourProfile"]
    is_active: bool


@dataclass(frozen=True)
class FacilityGovernance:
    id: str
    name: str
    category: str
    location: str
    capacity: int
    is_active: bool
    assigned_staff_count: int
    active_assigned_staff_count: int
    assignment_coverage: str
    issue_flags: list[str]


@dataclass(frozen=True)
class FacilityProfileUpdate:
    name: str | None = None
    location: str | None = None
    capacity: int | None = None
    category_id: str | None = None
    description: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    price_rupiah: int | None = None
    payment_instructions: str | None = None
    open_hours_summary: str | None = None
    open_hours: list["FacilityOpenHourCreation"] | None = None
    is_active: bool | None = None


@dataclass(frozen=True)
class FacilityImageCreation:
    url: str
    alt_text: str
    display_order: int
    is_cover: bool


@dataclass(frozen=True)
class FacilityImageProfile:
    id: str
    url: str
    alt_text: str
    display_order: int
    is_cover: bool
    is_active: bool


@dataclass(frozen=True)
class FacilityOpenHourCreation:
    day_of_week: int
    opens_at: str
    closes_at: str


@dataclass(frozen=True)
class FacilityOpenHourProfile:
    id: str
    day_of_week: int
    opens_at: str
    closes_at: str


@dataclass(frozen=True)
class FacilityBlackoutCreation:
    starts_at: datetime
    ends_at: datetime
    reason: str


@dataclass(frozen=True)
class FacilityBlackoutProfile:
    id: str
    starts_at: datetime
    ends_at: datetime
    reason: str


class FacilityManagementModule:
    def __init__(
        self,
        *,
        facility_management_repository: FacilityManagementRepository,
        assigned_facility_access: AssignedFacilityAccessModule | None = None,
        audit_logs: AuditLogModule | None = None,
    ) -> None:
        self._facility_management_repository = facility_management_repository
        self._assigned_facility_access = assigned_facility_access or AssignedFacilityAccessModule(
            facility_repository=facility_management_repository
        )
        self._audit_recorder = AuditLogRecorder(audit_logs)

    def assign_staff(self, facility_id: str, staff_id: str, *, actor: UserAccount | None = None) -> StaffAssignment:
        if self._facility_management_repository.get_facility(facility_id) is None:
            raise FacilityNotFound
        if self._facility_management_repository.get_staff_user(staff_id) is None:
            raise StaffUserNotFound

        assignment = self._facility_management_repository.add_staff_assignment(facility_id, staff_id)
        self._audit_recorder.record(
            actor=actor,
            action_type="staff_assignment.created",
            target_type="staff_assignment",
            target_id=assignment.id,
            facility_id=facility_id,
        )
        return StaffAssignment(facility_id=assignment.facility_id, staff_id=assignment.staff_id)

    def unassign_staff(self, facility_id: str, staff_id: str, *, actor: UserAccount | None = None) -> None:
        self._facility_management_repository.remove_staff_assignment(facility_id, staff_id)
        self._audit_recorder.record(
            actor=actor,
            action_type="staff_assignment.removed",
            target_type="staff_assignment",
            target_id=staff_id,
            facility_id=facility_id,
        )

    def list_assigned_facilities(self, staff: UserAccount) -> list[FacilityManagementProfile]:
        return [
            _to_facility_profile(facility)
            for facility in self._facility_management_repository.list_assigned_facilities(staff.id)
        ]

    def list_facility_governance(self) -> list[FacilityGovernance]:
        return [
            _to_facility_governance(facility)
            for facility in self._facility_management_repository.list_all_facilities_for_governance()
        ]

    def update_assigned_facility(
        self,
        staff: UserAccount,
        facility_id: str,
        update: FacilityProfileUpdate,
    ) -> FacilityManagementProfile:
        facility = self._require_assigned_facility(staff, facility_id)
        if update.name is not None:
            facility.name = update.name
        if update.location is not None:
            facility.location = update.location
        if update.capacity is not None:
            facility.capacity = update.capacity
        if update.category_id is not None:
            category = self._facility_management_repository.get_active_category(update.category_id)
            if category is None:
                raise FacilityCategoryNotFound
            facility.category_id = category.id
            facility.category = category
        if update.description is not None:
            facility.description = update.description
        if update.contact_name is not None:
            facility.contact_name = update.contact_name
        if update.contact_phone is not None:
            facility.contact_phone = update.contact_phone
        if update.contact_email is not None:
            facility.contact_email = update.contact_email
        if update.price_rupiah is not None:
            facility.price_rupiah = update.price_rupiah
        if update.payment_instructions is not None:
            facility.payment_instructions = update.payment_instructions
        if update.open_hours_summary is not None:
            facility.open_hours_summary = update.open_hours_summary
        if update.open_hours is not None:
            open_hours = [
                _open_hour_from_creation(facility_id=facility.id, creation=creation)
                for creation in update.open_hours
            ]
            facility.open_hours = self._facility_management_repository.replace_open_hours(facility.id, open_hours)
            facility.open_hours_summary = _summarize_open_hours(facility.open_hours)
        if update.is_active is not None:
            facility.is_active = update.is_active
        return _to_facility_profile(facility)

    def deactivate_assigned_facility(self, staff: UserAccount, facility_id: str) -> FacilityManagementProfile:
        return self.update_assigned_facility(staff, facility_id, FacilityProfileUpdate(is_active=False))

    def add_assigned_facility_image(
        self,
        staff: UserAccount,
        facility_id: str,
        creation: FacilityImageCreation,
    ) -> FacilityImageProfile:
        self._require_assigned_facility(staff, facility_id)
        if creation.is_cover:
            self._facility_management_repository.clear_cover_images(facility_id)
        image = self._facility_management_repository.add_image(
            FacilityImage(
                facility_id=facility_id,
                url=creation.url,
                alt_text=creation.alt_text,
                display_order=creation.display_order,
                is_cover=creation.is_cover,
                is_active=True,
            )
        )
        return _to_image_profile(image)

    def add_assigned_facility_open_hour(
        self,
        staff: UserAccount,
        facility_id: str,
        creation: FacilityOpenHourCreation,
    ) -> FacilityOpenHourProfile:
        self._require_assigned_facility(staff, facility_id)
        _ensure_valid_open_hour(creation.day_of_week, creation.opens_at, creation.closes_at)
        open_hour = self._facility_management_repository.add_open_hour(
            FacilityOpenHour(
                facility_id=facility_id,
                day_of_week=creation.day_of_week,
                opens_at=_time_from_string(creation.opens_at),
                closes_at=_time_from_string(creation.closes_at),
            )
        )
        return _to_open_hour_profile(open_hour)

    def add_assigned_facility_blackout(
        self,
        staff: UserAccount,
        facility_id: str,
        creation: FacilityBlackoutCreation,
    ) -> FacilityBlackoutProfile:
        self._require_assigned_facility(staff, facility_id)
        blackout = self._facility_management_repository.add_blackout(
            FacilityBlackout(
                facility_id=facility_id,
                starts_at=_as_utc(creation.starts_at),
                ends_at=_as_utc(creation.ends_at),
                reason=creation.reason,
            )
        )
        return _to_blackout_profile(blackout)

    def _require_assigned_facility(self, staff: UserAccount, facility_id: str) -> Facility:
        try:
            return self._assigned_facility_access.require_assigned_facility(facility_id, staff_id=staff.id)
        except AssignedFacilityNotFound:
            raise FacilityNotFound
        except AssignedFacilityAccessDenied:
            raise StaffFacilityAccessDenied

def _to_facility_profile(facility: Facility) -> FacilityManagementProfile:
    return FacilityManagementProfile(
        id=facility.id,
        name=facility.name,
        location=facility.location,
        capacity=facility.capacity,
        category_id=facility.category_id,
        category=facility.category.name,
        description=facility.description,
        contact_name=facility.contact_name,
        contact_phone=facility.contact_phone,
        contact_email=facility.contact_email,
        price_rupiah=facility.price_rupiah,
        price_summary=summarize_price(facility.price_rupiah),
        payment_instructions=facility.payment_instructions,
        open_hours_summary=facility.open_hours_summary,
        open_hours=[_to_open_hour_profile(open_hour) for open_hour in facility.open_hours],
        is_active=facility.is_active,
    )


def _to_facility_governance(facility: Facility) -> FacilityGovernance:
    assigned_staff_count = len(facility.staff_assignments)
    active_assigned_staff_count = sum(1 for assignment in facility.staff_assignments if assignment.staff.is_active)
    issue_flags = []
    if active_assigned_staff_count == 0:
        issue_flags.append("needs_staff")
    return FacilityGovernance(
        id=facility.id,
        name=facility.name,
        category=facility.category.name,
        location=facility.location,
        capacity=facility.capacity,
        is_active=facility.is_active,
        assigned_staff_count=assigned_staff_count,
        active_assigned_staff_count=active_assigned_staff_count,
        assignment_coverage="covered" if active_assigned_staff_count > 0 else "needs_staff",
        issue_flags=issue_flags,
    )


def _to_image_profile(image: FacilityImage) -> FacilityImageProfile:
    return FacilityImageProfile(
        id=image.id,
        url=image.url,
        alt_text=image.alt_text,
        display_order=image.display_order,
        is_cover=image.is_cover,
        is_active=image.is_active,
    )


def _to_open_hour_profile(open_hour: FacilityOpenHour) -> FacilityOpenHourProfile:
    return FacilityOpenHourProfile(
        id=open_hour.id,
        day_of_week=open_hour.day_of_week,
        opens_at=open_hour.opens_at.isoformat(timespec="minutes"),
        closes_at=open_hour.closes_at.isoformat(timespec="minutes"),
    )


def _to_blackout_profile(blackout: FacilityBlackout) -> FacilityBlackoutProfile:
    return FacilityBlackoutProfile(
        id=blackout.id,
        starts_at=_as_utc(blackout.starts_at),
        ends_at=_as_utc(blackout.ends_at),
        reason=blackout.reason,
    )


def _time_from_string(value: str) -> time:
    try:
        return time.fromisoformat(value)
    except ValueError:
        raise FacilityOpenHourInvalid from None


def _open_hour_from_creation(
    *, facility_id: str, creation: FacilityOpenHourCreation | dict[str, object]
) -> FacilityOpenHour:
    if isinstance(creation, dict):
        creation = FacilityOpenHourCreation(
            day_of_week=int(creation["day_of_week"]),
            opens_at=str(creation["opens_at"]),
            closes_at=str(creation["closes_at"]),
        )
    _ensure_valid_open_hour(creation.day_of_week, creation.opens_at, creation.closes_at)
    return FacilityOpenHour(
        facility_id=facility_id,
        day_of_week=creation.day_of_week,
        opens_at=_time_from_string(creation.opens_at),
        closes_at=_time_from_string(creation.closes_at),
    )


def _ensure_valid_open_hour(day_of_week: int, opens_at: str, closes_at: str) -> None:
    if day_of_week < 0 or day_of_week > 6:
        raise FacilityOpenHourInvalid
    if _time_from_string(closes_at) <= _time_from_string(opens_at):
        raise FacilityOpenHourInvalid


_DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]


def _summarize_open_hours(open_hours: list[FacilityOpenHour]) -> str:
    if not open_hours:
        return "Belum ada jam buka"
    return "; ".join(
        f"{_DAY_NAMES[open_hour.day_of_week]} {open_hour.opens_at.isoformat(timespec='minutes')}-{open_hour.closes_at.isoformat(timespec='minutes')}"
        for open_hour in sorted(open_hours, key=lambda item: (item.day_of_week, item.opens_at))
    )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
