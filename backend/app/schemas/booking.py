from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.booking import BookingStatus


class BookingCreateRequest(BaseModel):
    provider_id: int
    skill_id: Optional[int] = None
    skill_title: str = Field(..., min_length=1, max_length=200)
    scheduled_date: str = Field(..., min_length=1, max_length=100)
    scheduled_time: str = Field(..., min_length=1, max_length=100)
    format: str = Field(default="Online", max_length=100)
    credits: float = Field(default=1.0, gt=0, le=20.0)
    notes: Optional[str] = ""


class BookingPartnerSummary(BaseModel):
    user_id: int
    name: str
    avatar: Optional[str] = "/default-avatar.svg"
    location: Optional[str] = "Community Member"


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    booking_id: int
    requester_id: int
    provider_id: int
    skill_id: Optional[int] = None
    skill_title: str
    scheduled_date: str
    scheduled_time: str
    format: str
    credits: float
    status: BookingStatus
    notes: Optional[str] = ""
    created_at: datetime
    completed_at: Optional[datetime] = None
    requester: Optional[BookingPartnerSummary] = None
    provider: Optional[BookingPartnerSummary] = None
