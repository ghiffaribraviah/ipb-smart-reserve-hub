from collections.abc import Callable
from datetime import datetime

from sqlalchemy.orm import Session

from app.accounts import UserAccountModule
from app.booking_settings import BookingSettings, BookingSettingsModule
from app.facility_availability import FacilityAvailabilityModule
from app.facility_availability_reader import SqlAlchemyFacilityAvailabilityReader
from app.facility_catalog_reader import SqlAlchemyFacilityCatalogReader
from app.facilities import FacilityCatalogModule
from app.organization_unit_repository import SqlAlchemyOrganizationUnitRepository
from app.organization_units import OrganizationUnitManagementModule
from app.reservation_time_selection import ReservationTimeSelectionModule
from app.settings import SettingsModule
from app.student_email_policy import AllowedStudentEmailDomains
from app.user_repository import SqlAlchemyUserRepository


class UserAccountModuleFactory:
    def __init__(self, *, settings: SettingsModule, default_booking_settings: BookingSettings) -> None:
        self._settings = settings
        self._default_booking_settings = default_booking_settings

    def build(self, session: Session) -> UserAccountModule:
        booking_settings = BookingSettingsModule(
            session=session,
            defaults=self._default_booking_settings,
        ).get_booking_settings()
        return UserAccountModule(
            user_repository=SqlAlchemyUserRepository(session),
            secret_key=self._settings.secret_key,
            student_email_policy=AllowedStudentEmailDomains(booking_settings.allowed_student_email_domains),
        )


class FacilityModuleFactory:
    def __init__(self, *, default_booking_settings: BookingSettings, clock: Callable[[], datetime]) -> None:
        self._default_booking_settings = default_booking_settings
        self._clock = clock

    def build_catalog(self, session: Session) -> FacilityCatalogModule:
        return FacilityCatalogModule(facility_catalog_reader=SqlAlchemyFacilityCatalogReader(session))

    def build_availability(self, session: Session) -> FacilityAvailabilityModule:
        return FacilityAvailabilityModule(facility_availability_reader=SqlAlchemyFacilityAvailabilityReader(session))

    def build_reservation_time_selection(self, session: Session) -> ReservationTimeSelectionModule:
        return ReservationTimeSelectionModule(
            facility_availability=self.build_availability(session),
            booking_settings=BookingSettingsModule(
                session=session,
                defaults=self._default_booking_settings,
            ).get_booking_settings(),
            clock=self._clock,
        )


class OrganizationUnitModuleFactory:
    def build_management(self, session: Session) -> OrganizationUnitManagementModule:
        return OrganizationUnitManagementModule(
            organization_unit_repository=SqlAlchemyOrganizationUnitRepository(session)
        )


class BookingSettingsModuleFactory:
    def __init__(self, *, default_booking_settings: BookingSettings) -> None:
        self._default_booking_settings = default_booking_settings

    def build(self, session: Session) -> BookingSettingsModule:
        return BookingSettingsModule(session=session, defaults=self._default_booking_settings)
