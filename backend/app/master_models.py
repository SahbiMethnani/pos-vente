from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Text
from sqlalchemy.sql import func
from app.core.master_database import MasterBase
import enum


class ClientStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Client(MasterBase):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False)
    contact_email = Column(String(150), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    admin_username = Column(String(50), nullable=False)
    admin_email = Column(String(150), nullable=False)
    admin_password_hash = Column(String(255), nullable=False)
    db_path = Column(String(500), nullable=True)
    status = Column(Enum(ClientStatus), default=ClientStatus.pending)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
