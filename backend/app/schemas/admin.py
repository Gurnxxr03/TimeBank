from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.models.user import UserRole, UserStatus, AuthProvider
from app.schemas.skill import UserSkillResponse


class AdminUserItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: str
    email: str
    role: UserRole
    status: UserStatus
    auth_provider: AuthProvider
    rating: Optional[float] = None
    created_at: datetime
    skills_count: int = 0
    offering_count: int = 0
    seeking_count: int = 0


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
    rating: Optional[float] = None
    created_at: datetime
    skills: List[UserSkillResponse] = []


class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    banned_users: int
    admin_users: int
    total_skills_catalog: int
    total_skills_offered: int
    total_skills_sought: int
