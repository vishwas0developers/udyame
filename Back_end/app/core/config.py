from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Udyame AI"
    API_V1_STR: str = "/api/v1"
    
    # Application
    APP_MODE: str = "BOTH" # API, ADMIN, BOTH
    
    # Database
    DATABASE_URL: str = "postgresql+psycopg2://user:pass@localhost:5432/udyame_db"
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: Optional[str] = None
    
    # AI Providers
    DEFAULT_LLM_PROVIDER: str = "openai"
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    HF_TOKEN: Optional[str] = None
    EMBEDDING_MODE: str = "REMOTE" # LOCAL or REMOTE
    
    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_SECURE: bool = False
    MINIO_BUCKET_NAME: str = "udyame-assets"
    MINIO_BUCKET_DOCUMENTS: str = "udyame-documents"
    MINIO_BUCKET_TEMPLATES: str = "udyame-templates"
    MINIO_BUCKET_LOGS: str = "udyame-logs"
    
    # SMTP / Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: str = "noreply@udyame.com"
    EMAILS_FROM_NAME: str = "Udyame AI"
    
    # Payments
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None

    # Monitoring
    SENTRY_DSN: Optional[str] = None
    RATE_LIMIT_PER_MINUTE: int = 60

    # Security
    SECRET_KEY: str = "SUPER_SECRET_KEY_REPLACE_IN_PROD"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7    # 7 days
    COOKIE_SECURE: bool = True

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_CALLBACK_URL: str = "http://localhost:5014/api/v1/auth/google/callback"
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def redis_connection_url(self) -> str:
        if self.REDIS_URL:
            return self.REDIS_URL
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

settings = Settings()
