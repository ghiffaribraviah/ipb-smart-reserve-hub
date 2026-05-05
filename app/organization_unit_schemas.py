from pydantic import BaseModel, Field


class OrganizationUnitCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    type: str = Field(min_length=1)
    code: str | None = None


class OrganizationUnitUpdateRequest(BaseModel):
    name: str = Field(min_length=1)
    type: str = Field(min_length=1)
    code: str | None = None


class OrganizationUnitResponse(BaseModel):
    id: str
    name: str
    type: str
    code: str | None
    is_active: bool
