from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

master_engine = create_engine(
    settings.MASTER_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.MASTER_DATABASE_URL else {}
)

MasterSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=master_engine)

MasterBase = declarative_base()


def get_master_db():
    db = MasterSessionLocal()
    try:
        yield db
    finally:
        db.close()
