from dataclasses import dataclass

from app.api.responses import attachment_response


@dataclass(frozen=True)
class Download:
    filename: str
    content_type: str
    content: bytes


def test_attachment_response_returns_download_bytes_with_attachment_filename():
    response = attachment_response(
        Download(
            filename="receipt.png",
            content_type="image/png",
            content=b"payment receipt image",
        )
    )

    assert response.body == b"payment receipt image"
    assert response.media_type == "image/png"
    assert response.headers["content-disposition"] == 'attachment; filename="receipt.png"'
