from sqlalchemy import func, select
import pytest

from app.core.database import Base, build_session_factory
from app.core.settings import SettingsModule
from app.dev.bootstrap_seed import BOOTSTRAP_PASSWORD, BootstrapSeedRefused, seed_bootstrap_accounts
from app.models import User, UserRole
from app.repositories.user_repository import SqlAlchemyUserRepository
from app.services.accounts import AllowedStudentEmailDomains, LoginCredentials, UserAccountModule


def test_bootstrap_seed_creates_three_canonical_login_accounts(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'bootstrap.db'}", secret_key="test-secret")
    session_factory = build_session_factory(settings.database_url)
    Base.metadata.create_all(bind=session_factory.kw["bind"])

    seed_bootstrap_accounts(settings=settings)

    with session_factory() as session:
        users = session.scalars(select(User).order_by(User.email)).all()
        assert [(user.email, user.role) for user in users] == [
            ("bootstrap.admin@ipb.ac.id", UserRole.super_admin),
            ("bootstrap.staff@ipb.ac.id", UserRole.staff),
            ("bootstrap.student@apps.ipb.ac.id", UserRole.student),
        ]
        assert session.scalar(select(func.count()).select_from(User)) == 3

        accounts = UserAccountModule(
            user_repository=SqlAlchemyUserRepository(session),
            secret_key=settings.secret_key,
            student_email_policy=AllowedStudentEmailDomains(("apps.ipb.ac.id",)),
        )
        admin_session = accounts.login(LoginCredentials(email="bootstrap.admin@ipb.ac.id", password=BOOTSTRAP_PASSWORD))
        staff_session = accounts.login(LoginCredentials(email="bootstrap.staff@ipb.ac.id", password=BOOTSTRAP_PASSWORD))
        student_session = accounts.login(LoginCredentials(email="bootstrap.student@apps.ipb.ac.id", password=BOOTSTRAP_PASSWORD))

    assert admin_session.access_token
    assert staff_session.access_token
    assert student_session.access_token


def test_bootstrap_seed_is_idempotent(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'bootstrap.db'}", secret_key="test-secret")

    seed_bootstrap_accounts(settings=settings)
    seed_bootstrap_accounts(settings=settings)

    session_factory = build_session_factory(settings.database_url)
    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(User)) == 3


def test_bootstrap_seed_refuses_production_environment(tmp_path):
    settings = SettingsModule(database_url=f"sqlite+pysqlite:///{tmp_path / 'bootstrap.db'}", secret_key="test-secret")

    with pytest.raises(BootstrapSeedRefused):
        seed_bootstrap_accounts(settings=settings, environment="production")
