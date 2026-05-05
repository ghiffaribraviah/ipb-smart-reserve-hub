import json
from dataclasses import asdict
from typing import Any

from sqlalchemy.orm import Session

from app.models import SystemSetting
from app.settings import BookingSettings


class BookingSettingsModule:
    def __init__(self, *, session: Session, defaults: BookingSettings) -> None:
        self._session = session
        self._defaults = defaults

    def get_booking_settings(self) -> BookingSettings:
        stored_values = {
            setting.key: self._decode(setting.value) for setting in self._session.query(SystemSetting).all()
        }
        return BookingSettings(**(asdict(self._defaults) | stored_values))

    def update_booking_settings(self, booking_settings: BookingSettings) -> BookingSettings:
        for key, value in asdict(booking_settings).items():
            setting = self._session.get(SystemSetting, key)
            if setting is None:
                setting = SystemSetting(key=key, value=self._encode(value))
                self._session.add(setting)
            else:
                setting.value = self._encode(value)
        self._session.flush()
        return self.get_booking_settings()

    @staticmethod
    def _encode(value: Any) -> str:
        return json.dumps(value)

    @staticmethod
    def _decode(value: str) -> Any:
        decoded = json.loads(value)
        if isinstance(decoded, list):
            return tuple(decoded)
        return decoded
