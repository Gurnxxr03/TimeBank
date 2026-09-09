from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.schemas.user import UserProfileResponse, UserUpdateRequest
from app.schemas.skill import UserSkillAddRequest, UserSkillResponse
from app.dependencies import verify_token

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Get profile information and skills for the authenticated user.
    """
    user = (
        db.query(User)
        .options(joinedload(User.user_skills).joinedload(UserSkill.skill))
        .filter(User.user_id == current_user.user_id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found.",
        )

    return UserProfileResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        auth_provider=user.auth_provider,
        rating=user.rating,
        created_at=user.created_at,
        skills=[UserSkillResponse.model_validate(s) for s in user.user_skills],
    )


@router.put("/me", response_model=UserProfileResponse)
def update_current_user_profile(
    req: UserUpdateRequest,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Update profile details for the authenticated user.
    """
    user = (
        db.query(User)
        .options(joinedload(User.user_skills).joinedload(UserSkill.skill))
        .filter(User.user_id == current_user.user_id)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if req.name is not None and req.name.strip():
        user.name = req.name.strip()

    db.commit()
    db.refresh(user)

    return UserProfileResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        auth_provider=user.auth_provider,
        rating=user.rating,
        created_at=user.created_at,
        skills=[UserSkillResponse.model_validate(s) for s in user.user_skills],
    )


@router.post("/me/skills", response_model=UserSkillResponse, status_code=status.HTTP_201_CREATED)
def add_user_skill(
    req: UserSkillAddRequest,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Associate a skill (offering or seeking) with the current user.
    """
    # 1. Verify skill exists
    skill = db.query(Skill).filter(Skill.skill_id == req.skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found in catalog.",
        )

    # 2. Check if user already has this skill under this type
    existing = (
        db.query(UserSkill)
        .filter(
            UserSkill.user_id == current_user.user_id,
            UserSkill.skill_id == req.skill_id,
            UserSkill.type == req.type,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You have already added '{skill.name}' as a {req.type.value} skill.",
        )

    # 3. Create user skill
    new_user_skill = UserSkill(
        user_id=current_user.user_id,
        skill_id=req.skill_id,
        type=req.type,
        proficiency=req.proficiency,
    )
    db.add(new_user_skill)
    db.commit()
    db.refresh(new_user_skill)

    # Load relationship for response
    new_user_skill.skill = skill
    return UserSkillResponse.model_validate(new_user_skill)


@router.delete("/me/skills/{id}", status_code=status.HTTP_200_OK)
def remove_user_skill(
    id: int,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Remove an associated skill by its user_skill ID.
    """
    user_skill = (
        db.query(UserSkill)
        .filter(UserSkill.id == id, UserSkill.user_id == current_user.user_id)
        .first()
    )
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User skill not found or does not belong to you.",
        )

    db.delete(user_skill)
    db.commit()
    return {"message": "Skill removed successfully"}
