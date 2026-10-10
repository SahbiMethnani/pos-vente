from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    CLIENTS_DB_DIR: str = str(
    Path(__file__).resolve().parent.parent.parent / "clients_dbs"
       )
    DATABASE_URL: str = "sqlite:///./pos.db"
    MASTER_DATABASE_URL: str = "sqlite:///./master.db"
    SECRET_KEY: str = "changeme-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    # SMTP / Email settings (optional, set in .env for production)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    EMAIL_FROM: str = "no-reply@pos.local"
    PO_API_KEY: str = ""

    class Config:
        # Use backend/.env explicitly so settings load correctly regardless of cwd
        env_file = str(Path(__file__).resolve().parent.parent.parent / ".env")


settings = Settings()
