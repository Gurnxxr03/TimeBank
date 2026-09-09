from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.skill import Skill
from app.schemas.skill import SkillCreateRequest, SkillResponse
from app.dependencies import verify_token

router = APIRouter(prefix="/skills", tags=["Skills Catalog"])


@router.get("", response_model=List[SkillResponse])
def get_skills_catalog(
    category: str = None,
    db: Session = Depends(get_db)
):
    """
    List all available skills in the platform catalog.
    Optionally filter by category.
    """
    query = db.query(Skill)
    if category:
        query = query.filter(func.lower(Skill.category) == category.lower().strip())
    skills = query.order_by(Skill.category, Skill.name).all()
    return skills


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    req: SkillCreateRequest,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Add a new skill to the global catalog.
    Rejects case-insensitive duplicates with 409 Conflict.
    """
    clean_name = req.name.strip()
    clean_category = req.category.strip() if req.category else "General"

    # Case-insensitive duplicate check
    existing = db.query(Skill).filter(func.lower(Skill.name) == func.lower(clean_name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A skill named '{existing.name}' already exists in the catalog.",
        )

    new_skill = Skill(
        name=clean_name,
        category=clean_category
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill
