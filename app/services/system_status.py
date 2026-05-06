from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.orm import Session


@dataclass(frozen=True)
class StatusCheck:
    status: str


@dataclass(frozen=True)
class ApplicationStatus:
    name: str
    version: str


@dataclass(frozen=True)
class SystemStatus:
    backend: StatusCheck
    database: StatusCheck
    storage: StatusCheck
    application: ApplicationStatus
    worker: StatusCheck


class SystemStatusModule:
    def __init__(self, *, session: Session) -> None:
        self._session = session

    def get_system_status(self) -> SystemStatus:
        return SystemStatus(
            backend=StatusCheck(status="ok"),
            database=StatusCheck(status=self._database_status()),
            storage=StatusCheck(status="not_configured"),
            application=ApplicationStatus(name="ipb-smart-reserve-hub", version="0.1.0"),
            worker=StatusCheck(status="not_configured"),
        )

    def _database_status(self) -> str:
        try:
            self._session.execute(text("SELECT 1"))
        except Exception:
            return "unavailable"
        return "ok"
