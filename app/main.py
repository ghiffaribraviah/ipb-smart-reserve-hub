from collections.abc import Callable
from datetime import datetime

from fastapi import FastAPI

from app.api.http_application import HttpApplicationModule
from app.core.settings import SettingsModule


def create_app(
    *,
    settings: SettingsModule | None = None,
    database_url: str | None = None,
    secret_key: str | None = None,
    allowed_student_email_domains: tuple[str, ...] | None = None,
    clock: Callable[[], datetime] | None = None,
) -> FastAPI:
    app_settings = (settings or SettingsModule.from_environment()).with_overrides(
        database_url=database_url,
        secret_key=secret_key,
        allowed_student_email_domains=allowed_student_email_domains,
    )
    return HttpApplicationModule(settings=app_settings, clock=clock).build()
