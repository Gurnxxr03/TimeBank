import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User, AuthProvider, UserRole, UserStatus
from app.models.skill import Skill
from app.utils.security import hash_password

# Test database in memory
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_auth_flow_and_profile():
    # 1. Signup
    signup_res = client.post(
        "/auth/signup",
        json={"name": "Sarah Connor", "email": "sarah@example.com", "password": "Password123!"}
    )
    assert signup_res.status_code == 201
    assert "access_token" in signup_res.cookies
    data = signup_res.json()
    assert data["user"]["name"] == "Sarah Connor"
    assert data["user"]["role"] == "user"

    # 2. Duplicate Signup Rejection
    dup_res = client.post(
        "/auth/signup",
        json={"name": "Sarah Connor", "email": "sarah@example.com", "password": "Password123!"}
    )
    assert dup_res.status_code == 409

    # 3. GET /users/me with cookie
    me_res = client.get("/users/me")
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "sarah@example.com"

    # 4. Update Profile PUT /users/me
    update_res = client.put("/users/me", json={"name": "Sarah J. Connor"})
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Sarah J. Connor"

    # 5. Logout
    logout_res = client.post("/auth/logout")
    assert logout_res.status_code == 200

    # 6. GET /users/me after logout -> 401
    me_after_logout = client.get("/users/me")
    assert me_after_logout.status_code == 401

    # 7. Login again
    login_res = client.post(
        "/auth/login",
        json={"email": "sarah@example.com", "password": "Password123!"}
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.cookies


def test_skills_and_user_skills():
    # Log in as Sarah
    client.post(
        "/auth/login",
        json={"email": "sarah@example.com", "password": "Password123!"}
    )

    # 1. Create a skill in catalog
    create_skill_res = client.post(
        "/skills",
        json={"name": "Survival Tactics", "category": "Practical & Career"}
    )
    assert create_skill_res.status_code == 201
    skill_id = create_skill_res.json()["skill_id"]

    # 2. Duplicate skill rejection (case-insensitive)
    dup_skill_res = client.post(
        "/skills",
        json={"name": "survival tactics", "category": "Practical & Career"}
    )
    assert dup_skill_res.status_code == 409

    # 3. Add skill to user profile (Offering)
    add_us_res = client.post(
        "/users/me/skills",
        json={"skill_id": skill_id, "type": "offering", "proficiency": "Expert"}
    )
    assert add_us_res.status_code == 201
    user_skill_id = add_us_res.json()["id"]

    # 4. Check /users/me reflects added skill
    me_res = client.get("/users/me")
    assert me_res.status_code == 200
    skills = me_res.json()["skills"]
    assert len(skills) >= 1
    assert any(s["skill"]["name"] == "Survival Tactics" for s in skills)

    # 5. Remove user skill
    del_res = client.delete(f"/users/me/skills/{user_skill_id}")
    assert del_res.status_code == 200

    # 6. Verify removed
    me_res2 = client.get("/users/me")
    assert not any(s["id"] == user_skill_id for s in me_res2.json()["skills"])


def test_admin_portal_and_rbac():
    # Create admin in DB
    db = TestingSessionLocal()
    admin = User(
        name="Sys Admin",
        email="admin_test@example.com",
        password_hash=hash_password("AdminSecurePass1!"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
        auth_provider=AuthProvider.LOCAL
    )
    db.add(admin)
    db.commit()
    db.close()

    # Sarah Connor is a normal user
    client.post("/auth/login", json={"email": "sarah@example.com", "password": "Password123!"})
    admin_access_res = client.get("/admin/stats")
    assert admin_access_res.status_code == 403

    # Log in as Admin
    client.post("/auth/login", json={"email": "admin_test@example.com", "password": "AdminSecurePass1!"})
    
    # 1. Admin stats
    stats_res = client.get("/admin/stats")
    assert stats_res.status_code == 200
    assert stats_res.json()["total_users"] >= 2

    # 2. Admin user listing
    users_res = client.get("/admin/users?page=1&page_size=10")
    assert users_res.status_code == 200
    data = users_res.json()
    assert len(data["items"]) >= 2

    # 3. Find Sarah's ID
    sarah_item = next(u for u in data["items"] if u["email"] == "sarah@example.com")
    sarah_id = sarah_item["user_id"]

    # 4. Ban Sarah
    ban_res = client.put(f"/admin/users/{sarah_id}/status", json={"status": "banned"})
    assert ban_res.status_code == 200
    assert ban_res.json()["status"] == "banned"

    # 5. Sarah attempts to log in while banned -> 403
    sarah_login = client.post("/auth/login", json={"email": "sarah@example.com", "password": "Password123!"})
    assert sarah_login.status_code == 403

    # 6. Admin unbans Sarah
    client.post("/auth/login", json={"email": "admin_test@example.com", "password": "AdminSecurePass1!"})
    unban_res = client.put(f"/admin/users/{sarah_id}/status", json={"status": "active"})
    assert unban_res.status_code == 200
    assert unban_res.json()["status"] == "active"
