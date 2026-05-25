from sqlalchemy import func, select
import pytest

from app.core.database import Base, build_session_factory
from app.core.settings import SettingsModule
from app.dev.reset_db import DatabaseResetRefused, reset_database
from app.models import Facility, FacilityCategory, User


def test_reset_database_drops_existing_rows_and_recreates_schema(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'reset.db'}", secret_key="test-secret")
    session_factory = build_session_factory(settings.database_url)
    Base.metadata.create_all(bind=session_factory.kw["bind"])

    with session_factory() as session:
        session.add(
            User(
                email="dummy@example.com",
                password_hash="dummy",
                full_name="Dummy User",
                role="student",
                is_active=True,
            )
        )
        session.add(
            FacilityCategory(
                name="Temporary Category",
                slug="temporary-category",
                icon_hint=None,
                is_active=True,
            )
        )
        session.commit()

    reset_database(settings=settings)

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(User)) == 0
        assert session.scalar(select(func.count()).select_from(FacilityCategory)) == 0
        assert session.scalar(select(func.count()).select_from(Facility)) == 0


def test_reset_database_refuses_production_environment(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'reset.db'}", secret_key="test-secret")

    with pytest.raises(DatabaseResetRefused):
        reset_database(settings=settings, environment="production")
