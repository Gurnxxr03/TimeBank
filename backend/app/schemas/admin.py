from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime
from app.models.user import UserRole, UserStatus, AuthProvider
from app.schemas.skill import UserSkillResponse
from app.schemas.booking import BookingResponse


class AdminUserItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: str
    email: str
    role: UserRole
    status: UserStatus
    auth_provider: AuthProvider
    avatar: Optional[str] = "/default-avatar.svg"
    location: Optional[str] = "Community Member"
    time_credits: float = 10.0
    in_escrow: float = 0.0
    lifetime_earned: float = 0.0
    lifetime_spent: float = 0.0
    onboarding_completed: bool = False
    rating: Optional[float] = None
    created_at: datetime
    skills_count: int = 0
    offering_count: int = 0
    seeking_count: int = 0
    bookings_count: int = 0


class AdminUserListResponse(BaseModel):
    items: List[AdminUserItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdminUserDetailResponse(BaseModel):
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
    availability: List[str] = []
    rating: Optional[float] = None
    created_at: datetime
    skills: List[UserSkillResponse] = []
    bookings: List[BookingResponse] = []


class UserRoleUpdateRequest(BaseModel):
    role: UserRole


class AdminCreditAdjustRequest(BaseModel):
    time_credits: float = Field(..., ge=0, le=10000)


class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    banned_users: int
    admin_users: int
    total_skills_catalog: int
    total_skills_offered: int
    total_skills_sought: int
    total_credits_in_circulation: float = 0.0
    total_credits_in_escrow: float = 0.0
    total_bookings: int = 0
    completed_bookings: int = 0
