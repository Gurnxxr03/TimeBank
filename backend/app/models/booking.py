import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base


class BookingStatus(str, enum.Enum):
    IN_ESCROW = "in_escrow"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    requester_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    provider_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.skill_id", ondelete="SET NULL"), nullable=True)
    skill_title = Column(String(200), nullable=False)
    scheduled_date = Column(String(100), nullable=False)
    scheduled_time = Column(String(100), nullable=False)
    format = Column(String(100), nullable=False, default="Online")
    credits = Column(Float, nullable=False, default=1.0)
    status = Column(
        SQLEnum(BookingStatus, values_callable=lambda x: [e.value for e in x]),
        default=BookingStatus.IN_ESCROW,
        nullable=False,
    )
    notes = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    requester = relationship("User", foreign_keys=[requester_id], back_populates="requested_bookings")
    provider = relationship("User", foreign_keys=[provider_id], back_populates="provided_bookings")
    skill = relationship("Skill")
