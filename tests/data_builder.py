from datetime import datetime, time

from sqlalchemy import select

from app.models import (
    Facility,
    FacilityBlackout,
    FacilityCategory,
    FacilityImage,
    FacilityOpenHour,
    FacilityReview,
    OrganizationUnit,
    Reservation,
    ReservationPaymentReceipt,
    ReservationStatus,
    User,
    UserRole,
)
from app.core.security import hash_password
from app.services.accounts import UserAccount


class DataBuilder:
    def __init__(self, app) -> None:
        self._session_factory = app.state.session_factory

    def create_facility_category(
        self,
        *,
        name: str,
        slug: str,
        icon_hint: str | None = None,
        is_active: bool = True,
    ) -> str:
        with self._session_factory() as session:
            category = FacilityCategory(
                name=name,
                slug=slug,
                icon_hint=icon_hint,
                is_active=is_active,
            )
            session.add(category)
            session.commit()
            return category.id

    def create_user(
        self,
        *,
        email: str,
        role: UserRole,
        password: str = "secret123",
        is_active: bool = True,
    ) -> str:
        with self._session_factory() as session:
            user = User(
                email=email,
                password_hash=hash_password(password),
                full_name="Seed User",
                role=role,
                is_active=is_active,
            )
            session.add(user)
            session.commit()
            return user.id

    def create_facility(
        self,
        *,
        name: str,
        is_active: bool = True,
        category_name: str = "Auditorium",
        category_slug: str = "auditorium",
        category_icon_hint: str | None = "presentation",
        capacity: int = 120,
        price_rupiah: int = 0,
        payment_instructions: str | None = None,
        include_cover_image: bool = True,
    ) -> str:
        with self._session_factory() as session:
            category = session.scalar(select(FacilityCategory).where(FacilityCategory.name == category_name))
            if category is None:
                category = FacilityCategory(
                    name=category_name,
                    slug=category_slug,
                    icon_hint=category_icon_hint,
                )
            facility = Facility(
                name=name,
                category=category,
                location="Kampus IPB Dramaga",
                capacity=capacity,
                description="Ruang kegiatan mahasiswa",
                contact_name="TU Fasilitas",
                contact_phone="0251-8620000",
                price_rupiah=price_rupiah,
                payment_instructions=payment_instructions,
                open_hours_summary="Senin-Jumat 08.00-16.00",
                rating_average=None,
                review_count=0,
                is_active=is_active,
            )
            if include_cover_image:
                facility.images.append(
                    FacilityImage(
                        url="https://cdn.example.test/auditorium-cover.jpg",
                        alt_text="Auditorium cover",
                        display_order=1,
                        is_cover=True,
                        is_active=True,
                    )
                )
            session.add(facility)
            session.commit()
            return facility.id

    def add_facility_review(
        self,
        facility_id: str,
        *,
        rating: int,
        activity_title: str,
        is_deleted: bool = False,
    ) -> str:
        with self._session_factory() as session:
            student = User(
                email=f"reviewer-{activity_title.lower().replace(' ', '-')}@apps.ipb.ac.id",
                password_hash=hash_password("secret123"),
                full_name="Student Reviewer",
                role=UserRole.student,
                is_active=True,
            )
            organization_unit = OrganizationUnit(name=f"Reviewer Unit {activity_title}", type="student_organization")
            reservation = Reservation(
                facility_id=facility_id,
                student=student,
                organization_unit=organization_unit,
                reservation_code=f"RSV-REVIEW-{activity_title.upper().replace(' ', '-')}",
                activity_title=activity_title,
                event_description="Reviewed event",
                price_rupiah=0,
                starts_at=datetime.fromisoformat("2026-06-01T01:00:00+00:00"),
                ends_at=datetime.fromisoformat("2026-06-01T03:00:00+00:00"),
                status=ReservationStatus.completed,
            )
            review = FacilityReview(
                reservation=reservation,
                facility_id=facility_id,
                student=student,
                rating=rating,
                comment=None,
                is_deleted=is_deleted,
            )
            session.add(review)
            session.commit()
            return review.id

    def add_facility_image(
        self,
        facility_id: str,
        *,
        url: str,
        display_order: int,
        is_cover: bool = False,
    ) -> None:
        with self._session_factory() as session:
            facility = session.get(Facility, facility_id)
            facility.images.append(
                FacilityImage(
                    url=url,
                    alt_text=f"Facility image {display_order}",
                    display_order=display_order,
                    is_cover=is_cover,
                    is_active=True,
                )
            )
            session.commit()

    def create_organization_unit(
        self,
        *,
        name: str,
        unit_type: str = "student_organization",
        is_active: bool = True,
    ) -> str:
        with self._session_factory() as session:
            organization_unit = OrganizationUnit(name=name, type=unit_type, is_active=is_active)
            session.add(organization_unit)
            session.commit()
            return organization_unit.id

    def create_reservation(
        self,
        *,
        facility_id: str,
        organization_unit_id: str,
        activity_title: str,
        starts_at: str,
        ends_at: str,
        status: ReservationStatus,
        document_upload_due_at: str | None = None,
        document_verification_due_at: str | None = None,
        payment_upload_due_at: str | None = None,
        payment_verification_due_at: str | None = None,
        extra_requirement_av_support: bool = False,
        extra_requirement_logistics_coordination: bool = False,
        extra_requirement_extra_cleaning: bool = False,
        extra_requirement_security_personnel: bool = False,
        extra_requirement_notes: str | None = None,
        has_payment_receipt: bool = False,
    ) -> str:
        with self._session_factory() as session:
            facility = session.get(Facility, facility_id)
            student = User(
                email=f"student-{activity_title.lower().replace(' ', '-')}@apps.ipb.ac.id",
                password_hash=hash_password("secret123"),
                full_name="Student Reservasi",
                role=UserRole.student,
                is_active=True,
            )
            reservation = Reservation(
                facility_id=facility_id,
                student=student,
                organization_unit_id=organization_unit_id,
                reservation_code=f"RSV-{activity_title.upper().replace(' ', '-')}",
                activity_title=activity_title,
                event_description="Private event description",
                price_rupiah=facility.price_rupiah if facility is not None else 0,
                starts_at=datetime.fromisoformat(starts_at),
                ends_at=datetime.fromisoformat(ends_at),
                document_upload_due_at=_datetime_or_none(document_upload_due_at),
                document_verification_due_at=_datetime_or_none(document_verification_due_at),
                payment_upload_due_at=_datetime_or_none(payment_upload_due_at),
                payment_verification_due_at=_datetime_or_none(payment_verification_due_at),
                extra_requirement_av_support=extra_requirement_av_support,
                extra_requirement_logistics_coordination=extra_requirement_logistics_coordination,
                extra_requirement_extra_cleaning=extra_requirement_extra_cleaning,
                extra_requirement_security_personnel=extra_requirement_security_personnel,
                extra_requirement_notes=extra_requirement_notes,
                status=status,
            )
            if has_payment_receipt:
                reservation.payment_receipt = ReservationPaymentReceipt(
                    storage_key=f"payment-receipts/{activity_title}",
                    filename="receipt.png",
                    content_type="image/png",
                    size_bytes=10,
                    uploaded_at=datetime.fromisoformat("2026-06-01T00:00:00+00:00"),
                )
            session.add(reservation)
            session.commit()
            return reservation.id

    def get_reservation_status(self, reservation_id: str) -> ReservationStatus:
        with self._session_factory() as session:
            return session.get(Reservation, reservation_id).status

    def user_account_for_reservation(self, reservation_id: str) -> UserAccount:
        with self._session_factory() as session:
            reservation = session.get(Reservation, reservation_id)
            return UserAccount(
                id=reservation.student.id,
                email=reservation.student.email,
                full_name=reservation.student.full_name,
                role=reservation.student.role,
                is_active=reservation.student.is_active,
            )

    def add_facility_open_hour(
        self,
        facility_id: str,
        *,
        day_of_week: int,
        opens_at: str,
        closes_at: str,
    ) -> None:
        with self._session_factory() as session:
            session.add(
                FacilityOpenHour(
                    facility_id=facility_id,
                    day_of_week=day_of_week,
                    opens_at=time.fromisoformat(opens_at),
                    closes_at=time.fromisoformat(closes_at),
                )
            )
            session.commit()

    def add_facility_blackout(
        self,
        facility_id: str,
        *,
        starts_at: str,
        ends_at: str,
        reason: str = "Maintenance",
    ) -> None:
        with self._session_factory() as session:
            session.add(
                FacilityBlackout(
                    facility_id=facility_id,
                    starts_at=datetime.fromisoformat(starts_at),
                    ends_at=datetime.fromisoformat(ends_at),
                    reason=reason,
                )
            )
            session.commit()


def _datetime_or_none(value: str | None) -> datetime | None:
    if value is None:
        return None
    return datetime.fromisoformat(value)
