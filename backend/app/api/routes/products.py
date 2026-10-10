from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from typing import Optional
from sqlalchemy.orm import Session
from app.core.tenant import get_db_for_request
from app.core.security import get_current_user
from app.crud.crud import (
    get_categories, create_category, update_category, delete_category,
    get_products, get_product, create_product, update_product, delete_product
)
from app.schemas.schemas import (
    CategoryCreate, CategoryUpdate, CategoryOut,
    ProductCreate, ProductUpdate, ProductOut
)

STATIC_DIR = Path(__file__).resolve().parents[3] / "static"
PRODUCT_IMAGES_DIR = STATIC_DIR / "products"
PRODUCT_IMAGES_DIR.mkdir(parents=True, exist_ok=True)


def save_product_image(image: Optional[UploadFile]) -> Optional[str]:
    if not image:
        return None
    extension = Path(image.filename).suffix or ".jpg"
    image_name = f"{uuid4().hex}{extension}"
    destination = PRODUCT_IMAGES_DIR / image_name
    with destination.open("wb") as buffer:
        buffer.write(image.file.read())
    return f"/static/products/{image_name}"

# ─── Categories ──────────────────────────────────────────────────────────────

router_categories = APIRouter(prefix="/api/categories", tags=["Categories"])


@router_categories.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    return get_categories(db)


@router_categories.post("", response_model=CategoryOut)
def add_category(category: CategoryCreate, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    return create_category(db, category)


@router_categories.put("/{category_id}", response_model=CategoryOut)
def edit_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    db_cat = update_category(db, category_id, category)
    if not db_cat:
        raise HTTPException(404, "Catégorie non trouvée")
    return db_cat


@router_categories.delete("/{category_id}")
def remove_category(category_id: int, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    delete_category(db, category_id)
    return {"message": "Catégorie supprimée"}


# ─── Products ────────────────────────────────────────────────────────────────

router_products = APIRouter(prefix="/api/products", tags=["Products"])


@router_products.get("", response_model=list[ProductOut])
def list_products(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    low_stock: bool = Query(False),
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db_for_request),
    current_user=Depends(get_current_user)
):
    return get_products(db, skip=skip, limit=limit, search=search,
                        category_id=category_id, low_stock=low_stock)


@router_products.get("/{product_id}", response_model=ProductOut)
def get_one_product(product_id: int, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    p = get_product(db, product_id)
    if not p:
        raise HTTPException(404, "Produit non trouvé")
    return p


@router_products.post("", response_model=ProductOut)
def add_product(product: ProductCreate, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    return create_product(db, product)


@router_products.post("/upload", response_model=ProductOut)
def add_product_with_image(
    reference: str = Form(...),
    barcode: Optional[str] = Form(None),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    purchase_price: float = Form(0.0),
    selling_price: float = Form(...),
    stock_quantity: float = Form(0.0),
    alert_threshold: float = Form(5.0),
    tax_rate: float = Form(0.0),
    status: bool = Form(True),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db_for_request),
    current_user=Depends(get_current_user)
):
    image_url = save_product_image(image)
    product = ProductCreate(
        reference=reference,
        barcode=barcode,
        name=name,
        description=description,
        category_id=category_id,
        purchase_price=purchase_price,
        selling_price=selling_price,
        stock_quantity=stock_quantity,
        alert_threshold=alert_threshold,
        tax_rate=tax_rate,
        status=status,
        image=image_url
    )
    return create_product(db, product)


@router_products.put("/{product_id}", response_model=ProductOut)
def edit_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    p = update_product(db, product_id, product)
    if not p:
        raise HTTPException(404, "Produit non trouvé")
    return p


@router_products.put("/upload/{product_id}", response_model=ProductOut)
def edit_product_with_image(
    product_id: int,
    reference: str = Form(...),
    barcode: Optional[str] = Form(None),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    purchase_price: float = Form(0.0),
    selling_price: float = Form(...),
    stock_quantity: float = Form(0.0),
    alert_threshold: float = Form(5.0),
    tax_rate: float = Form(0.0),
    status: bool = Form(True),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db_for_request),
    current_user=Depends(get_current_user)
):
    image_url = save_product_image(image)
    update_data = {
        "reference": reference,
        "barcode": barcode,
        "name": name,
        "description": description,
        "category_id": category_id,
        "purchase_price": purchase_price,
        "selling_price": selling_price,
        "stock_quantity": stock_quantity,
        "alert_threshold": alert_threshold,
        "tax_rate": tax_rate,
        "status": status,
    }
    if image_url is not None:
        update_data["image"] = image_url
    product = ProductUpdate(**update_data)
    p = update_product(db, product_id, product)
    if not p:
        raise HTTPException(404, "Produit non trouvé")
    return p


@router_products.delete("/{product_id}")
def remove_product(product_id: int, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    delete_product(db, product_id)
    return {"message": "Produit désactivé"}
