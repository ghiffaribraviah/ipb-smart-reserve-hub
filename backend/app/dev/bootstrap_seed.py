from __future__ import annotations

import os

from app.core.database import Base, build_session_factory
from app.core.security import hash_password
from app.core.settings import SettingsModule
from app.models import User, UserRole


class BootstrapSeedRefused(Exception):
    pass


BOOTSTRAP_PASSWORD = "bootstrap12345"
BOOTSTRAP_USERS = [
    {
        "email": "bootstrap.admin@ipb.ac.id",
        "full_name": "Bootstrap Super Admin",
        "role": UserRole.super_admin,
    },
    {
        "email": "bootstrap.staff@ipb.ac.id",
        "full_name": "Bootstrap Staff",
        "role": UserRole.staff,
    },
    {
        "email": "bootstrap.student@apps.ipb.ac.id",
        "full_name": "Bootstrap Student",
        "role": UserRole.student,
        "nim": "G64009999",
        "phone": "081299999999",
    },
]


def seed_bootstrap_accounts(*, settings: SettingsModule | None = None, environment: str | None = None) -> None:
    seed_environment = environment if environment is not None else os.environ.get("IPB_ENVIRONMENT")
    if seed_environment == "production":
        raise BootstrapSeedRefused("Bootstrap seed cannot run in production.")

    app_settings = settings or SettingsModule.from_environment()
    session_factory = build_session_factory(app_settings.database_url)
    engine = session_factory.kw["bind"]
    Base.metadata.create_all(bind=engine)

    with session_factory() as session:
        for user_definition in BOOTSTRAP_USERS:
            user = session.query(User).filter(User.email == user_definition["email"]).one_or_none()
            if user is None:
                user = User(email=user_definition["email"], password_hash="", full_name="", role=user_definition["role"])
                session.add(user)

            user.password_hash = hash_password(BOOTSTRAP_PASSWORD)
            user.full_name = user_definition["full_name"]
            user.role = user_definition["role"]
            user.is_active = True
            user.nim = user_definition.get("nim")
            user.phone = user_definition.get("phone")

        session.commit()


if __name__ == "__main__":
    try:
        seed_bootstrap_accounts()
    except BootstrapSeedRefused as exc:
        print(str(exc))
    else:
        print("Bootstrap accounts loaded.")
