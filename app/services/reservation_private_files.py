from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Protocol
import uuid

from app.storage import PrivateStorage


class StoredPrivateFile(Protocol):
    storage_key: str
    filename: str
    content_type: str


@dataclass(frozen=True)
class PrivateFileUpload:
    filename: str
    content_type: str
    content: bytes


@dataclass(frozen=True)
class PrivateFileMetadata:
    storage_key: str
    filename: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime


@dataclass(frozen=True)
class PrivateFileDownload:
    filename: str
    content_type: str
    content: bytes


class UnsupportedPrivateFileType(Exception):
    pass


class PrivateFileTooLarge(Exception):
    pass


class ReservationPrivateFileModule:
    def __init__(self, *, storage: PrivateStorage, clock: Callable[[], datetime]) -> None:
        self._storage = storage
        self._clock = clock

    def store_upload(
        self,
        *,
        reservation_id: str,
        folder: str,
        upload: PrivateFileUpload,
        allowed_content_types: set[str],
        allowed_extensions: tuple[str, ...],
        max_size_bytes: int,
    ) -> PrivateFileMetadata:
        if not _is_allowed_file(upload, allowed_content_types, allowed_extensions):
            raise UnsupportedPrivateFileType
        if len(upload.content) > max_size_bytes:
            raise PrivateFileTooLarge

        uploaded_at = _as_utc(self._clock())
        storage_key = f"{folder}/{reservation_id}/{uuid.uuid4().hex}-{upload.filename}"
        self._storage.put(storage_key, upload.content, content_type=upload.content_type)
        return PrivateFileMetadata(
            storage_key=storage_key,
            filename=upload.filename,
            content_type=upload.content_type,
            size_bytes=len(upload.content),
            uploaded_at=uploaded_at,
        )

    def download(self, file: StoredPrivateFile) -> PrivateFileDownload:
        return PrivateFileDownload(
            filename=file.filename,
            content_type=file.content_type,
            content=self._storage.get(file.storage_key),
        )


def _is_allowed_file(
    upload: PrivateFileUpload,
    allowed_content_types: set[str],
    allowed_extensions: tuple[str, ...],
) -> bool:
    return upload.content_type.lower() in allowed_content_types and upload.filename.lower().endswith(
        allowed_extensions
    )


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
