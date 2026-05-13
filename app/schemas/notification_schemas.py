from datetime import datetime

from pydantic import BaseModel


class NotificationTargetResponse(BaseModel):
    type: str
    reservation_id: str | None = None
    route: str


class NotificationResponse(BaseModel):
    id: str
    reservation_id: str | None
    title: str
    message: str
    category: str
    target: NotificationTargetResponse | None
    created_at: datetime
    read_at: datetime | None = None
