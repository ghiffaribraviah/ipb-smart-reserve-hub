from datetime import datetime, time

from sqlalchemy import select

from app.models import (
    Facility,
    FacilityBlackout,
    FacilityCategory,
    FacilityImage,
    FacilityOpenHour,
    OrganizationUnit,
    Reservation,
    ReservationStatus,
    User,
    UserRole,
)
from app.core.security import hash_password


class DataBuilder:
    def __init__(self, app) -> None:
        self._session_factory = app.state.session_factory

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
        price_rupiah: int = 0,
    ) -> str:
        with self._session_factory() as session:
            category = session.scalar(select(FacilityCategory).where(FacilityCategory.name == category_name))
            if category is None:
                category = FacilityCategory(name=category_name)
            facility = Facility(
                name=name,
                category=category,
                location="Kampus IPB Dramaga",
                capacity=120,
                description="Ruang kegiatan mahasiswa",
                contact_name="TU Fasilitas",
                contact_phone="0251-8620000",
                price_rupiah=price_rupiah,
                open_hours_summary="Senin-Jumat 08.00-16.00",
                rating_average=None,
                review_count=0,
                is_active=is_active,
            )
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
    ) -> str:
        with self._session_factory() as session:
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
                starts_at=datetime.fromisoformat(starts_at),
                ends_at=datetime.fromisoformat(ends_at),
                status=status,
            )
            session.add(reservation)
            session.commit()
            return reservation.id

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
