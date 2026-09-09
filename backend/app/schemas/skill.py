from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from app.models.user_skill import SkillType


class SkillCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    category: str = Field(default="General", min_length=2, max_length=100)


class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_id: int
    name: str
    category: str


class UserSkillAddRequest(BaseModel):
    skill_id: int
    type: SkillType
    proficiency: Optional[str] = Field(default="Intermediate", max_length=50)


class UserSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    skill_id: int
    type: SkillType
    proficiency: Optional[str]
    skill: SkillResponse
