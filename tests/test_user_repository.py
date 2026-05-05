import pytest

from app.core.database import Base, build_session_factory
from app.models import User, UserRole
from app.repositories.user_repository import DuplicateUserEmail, SqlAlchemyUserRepository


def test_sqlalchemy_user_repository_stores_and_finds_user_accounts():
    session_factory = build_session_factory("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(bind=session_factory.kw["bind"])

    with session_factory() as session:
        repository = SqlAlchemyUserRepository(session)
        user = repository.add(
            User(
                email="budi@apps.ipb.ac.id",
                password_hash="hash",
                full_name="Budi Santoso",
                role=UserRole.student,
            )
        )

        assert repository.find_by_email("budi@apps.ipb.ac.id") == user
        assert repository.get_by_id(user.id) == user

        with pytest.raises(DuplicateUserEmail):
            repository.add(
                User(
                    email="budi@apps.ipb.ac.id",
                    password_hash="hash",
                    full_name="Budi Duplicate",
                    role=UserRole.student,
                )
            )
