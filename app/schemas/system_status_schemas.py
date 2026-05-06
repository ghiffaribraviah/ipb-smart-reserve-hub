from pydantic import BaseModel


class StatusCheckResponse(BaseModel):
    status: str


class ApplicationStatusResponse(BaseModel):
    name: str
    version: str


class SystemStatusResponse(BaseModel):
    backend: StatusCheckResponse
    database: StatusCheckResponse
    storage: StatusCheckResponse
    application: ApplicationStatusResponse
    worker: StatusCheckResponse
