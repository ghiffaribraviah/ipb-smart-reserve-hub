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
    ApprovalLetterNumberSequence,
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
_seed_letter_serials: dict[tuple[int, str], int] = {}

DEV_FACILITY_IMAGE_URLS_BY_NAME = {
    "Auditorium Andi Hakim Nasoetion": (
        "https://www.ipb.ac.id/wp-content/uploads/2026/05/"
        "fem-ipb-university-hadirkan-wamenkeu-dan-ketua-dewan-komisioner-lps-"
        "dalam-ministerial-and-top-executive-lecture-series.jpg-770x400.jpeg",
        "https://www.ipb.ac.id/wp-content/uploads/2026/05/"
        "ipb-university-dan-kemdiktisaintek-gelar-seleksi-bersama-prime-step-2026-"
        "untuk-pengembangan-inovasi-dan-startup-.jpg-770x400.jpeg",
    ),
    "Ruang Sidang Rektorat": (
        "https://www.ipb.ac.id/wp-content/uploads/2023/07/"
        "gedung-startup-center-stp-ipb-university-siap-menerima-tenant-program-inkubasi-bisnis-news.png",
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_3608_681c4971-6fed-4387-805d-e8c5b33465ef.jpg",
    ),
    "Lapangan Basket Indoor": (
        "https://cdn.ipb.ac.id/inventori/FotoOrsen_1_16b15580-d654-46a8-9fa1-5378e2fbb7a4.jpg",
        "https://www.ipb.ac.id/wp-content/uploads/2025/09/DJI_0174-scaled.jpg",
    ),
    "Auditorium Fakultas Ekonomi dan Manajemen": (
        "https://www.ipb.ac.id/wp-content/uploads/2023/11/FEM.jpg",
        "https://www.ipb.ac.id/wp-content/uploads/2025/06/"
        "LKST-IPB-University-Fasilitasi-25-Startup-Melalui-Program-Inkubasi-Bisnis-Tahun-2025.jpg",
    ),
    "Gedung Kuliah Bersama Auditorium": (
        "https://www.ipb.ac.id/wp-content/uploads/2025/05/"
        "LKST-IPB-University-Seleksi-44-Calon-Startup-Program-Inkubasi-Bisnis-Tahun-2025.jpg",
        "https://www.ipb.ac.id/wp-content/uploads/2024/12/"
        "LKST-IPB-University-Gelar-Business-Matching-20-Startup-Paparkan-Potensi-Bisnis.jpg",
    ),
    "Ruang Kelas CCR 2.03": (
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_3608_031e62b7-50d3-439a-9fce-bcfd6499eff6.jpg",
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_3608_888bd492-3ec1-4bbc-ac95-266ba43fbedd.jpg",
    ),
    "Ruang Diskusi Perpustakaan LSI": (
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_3611_dff98d69-7739-4fb2-9592-0437eed5d8bb.jpg",
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_3611_7c5c71a4-b86b-424e-b07d-786e3f315a47.jpg",
    ),
    "Lapangan Futsal Outdoor": (
        "https://www.ipb.ac.id/wp-content/uploads/2025/09/DJI_0153-scaled.jpg",
        "https://www.ipb.ac.id/wp-content/uploads/2025/09/DJI_0182-scaled.jpg",
    ),
    "Laboratorium Komputer Departemen Ilmu Komputer": (
        "https://cs.ipb.ac.id/wp-content/uploads/2015/06/IMG_5247-1024x682.jpg",
        "https://www.ipb.ac.id/wp-content/uploads/2023/11/FMIPA.jpg",
    ),
    "Laboratorium Bahasa": (
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_3607_1884829b-d075-475c-98ff-89fd668dc829.jpg",
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_3607_acb96d48-57a0-4a99-b358-78dde9d6f717.jpg",
    ),
    "Plaza Rektorat": (
        "https://www.ipb.ac.id/wp-content/uploads/2025/09/Danau-SGDS-770x400.jpg",
        "https://www.ipb.ac.id/wp-content/uploads/2025/09/DJI_0170-scaled.jpg",
    ),
    "Taman Koleksi Kampus": (
        "https://museum.ipb.ac.id/wp-content/uploads/2023/05/Taman-Inovasi.webp",
        "https://museum.ipb.ac.id/wp-content/uploads/2023/05/Taman-kehati-Telaga-Inspirasi.jpg",
    ),
    "Lapangan Tenis IPB": (
        "https://www.ipb.ac.id/wp-content/uploads/2026/03/Cuplikan-layar-2026-03-31-141033.png",
        "https://www.ipb.ac.id/wp-content/uploads/2026/03/Cuplikan-layar-2026-03-31-141053.png",
    ),
}

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
    _reset_seed_letter_serials()

    with session_factory() as session:
        users_by_email = {user.email: user for user in (_ensure_user(session, **user_data) for user_data in DEMO_USERS)}
        demo_student = users_by_email["demo.student@apps.ipb.ac.id"]
        reservation_student = users_by_email["demo.student.06@apps.ipb.ac.id"]
        student_02 = users_by_email["demo.student.02@apps.ipb.ac.id"]
        student_03 = users_by_email["demo.student.03@apps.ipb.ac.id"]
        student_04 = users_by_email["demo.student.04@apps.ipb.ac.id"]
        student_05 = users_by_email["demo.student.05@apps.ipb.ac.id"]
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
        for facility in facilities:
            cover_image_url, detail_image_url = _facility_image_urls(facility)
            _ensure_image(
                session,
                facility=facility,
                url=cover_image_url,
                alt_text=f"{facility.name} cover",
                display_order=1,
                is_cover=True,
            )
            _ensure_image(
                session,
                facility=facility,
                url=detail_image_url,
                alt_text=f"{facility.name} detail",
                display_order=2,
                is_cover=False,
            )
            _deactivate_fake_seed_images(session, facility=facility)
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
        agria_swara = _ensure_organization_unit(
            session,
            name="Paduan Suara Mahasiswa Agria Swara",
            unit_type="student_activity_unit",
            code="AGRIASWARA",
        )
        pramuka = _ensure_organization_unit(
            session,
            name="UKM Pramuka IPB",
            unit_type="student_activity_unit",
            code="PRAMUKA",
        )
        himagron = _ensure_organization_unit(
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
        seeded_reservations.extend(
            _ensure_production_like_reservations(
                session,
                facilities=facilities,
                students=[student_02, student_03, student_04, student_05],
                organization_units=[bem, himalkom, agria_swara, pramuka, himagron],
                now=now,
                first_start=first_start,
            )
        )

        _remove_demo_student_reservations(session, demo_student)
        _remove_unlisted_seed_reservations(
            session,
            {reservation.reservation_code for reservation in seeded_reservations},
        )
        session.flush()
        _ensure_approval_letter_number_sequences(session)
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

        if "reservation_approval_letters" in tables:
            columns = _column_names(inspector, "reservation_approval_letters")
            if "letter_number" not in columns:
                connection.execute(
                    text(
                        "ALTER TABLE reservation_approval_letters "
                        "ADD COLUMN letter_number VARCHAR(64) NOT NULL DEFAULT 'RSV/IPBSRH/2026/000000'"
                    )
                )


def _column_names(inspector, table_name: str) -> set[str]:
    return {column["name"] for column in inspector.get_columns(table_name)}


def _reset_seed_letter_serials() -> None:
    _seed_letter_serials.clear()


def _ensure_approval_letter_number_sequences(session) -> None:
    next_serial_by_year: dict[int, int] = {}
    for year, _reservation_code in _seed_letter_serials:
        next_serial_by_year[year] = max(next_serial_by_year.get(year, 1), _seed_letter_serials[(year, _reservation_code)] + 1)

    for year, next_serial in next_serial_by_year.items():
        sequence = session.get(ApprovalLetterNumberSequence, year)
        if sequence is None:
            sequence = ApprovalLetterNumberSequence(year=year, next_serial=next_serial)
            session.add(sequence)
        else:
            sequence.next_serial = max(sequence.next_serial, next_serial)


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


def _facility_image_urls(facility: Facility) -> tuple[str, str]:
    return DEV_FACILITY_IMAGE_URLS_BY_NAME[facility.name]


def _deactivate_fake_seed_images(session, *, facility: Facility) -> None:
    fake_images = session.scalars(
        select(FacilityImage).where(
            FacilityImage.facility == facility,
            FacilityImage.url.like("https://cdn.example.test/dev-seed/%"),
        )
    ).all()
    for image in fake_images:
        image.is_active = False


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
    cancellation_rejection_reason: str | None = None,
    signed_letter: bool = False,
    payment_receipt: bool = False,
    review: bool = False,
    review_rating: int = 5,
    review_comment: str = "Fasilitas siap pakai dan proses peminjaman jelas.",
    review_is_deleted: bool = False,
    review_admin_removal_reason: str | None = None,
    event_description: str = "Seeded public calendar reservation for local frontend development.",
    participant_count: int | None = None,
    contact_phone: str = "081234599999",
    extra_requirement_av_support: bool = False,
    extra_requirement_logistics_coordination: bool = False,
    extra_requirement_extra_cleaning: bool = False,
    extra_requirement_security_personnel: bool = False,
    extra_requirement_notes: str | None = None,
) -> Reservation:
    reservation = session.scalar(select(Reservation).where(Reservation.reservation_code == code))
    if reservation is None:
        reservation = Reservation(reservation_code=code)
        session.add(reservation)
    reservation.facility = facility
    reservation.student = student
    reservation.organization_unit = organization_unit
    reservation.activity_title = activity_title
    reservation.event_description = event_description
    reservation.participant_count = participant_count if participant_count is not None else min(facility.capacity, 80)
    reservation.contact_phone = contact_phone
    reservation.price_rupiah = facility.price_rupiah
    reservation.organization_unit_name = organization_unit.name
    reservation.extra_requirement_av_support = extra_requirement_av_support
    reservation.extra_requirement_logistics_coordination = extra_requirement_logistics_coordination
    reservation.extra_requirement_extra_cleaning = extra_requirement_extra_cleaning
    reservation.extra_requirement_security_personnel = extra_requirement_security_personnel
    reservation.extra_requirement_notes = extra_requirement_notes
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
    reservation.cancellation_rejection_reason = cancellation_rejection_reason
    _ensure_approval_letter(reservation, generated_at=starts_at - timedelta(days=3))
    session.add(reservation.approval_letter)
    if signed_letter:
        _ensure_signed_letter(reservation, uploaded_at=starts_at - timedelta(days=2))
        session.add(reservation.signed_approval_letter)
    else:
        reservation.signed_approval_letter = None
    if payment_receipt:
        _ensure_payment_receipt(reservation, uploaded_at=starts_at - timedelta(days=1))
        session.add(reservation.payment_receipt)
    else:
        reservation.payment_receipt = None
    if review:
        _ensure_review(
            reservation,
            created_at=ends_at + timedelta(hours=4),
            rating=review_rating,
            comment=review_comment,
            is_deleted=review_is_deleted,
            admin_removal_reason=review_admin_removal_reason,
        )
        session.add(reservation.review)
    else:
        reservation.review = None
    return reservation


def _ensure_production_like_reservations(
    session,
    *,
    facilities: list[Facility],
    students: list[User],
    organization_units: list[OrganizationUnit],
    now: datetime,
    first_start: datetime,
) -> list[Reservation]:
    specs = [
        {
            "code": "DEV-SEED-PENDING-ORIENTATION",
            "facility_index": 4,
            "student_index": 0,
            "organization_index": 2,
            "status": ReservationStatus.pending_document_upload,
            "activity_title": "Briefing Kepanitiaan Masa Orientasi",
            "start_offset_days": 1,
            "duration_hours": 3,
            "document_upload_due_at": now + timedelta(hours=18),
            "participants": 180,
            "av": True,
            "notes": "Butuh mikrofon wireless dan satu operator proyektor.",
        },
        {
            "code": "DEV-SEED-PENDING-TRAINING",
            "facility_index": 5,
            "student_index": 1,
            "organization_index": 1,
            "status": ReservationStatus.pending_document_upload,
            "activity_title": "Kelas Tambahan Data Science",
            "start_offset_days": 2,
            "duration_hours": 2,
            "document_upload_due_at": now + timedelta(days=1, hours=6),
            "participants": 45,
        },
        {
            "code": "DEV-SEED-PENDING-FESTIVAL",
            "facility_index": 10,
            "student_index": 2,
            "organization_index": 0,
            "status": ReservationStatus.pending_document_upload,
            "activity_title": "Persiapan Festival Kampus",
            "start_offset_days": 9,
            "duration_hours": 5,
            "document_upload_due_at": now + timedelta(days=2),
            "participants": 320,
            "logistics": True,
            "cleaning": True,
            "notes": "Butuh koordinasi kebersihan setelah acara.",
        },
        {
            "code": "DEV-SEED-DOCUMENT-REVIEW-AGRIA",
            "facility_index": 3,
            "student_index": 2,
            "organization_index": 2,
            "status": ReservationStatus.pending_document_review,
            "activity_title": "Gladi Bersih Konser Agria Swara",
            "start_offset_days": 10,
            "duration_hours": 4,
            "document_verification_due_at": now + timedelta(hours=12),
            "signed_letter": True,
            "participants": 210,
            "av": True,
        },
        {
            "code": "DEV-SEED-DOCUMENT-REVIEW-PRAMUKA",
            "facility_index": 11,
            "student_index": 3,
            "organization_index": 3,
            "status": ReservationStatus.pending_document_review,
            "activity_title": "Rapat Besar Gugus Depan",
            "start_offset_days": 11,
            "duration_hours": 3,
            "document_verification_due_at": now + timedelta(days=1),
            "signed_letter": True,
            "participants": 95,
        },
        {
            "code": "DEV-SEED-OVERDUE-DOCUMENT",
            "facility_index": 8,
            "student_index": 1,
            "organization_index": 1,
            "status": ReservationStatus.overdue_verification,
            "activity_title": "Praktikum Tambahan Menunggu Verifikasi",
            "start_offset_days": 12,
            "duration_hours": 3,
            "document_verification_due_at": now - timedelta(hours=6),
            "signed_letter": True,
            "participants": 36,
        },
        {
            "code": "DEV-SEED-PAYMENT-PENDING-FUTSAL",
            "facility_index": 7,
            "student_index": 0,
            "organization_index": 0,
            "status": ReservationStatus.pending_payment,
            "activity_title": "Liga Futsal Antar Fakultas",
            "start_offset_days": 13,
            "duration_hours": 4,
            "payment_upload_due_at": now + timedelta(days=2),
            "signed_letter": True,
            "participants": 70,
        },
        {
            "code": "DEV-SEED-PAYMENT-REVIEW-TENNIS",
            "facility_index": 12,
            "student_index": 3,
            "organization_index": 4,
            "status": ReservationStatus.pending_payment,
            "activity_title": "Klinik Tenis Mahasiswa",
            "start_offset_days": 14,
            "duration_hours": 2,
            "payment_verification_due_at": now + timedelta(days=1, hours=4),
            "signed_letter": True,
            "payment_receipt": True,
            "participants": 32,
        },
        {
            "code": "DEV-SEED-PAYMENT-REVIEW-LANGUAGE",
            "facility_index": 9,
            "student_index": 2,
            "organization_index": 2,
            "status": ReservationStatus.pending_payment,
            "activity_title": "TOEFL Preparation Camp",
            "start_offset_days": 15,
            "duration_hours": 3,
            "payment_verification_due_at": now + timedelta(days=2, hours=5),
            "signed_letter": True,
            "payment_receipt": True,
            "participants": 34,
        },
        {
            "code": "DEV-SEED-APPROVED-EXPO",
            "facility_index": 10,
            "student_index": 0,
            "organization_index": 0,
            "status": ReservationStatus.approved,
            "activity_title": "Expo Karya Mahasiswa",
            "start_offset_days": 16,
            "duration_hours": 6,
            "signed_letter": True,
            "participants": 420,
            "logistics": True,
            "security": True,
        },
        {
            "code": "DEV-SEED-APPROVED-SEMINAR-FEM",
            "facility_index": 3,
            "student_index": 1,
            "organization_index": 4,
            "status": ReservationStatus.approved,
            "activity_title": "Seminar Agribisnis Berkelanjutan",
            "start_offset_days": 17,
            "duration_hours": 3,
            "signed_letter": True,
            "payment_receipt": True,
            "participants": 230,
            "av": True,
        },
        {
            "code": "DEV-SEED-APPROVED-LIBRARY",
            "facility_index": 6,
            "student_index": 3,
            "organization_index": 1,
            "status": ReservationStatus.approved,
            "activity_title": "Diskusi Riset Mahasiswa",
            "start_offset_days": 18,
            "duration_hours": 2,
            "signed_letter": True,
            "participants": 22,
        },
        {
            "code": "DEV-SEED-CANCELLATION-REQUESTED",
            "facility_index": 1,
            "student_index": 0,
            "organization_index": 1,
            "status": ReservationStatus.cancellation_requested,
            "activity_title": "Forum Kepemimpinan Mahasiswa",
            "start_offset_days": 19,
            "duration_hours": 2,
            "signed_letter": True,
            "cancellation_reason": "Narasumber utama berhalangan hadir.",
            "participants": 72,
        },
        {
            "code": "DEV-SEED-CANCELLED-RAIN",
            "facility_index": 11,
            "student_index": 2,
            "organization_index": 3,
            "status": ReservationStatus.cancelled,
            "activity_title": "Latihan Lapangan Terbuka",
            "start_offset_days": 20,
            "duration_hours": 3,
            "cancellation_reason": "Kegiatan luar ruang dipindah karena cuaca.",
            "participants": 80,
        },
        {
            "code": "DEV-SEED-EXPIRED-UPLOAD",
            "facility_index": 5,
            "student_index": 1,
            "organization_index": 4,
            "status": ReservationStatus.expired,
            "activity_title": "Kelas Tamu Yang Tidak Dilanjutkan",
            "start_offset_days": -2,
            "duration_hours": 2,
            "document_upload_due_at": now - timedelta(days=1),
            "participants": 55,
        },
        {
            "code": "DEV-SEED-REJECTED-CAPACITY",
            "facility_index": 6,
            "student_index": 3,
            "organization_index": 0,
            "status": ReservationStatus.rejected,
            "activity_title": "Diskusi Besar Melebihi Kapasitas",
            "start_offset_days": 21,
            "duration_hours": 2,
            "rejection_reason": "Jumlah peserta melebihi kapasitas ruang diskusi.",
            "rejection_source": ReservationRejectionSource.document,
            "signed_letter": True,
            "participants": 75,
        },
        {
            "code": "DEV-SEED-COMPLETED-AGRIA-CONCERT",
            "facility_index": 0,
            "student_index": 2,
            "organization_index": 2,
            "status": ReservationStatus.completed,
            "activity_title": "Konser Mini Agria Swara",
            "start_offset_days": -18,
            "duration_hours": 3,
            "signed_letter": True,
            "review": True,
            "rating": 5,
            "comment": "Akustik auditorium bagus dan staf sigap membantu persiapan panggung.",
            "participants": 300,
        },
        {
            "code": "DEV-SEED-COMPLETED-FUTSAL",
            "facility_index": 7,
            "student_index": 0,
            "organization_index": 0,
            "status": ReservationStatus.completed,
            "activity_title": "Final Liga Futsal Fakultas",
            "start_offset_days": -16,
            "duration_hours": 4,
            "signed_letter": True,
            "payment_receipt": True,
            "review": True,
            "rating": 4,
            "comment": "Lapangan sesuai kebutuhan, hanya area tunggu cukup padat saat pergantian sesi.",
            "participants": 75,
        },
        {
            "code": "DEV-SEED-COMPLETED-LAB",
            "facility_index": 8,
            "student_index": 1,
            "organization_index": 1,
            "status": ReservationStatus.completed,
            "activity_title": "Bootcamp Python Dasar",
            "start_offset_days": -14,
            "duration_hours": 5,
            "signed_letter": True,
            "review": True,
            "rating": 5,
            "comment": "Komputer siap digunakan dan jaringan stabil selama pelatihan.",
            "participants": 38,
        },
        {
            "code": "DEV-SEED-COMPLETED-PLAZA",
            "facility_index": 10,
            "student_index": 0,
            "organization_index": 0,
            "status": ReservationStatus.completed,
            "activity_title": "Pameran Komunitas Hijau",
            "start_offset_days": -12,
            "duration_hours": 6,
            "signed_letter": True,
            "review": True,
            "rating": 4,
            "comment": "Area luas dan mudah diakses, koordinasi listrik perlu dibuat lebih awal.",
            "participants": 360,
        },
        {
            "code": "DEV-SEED-COMPLETED-CLASS",
            "facility_index": 5,
            "student_index": 3,
            "organization_index": 4,
            "status": ReservationStatus.completed,
            "activity_title": "Workshop Penulisan Proposal",
            "start_offset_days": -10,
            "duration_hours": 3,
            "signed_letter": True,
            "review": True,
            "rating": 4,
            "comment": "Ruang kelas nyaman untuk diskusi kelompok kecil.",
            "participants": 52,
        },
        {
            "code": "DEV-SEED-COMPLETED-LANGUAGE",
            "facility_index": 9,
            "student_index": 2,
            "organization_index": 2,
            "status": ReservationStatus.completed,
            "activity_title": "Latihan Debat Bahasa Inggris",
            "start_offset_days": -8,
            "duration_hours": 2,
            "signed_letter": True,
            "payment_receipt": True,
            "review": True,
            "rating": 3,
            "comment": "Perangkat audio cukup membantu, beberapa headset perlu pengecekan ulang.",
            "participants": 32,
        },
        {
            "code": "DEV-SEED-COMPLETED-TENNIS",
            "facility_index": 12,
            "student_index": 1,
            "organization_index": 3,
            "status": ReservationStatus.completed,
            "activity_title": "Latihan Gabungan Tenis",
            "start_offset_days": -6,
            "duration_hours": 2,
            "signed_letter": True,
            "payment_receipt": True,
            "review": True,
            "rating": 4,
            "comment": "Jadwal lapangan jelas dan proses check-in cepat.",
            "participants": 28,
        },
        {
            "code": "DEV-SEED-COMPLETED-LIBRARY-DELETED-REVIEW",
            "facility_index": 6,
            "student_index": 0,
            "organization_index": 1,
            "status": ReservationStatus.completed,
            "activity_title": "Kelompok Baca Riset",
            "start_offset_days": -4,
            "duration_hours": 2,
            "signed_letter": True,
            "review": True,
            "rating": 2,
            "comment": "Komentar ini disembunyikan untuk demo moderasi ulasan.",
            "review_is_deleted": True,
            "admin_removal_reason": "Komentar tidak relevan dengan penggunaan fasilitas.",
            "participants": 20,
        },
        {
            "code": "DEV-SEED-COMPLETED-BASKET",
            "facility_index": 2,
            "student_index": 3,
            "organization_index": 0,
            "status": ReservationStatus.completed,
            "activity_title": "Sparring Basket Mahasiswa",
            "start_offset_days": -3,
            "duration_hours": 3,
            "signed_letter": True,
            "payment_receipt": True,
            "review": True,
            "rating": 5,
            "comment": "Lapangan bersih, pencahayaan baik, dan staf membuka venue tepat waktu.",
            "participants": 90,
        },
        {
            "code": "DEV-SEED-COMPLETED-GKB",
            "facility_index": 4,
            "student_index": 1,
            "organization_index": 4,
            "status": ReservationStatus.completed,
            "activity_title": "Kuliah Tamu Kewirausahaan Sosial",
            "start_offset_days": -2,
            "duration_hours": 3,
            "signed_letter": True,
            "review": True,
            "rating": 5,
            "comment": "Kapasitas auditorium pas untuk kuliah tamu dan layar utama mudah terlihat.",
            "participants": 260,
        },
    ]

    reservations: list[Reservation] = []
    for spec in specs:
        starts_at = first_start + timedelta(days=spec["start_offset_days"])
        starts_at = starts_at.replace(hour=9 + (len(reservations) % 6), minute=0, second=0, microsecond=0)
        facility = facilities[spec["facility_index"]]
        reservations.append(
            _ensure_reservation(
                session,
                code=spec["code"],
                facility=facility,
                student=students[spec["student_index"]],
                organization_unit=organization_units[spec["organization_index"]],
                status=spec["status"],
                activity_title=spec["activity_title"],
                starts_at=starts_at,
                ends_at=starts_at + timedelta(hours=spec["duration_hours"]),
                document_upload_due_at=spec.get("document_upload_due_at"),
                document_verification_due_at=spec.get("document_verification_due_at"),
                payment_upload_due_at=spec.get("payment_upload_due_at"),
                payment_verification_due_at=spec.get("payment_verification_due_at"),
                rejection_reason=spec.get("rejection_reason"),
                rejection_source=spec.get("rejection_source"),
                cancellation_reason=spec.get("cancellation_reason"),
                signed_letter=spec.get("signed_letter", False),
                payment_receipt=spec.get("payment_receipt", False),
                review=spec.get("review", False),
                review_rating=spec.get("rating", 5),
                review_comment=spec.get("comment", "Fasilitas siap pakai dan proses peminjaman jelas."),
                review_is_deleted=spec.get("review_is_deleted", False),
                review_admin_removal_reason=spec.get("admin_removal_reason"),
                participant_count=min(facility.capacity, spec["participants"]),
                extra_requirement_av_support=spec.get("av", False),
                extra_requirement_logistics_coordination=spec.get("logistics", False),
                extra_requirement_extra_cleaning=spec.get("cleaning", False),
                extra_requirement_security_personnel=spec.get("security", False),
                extra_requirement_notes=spec.get("notes"),
                event_description=f"Data demo realistis untuk {spec['activity_title']} oleh {organization_units[spec['organization_index']].name}.",
            )
        )
    return reservations


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
    letter_number = _seed_letter_number(reservation.reservation_code, generated_at=generated_at)
    if reservation.approval_letter is None:
        reservation.approval_letter = ReservationApprovalLetter(
            reservation=reservation,
            storage_key=storage_key,
            letter_number=letter_number,
            filename=f"{reservation.reservation_code}-surat-persetujuan.pdf",
            content_type="application/pdf",
            size_bytes=33,
            generated_at=generated_at,
        )
    reservation.approval_letter.storage_key = storage_key
    reservation.approval_letter.letter_number = letter_number
    reservation.approval_letter.filename = f"{reservation.reservation_code}-surat-persetujuan.pdf"
    reservation.approval_letter.content_type = "application/pdf"
    reservation.approval_letter.size_bytes = 33
    reservation.approval_letter.generated_at = generated_at
    return reservation.approval_letter


def _seed_letter_number(reservation_code: str, *, generated_at: datetime) -> str:
    year = generated_at.year
    key = (year, reservation_code)
    if key not in _seed_letter_serials:
        _seed_letter_serials[key] = len([existing for existing in _seed_letter_serials if existing[0] == year]) + 1
    return f"RSV/IPBSRH/{year}/{_seed_letter_serials[key]:06d}"


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


def _ensure_review(
    reservation: Reservation,
    *,
    created_at: datetime,
    rating: int,
    comment: str,
    is_deleted: bool,
    admin_removal_reason: str | None,
) -> FacilityReview:
    if reservation.review is None:
        reservation.review = FacilityReview(
            reservation=reservation,
            facility=reservation.facility,
            student=reservation.student,
            rating=rating,
            comment=comment,
            is_deleted=is_deleted,
            created_at=created_at,
        )
    reservation.review.facility = reservation.facility
    reservation.review.student = reservation.student
    reservation.review.rating = rating
    reservation.review.comment = comment
    reservation.review.is_deleted = is_deleted
    reservation.review.deleted_by = "super_admin" if is_deleted else None
    reservation.review.deleted_at = created_at + timedelta(hours=1) if is_deleted else None
    reservation.review.admin_removal_reason = admin_removal_reason if is_deleted else None
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
