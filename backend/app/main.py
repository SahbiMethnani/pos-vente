import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from app.core.database import engine, Base
from app.models.models import *  # noqa - registers all models
from app.api.routes.auth import router, router_users
from app.api.routes.products import router_categories, router_products
from app.api.routes.routes import (
    router_customers, router_suppliers, router_stock,
    router_sales, router_settings, router_dashboard
)
from app.api.routes.social_and_orders import (
    router_posts, router_orders, router_social_settings, router_public
)
from app.core.master_database import master_engine, MasterBase
from app.master_models import *  # noqa - registers master models
from app.api.routes.clients import router as router_clients
from app.core.security import get_password_hash
from app.core.database import SessionLocal
from app.models.models import User, UserRole, Setting

app = FastAPI(
    title="POS API",
    description="Application de caisse – Point de Vente",
    version="1.0.0"
)

allowed_origins = os.getenv("BACKEND_ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = Path(__file__).resolve().parent.parent / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(router)
app.include_router(router_users)
app.include_router(router_categories)
app.include_router(router_products)
app.include_router(router_customers)
app.include_router(router_suppliers)
app.include_router(router_stock)
app.include_router(router_sales)
app.include_router(router_settings)
app.include_router(router_dashboard)
app.include_router(router_posts)
app.include_router(router_orders)
app.include_router(router_social_settings)
app.include_router(router_public)
app.include_router(router_clients)


@app.on_event("startup")
def startup():
    # create tenant schema (used for individual client DBs when created)
    Base.metadata.create_all(bind=engine)
    # create master DB tables (clients registry)
    MasterBase.metadata.create_all(bind=master_engine)
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            db.add(User(
                username="admin",
                email="admin@pos.local",
                full_name="Administrateur",
                role=UserRole.admin,
                password_hash=get_password_hash("admin123"),
                is_active=True
            ))
        settings = db.query(Setting).first()
        if not settings:
            db.add(Setting())
        db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "POS API opérationnelle", "docs": "/docs"}
