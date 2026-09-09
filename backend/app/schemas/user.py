from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole, UserStatus, AuthProvider
from app.schemas.skill import UserSkillResponse


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)


class UserProfileResponse(BaseModel):
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


class UserStatusUpdateRequest(BaseModel):
    status: UserStatus
