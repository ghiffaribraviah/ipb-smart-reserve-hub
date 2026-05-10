import os
from datetime import UTC, datetime, time, timedelta

from sqlalchemy import select

from app.core.database import Base, build_session_factory
from app.core.security import hash_password
from app.core.settings import SettingsModule
from app.models import (
    Facility,
    FacilityCategory,
    FacilityImage,
    FacilityOpenHour,
    FacilityStaffAssignment,
    OrganizationUnit,
    Reservation,
    ReservationStatus,
    User,
    UserRole,
)


DEMO_PASSWORD = "demo12345"


class ProductionSeedRefused(Exception):
    pass


def seed_development_data(*, settings: SettingsModule | None = None, environment: str | None = None) -> None:
    seed_environment = environment if environment is not None else os.environ.get("IPB_ENVIRONMENT")
    if seed_environment == "production":
        raise ProductionSeedRefused("Development seed data cannot be loaded in production.")

    app_settings = settings or SettingsModule.from_environment()
    session_factory = build_session_factory(app_settings.database_url)
    Base.metadata.create_all(bind=session_factory.kw["bind"])

    with session_factory() as session:
        demo_student = _ensure_user(
            session,
            email="demo.student@apps.ipb.ac.id",
            full_name="Demo Student",
            role=UserRole.student,
            nim="G64000001",
            phone="081234500001",
        )
        blocking_student = _ensure_user(
            session,
            email="demo.blocking@apps.ipb.ac.id",
            full_name="Demo Calendar Blocker",
            role=UserRole.student,
            nim="G64000002",
            phone="081234500002",
        )
        staff = _ensure_user(session, email="demo.staff@ipb.ac.id", full_name="Demo Staff", role=UserRole.staff)
        _ensure_user(session, email="demo.admin@ipb.ac.id", full_name="Demo Super Admin", role=UserRole.super_admin)

        auditorium = _ensure_category(
            session,
            name="Auditorium",
            slug="auditorium",
            icon_hint="presentation",
        )
        ruang_kelas = _ensure_category(
            session,
            name="Ruang Kelas",
            slug="ruang-kelas",
            icon_hint="school",
        )
        olahraga = _ensure_category(
            session,
            name="Olahraga",
            slug="olahraga",
            icon_hint="dumbbell",
        )

        facilities = [
            _ensure_facility(
                session,
                category=auditorium,
                name="Auditorium Andi Hakim Nasoetion",
                location="Kampus IPB Dramaga",
                capacity=450,
                description="Auditorium utama untuk seminar, kuliah umum, dan kegiatan besar mahasiswa.",
                contact_name="TU Auditorium",
                contact_phone="0251-8622642",
                contact_email="auditorium@ipb.ac.id",
                price_rupiah=0,
                open_hours_summary="Senin-Jumat 08.00-16.00",
            ),
            _ensure_facility(
                session,
                category=ruang_kelas,
                name="Ruang Sidang Rektorat",
                location="Kampus IPB Dramaga",
                capacity=80,
                description="Ruang rapat formal untuk koordinasi organisasi dan kegiatan akademik.",
                contact_name="TU Rektorat",
                contact_phone="0251-8621000",
                contact_email="rektorat@ipb.ac.id",
                price_rupiah=150000,
                open_hours_summary="Senin-Jumat 09.00-15.00",
            ),
            _ensure_facility(
                session,
                category=olahraga,
                name="Lapangan Basket Indoor",
                location="Gymnasium IPB",
                capacity=120,
                description="Lapangan indoor untuk latihan, pertandingan, dan kegiatan olahraga mahasiswa.",
                contact_name="Pengelola Gymnasium",
                contact_phone="0251-8623000",
                contact_email="gymnasium@ipb.ac.id",
                price_rupiah=250000,
                open_hours_summary="Senin-Sabtu 08.00-18.00",
            ),
        ]

        session.flush()
        for display_index, facility in enumerate(facilities, start=1):
            _ensure_image(
                session,
                facility=facility,
                url=f"https://cdn.example.test/dev-seed/facility-{display_index}-cover.jpg",
                alt_text=f"{facility.name} cover",
                display_order=1,
                is_cover=True,
            )
            _ensure_image(
                session,
                facility=facility,
                url=f"https://cdn.example.test/dev-seed/facility-{display_index}-detail.jpg",
                alt_text=f"{facility.name} detail",
                display_order=2,
                is_cover=False,
            )
            for day_of_week in range(5):
                _ensure_open_hour(
                    session,
                    facility=facility,
                    day_of_week=day_of_week,
                    opens_at=time(8, 0),
                    closes_at=time(16, 0),
                )

        bem = _ensure_organization_unit(session, name="BEM KM IPB", unit_type="student_organization", code="BEM")
        himalkom = _ensure_organization_unit(
            session,
            name="Himpunan Mahasiswa Ilmu Komputer",
            unit_type="student_organization",
            code="HIMALKOM",
        )
        session.flush()
        _ensure_staff_assignment(session, facility=facilities[0], staff=staff)

        now = datetime.now(UTC)
        first_start = (now + timedelta(days=7)).replace(hour=2, minute=0, second=0, microsecond=0)
        second_start = (now + timedelta(days=8)).replace(hour=3, minute=0, second=0, microsecond=0)
        _ensure_reservation(
            session,
            code="DEV-SEED-APPROVED",
            facility=facilities[0],
            student=blocking_student,
            organization_unit=bem,
            status=ReservationStatus.approved,
            activity_title="Seminar Karier",
            starts_at=first_start,
            ends_at=first_start + timedelta(hours=2),
        )
        _ensure_reservation(
            session,
            code="DEV-SEED-PENDING",
            facility=facilities[1],
            student=blocking_student,
            organization_unit=himalkom,
            status=ReservationStatus.pending_document_upload,
            activity_title="Workshop Kewirausahaan",
            starts_at=second_start,
            ends_at=second_start + timedelta(hours=2),
        )

        _remove_demo_student_reservations(session, demo_student)
        session.commit()


def _ensure_user(
    session,
    *,
    email: str,
    full_name: str,
    role: UserRole,
    nim: str | None = None,
    phone: str | None = None,
) -> User:
    user = session.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(
            email=email,
            password_hash=hash_password(DEMO_PASSWORD),
            full_name=full_name,
            role=role,
            nim=nim,
            phone=phone,
            is_active=True,
        )
        session.add(user)
    user.password_hash = hash_password(DEMO_PASSWORD)
    user.full_name = full_name
    user.role = role
    user.nim = nim
    user.phone = phone
    user.is_active = True
    return user


def _ensure_category(session, *, name: str, slug: str, icon_hint: str | None) -> FacilityCategory:
    category = session.scalar(select(FacilityCategory).where(FacilityCategory.name == name))
    if category is None:
        category = FacilityCategory(name=name, slug=slug, icon_hint=icon_hint, is_active=True)
        session.add(category)
    category.slug = slug
    category.icon_hint = icon_hint
    category.is_active = True
    return category


def _ensure_facility(
    session,
    *,
    category: FacilityCategory,
    name: str,
    location: str,
    capacity: int,
    description: str,
    contact_name: str,
    contact_phone: str,
    contact_email: str,
    price_rupiah: int,
    open_hours_summary: str,
) -> Facility:
    facility = session.scalar(select(Facility).where(Facility.name == name))
    if facility is None:
        facility = Facility(name=name, category=category)
        session.add(facility)
    facility.category = category
    facility.location = location
    facility.capacity = capacity
    facility.description = description
    facility.contact_name = contact_name
    facility.contact_phone = contact_phone
    facility.contact_email = contact_email
    facility.price_rupiah = price_rupiah
    facility.payment_instructions = "Ikuti instruksi pembayaran dari TU fasilitas setelah reservasi disetujui."
    facility.open_hours_summary = open_hours_summary
    facility.rating_average = None
    facility.review_count = 0
    facility.is_active = True
    return facility


def _ensure_image(
    session,
    *,
    facility: Facility,
    url: str,
    alt_text: str,
    display_order: int,
    is_cover: bool,
) -> FacilityImage:
    image = session.scalar(select(FacilityImage).where(FacilityImage.facility == facility, FacilityImage.url == url))
    if image is None:
        image = FacilityImage(facility=facility, url=url)
        session.add(image)
    image.alt_text = alt_text
    image.display_order = display_order
    image.is_cover = is_cover
    image.is_active = True
    return image


def _ensure_open_hour(
    session,
    *,
    facility: Facility,
    day_of_week: int,
    opens_at: time,
    closes_at: time,
) -> FacilityOpenHour:
    open_hour = session.scalar(
        select(FacilityOpenHour).where(
            FacilityOpenHour.facility == facility,
            FacilityOpenHour.day_of_week == day_of_week,
            FacilityOpenHour.opens_at == opens_at,
            FacilityOpenHour.closes_at == closes_at,
        )
    )
    if open_hour is None:
        open_hour = FacilityOpenHour(
            facility=facility,
            day_of_week=day_of_week,
            opens_at=opens_at,
            closes_at=closes_at,
        )
        session.add(open_hour)
    return open_hour


def _ensure_organization_unit(session, *, name: str, unit_type: str, code: str) -> OrganizationUnit:
    organization_unit = session.scalar(select(OrganizationUnit).where(OrganizationUnit.name == name))
    if organization_unit is None:
        organization_unit = OrganizationUnit(name=name)
        session.add(organization_unit)
    organization_unit.type = unit_type
    organization_unit.code = code
    organization_unit.is_active = True
    return organization_unit


def _ensure_staff_assignment(session, *, facility: Facility, staff: User) -> FacilityStaffAssignment:
    assignment = session.scalar(
        select(FacilityStaffAssignment).where(
            FacilityStaffAssignment.facility == facility,
            FacilityStaffAssignment.staff == staff,
        )
    )
    if assignment is None:
        assignment = FacilityStaffAssignment(facility=facility, staff=staff)
        session.add(assignment)
    return assignment


def _ensure_reservation(
    session,
    *,
    code: str,
    facility: Facility,
    student: User,
    organization_unit: OrganizationUnit,
    status: ReservationStatus,
    activity_title: str,
    starts_at: datetime,
    ends_at: datetime,
) -> Reservation:
    reservation = session.scalar(select(Reservation).where(Reservation.reservation_code == code))
    if reservation is None:
        reservation = Reservation(reservation_code=code)
        session.add(reservation)
    reservation.facility = facility
    reservation.student = student
    reservation.organization_unit = organization_unit
    reservation.activity_title = activity_title
    reservation.event_description = "Seeded public calendar reservation for local frontend development."
    reservation.participant_count = min(facility.capacity, 80)
    reservation.contact_phone = "081234599999"
    reservation.price_rupiah = facility.price_rupiah
    reservation.organization_unit_name = organization_unit.name
    reservation.extra_requirement_av_support = False
    reservation.extra_requirement_logistics_coordination = False
    reservation.extra_requirement_extra_cleaning = False
    reservation.extra_requirement_security_personnel = False
    reservation.extra_requirement_notes = None
    reservation.starts_at = starts_at
    reservation.ends_at = ends_at
    reservation.status = status
    return reservation


def _remove_demo_student_reservations(session, demo_student: User) -> None:
    for reservation in session.scalars(select(Reservation).where(Reservation.student == demo_student)):
        session.delete(reservation)


def main() -> int:
    try:
        seed_development_data()
    except ProductionSeedRefused as exc:
        print(str(exc))
        return 1
    print("Development seed data loaded.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
