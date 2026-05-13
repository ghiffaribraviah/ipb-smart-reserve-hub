from typing import Protocol

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import User, UserRole


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

    def list_users(
        self,
        *,
        role: UserRole | None = None,
        is_active: bool | None = None,
        search: str | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> tuple[list[User], int]:
        raise NotImplementedError

    def set_active_status(self, user_id: str, *, is_active: bool) -> User | None:
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

    def list_users(
        self,
        *,
        role: UserRole | None = None,
        is_active: bool | None = None,
        search: str | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> tuple[list[User], int]:
        filters = []
        if role is not None:
            filters.append(User.role == role)
        if is_active is not None:
            filters.append(User.is_active.is_(is_active))
        if search:
            normalized_search = f"%{search.lower().strip()}%"
            filters.append(
                (func.lower(User.email).like(normalized_search))
                | (func.lower(User.full_name).like(normalized_search))
                | (func.lower(User.nim).like(normalized_search))
            )

        total = self._session.scalar(select(func.count()).select_from(User).where(*filters)) or 0
        users = list(
            self._session.scalars(
                select(User)
                .where(*filters)
                .order_by(User.created_at.desc(), User.id.desc())
                .offset(offset)
                .limit(limit)
            )
        )
        return users, total

    def set_active_status(self, user_id: str, *, is_active: bool) -> User | None:
        user = self._session.get(User, user_id)
        if user is None:
            return None
        user.is_active = is_active
        self._session.flush()
        return user
