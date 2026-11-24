import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base


class AuthProvider(str, enum.Enum):
    LOCAL = "local"
    GOOGLE = "google"


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    BANNED = "banned"


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    auth_provider = Column(
        SQLEnum(AuthProvider, values_callable=lambda x: [e.value for e in x]),
        default=AuthProvider.LOCAL,
        nullable=False
    )
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    google_sub = Column(String(255), unique=True, index=True, nullable=True)
    role = Column(
        SQLEnum(UserRole, values_callable=lambda x: [e.value for e in x]),
        default=UserRole.USER,
        nullable=False
    )
    rating = Column(Float, nullable=True, default=5.0)
    status = Column(
        SQLEnum(UserStatus, values_callable=lambda x: [e.value for e in x]),
        default=UserStatus.ACTIVE,
        nullable=False
    )
    avatar = Column(Text, nullable=True, default="/default-avatar.svg")
    location = Column(String(255), nullable=True, default="Community Member")
    bio = Column(Text, nullable=True, default="")
    time_credits = Column(Float, nullable=False, default=10.0)
    in_escrow = Column(Float, nullable=False, default=0.0)
    lifetime_earned = Column(Float, nullable=False, default=0.0)
    lifetime_spent = Column(Float, nullable=False, default=0.0)
    onboarding_completed = Column(Integer, nullable=False, default=0)
    availability = Column(Text, nullable=True, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user_skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    requested_bookings = relationship(
        "Booking",
        foreign_keys="Booking.requester_id",
        back_populates="requester",
        cascade="all, delete-orphan",
    )
    provided_bookings = relationship(
        "Booking",
        foreign_keys="Booking.provider_id",
        back_populates="provider",
        cascade="all, delete-orphan",
    )
