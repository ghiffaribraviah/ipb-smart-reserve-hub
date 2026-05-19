import os
from datetime import UTC, datetime, time, timedelta

from sqlalchemy import inspect, select, text

from app.core.database import Base, build_session_factory
from app.core.security import hash_password
from app.core.settings import SettingsModule
from app.models import (
    AuditLog,
    Facility,
    FacilityCategory,
    FacilityImage,
    FacilityOpenHour,
    FacilityReview,
    FacilityStaffAssignment,
    Notification,
    OrganizationUnit,
    Reservation,
    ReservationApprovalLetter,
    ReservationPaymentReceipt,
    ReservationRejectionSource,
    ReservationSignedApprovalLetter,
    ReservationStatus,
    User,
    UserRole,
)


DEMO_PASSWORD = "demo12345"

DEMO_USERS = [
    {
        "email": "demo.admin@ipb.ac.id",
        "full_name": "Demo Super Admin",
        "role": UserRole.super_admin,
    },
    {
        "email": "demo.staff.operations@ipb.ac.id",
        "full_name": "Demo Staff Operasional",
        "role": UserRole.staff,
    },
    {
        "email": "demo.staff.facilities@ipb.ac.id",
        "full_name": "Demo Staff Fasilitas",
        "role": UserRole.staff,
    },
    {
        "email": "demo.staff.finance@ipb.ac.id",
        "full_name": "Demo Staff Keuangan",
        "role": UserRole.staff,
    },
    {
        "email": "demo.student@apps.ipb.ac.id",
        "full_name": "Demo Student",
        "role": UserRole.student,
        "nim": "G64000001",
        "phone": "081234500001",
    },
    {
        "email": "demo.student.06@apps.ipb.ac.id",
        "legacy_email": "demo.blocking@apps.ipb.ac.id",
        "full_name": "Demo Student Reservasi",
        "role": UserRole.student,
        "nim": "G64000002",
        "phone": "081234500002",
    },
    {
        "email": "demo.student.02@apps.ipb.ac.id",
        "full_name": "Demo Student 02",
        "role": UserRole.student,
        "nim": "G64000003",
        "phone": "081234500003",
    },
    {
        "email": "demo.student.03@apps.ipb.ac.id",
        "full_name": "Demo Student 03",
        "role": UserRole.student,
        "nim": "G64000004",
        "phone": "081234500004",
    },
    {
        "email": "demo.student.04@apps.ipb.ac.id",
        "full_name": "Demo Student 04",
        "role": UserRole.student,
        "nim": "G64000005",
        "phone": "081234500005",
    },
    {
        "email": "demo.student.05@apps.ipb.ac.id",
        "full_name": "Demo Student 05",
        "role": UserRole.student,
        "nim": "G64000006",
        "phone": "081234500006",
    },
]


class ProductionSeedRefused(Exception):
    pass


def seed_development_data(*, settings: SettingsModule | None = None, environment: str | None = None) -> None:
    seed_environment = environment if environment is not None else os.environ.get("IPB_ENVIRONMENT")
    if seed_environment == "production":
        raise ProductionSeedRefused("Development seed data cannot be loaded in production.")

    app_settings = settings or SettingsModule.from_environment()
    session_factory = build_session_factory(app_settings.database_url)
    engine = session_factory.kw["bind"]
    Base.metadata.create_all(bind=engine)
    _ensure_seed_compatible_schema(engine)

    with session_factory() as session:
        users_by_email = {user.email: user for user in (_ensure_user(session, **user_data) for user_data in DEMO_USERS)}
        demo_student = users_by_email["demo.student@apps.ipb.ac.id"]
        reservation_student = users_by_email["demo.student.06@apps.ipb.ac.id"]
        operations_staff = users_by_email["demo.staff.operations@ipb.ac.id"]
        facilities_staff = users_by_email["demo.staff.facilities@ipb.ac.id"]
        finance_staff = users_by_email["demo.staff.finance@ipb.ac.id"]

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
        laboratorium = _ensure_category(
            session,
            name="Laboratorium",
            slug="laboratorium",
            icon_hint="flask-conical",
        )
        area_terbuka = _ensure_category(
            session,
            name="Area Terbuka",
            slug="area-terbuka",
            icon_hint="trees",
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
            _ensure_facility(
                session,
                category=auditorium,
                name="Auditorium Fakultas Ekonomi dan Manajemen",
                location="FEM Kampus IPB Dramaga",
                capacity=260,
                description="Auditorium fakultas untuk seminar, sidang terbuka, dan kuliah tamu.",
                contact_name="TU FEM",
                contact_phone="0251-8626545",
                contact_email="fem-auditorium@ipb.ac.id",
                price_rupiah=100000,
                open_hours_summary="Senin-Jumat 08.00-16.00",
            ),
            _ensure_facility(
                session,
                category=auditorium,
                name="Gedung Kuliah Bersama Auditorium",
                location="Kampus IPB Dramaga",
                capacity=320,
                description="Ruang auditorium GKB untuk kegiatan lintas departemen dan orientasi mahasiswa.",
                contact_name="Pengelola GKB",
                contact_phone="0251-8627111",
                contact_email="gkb@ipb.ac.id",
                price_rupiah=0,
                open_hours_summary="Senin-Jumat 07.30-16.30",
            ),
            _ensure_facility(
                session,
                category=ruang_kelas,
                name="Ruang Kelas CCR 2.03",
                location="Common Class Room",
                capacity=60,
                description="Ruang kelas sedang dengan proyektor untuk workshop dan kelas tambahan.",
                contact_name="Admin CCR",
                contact_phone="0251-8627203",
                contact_email="ccr@ipb.ac.id",
                price_rupiah=0,
                open_hours_summary="Senin-Jumat 07.00-17.00",
            ),
            _ensure_facility(
                session,
                category=ruang_kelas,
                name="Ruang Diskusi Perpustakaan LSI",
                location="Perpustakaan LSI IPB",
                capacity=24,
                description="Ruang diskusi kecil untuk kelompok riset, tutorial, dan rapat organisasi.",
                contact_name="Layanan Perpustakaan",
                contact_phone="0251-8623712",
                contact_email="library@ipb.ac.id",
                price_rupiah=0,
                open_hours_summary="Senin-Sabtu 08.00-19.00",
            ),
            _ensure_facility(
                session,
                category=olahraga,
                name="Lapangan Futsal Outdoor",
                location="Student Center IPB",
                capacity=80,
                description="Lapangan futsal terbuka untuk latihan rutin dan turnamen mahasiswa.",
                contact_name="Pengelola Student Center",
                contact_phone="0251-8623555",
                contact_email="studentcenter@ipb.ac.id",
                price_rupiah=125000,
                open_hours_summary="Senin-Minggu 07.00-21.00",
            ),
            _ensure_facility(
                session,
                category=laboratorium,
                name="Laboratorium Komputer Departemen Ilmu Komputer",
                location="FMIPA IPB Dramaga",
                capacity=40,
                description="Laboratorium komputer untuk praktikum, pelatihan pemrograman, dan ujian berbasis komputer.",
                contact_name="Admin Lab Ilkom",
                contact_phone="0251-8625584",
                contact_email="lab-ilkom@ipb.ac.id",
                price_rupiah=0,
                open_hours_summary="Senin-Jumat 08.00-17.00",
            ),
            _ensure_facility(
                session,
                category=laboratorium,
                name="Laboratorium Bahasa",
                location="Gedung Kuliah Bersama",
                capacity=36,
                description="Laboratorium bahasa dengan perangkat audio untuk pelatihan komunikasi dan tes bahasa.",
                contact_name="Admin Lab Bahasa",
                contact_phone="0251-8627336",
                contact_email="lab-bahasa@ipb.ac.id",
                price_rupiah=75000,
                open_hours_summary="Senin-Jumat 08.00-16.00",
            ),
            _ensure_facility(
                session,
                category=area_terbuka,
                name="Plaza Rektorat",
                location="Kampus IPB Dramaga",
                capacity=600,
                description="Area terbuka untuk pameran, festival kampus, dan kegiatan seremoni.",
                contact_name="Biro Umum",
                contact_phone="0251-8621001",
                contact_email="biro-umum@ipb.ac.id",
                price_rupiah=0,
                open_hours_summary="Senin-Minggu 06.00-22.00",
            ),
            _ensure_facility(
                session,
                category=area_terbuka,
                name="Taman Koleksi Kampus",
                location="Kampus IPB Baranangsiang",
                capacity=150,
                description="Ruang hijau untuk kegiatan komunitas, pameran kecil, dan diskusi luar ruang.",
                contact_name="Pengelola Baranangsiang",
                contact_phone="0251-8329101",
                contact_email="baranangsiang@ipb.ac.id",
                price_rupiah=50000,
                open_hours_summary="Senin-Sabtu 07.00-18.00",
            ),
            _ensure_facility(
                session,
                category=olahraga,
                name="Lapangan Tenis IPB",
                location="Gymnasium IPB",
                capacity=40,
                description="Lapangan tenis untuk latihan unit kegiatan mahasiswa dan kegiatan sivitas akademika.",
                contact_name="Pengelola Gymnasium",
                contact_phone="0251-8623000",
                contact_email="gymnasium@ipb.ac.id",
                price_rupiah=100000,
                open_hours_summary="Senin-Sabtu 07.00-20.00",
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
        _ensure_organization_unit(
            session,
            name="Paduan Suara Mahasiswa Agria Swara",
            unit_type="student_activity_unit",
            code="AGRIASWARA",
        )
        _ensure_organization_unit(
            session,
            name="UKM Pramuka IPB",
            unit_type="student_activity_unit",
            code="PRAMUKA",
        )
        _ensure_organization_unit(
            session,
            name="Himpunan Mahasiswa Agronomi",
            unit_type="student_organization",
            code="HIMAGRON",
        )
        session.flush()
        staff_rotation = [operations_staff, facilities_staff, finance_staff]
        for index, facility in enumerate(facilities):
            _ensure_staff_assignment(session, facility=facility, staff=staff_rotation[index % len(staff_rotation)])

        now = datetime.now(UTC)
        first_start = (now + timedelta(days=7)).replace(hour=2, minute=0, second=0, microsecond=0)
        second_start = (now + timedelta(days=8)).replace(hour=3, minute=0, second=0, microsecond=0)
        completed_start = first_start - timedelta(days=14)
        seeded_reservations = [
            _ensure_reservation(
                session,
                code="DEV-SEED-APPROVED",
                facility=facilities[0],
                student=reservation_student,
                organization_unit=bem,
                status=ReservationStatus.approved,
                activity_title="Seminar Karier",
                starts_at=first_start,
                ends_at=first_start + timedelta(hours=2),
            ),
            _ensure_reservation(
                session,
                code="DEV-SEED-PENDING",
                facility=facilities[1],
                student=reservation_student,
                organization_unit=himalkom,
                status=ReservationStatus.pending_document_upload,
                activity_title="Workshop Kewirausahaan",
                starts_at=second_start,
                ends_at=second_start + timedelta(hours=2),
                document_upload_due_at=now + timedelta(days=1),
            ),
            _ensure_reservation(
                session,
                code="DEV-SEED-DOCUMENT-REVIEW",
                facility=facilities[0],
                student=reservation_student,
                organization_unit=bem,
                status=ReservationStatus.pending_document_review,
                activity_title="Review Surat UKM",
                starts_at=first_start + timedelta(days=2),
                ends_at=first_start + timedelta(days=2, hours=2),
                document_verification_due_at=now + timedelta(days=2),
                signed_letter=True,
            ),
            _ensure_reservation(
                session,
                code="DEV-SEED-PAYMENT-PENDING",
                facility=facilities[1],
                student=reservation_student,
                organization_unit=himalkom,
                status=ReservationStatus.pending_payment,
                activity_title="Forum Berbayar Menunggu Upload",
                starts_at=first_start + timedelta(days=3),
                ends_at=first_start + timedelta(days=3, hours=2),
                payment_upload_due_at=now + timedelta(days=3),
                signed_letter=True,
            ),
            _ensure_reservation(
                session,
                code="DEV-SEED-PAYMENT-REVIEW",
                facility=facilities[2],
                student=reservation_student,
                organization_unit=bem,
                status=ReservationStatus.pending_payment,
                activity_title="Turnamen Basket Menunggu Review",
                starts_at=first_start + timedelta(days=4),
                ends_at=first_start + timedelta(days=4, hours=2),
                payment_verification_due_at=now + timedelta(days=4),
                signed_letter=True,
                payment_receipt=True,
            ),
            _ensure_reservation(
                session,
                code="DEV-SEED-CANCELLATION",
                facility=facilities[0],
                student=reservation_student,
                organization_unit=bem,
                status=ReservationStatus.cancelled,
                activity_title="Kegiatan Dibatalkan Mahasiswa",
                starts_at=first_start + timedelta(days=5),
                ends_at=first_start + timedelta(days=5, hours=2),
                cancellation_reason="Jadwal kegiatan dipindahkan oleh organisasi.",
            ),
            _ensure_reservation(
                session,
                code="DEV-SEED-COMPLETED",
                facility=facilities[2],
                student=reservation_student,
                organization_unit=himalkom,
                status=ReservationStatus.completed,
                activity_title="Kegiatan Selesai Dengan Ulasan",
                starts_at=completed_start,
                ends_at=completed_start + timedelta(hours=2),
                payment_receipt=True,
                review=True,
            ),
            _ensure_reservation(
                session,
                code="DEV-SEED-DOCUMENT-REJECTED",
                facility=facilities[0],
                student=reservation_student,
                organization_unit=bem,
                status=ReservationStatus.rejected,
                activity_title="Surat Ditolak",
                starts_at=first_start + timedelta(days=6),
                ends_at=first_start + timedelta(days=6, hours=2),
                rejection_reason="Surat belum ditandatangani pembina.",
                rejection_source=ReservationRejectionSource.document,
                signed_letter=True,
            ),
            _ensure_reservation(
                session,
                code="DEV-SEED-PAYMENT-REJECTED",
                facility=facilities[2],
                student=reservation_student,
                organization_unit=himalkom,
                status=ReservationStatus.rejected,
                activity_title="Pembayaran Ditolak",
                starts_at=first_start + timedelta(days=7),
                ends_at=first_start + timedelta(days=7, hours=2),
                rejection_reason="Nominal transfer tidak sesuai.",
                rejection_source=ReservationRejectionSource.payment,
                signed_letter=True,
                payment_receipt=True,
            ),
        ]

        _remove_demo_student_reservations(session, demo_student)
        _remove_unlisted_seed_reservations(
            session,
            {reservation.reservation_code for reservation in seeded_reservations},
        )
        session.flush()
        _ensure_seed_notifications(session, reservation_student, seeded_reservations[:3], now=now)
        _ensure_seed_audit_logs(session, operations_staff, seeded_reservations[:3], now=now)
        session.commit()


def _ensure_seed_compatible_schema(engine) -> None:
    if engine.dialect.name != "sqlite":
        return

    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    with engine.begin() as connection:
        if "facility_categories" in tables:
            columns = _column_names(inspector, "facility_categories")
            if "slug" not in columns:
                connection.execute(text("ALTER TABLE facility_categories ADD COLUMN slug VARCHAR(255)"))
            if "icon_hint" not in columns:
                connection.execute(text("ALTER TABLE facility_categories ADD COLUMN icon_hint VARCHAR(64)"))

        if "reservations" in tables:
            columns = _column_names(inspector, "reservations")
            if "extra_requirement_av_support" not in columns:
                connection.execute(
                    text("ALTER TABLE reservations ADD COLUMN extra_requirement_av_support BOOLEAN NOT NULL DEFAULT 0")
                )
            if "extra_requirement_logistics_coordination" not in columns:
                connection.execute(
                    text(
                        "ALTER TABLE reservations "
                        "ADD COLUMN extra_requirement_logistics_coordination BOOLEAN NOT NULL DEFAULT 0"
                    )
                )
            if "extra_requirement_extra_cleaning" not in columns:
                connection.execute(
                    text(
                        "ALTER TABLE reservations "
                        "ADD COLUMN extra_requirement_extra_cleaning BOOLEAN NOT NULL DEFAULT 0"
                    )
                )
            if "extra_requirement_security_personnel" not in columns:
                connection.execute(
                    text(
                        "ALTER TABLE reservations "
                        "ADD COLUMN extra_requirement_security_personnel BOOLEAN NOT NULL DEFAULT 0"
                    )
                )
            if "extra_requirement_notes" not in columns:
                connection.execute(text("ALTER TABLE reservations ADD COLUMN extra_requirement_notes TEXT"))
            if "rejection_source" not in columns:
                connection.execute(text("ALTER TABLE reservations ADD COLUMN rejection_source VARCHAR(32)"))


def _column_names(inspector, table_name: str) -> set[str]:
    return {column["name"] for column in inspector.get_columns(table_name)}


def _ensure_user(
    session,
    *,
    email: str,
    full_name: str,
    role: UserRole,
    nim: str | None = None,
    phone: str | None = None,
    legacy_email: str | None = None,
) -> User:
    user = session.scalar(select(User).where(User.email == email))
    if user is None and legacy_email is not None:
        user = session.scalar(select(User).where(User.email == legacy_email))
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
    user.email = email
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
    document_upload_due_at: datetime | None = None,
    document_verification_due_at: datetime | None = None,
    payment_upload_due_at: datetime | None = None,
    payment_verification_due_at: datetime | None = None,
    rejection_reason: str | None = None,
    rejection_source: ReservationRejectionSource | None = None,
    cancellation_reason: str | None = None,
    signed_letter: bool = False,
    payment_receipt: bool = False,
    review: bool = False,
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
    reservation.document_upload_due_at = document_upload_due_at
    reservation.document_verification_due_at = document_verification_due_at
    reservation.payment_upload_due_at = payment_upload_due_at
    reservation.payment_verification_due_at = payment_verification_due_at
    reservation.status = status
    reservation.rejection_reason = rejection_reason
    reservation.rejection_source = rejection_source
    reservation.cancellation_reason = cancellation_reason
    reservation.cancellation_rejection_reason = None
    if signed_letter:
        _ensure_approval_letter(reservation, generated_at=starts_at - timedelta(days=3))
        _ensure_signed_letter(reservation, uploaded_at=starts_at - timedelta(days=2))
        session.add(reservation.approval_letter)
        session.add(reservation.signed_approval_letter)
    else:
        reservation.approval_letter = None
        reservation.signed_approval_letter = None
    if payment_receipt:
        _ensure_payment_receipt(reservation, uploaded_at=starts_at - timedelta(days=1))
        session.add(reservation.payment_receipt)
    else:
        reservation.payment_receipt = None
    if review:
        _ensure_review(reservation, created_at=ends_at + timedelta(hours=4))
        session.add(reservation.review)
    else:
        reservation.review = None
    return reservation


def _remove_demo_student_reservations(session, demo_student: User) -> None:
    for reservation in session.scalars(select(Reservation).where(Reservation.student == demo_student)):
        session.delete(reservation)


def _remove_unlisted_seed_reservations(session, current_codes: set[str]) -> None:
    for reservation in session.scalars(
        select(Reservation).where(
            Reservation.reservation_code.like("DEV-SEED-%"),
            Reservation.reservation_code.not_in(current_codes),
        )
    ):
        session.delete(reservation)


def _ensure_approval_letter(reservation: Reservation, *, generated_at: datetime) -> ReservationApprovalLetter:
    storage_key = f"dev-seed/approval-letters/{reservation.reservation_code}.pdf"
    if reservation.approval_letter is None:
        reservation.approval_letter = ReservationApprovalLetter(
            reservation=reservation,
            storage_key=storage_key,
            filename=f"{reservation.reservation_code}-surat-persetujuan.pdf",
            content_type="application/pdf",
            size_bytes=33,
            generated_at=generated_at,
        )
    reservation.approval_letter.storage_key = storage_key
    reservation.approval_letter.filename = f"{reservation.reservation_code}-surat-persetujuan.pdf"
    reservation.approval_letter.content_type = "application/pdf"
    reservation.approval_letter.size_bytes = 33
    reservation.approval_letter.generated_at = generated_at
    return reservation.approval_letter


def _ensure_signed_letter(reservation: Reservation, *, uploaded_at: datetime) -> ReservationSignedApprovalLetter:
    storage_key = f"dev-seed/signed-approval-letters/{reservation.reservation_code}.pdf"
    if reservation.signed_approval_letter is None:
        reservation.signed_approval_letter = ReservationSignedApprovalLetter(
            reservation=reservation,
            storage_key=storage_key,
            filename=f"{reservation.reservation_code}-signed.pdf",
            content_type="application/pdf",
            size_bytes=37,
            uploaded_at=uploaded_at,
        )
    reservation.signed_approval_letter.storage_key = storage_key
    reservation.signed_approval_letter.filename = f"{reservation.reservation_code}-signed.pdf"
    reservation.signed_approval_letter.content_type = "application/pdf"
    reservation.signed_approval_letter.size_bytes = 37
    reservation.signed_approval_letter.uploaded_at = uploaded_at
    return reservation.signed_approval_letter


def _ensure_payment_receipt(reservation: Reservation, *, uploaded_at: datetime) -> ReservationPaymentReceipt:
    storage_key = f"dev-seed/payment-receipts/{reservation.reservation_code}.png"
    if reservation.payment_receipt is None:
        reservation.payment_receipt = ReservationPaymentReceipt(
            reservation=reservation,
            storage_key=storage_key,
            filename=f"{reservation.reservation_code}-receipt.png",
            content_type="image/png",
            size_bytes=35,
            uploaded_at=uploaded_at,
        )
    reservation.payment_receipt.storage_key = storage_key
    reservation.payment_receipt.filename = f"{reservation.reservation_code}-receipt.png"
    reservation.payment_receipt.content_type = "image/png"
    reservation.payment_receipt.size_bytes = 35
    reservation.payment_receipt.uploaded_at = uploaded_at
    return reservation.payment_receipt


def _ensure_review(reservation: Reservation, *, created_at: datetime) -> FacilityReview:
    if reservation.review is None:
        reservation.review = FacilityReview(
            reservation=reservation,
            facility=reservation.facility,
            student=reservation.student,
            rating=5,
            comment="Fasilitas siap pakai dan proses peminjaman jelas.",
            is_deleted=False,
            created_at=created_at,
        )
    reservation.review.facility = reservation.facility
    reservation.review.student = reservation.student
    reservation.review.rating = 5
    reservation.review.comment = "Fasilitas siap pakai dan proses peminjaman jelas."
    reservation.review.is_deleted = False
    reservation.review.deleted_by = None
    reservation.review.deleted_at = None
    reservation.review.admin_removal_reason = None
    reservation.review.created_at = created_at
    return reservation.review


def _ensure_seed_notifications(
    session,
    student: User,
    reservations: list[Reservation],
    *,
    now: datetime,
) -> None:
    existing = {
        notification.title
        for notification in session.scalars(select(Notification).where(Notification.recipient == student))
    }
    for index, reservation in enumerate(reservations, start=1):
        title = f"Demo seed: {reservation.activity_title}"
        if title in existing:
            continue
        session.add(
            Notification(
                recipient=student,
                reservation=reservation,
                title=title,
                message=f"Data demo untuk testing {reservation.reservation_code}.",
                created_at=now - timedelta(minutes=index),
            )
        )


def _ensure_seed_audit_logs(
    session,
    actor: User,
    reservations: list[Reservation],
    *,
    now: datetime,
) -> None:
    existing = {
        audit_log.target_id
        for audit_log in session.scalars(
            select(AuditLog).where(
                AuditLog.actor == actor,
                AuditLog.action_type == "dev_seed.loaded",
            )
        )
    }
    for index, reservation in enumerate(reservations, start=1):
        if reservation.id in existing:
            continue
        session.add(
            AuditLog(
                actor=actor,
                actor_email=actor.email,
                action_type="dev_seed.loaded",
                target_type="reservation",
                target_id=reservation.id,
                facility=reservation.facility,
                student=reservation.student,
                reservation=reservation,
                created_at=now - timedelta(minutes=index),
            )
        )


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
