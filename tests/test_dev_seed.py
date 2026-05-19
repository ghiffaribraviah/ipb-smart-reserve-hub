from collections import Counter
from datetime import UTC, datetime

from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select, text
import pytest

from app.core.database import Base, build_session_factory
from app.core.settings import SettingsModule
from app.dev.seed import DEMO_PASSWORD, ProductionSeedRefused, seed_development_data
from app.main import create_app
from app.models import (
    Facility,
    FacilityCategory,
    FacilityReview,
    FacilityImage,
    FacilityOpenHour,
    FacilityStaffAssignment,
    OrganizationUnit,
    Reservation,
    ReservationPaymentReceipt,
    ReservationRejectionSource,
    ReservationSignedApprovalLetter,
    ReservationStatus,
    User,
    UserRole,
)
from app.repositories.user_repository import SqlAlchemyUserRepository
from app.services.accounts import AllowedStudentEmailDomains, LoginCredentials, UserAccountModule


async def _login(client: AsyncClient, *, email: str) -> str:
    login = await client.post("/auth/login", json={"email": email, "password": DEMO_PASSWORD})
    assert login.status_code == 200
    return login.json()["access_token"]


def test_dev_seed_creates_fixed_demo_accounts_with_login_credentials(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'seed.db'}", secret_key="test-secret")
    session_factory = build_session_factory(settings.database_url)
    Base.metadata.create_all(bind=session_factory.kw["bind"])

    seed_development_data(settings=settings)

    with session_factory() as session:
        users = session.scalars(select(User).order_by(User.email)).all()
        assert [(user.email, user.role) for user in users] == [
            ("demo.admin@ipb.ac.id", UserRole.super_admin),
            ("demo.staff.facilities@ipb.ac.id", UserRole.staff),
            ("demo.staff.finance@ipb.ac.id", UserRole.staff),
            ("demo.staff.operations@ipb.ac.id", UserRole.staff),
            ("demo.student.02@apps.ipb.ac.id", UserRole.student),
            ("demo.student.03@apps.ipb.ac.id", UserRole.student),
            ("demo.student.04@apps.ipb.ac.id", UserRole.student),
            ("demo.student.05@apps.ipb.ac.id", UserRole.student),
            ("demo.student.06@apps.ipb.ac.id", UserRole.student),
            ("demo.student@apps.ipb.ac.id", UserRole.student),
        ]
        assert Counter(user.role for user in users) == Counter(
            {
                UserRole.super_admin: 1,
                UserRole.staff: 3,
                UserRole.student: 6,
            }
        )

        user_accounts = UserAccountModule(
            user_repository=SqlAlchemyUserRepository(session),
            secret_key=settings.secret_key,
            student_email_policy=AllowedStudentEmailDomains(("apps.ipb.ac.id",)),
        )
        session_token = user_accounts.login(
            LoginCredentials(email="demo.student@apps.ipb.ac.id", password=DEMO_PASSWORD)
        )

    assert session_token.access_token


def test_dev_seed_refuses_production_environment(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'seed.db'}", secret_key="test-secret")

    with pytest.raises(ProductionSeedRefused):
        seed_development_data(settings=settings, environment="production")


def test_dev_seed_refuses_production_environment_from_process_env(tmp_path, monkeypatch):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'seed.db'}", secret_key="test-secret")
    monkeypatch.setenv("IPB_ENVIRONMENT", "production")

    with pytest.raises(ProductionSeedRefused):
        seed_development_data(settings=settings)


def test_dev_seed_creates_frontend_reservation_tracer_data(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'seed.db'}", secret_key="test-secret")

    seed_development_data(settings=settings)

    session_factory = build_session_factory(settings.database_url)
    with session_factory() as session:
        demo_student = session.scalar(select(User).where(User.email == "demo.student@apps.ipb.ac.id"))
        reservation_student = session.scalar(select(User).where(User.email == "demo.student.06@apps.ipb.ac.id"))

        facilities = session.scalars(select(Facility).where(Facility.is_active.is_(True))).all()
        assert len(facilities) >= 3
        for facility in facilities:
            assert facility.open_hours_summary
            assert session.scalar(
                select(FacilityImage).where(
                    FacilityImage.facility_id == facility.id,
                    FacilityImage.is_cover.is_(True),
                    FacilityImage.is_active.is_(True),
                )
            )
            assert session.scalar(select(FacilityOpenHour).where(FacilityOpenHour.facility_id == facility.id))

        assert len(session.scalars(select(OrganizationUnit).where(OrganizationUnit.is_active.is_(True))).all()) >= 2
        assert session.scalar(select(FacilityStaffAssignment))
        categories = session.scalars(select(FacilityCategory).order_by(FacilityCategory.name)).all()
        assert [(category.name, category.slug, category.icon_hint) for category in categories] == [
            ("Area Terbuka", "area-terbuka", "trees"),
            ("Auditorium", "auditorium", "presentation"),
            ("Laboratorium", "laboratorium", "flask-conical"),
            ("Olahraga", "olahraga", "dumbbell"),
            ("Ruang Kelas", "ruang-kelas", "school"),
        ]

        demo_student_reservations = session.scalars(
            select(Reservation).where(Reservation.student_id == demo_student.id)
        ).all()
        reservation_student_reservations = session.scalars(
            select(Reservation).where(Reservation.student_id == reservation_student.id)
        ).all()

    assert demo_student_reservations == []
    assert {reservation.status for reservation in reservation_student_reservations} >= {
        ReservationStatus.approved,
        ReservationStatus.pending_document_upload,
    }


def test_dev_seed_creates_richer_facility_catalog_demo_data(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'seed.db'}", secret_key="test-secret")

    seed_development_data(settings=settings)

    session_factory = build_session_factory(settings.database_url)
    with session_factory() as session:
        facilities = session.scalars(select(Facility).where(Facility.is_active.is_(True))).all()
        categories = session.scalars(select(FacilityCategory).where(FacilityCategory.is_active.is_(True))).all()
        organizations = session.scalars(select(OrganizationUnit).where(OrganizationUnit.is_active.is_(True))).all()

        facility_ids = {facility.id for facility in facilities}
        assigned_facility_ids = {
            assignment.facility_id for assignment in session.scalars(select(FacilityStaffAssignment)).all()
        }

        assert len(facilities) >= 12
        assert len(categories) >= 5
        assert len(organizations) >= 5
        assert assigned_facility_ids >= facility_ids

        category_counts = Counter(facility.category.slug for facility in facilities)
        assert min(category_counts.values()) >= 2

        for facility in facilities:
            assert facility.location
            assert facility.capacity > 0
            assert facility.description
            assert facility.open_hours_summary
            assert (
                session.scalar(
                    select(func.count())
                    .select_from(FacilityImage)
                    .where(FacilityImage.facility_id == facility.id, FacilityImage.is_active.is_(True))
                )
                >= 2
            )
            assert (
                session.scalar(
                    select(func.count())
                    .select_from(FacilityOpenHour)
                    .where(FacilityOpenHour.facility_id == facility.id)
                )
                >= 5
            )


@pytest.mark.anyio
async def test_dev_seed_supports_blackbox_student_staff_and_admin_workflows(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'seed.db'}", secret_key="test-secret")
    seed_development_data(settings=settings)
    app = create_app(settings=settings, clock=lambda: datetime(2026, 5, 1, tzinfo=UTC))
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        student_token = await _login(client, email="demo.student.06@apps.ipb.ac.id")
        operations_staff_token = await _login(client, email="demo.staff.operations@ipb.ac.id")
        finance_staff_token = await _login(client, email="demo.staff.finance@ipb.ac.id")
        admin_token = await _login(client, email="demo.admin@ipb.ac.id")

        student_reservations = await client.get(
            "/student/reservations",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        operations_queue = await client.get(
            "/staff/reservations/verification-queue",
            headers={"Authorization": f"Bearer {operations_staff_token}"},
        )
        finance_queue = await client.get(
            "/staff/reservations/verification-queue",
            headers={"Authorization": f"Bearer {finance_staff_token}"},
        )
        report = await client.get(
            "/admin/reports/aggregate",
            params={"start": "2026-05-01T00:00:00+00:00", "end": "2026-07-31T23:59:59+00:00"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        reservations_by_code = {reservation["reservation_code"]: reservation for reservation in student_reservations.json()}
        document_review_id = reservations_by_code["DEV-SEED-DOCUMENT-REVIEW"]["id"]
        payment_review_id = reservations_by_code["DEV-SEED-PAYMENT-REVIEW"]["id"]
        signed_download = await client.get(
            f"/staff/reservations/{document_review_id}/signed-approval-letter/download",
            headers={"Authorization": f"Bearer {operations_staff_token}"},
        )
        receipt_download = await client.get(
            f"/staff/reservations/{payment_review_id}/payment-receipt/download",
            headers={"Authorization": f"Bearer {finance_staff_token}"},
        )

    assert student_reservations.status_code == 200
    assert set(reservations_by_code) == {
        "DEV-SEED-APPROVED",
        "DEV-SEED-CANCELLATION",
        "DEV-SEED-COMPLETED",
        "DEV-SEED-DOCUMENT-REJECTED",
        "DEV-SEED-DOCUMENT-REVIEW",
        "DEV-SEED-PAYMENT-PENDING",
        "DEV-SEED-PAYMENT-REJECTED",
        "DEV-SEED-PAYMENT-REVIEW",
        "DEV-SEED-PENDING",
    }
    assert reservations_by_code["DEV-SEED-PENDING"]["document"]["review_status"] == "upload_needed"
    assert reservations_by_code["DEV-SEED-DOCUMENT-REVIEW"]["document"]["review_status"] == "waiting_review"
    assert reservations_by_code["DEV-SEED-PAYMENT-PENDING"]["payment"]["review_status"] == "upload_needed"
    assert reservations_by_code["DEV-SEED-PAYMENT-REVIEW"]["payment"]["review_status"] == "waiting_review"
    assert reservations_by_code["DEV-SEED-DOCUMENT-REJECTED"]["rejection"] == {
        "source": "document",
        "reason": "Surat belum ditandatangani pembina.",
    }
    assert reservations_by_code["DEV-SEED-PAYMENT-REJECTED"]["rejection"] == {
        "source": "payment",
        "reason": "Nominal transfer tidak sesuai.",
    }
    assert reservations_by_code["DEV-SEED-COMPLETED"]["review"] is not None

    assert operations_queue.status_code == 200
    assert {item["workflow_type"] for item in operations_queue.json()} >= {"document_review"}
    assert "cancellation_review" not in {item["workflow_type"] for item in operations_queue.json()}
    assert finance_queue.status_code == 200
    assert {item["workflow_type"] for item in finance_queue.json()} >= {"payment_review"}
    assert signed_download.status_code == 200
    assert receipt_download.status_code == 200
    assert report.status_code == 200
    assert report.json()["kpis"]["total_reservations"] == 9


def test_dev_seed_updates_stale_local_sqlite_schema_before_upserting(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'seed.db'}", secret_key="test-secret")
    session_factory = build_session_factory(settings.database_url)

    with session_factory.kw["bind"].begin() as connection:
        connection.execute(text("CREATE TABLE facility_categories (id VARCHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE, is_active BOOLEAN NOT NULL)"))
        connection.execute(
            text(
                """
                CREATE TABLE reservations (
                    id VARCHAR(36) PRIMARY KEY,
                    facility_id VARCHAR(36) NOT NULL,
                    student_id VARCHAR(36) NOT NULL,
                    organization_unit_id VARCHAR(36) NOT NULL,
                    reservation_code VARCHAR(32) NOT NULL UNIQUE,
                    activity_title VARCHAR(255) NOT NULL,
                    event_description TEXT NOT NULL,
                    participant_count INTEGER NOT NULL,
                    contact_phone VARCHAR(32) NOT NULL,
                    price_rupiah INTEGER NOT NULL,
                    organization_unit_name VARCHAR(255) NOT NULL,
                    starts_at DATETIME NOT NULL,
                    ends_at DATETIME NOT NULL,
                    document_upload_due_at DATETIME,
                    document_verification_due_at DATETIME,
                    payment_upload_due_at DATETIME,
                    payment_verification_due_at DATETIME,
                    status VARCHAR(32) NOT NULL,
                    rejection_reason TEXT,
                    cancellation_reason TEXT,
                    cancellation_rejection_reason TEXT,
                    created_at DATETIME NOT NULL
                )
                """
            )
        )

    seed_development_data(settings=settings)

    with session_factory() as session:
        categories = session.scalars(select(FacilityCategory).order_by(FacilityCategory.name)).all()
        reservations = session.scalars(select(Reservation).order_by(Reservation.reservation_code)).all()

    assert [(category.name, category.slug, category.icon_hint) for category in categories] == [
        ("Area Terbuka", "area-terbuka", "trees"),
        ("Auditorium", "auditorium", "presentation"),
        ("Laboratorium", "laboratorium", "flask-conical"),
        ("Olahraga", "olahraga", "dumbbell"),
        ("Ruang Kelas", "ruang-kelas", "school"),
    ]
    assert {reservation.reservation_code for reservation in reservations} >= {
        "DEV-SEED-APPROVED",
        "DEV-SEED-PENDING",
    }


def test_dev_seed_is_idempotent_for_seeded_database_rows(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'seed.db'}", secret_key="test-secret")

    seed_development_data(settings=settings)
    seed_development_data(settings=settings)

    session_factory = build_session_factory(settings.database_url)
    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(User)) == 10
        assert session.scalar(select(func.count()).select_from(Facility)) == 13
        assert session.scalar(select(func.count()).select_from(OrganizationUnit)) == 5
        assert session.scalar(select(func.count()).select_from(FacilityStaffAssignment)) == 13
        assert session.scalar(select(func.count()).select_from(FacilityImage)) == 26
        assert session.scalar(select(func.count()).select_from(FacilityOpenHour)) == 65
        assert session.scalar(select(func.count()).select_from(Reservation)) == 9
        assert session.scalar(select(func.count()).select_from(ReservationSignedApprovalLetter)) == 5
        assert session.scalar(select(func.count()).select_from(ReservationPaymentReceipt)) == 3
        assert session.scalar(select(func.count()).select_from(FacilityReview)) == 1
