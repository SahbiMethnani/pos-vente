from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.core.master_database import get_master_db
from app.core.tenant import require_po
from app.master_models import Client, ClientStatus
from app.core.security import get_password_hash
from app.core.database import Base as TenantBase
from app import models as tenant_models  # noqa: register models
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.email_utils import send_email
from app.core.config import settings
import os
from pathlib import Path

router = APIRouter(prefix="/clients", tags=["clients"])


class ClientRegister(BaseModel):
    company_name: str
    admin_username: str
    admin_email: EmailStr
    admin_password: str
    contact_email: EmailStr | None = None
    contact_phone: str | None = None


@router.post("/register")
def register_client(payload: ClientRegister, db: Session = Depends(get_master_db)):
    # Simple check for existing admin email or username
    existing = db.query(Client).filter((Client.admin_email == payload.admin_email) | (Client.admin_username == payload.admin_username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Admin username or email already registered")
    hashed = get_password_hash(payload.admin_password)
    client = Client(
        company_name=payload.company_name,
        admin_username=payload.admin_username,
        admin_email=payload.admin_email,
        admin_password_hash=hashed,
        contact_email=payload.contact_email,
        contact_phone=payload.contact_phone,
        status=ClientStatus.pending
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    # Optionally notify product owner via email
    try:
        send_email(settings.EMAIL_FROM, f"Nouvelle demande: {client.company_name}", f"Une nouvelle demande d'inscription a été créée: {client.company_name} (id={client.id})")
    except Exception:
        pass
    return {"id": client.id, "status": client.status.value}


@router.get("/pending")
def list_pending_clients(db: Session = Depends(get_master_db), _=Depends(require_po)):
    try:
        clients = db.query(Client).filter(Client.status == ClientStatus.pending).all()
        return [
            {
                "id": c.id,
                "company_name": c.company_name,
                "admin_email": c.admin_email,
                "contact_email": c.contact_email,
                "created_at": c.created_at,
            }
            for c in clients
        ]
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/{client_id}/approve")
def approve_client(client_id: int, db: Session = Depends(get_master_db), _=Depends(require_po)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.status == ClientStatus.approved:
        return {"detail": "Already approved"}

    # Create clients directory
    #base_dir = Path(__file__).resolve().parent.parent.parent.parent / "clients_dbs"
    #base_dir.mkdir(parents=True, exist_ok=True)
    base_dir = Path(settings.CLIENTS_DB_DIR)
    base_dir.mkdir(parents=True, exist_ok=True)
    client_db_path = base_dir / f"client_{client.id}.db"
    client_db_url = f"sqlite:///{client_db_path.as_posix()}"

    # create engine and DB schema for tenant
    engine = create_engine(client_db_url, connect_args={"check_same_thread": False})
    TenantBase.metadata.create_all(bind=engine)

    # create admin user in tenant DB
    TenantSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    tenant_db = TenantSession()
    try:
        # Import User model from tenant models
        from app.models.models import User, UserRole
        from app.core.security import get_password_hash

        admin_user = User(
            username=client.admin_username,
            email=client.admin_email,
            full_name=client.company_name,
            role=UserRole.admin,
            password_hash=client.admin_password_hash,
            is_active=True
        )
        tenant_db.add(admin_user)
        tenant_db.commit()
    finally:
        tenant_db.close()

    client.status = ClientStatus.approved
    client.db_path = str(client_db_path)
    db.commit()

    # send email to client
    try:
        send_email(client.admin_email, "Inscription validée", f"Bonjour {client.company_name},\nVotre inscription a été acceptée. Vous pouvez vous connecter avec le compte administrateur.")
    except Exception:
        pass

    return {"detail": "approved", "client_id": client.id}


@router.post("/{client_id}/reject")
def reject_client(client_id: int, reason: str | None = None, db: Session = Depends(get_master_db), _=Depends(require_po)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client.status = ClientStatus.rejected
    db.commit()
    # notify client
    try:
        send_email(client.admin_email, "Inscription refusée", f"Bonjour {client.company_name},\nVotre demande d'inscription a été refusée.\n{reason or ''}")
    except Exception:
        pass
    return {"detail": "rejected"}


@router.get('/debug_po')
def debug_po():
    # temporary debug endpoint
    return {"PO_API_KEY": settings.PO_API_KEY}
