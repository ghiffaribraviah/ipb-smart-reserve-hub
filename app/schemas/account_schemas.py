from pydantic import BaseModel, Field

from app.models import UserRole


class StudentRegistrationRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1)
    nim: str = Field(min_length=1)
    phone: str = Field(min_length=1)


class LoginRequest(BaseModel):
    email: str
    password: str


class AdminCreateUserRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1)
    role: UserRole
    is_active: bool = True


class AcademicProfileResponse(BaseModel):
    program_studi: str | None
    faculty: str | None
    entry_year: int | None
    degree: str | None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    nim: str | None = None
    phone: str | None = None
    academic_profile: AcademicProfileResponse | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
