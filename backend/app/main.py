from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth_router, users_router, skills_router, admin_router

app = FastAPI(
    title="TimeBank API",
    description="Backend API for TimeBank Community Skill-Exchange Platform (Phase 1 MVP)",
    version="1.0.0"
)

# CORS configuration - Exact origins only (No wildcard when allow_credentials=True)
allowed_origins = list(set([
    settings.FRONTEND_URL.rstrip("/"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(skills_router)
app.include_router(admin_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "TimeBank API",
        "version": "1.0.0"
    }


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Welcome to the TimeBank API. Visit /docs for OpenAPI documentation.",
        "health": "/health"
    }
