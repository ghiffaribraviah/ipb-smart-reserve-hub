import json
from typing import Any, Protocol

from sqlalchemy.orm import Session

from app.models import SystemSetting


class BookingSettingsRepository(Protocol):
    def load_booking_setting_values(self, setting_keys: set[str]) -> dict[str, Any]:
        raise NotImplementedError

    def save_booking_setting_values(self, values: dict[str, Any]) -> None:
        raise NotImplementedError


class SqlAlchemyBookingSettingsRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def load_booking_setting_values(self, setting_keys: set[str]) -> dict[str, Any]:
        return {
            setting.key: self._decode(setting.value)
            for setting in self._session.query(SystemSetting).all()
            if setting.key in setting_keys
        }

    def save_booking_setting_values(self, values: dict[str, Any]) -> None:
        for key, value in values.items():
            setting = self._session.get(SystemSetting, key)
            if setting is None:
                setting = SystemSetting(key=key, value=self._encode(value))
                self._session.add(setting)
            else:
                setting.value = self._encode(value)
        self._session.flush()

    @staticmethod
    def _encode(value: Any) -> str:
        return json.dumps(value)

    @staticmethod
    def _decode(value: str) -> Any:
        decoded = json.loads(value)
        if isinstance(decoded, list):
            return tuple(decoded)
        return decoded
