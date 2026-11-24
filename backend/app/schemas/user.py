from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole, UserStatus, AuthProvider
from app.schemas.skill import UserSkillResponse


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    avatar: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    onboarding_completed: Optional[bool] = None
    availability: Optional[List[str]] = None


class UserProfileResponse(BaseModel):
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
    availability: Optional[List[str]] = []
    rating: Optional[float] = 5.0
    created_at: datetime
    skills: List[UserSkillResponse] = []


class UserStatusUpdateRequest(BaseModel):
    status: UserStatus


class CommunityMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: str
    role: UserRole
    avatar: Optional[str] = "/default-avatar.svg"
    location: Optional[str] = "Community Member"
    bio: Optional[str] = ""
    availability: List[str] = []
    rating: Optional[float] = 5.0
    swaps_count: int = 0
    created_at: datetime
    skills: List[UserSkillResponse] = []
