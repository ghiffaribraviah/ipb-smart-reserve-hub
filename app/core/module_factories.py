from collections.abc import Callable
from datetime import datetime

from sqlalchemy.orm import Session

from app.pdf import ApprovalLetterPdfGenerator
from app.services.approval_letters import ApprovalLetterModule
from app.services.accounts import UserAccountModule
from app.repositories.audit_log_repository import SqlAlchemyAuditLogRepository
from app.services.assigned_facility_access import AssignedFacilityAccessModule
from app.services.audit_logs import AuditLogModule
from app.repositories.booking_settings_repository import SqlAlchemyBookingSettingsRepository
from app.services.booking_settings import BookingSettings, BookingSettingsModule
from app.services.facility_availability import FacilityAvailabilityModule
from app.repositories.facility_availability_reader import SqlAlchemyFacilityAvailabilityReader
from app.repositories.facility_catalog_reader import SqlAlchemyFacilityCatalogReader
from app.repositories.facility_management_repository import SqlAlchemyFacilityManagementRepository
from app.repositories.notification_repository import SqlAlchemyNotificationRepository
from app.services.facilities import FacilityCatalogModule
from app.services.facility_management import FacilityManagementModule
from app.repositories.organization_unit_repository import SqlAlchemyOrganizationUnitRepository
from app.repositories.reservation_repository import SqlAlchemyReservationRepository
from app.repositories.review_repository import SqlAlchemyReviewRepository
from app.services.organization_units import OrganizationUnitManagementModule
from app.services.notifications import NotificationModule
from app.services.payments import PaymentModule
from app.services.public_facility_calendar import PublicFacilityCalendarModule
from app.services.reservation_lifecycle import FacilityReservationLifecycleModule
from app.services.reservations import ReservationModule, ReservationSubmissionConflictGuard
from app.services.reservation_time_selection import ReservationTimeSelectionModule
from app.services.reviews import ReviewModule
from app.services.staff_reservation_review_access import StaffReservationReviewAccessModule
from app.services.system_status import SystemStatusModule
from app.storage import PrivateStorage
from app.core.settings import SettingsModule
from app.core.student_email_policy import AllowedStudentEmailDomains
from app.repositories.user_repository import SqlAlchemyUserRepository


class UserAccountModuleFactory:
    def __init__(self, *, settings: SettingsModule, default_booking_settings: BookingSettings) -> None:
        self._settings = settings
        self._default_booking_settings = default_booking_settings

    def build(self, session: Session) -> UserAccountModule:
        booking_settings = BookingSettingsModule(
            booking_settings_repository=SqlAlchemyBookingSettingsRepository(session),
            defaults=self._default_booking_settings,
        ).get_booking_settings()
        return UserAccountModule(
            user_repository=SqlAlchemyUserRepository(session),
            secret_key=self._settings.secret_key,
            student_email_policy=AllowedStudentEmailDomains(booking_settings.allowed_student_email_domains),
        )


class FacilityModuleFactory:
    def __init__(
        self,
        *,
        default_booking_settings: BookingSettings,
        clock: Callable[[], datetime],
        private_storage: PrivateStorage,
    ) -> None:
        self._default_booking_settings = default_booking_settings
        self._clock = clock
        self._private_storage = private_storage
        self._approval_letter_pdf_generator = ApprovalLetterPdfGenerator()

    def build_catalog(self, session: Session) -> FacilityCatalogModule:
        return FacilityCatalogModule(
            facility_catalog_reader=SqlAlchemyFacilityCatalogReader(
                session,
                public_facility_calendar=PublicFacilityCalendarModule(),
            )
        )

    def build_availability(self, session: Session) -> FacilityAvailabilityModule:
        return FacilityAvailabilityModule(facility_availability_reader=SqlAlchemyFacilityAvailabilityReader(session))

    def build_reservation_time_selection(self, session: Session) -> ReservationTimeSelectionModule:
        return ReservationTimeSelectionModule(
            facility_availability=self.build_availability(session),
            booking_settings=BookingSettingsModule(
                booking_settings_repository=SqlAlchemyBookingSettingsRepository(session),
                defaults=self._default_booking_settings,
            ).get_booking_settings(),
            clock=self._clock,
        )

    def build_reservations(self, session: Session) -> ReservationModule:
        reservation_repository = SqlAlchemyReservationRepository(session)
        notifications = self.build_notifications(session)
        audit_logs = self.build_audit_logs(session)
        booking_settings = BookingSettingsModule(
            booking_settings_repository=SqlAlchemyBookingSettingsRepository(session),
            defaults=self._default_booking_settings,
        ).get_booking_settings()
        return ReservationModule(
            reservation_repository=reservation_repository,
            reservation_time_selection=self.build_reservation_time_selection(session),
            submission_conflict_guard=ReservationSubmissionConflictGuard(conflict_reader=reservation_repository),
            booking_settings=booking_settings,
            clock=self._clock,
            reservation_lifecycle=FacilityReservationLifecycleModule(
                booking_settings=booking_settings,
                clock=self._clock,
            ),
            staff_review_access=StaffReservationReviewAccessModule(reservation_repository=reservation_repository),
            notifications=notifications,
            audit_logs=audit_logs,
        )

    def build_reviews(self, session: Session) -> ReviewModule:
        booking_settings = BookingSettingsModule(
            booking_settings_repository=SqlAlchemyBookingSettingsRepository(session),
            defaults=self._default_booking_settings,
        ).get_booking_settings()
        return ReviewModule(
            review_repository=SqlAlchemyReviewRepository(session),
            clock=self._clock,
            reservation_lifecycle=FacilityReservationLifecycleModule(
                booking_settings=booking_settings,
                clock=self._clock,
            ),
            audit_logs=self.build_audit_logs(session),
        )

    def build_audit_logs(self, session: Session) -> AuditLogModule:
        return AuditLogModule(audit_log_repository=SqlAlchemyAuditLogRepository(session), clock=self._clock)

    def build_notifications(self, session: Session) -> NotificationModule:
        return NotificationModule(
            notification_repository=SqlAlchemyNotificationRepository(session),
            clock=self._clock,
        )

    def build_approval_letters(self, session: Session) -> ApprovalLetterModule:
        booking_settings = BookingSettingsModule(
            booking_settings_repository=SqlAlchemyBookingSettingsRepository(session),
            defaults=self._default_booking_settings,
        ).get_booking_settings()
        reservation_repository = SqlAlchemyReservationRepository(session)
        return ApprovalLetterModule(
            reservation_repository=reservation_repository,
            storage=self._private_storage,
            pdf_generator=self._approval_letter_pdf_generator,
            booking_settings=booking_settings,
            clock=self._clock,
            reservation_lifecycle=FacilityReservationLifecycleModule(
                booking_settings=booking_settings,
                clock=self._clock,
            ),
            staff_review_access=StaffReservationReviewAccessModule(reservation_repository=reservation_repository),
            notifications=self.build_notifications(session),
            audit_logs=self.build_audit_logs(session),
        )

    def build_payments(self, session: Session) -> PaymentModule:
        booking_settings = BookingSettingsModule(
            booking_settings_repository=SqlAlchemyBookingSettingsRepository(session),
            defaults=self._default_booking_settings,
        ).get_booking_settings()
        reservation_repository = SqlAlchemyReservationRepository(session)
        return PaymentModule(
            reservation_repository=reservation_repository,
            storage=self._private_storage,
            booking_settings=booking_settings,
            clock=self._clock,
            reservation_lifecycle=FacilityReservationLifecycleModule(
                booking_settings=booking_settings,
                clock=self._clock,
            ),
            staff_review_access=StaffReservationReviewAccessModule(reservation_repository=reservation_repository),
            notifications=self.build_notifications(session),
            audit_logs=self.build_audit_logs(session),
        )

    def build_management(self, session: Session) -> FacilityManagementModule:
        facility_management_repository = SqlAlchemyFacilityManagementRepository(session)
        return FacilityManagementModule(
            facility_management_repository=facility_management_repository,
            assigned_facility_access=AssignedFacilityAccessModule(
                facility_repository=facility_management_repository
            ),
            audit_logs=self.build_audit_logs(session),
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
        return BookingSettingsModule(
            booking_settings_repository=SqlAlchemyBookingSettingsRepository(session),
            defaults=self._default_booking_settings,
        )


class SystemStatusModuleFactory:
    def build(self, session: Session) -> SystemStatusModule:
        return SystemStatusModule(session=session)
