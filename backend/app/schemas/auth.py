from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, UserStatus, AuthProvider


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token (JWT) from frontend GIS


class UserAuthResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: str
    email: str
    role: UserRole
    status: UserStatus
    auth_provider: AuthProvider
    avatar: Optional[str] = "/default-avatar.svg"
    location: Optional[str] = "Community Member"
    bio: Optional[str] = ""
    time_credits: float = 10.0
    in_escrow: float = 0.0
    lifetime_earned: float = 0.0
    lifetime_spent: float = 0.0
    onboarding_completed: bool = False
    availability: Optional[str] = "[]"
    rating: Optional[float] = 5.0
    created_at: datetime


class AuthMessageResponse(BaseModel):
    message: str
    user: UserAuthResponse
    access_token: Optional[str] = None
