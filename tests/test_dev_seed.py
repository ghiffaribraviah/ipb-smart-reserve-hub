from collections import Counter

from sqlalchemy import func, select
import pytest

from app.core.database import Base, build_session_factory
from app.core.settings import SettingsModule
from app.dev.seed import DEMO_PASSWORD, ProductionSeedRefused, seed_development_data
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
from app.repositories.user_repository import SqlAlchemyUserRepository
from app.services.accounts import AllowedStudentEmailDomains, LoginCredentials, UserAccountModule


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
            ("Auditorium", "auditorium", "presentation"),
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


def test_dev_seed_is_idempotent_for_seeded_database_rows(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'seed.db'}", secret_key="test-secret")

    seed_development_data(settings=settings)
    seed_development_data(settings=settings)

    session_factory = build_session_factory(settings.database_url)
    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(User)) == 10
        assert session.scalar(select(func.count()).select_from(Facility)) == 3
        assert session.scalar(select(func.count()).select_from(OrganizationUnit)) == 2
        assert session.scalar(select(func.count()).select_from(FacilityStaffAssignment)) == 3
        assert session.scalar(select(func.count()).select_from(FacilityImage)) == 6
        assert session.scalar(select(func.count()).select_from(FacilityOpenHour)) == 15
        assert session.scalar(select(func.count()).select_from(Reservation)) == 2
