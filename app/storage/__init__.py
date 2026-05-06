from typing import Protocol


class PrivateStorage(Protocol):
    def put(self, key: str, content: bytes, *, content_type: str) -> None:
        pass

    def get(self, key: str) -> bytes:
        pass


class InMemoryPrivateStorage:
    def __init__(self) -> None:
        self._objects: dict[str, bytes] = {}

    def put(self, key: str, content: bytes, *, content_type: str) -> None:
        self._objects[key] = content

    def get(self, key: str) -> bytes:
        return self._objects[key]
