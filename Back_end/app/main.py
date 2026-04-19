from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
import os

def get_application() -> FastAPI:
    _app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )

    # Mount Static Files
    base_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(base_dir, "static")
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)
    _app.mount("/static", StaticFiles(directory=static_dir), name="static")

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from app.routers import auth, planning, admin, admin_ui, credits

    _app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
    _app.include_router(planning.router, prefix=f"{settings.API_V1_STR}/planning", tags=["Planning"])
    _app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin API"])
    _app.include_router(credits.router, prefix=f"{settings.API_V1_STR}/credits", tags=["Credits"])
    _app.include_router(admin_ui.router, prefix="", tags=["Admin UI"])


    @_app.get("/health")
    def health_check():
        return {"status": "healthy"}

    return _app

app = get_application()
