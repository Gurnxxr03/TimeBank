from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.skills import router as skills_router
from app.routers.admin import router as admin_router
from app.routers.bookings import router as bookings_router

__all__ = [
    "auth_router",
    "users_router",
    "skills_router",
    "admin_router",
    "bookings_router",
]
