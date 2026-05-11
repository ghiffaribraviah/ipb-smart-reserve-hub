from typing import Protocol

from fastapi import Response


class AttachmentDownload(Protocol):
    filename: str
    content_type: str
    content: bytes


def attachment_response(download: AttachmentDownload) -> Response:
    return Response(
        content=download.content,
        media_type=download.content_type,
        headers={"Content-Disposition": f'attachment; filename="{download.filename}"'},
    )
