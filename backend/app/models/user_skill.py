import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base


class SkillType(str, enum.Enum):
    OFFERING = "offering"
    SEEKING = "seeking"


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.skill_id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(
        SQLEnum(SkillType, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    proficiency = Column(String(50), nullable=True)  # Beginner, Intermediate, Advanced, Expert

    # Relationships
    user = relationship("User", back_populates="user_skills")
    skill = relationship("Skill", back_populates="user_skills")
