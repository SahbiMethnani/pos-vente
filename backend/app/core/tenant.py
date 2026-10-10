from fastapi import Header, HTTPException, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.master_database import MasterSessionLocal
from app.master_models import Client
from app.core.master_database import MasterSessionLocal
from app.core.config import settings
from typing import Generator
from app.core.database import SessionLocal


def get_tenant_db(x_client_id: int | None = Header(None)) -> Generator:
    """Return a DB session for the tenant identified by header X-Client-Id.
    The tenant's DB path is looked up in the master DB `clients` table.
    """
    if not x_client_id:
        raise HTTPException(status_code=400, detail="X-Client-Id header is required")
    master_db = MasterSessionLocal()
    try:
        client = master_db.query(Client).filter(Client.id == x_client_id, Client.status == "approved").first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found or not approved")
        if not client.db_path:
            raise HTTPException(status_code=500, detail="Client database path not configured")
        client_db_url = f"sqlite:///{client.db_path}"
        engine = create_engine(client_db_url, connect_args={"check_same_thread": False})
        Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = Session()
        try:
            yield db
        finally:
            db.close()
    finally:
        master_db.close()


def require_po(x_po_key: str | None = Header(None)):
    if not settings.PO_API_KEY:
        raise HTTPException(status_code=500, detail="PO API key not configured on server")
    if x_po_key != settings.PO_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid PO API key")
    return True


def get_db_for_request(x_client_id: int | None = Header(None)) -> Generator:
    """Return tenant DB session if X-Client-Id provided and approved, otherwise main DB session."""
    if x_client_id is None:
        # yield main DB
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
        return

    # otherwise, lookup tenant
    master_db = MasterSessionLocal()
    try:
        client = master_db.query(Client).filter(Client.id == x_client_id, Client.status == "approved").first()
        if not client or not client.db_path:
            raise HTTPException(status_code=404, detail="Client not found or not approved")
        client_db_url = f"sqlite:///{client.db_path}"
        engine = create_engine(client_db_url, connect_args={"check_same_thread": False})
        Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = Session()
        try:
            yield db
        finally:
            db.close()
    finally:
        master_db.close()
