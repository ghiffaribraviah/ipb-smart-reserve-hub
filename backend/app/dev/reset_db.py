from __future__ import annotations

import os

from app.core.database import Base, build_session_factory
from app.core.settings import SettingsModule


class DatabaseResetRefused(Exception):
    pass


def reset_database(*, settings: SettingsModule | None = None, environment: str | None = None) -> None:
    reset_environment = environment if environment is not None else os.environ.get("IPB_ENVIRONMENT")
    if reset_environment == "production":
        raise DatabaseResetRefused("Database reset cannot run in production.")

    app_settings = settings or SettingsModule.from_environment()
    session_factory = build_session_factory(app_settings.database_url)
    engine = session_factory.kw["bind"]

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    try:
        reset_database()
    except DatabaseResetRefused as exc:
        print(str(exc))
    else:
        print("Database reset completed.")
