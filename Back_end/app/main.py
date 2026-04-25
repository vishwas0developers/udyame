import os
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

from app.core.config import settings
from app.db.session import get_db
from app.core.redis_client import redis_client
from app.services.storage_service import storage_service

# Initialize Sentry
if hasattr(settings, 'SENTRY_DSN') and settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[FastApiIntegration()],
        traces_sample_rate=1.0,
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup — each service initializes independently
    try:
        await redis_client.connect()
    except Exception as e:
        print(f"[STARTUP] Redis unavailable: {e} — rate limiting and caching disabled.")

    try:
        await storage_service.ensure_buckets_exist()
    except Exception as e:
        print(f"[STARTUP] MinIO unavailable: {e} — file storage disabled until reconnection.")

    yield
    # Shutdown
    await redis_client.disconnect()

def get_application() -> FastAPI:
    _app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan
    )

    # Mount Static Files
    base_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(base_dir, "static")
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)
    _app.mount("/static", StaticFiles(directory=static_dir), name="static")

    # 1. API and Admin Routers
    from app.routers import auth, planning, credits, billing, admin_panel, companies
    app_mode = os.getenv("APP_MODE", "BOTH").upper()
    if app_mode in ["API", "BOTH"]:
        _app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
        _app.include_router(planning.router, prefix=f"{settings.API_V1_STR}/planning", tags=["Planning"])
        _app.include_router(credits.router, prefix=f"{settings.API_V1_STR}/credits", tags=["Credits"])
        _app.include_router(billing.router, prefix=f"{settings.API_V1_STR}/plans", tags=["Billing"])
        _app.include_router(companies.router, prefix=f"{settings.API_V1_STR}/companies", tags=["Companies"])
    
    if app_mode in ["ADMIN", "BOTH"]:
        _app.include_router(admin_panel.router, prefix="", tags=["Admin Panel"])

    # 2. Rate Limiting (Inner)
    from app.core.rate_limiter import RateLimitMiddleware
    _app.add_middleware(RateLimitMiddleware)

    # 3. CORS (Outer - Must be last to catch all responses)
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://0.0.0.0:3000",
            settings.FRONTEND_URL
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


    @_app.get("/health")
    async def health_check(db: Session = Depends(get_db)):
        health = {"status": "ok", "timestamp": datetime.now().isoformat(), "services": {}}
        
        # Database check
        try:
            db.execute(text("SELECT 1"))
            health["services"]["database"] = "up"
        except Exception as e:
            health["services"]["database"] = f"down: {str(e)}"
            health["status"] = "error"
            
        # Redis check
        try:
            if await redis_client.ping():
                health["services"]["redis"] = "up"
            else:
                health["services"]["redis"] = "down"
                health["status"] = "degraded"
        except Exception as e:
            health["services"]["redis"] = f"error: {str(e)}"
            health["status"] = "degraded"
            
        # Storage check
        try:
            # storage_service.client is available after connect
            storage_service.client.list_buckets()
            health["services"]["storage"] = "up"
        except Exception as e:
            health["services"]["storage"] = f"error: {str(e)}"
            health["status"] = "degraded"
            
        return health

    return _app

app = get_application()
