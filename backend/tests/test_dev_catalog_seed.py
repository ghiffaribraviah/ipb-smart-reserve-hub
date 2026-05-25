from sqlalchemy import func, select
import pytest

from app.core.database import Base, build_session_factory
from app.core.settings import SettingsModule
from app.dev.catalog_seed import CatalogSeedRefused, seed_catalog_data
from app.models import Facility, FacilityCategory, FacilityImage, FacilityOpenHour, User


def test_catalog_seed_loads_canonical_facilities_without_wiping_users(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'catalog.db'}", secret_key="test-secret")
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
        session.commit()

    seed_catalog_data(settings=settings)

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(User)) == 1
        assert session.scalar(select(func.count()).select_from(Facility)) >= 10

        categories = session.scalars(select(FacilityCategory).order_by(FacilityCategory.name)).all()
        facilities = session.scalars(select(Facility).order_by(Facility.name)).all()

        assert {category.name for category in categories} == {
            "Area Terbuka",
            "Auditorium",
            "Keamanan",
            "Lapangan",
            "Laboratorium",
            "Ruang Meeting",
            "Transportasi",
        }
        assert len(facilities) >= 10
        assert {"Focus Room 1", "Lapangan Sepakbola", "Mobil Listrik"}.issubset(
            {facility.name for facility in facilities}
        )
        assert session.scalar(select(func.count()).select_from(FacilityImage)) == len(facilities)
        assert session.scalar(select(func.count()).select_from(FacilityOpenHour)) == len(facilities) * 5


def test_catalog_seed_is_idempotent(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'catalog.db'}", secret_key="test-secret")

    seed_catalog_data(settings=settings)
    seed_catalog_data(settings=settings)

    session_factory = build_session_factory(settings.database_url)
    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(Facility)) >= 10
        assert session.scalar(select(func.count()).select_from(FacilityCategory)) == 7
        assert session.scalar(select(func.count()).select_from(User)) == 0


def test_catalog_seed_refuses_production_environment(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'catalog.db'}", secret_key="test-secret")

    with pytest.raises(CatalogSeedRefused):
        seed_catalog_data(settings=settings, environment="production")
