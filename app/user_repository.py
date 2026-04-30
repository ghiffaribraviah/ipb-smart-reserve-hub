from typing import Protocol

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import User


class UserRepositoryError(Exception):
    pass


class DuplicateUserEmail(UserRepositoryError):
    pass


class UserRepository(Protocol):
    def add(self, user: User) -> User:
        raise NotImplementedError

    def find_by_email(self, email: str) -> User | None:
        raise NotImplementedError

    def get_by_id(self, user_id: str) -> User | None:
        raise NotImplementedError


class SqlAlchemyUserRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, user: User) -> User:
        self._session.add(user)
        try:
            self._session.flush()
        except IntegrityError as exc:
            raise DuplicateUserEmail from exc
        return user

    def find_by_email(self, email: str) -> User | None:
        return self._session.scalar(select(User).where(User.email == email))

    def get_by_id(self, user_id: str) -> User | None:
        return self._session.get(User, user_id)
