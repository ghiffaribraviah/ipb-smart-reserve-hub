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


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
