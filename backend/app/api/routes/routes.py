from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import date
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.crud import (
    get_customers, create_customer, update_customer, delete_customer,
    get_suppliers, create_supplier, update_supplier, delete_supplier,
    add_stock_movement, get_stock_movements,
    create_sale, get_sales, get_sale, cancel_sale,
    get_settings, update_settings,
    get_dashboard_stats
)
from app.schemas.schemas import (
    CustomerCreate, CustomerUpdate, CustomerOut,
    SupplierCreate, SupplierUpdate, SupplierOut,
    StockMovementCreate, StockMovementOut,
    SaleCreate, SaleOut,
    SettingUpdate, SettingOut,
    DashboardStats
)

# ─── Customers ───────────────────────────────────────────────────────────────

router_customers = APIRouter(prefix="/api/customers", tags=["Customers"])


@router_customers.get("", response_model=list[CustomerOut])
def list_customers(search: Optional[str] = None, skip: int = 0, limit: int = 100,
                   db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_customers(db, skip=skip, limit=limit, search=search)


@router_customers.post("", response_model=CustomerOut)
def add_customer(customer: CustomerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return create_customer(db, customer)


@router_customers.put("/{customer_id}", response_model=CustomerOut)
def edit_customer(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    c = update_customer(db, customer_id, customer)
    if not c:
        raise HTTPException(404, "Client non trouvé")
    return c


@router_customers.delete("/{customer_id}")
def remove_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    delete_customer(db, customer_id)
    return {"message": "Client supprimé"}


# ─── Suppliers ───────────────────────────────────────────────────────────────

router_suppliers = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])


@router_suppliers.get("", response_model=list[SupplierOut])
def list_suppliers(search: Optional[str] = None, skip: int = 0, limit: int = 100,
                   db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_suppliers(db, skip=skip, limit=limit, search=search)


@router_suppliers.post("", response_model=SupplierOut)
def add_supplier(supplier: SupplierCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return create_supplier(db, supplier)


@router_suppliers.put("/{supplier_id}", response_model=SupplierOut)
def edit_supplier(supplier_id: int, supplier: SupplierUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    s = update_supplier(db, supplier_id, supplier)
    if not s:
        raise HTTPException(404, "Fournisseur non trouvé")
    return s


@router_suppliers.delete("/{supplier_id}")
def remove_supplier(supplier_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    delete_supplier(db, supplier_id)
    return {"message": "Fournisseur supprimé"}


# ─── Stock ───────────────────────────────────────────────────────────────────

router_stock = APIRouter(prefix="/api/stocks", tags=["Stock"])


@router_stock.get("/movements", response_model=list[StockMovementOut])
def list_movements(product_id: Optional[int] = None, skip: int = 0, limit: int = 100,
                   db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_stock_movements(db, product_id=product_id, skip=skip, limit=limit)


@router_stock.post("/in", response_model=StockMovementOut)
def stock_in(movement: StockMovementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.models import StockMovementType
    movement.movement_type = StockMovementType.approvisionnement
    result = add_stock_movement(db, movement, current_user.id)
    if not result:
        raise HTTPException(404, "Produit non trouvé")
    return result


@router_stock.post("/out", response_model=StockMovementOut)
def stock_out(movement: StockMovementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.models import StockMovementType
    movement.movement_type = StockMovementType.perte
    result = add_stock_movement(db, movement, current_user.id)
    if not result:
        raise HTTPException(404, "Produit non trouvé")
    return result


@router_stock.post("/adjustment", response_model=StockMovementOut)
def stock_adjustment(movement: StockMovementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.models import StockMovementType
    movement.movement_type = StockMovementType.correction
    result = add_stock_movement(db, movement, current_user.id)
    if not result:
        raise HTTPException(404, "Produit non trouvé")
    return result


# ─── Sales ───────────────────────────────────────────────────────────────────

router_sales = APIRouter(prefix="/api/sales", tags=["Sales"])


@router_sales.post("", response_model=SaleOut)
def new_sale(sale: SaleCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return create_sale(db, sale, current_user.id)


@router_sales.get("", response_model=list[SaleOut])
def list_sales(
    skip: int = 0, limit: int = 50,
    user_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_sales(db, skip=skip, limit=limit, user_id=user_id,
                     customer_id=customer_id, date_from=date_from, date_to=date_to)


@router_sales.get("/{sale_id}", response_model=SaleOut)
def get_one_sale(sale_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sale = get_sale(db, sale_id)
    if not sale:
        raise HTTPException(404, "Vente non trouvée")
    return sale


@router_sales.post("/{sale_id}/cancel")
def cancel_one_sale(sale_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sale = cancel_sale(db, sale_id, current_user.id)
    if not sale:
        raise HTTPException(400, "Vente ne peut pas être annulée")
    return {"message": "Vente annulée", "ticket": sale.ticket_number}


# ─── Settings ─────────────────────────────────────────────────────────────────

router_settings = APIRouter(prefix="/api/settings", tags=["Settings"])


@router_settings.get("", response_model=SettingOut)
def read_settings(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_settings(db)


@router_settings.put("", response_model=SettingOut)
def save_settings(data: SettingUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return update_settings(db, data)


# ─── Dashboard ───────────────────────────────────────────────────────────────

router_dashboard = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router_dashboard.get("/stats")
def dashboard_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_dashboard_stats(db)
