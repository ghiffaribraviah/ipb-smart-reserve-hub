from datetime import UTC, datetime

import pytest

from app.services.reservation_private_files import (
    PrivateFileTooLarge,
    PrivateFileUpload,
    ReservationPrivateFileModule,
    UnsupportedPrivateFileType,
)
from app.storage import InMemoryPrivateStorage


def test_reservation_private_file_module_validates_stores_and_downloads_private_file():
    private_files = ReservationPrivateFileModule(
        storage=InMemoryPrivateStorage(),
        clock=lambda: datetime(2026, 5, 1, 3, tzinfo=UTC),
    )

    metadata = private_files.store_upload(
        reservation_id="reservation-1",
        folder="payment-receipts",
        upload=PrivateFileUpload(
            filename="receipt.png",
            content_type="image/png",
            content=b"payment receipt image",
        ),
        allowed_content_types={"image/png"},
        allowed_extensions=(".png",),
        max_size_bytes=5 * 1024 * 1024,
    )

    assert metadata.storage_key.startswith("payment-receipts/reservation-1/")
    assert metadata.filename == "receipt.png"
    assert metadata.content_type == "image/png"
    assert metadata.size_bytes == 21
    assert metadata.uploaded_at == datetime(2026, 5, 1, 3, tzinfo=UTC)

    download = private_files.download(metadata)

    assert download.filename == "receipt.png"
    assert download.content_type == "image/png"
    assert download.content == b"payment receipt image"


def test_reservation_private_file_module_rejects_invalid_type_and_size_before_storing():
    private_files = ReservationPrivateFileModule(
        storage=InMemoryPrivateStorage(),
        clock=lambda: datetime(2026, 5, 1, 3, tzinfo=UTC),
    )

    with pytest.raises(UnsupportedPrivateFileType):
        private_files.store_upload(
            reservation_id="reservation-1",
            folder="payment-receipts",
            upload=PrivateFileUpload(filename="receipt.pdf", content_type="application/pdf", content=b"%PDF"),
            allowed_content_types={"image/png"},
            allowed_extensions=(".png",),
            max_size_bytes=5 * 1024 * 1024,
        )

    with pytest.raises(PrivateFileTooLarge):
        private_files.store_upload(
            reservation_id="reservation-1",
            folder="payment-receipts",
            upload=PrivateFileUpload(filename="receipt.png", content_type="image/png", content=b"toolarge"),
            allowed_content_types={"image/png"},
            allowed_extensions=(".png",),
            max_size_bytes=3,
        )
