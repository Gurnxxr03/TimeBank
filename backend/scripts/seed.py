import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.user import User, AuthProvider, UserRole, UserStatus
from app.models.skill import Skill
from app.models.user_skill import UserSkill, SkillType
from app.utils.security import hash_password

INITIAL_SKILLS = [
    # Technology & Coding
    {"name": "Python Programming", "category": "Technology & Coding"},
    {"name": "React & Frontend Development", "category": "Technology & Coding"},
    {"name": "SQL & Database Design", "category": "Technology & Coding"},
    {"name": "Git & Version Control", "category": "Technology & Coding"},
    {"name": "UI/UX Design (Figma)", "category": "Technology & Coding"},
    
    # Academics & Tutoring
    {"name": "Calculus & Linear Algebra", "category": "Academics & Tutoring"},
    {"name": "Physics Tutoring", "category": "Academics & Tutoring"},
    {"name": "Essay Writing & Proofreading", "category": "Academics & Tutoring"},
    {"name": "Data Structures & Algorithms", "category": "Academics & Tutoring"},

    # Languages
    {"name": "Conversational Spanish", "category": "Languages"},
    {"name": "French for Beginners", "category": "Languages"},
    {"name": "Japanese Basics", "category": "Languages"},
    {"name": "German Tutoring", "category": "Languages"},

    # Creative & Media
    {"name": "Video Editing (Premiere / DaVinci)", "category": "Creative & Media"},
    {"name": "Digital Photography", "category": "Creative & Media"},
    {"name": "Music Production & Audio Mixing", "category": "Creative & Media"},
    {"name": "Graphic Design & Branding", "category": "Creative & Media"},

    # Practical Skills & Career
    {"name": "Public Speaking & Pitching", "category": "Practical & Career"},
    {"name": "Resume Review & Tech Interview Prep", "category": "Practical & Career"},
    {"name": "Personal Finance & Budgeting", "category": "Practical & Career"},
    {"name": "Chess Strategy", "category": "Practical & Career"},
]


def seed_database():
    print("🌱 Starting TimeBank Database Seeding...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Skills
        skills_map = {}
        for skill_data in INITIAL_SKILLS:
            existing = db.query(Skill).filter(Skill.name == skill_data["name"]).first()
            if not existing:
                skill = Skill(name=skill_data["name"], category=skill_data["category"])
                db.add(skill)
                db.flush()
                skills_map[skill.name] = skill
                print(f"  + Added skill: [{skill.category}] {skill.name}")
            else:
                skills_map[existing.name] = existing

        # 2. Seed Admin User
        admin_email = "admin@timebank.org"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            admin = User(
                name="Platform Admin",
                email=admin_email,
                password_hash=hash_password("AdminPassword123!"),
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
                auth_provider=AuthProvider.LOCAL,
                rating=5.0,
                time_credits=100.0,
                in_escrow=0.0,
                lifetime_earned=0.0,
                lifetime_spent=0.0,
                onboarding_completed=1,
                avatar="/default-avatar.svg",
                location="TimeBank HQ",
                bio="Platform Administrator & System Monitor",
            )
            db.add(admin)
            print(f"  + Created Admin: {admin_email} (Password: AdminPassword123!)")
        else:
            if existing_admin.time_credits is None:
                existing_admin.time_credits = 100.0
            existing_admin.onboarding_completed = 1
            print(f"  = Admin {admin_email} already exists.")

        # 3. Seed Demo Regular User
        demo_email = "alex@timebank.org"
        existing_demo = db.query(User).filter(User.email == demo_email).first()
        if not existing_demo:
            demo_user = User(
                name="Alex Rivera",
                email=demo_email,
                password_hash=hash_password("Password123!"),
                role=UserRole.USER,
                status=UserStatus.ACTIVE,
                auth_provider=AuthProvider.LOCAL,
                rating=4.9,
                time_credits=10.0,
                in_escrow=0.0,
                lifetime_earned=0.0,
                lifetime_spent=0.0,
                onboarding_completed=1,
                avatar="/default-avatar.svg",
                location="Indiranagar, Bengaluru, KA",
                bio="Passionate web developer and community organizer.",
            )
            db.add(demo_user)
            db.flush()

            # Attach test skills to demo user
            if "React & Frontend Development" in skills_map:
                db.add(UserSkill(
                    user_id=demo_user.user_id,
                    skill_id=skills_map["React & Frontend Development"].skill_id,
                    type=SkillType.OFFERING,
                    proficiency="Advanced",
                ))
            if "Conversational Spanish" in skills_map:
                db.add(UserSkill(
                    user_id=demo_user.user_id,
                    skill_id=skills_map["Conversational Spanish"].skill_id,
                    type=SkillType.SEEKING,
                    proficiency="Beginner",
                ))
            print(f"  + Created Demo User: {demo_email} (Password: Password123!) with 2 skills")
        else:
            if existing_demo.time_credits is None:
                existing_demo.time_credits = 10.0
            existing_demo.onboarding_completed = 1
            print(f"  = Demo user {demo_email} already exists.")

        db.commit()
        print("✅ Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
