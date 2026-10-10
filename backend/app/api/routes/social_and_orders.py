from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.core.tenant import get_db_for_request
from app.core.security import get_current_user
from app.crud.crud import (
    create_post, get_posts, get_post, update_post, publish_post, delete_post,
    create_client_order, get_client_orders, get_client_order, get_client_order_by_number,
    update_client_order_status, update_client_order_tracking, get_settings
)
from app.schemas.schemas import (
    PostCreate, PostUpdate, PostOut,
    ClientOrderCreate, ClientOrderOut, SocialSettingsUpdate,
    ProductOut, CategoryOut
)
from app.models.models import Post, ClientOrder, PostStatus, Product, Category, OrderStatus

# ─── Posts (Social Media Management) ──────────────────────────────────────────

router_posts = APIRouter(prefix="/api/posts", tags=["Social Posts"])


@router_posts.post("", response_model=PostOut)
def create_new_post(post: PostCreate, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    """Create a new post for social media"""
    return create_post(db, post)


@router_posts.get("", response_model=list[PostOut])
def list_posts(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db_for_request),
    current_user=Depends(get_current_user)
):
    """List all posts with optional status filter"""
    return get_posts(db, status=status, skip=skip, limit=limit)


@router_posts.get("/{post_id}", response_model=PostOut)
def get_one_post(post_id: int, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    """Get a specific post by ID"""
    post = get_post(db, post_id)
    if not post:
        raise HTTPException(404, "Post non trouvé")
    return post


@router_posts.put("/{post_id}", response_model=PostOut)
def edit_post(post_id: int, post: PostUpdate, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    """Update a post"""
    updated = update_post(db, post_id, post)
    if not updated:
        raise HTTPException(404, "Post non trouvé")
    return updated


@router_posts.post("/{post_id}/publish")
def publish_one_post(post_id: int, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    """Publish a post to all social media platforms"""
    published = publish_post(db, post_id)
    if not published:
        raise HTTPException(404, "Post non trouvé")
    return {"message": "Post publié avec succès", "post": published}


@router_posts.delete("/{post_id}")
def remove_post(post_id: int, db: Session = Depends(get_db_for_request), current_user=Depends(get_current_user)):
    """Delete a post"""
    deleted = delete_post(db, post_id)
    if not deleted:
        raise HTTPException(404, "Post non trouvé")
    return {"message": "Post supprimé"}


# ─── Client Orders ───────────────────────────────────────────────────────────

router_orders = APIRouter(prefix="/api/orders", tags=["Client Orders"])


@router_orders.post("", response_model=ClientOrderOut)
def create_order(order: ClientOrderCreate, db: Session = Depends(get_db_for_request)):
    """Create a new client order (public endpoint - no auth required)"""
    try:
        return create_client_order(db, order)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router_orders.get("", response_model=list[ClientOrderOut])
def list_orders(
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db_for_request),
    current_user=Depends(get_current_user)
):
    """List all client orders (admin only) with optional status/date filters"""
    return get_client_orders(db, status=status, start_date=start_date, end_date=end_date, skip=skip, limit=limit)


@router_orders.get("/{order_id}", response_model=ClientOrderOut)
def get_order(order_id: int, db: Session = Depends(get_db_for_request)):
    """Get order by ID"""
    order = get_client_order(db, order_id)
    if not order:
        raise HTTPException(404, "Commande non trouvée")
    return order


@router_orders.get("/number/{order_number}", response_model=ClientOrderOut)
def get_order_by_number(order_number: str, db: Session = Depends(get_db_for_request)):
    """Track order by order number"""
    order = get_client_order_by_number(db, order_number)
    if not order:
        raise HTTPException(404, "Commande non trouvée")
    return order


@router_orders.put("/{order_id}/status", response_model=ClientOrderOut)
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db_for_request),
    current_user=Depends(get_current_user)
):
    """Update order status"""
    normalized_status = status.lower()
    if normalized_status not in {item.value for item in OrderStatus}:
        raise HTTPException(400, "Statut de commande invalide")

    try:
        updated = update_client_order_status(db, order_id, normalized_status, current_user.id)
    except ValueError as exc:
        raise HTTPException(400, str(exc))

    if not updated:
        raise HTTPException(404, "Commande non trouvée")
    return updated


@router_orders.put("/{order_id}/tracking")
def update_tracking(
    order_id: int,
    tracking_number: str,
    db: Session = Depends(get_db_for_request),
    current_user=Depends(get_current_user)
):
    """Update order tracking number"""
    updated = update_client_order_tracking(db, order_id, tracking_number)
    if not updated:
        raise HTTPException(404, "Commande non trouvée")
    return {"message": "Numéro de suivi mis à jour", "tracking_number": tracking_number}


# ─── Social Settings ──────────────────────────────────────────────────────────

router_social_settings = APIRouter(prefix="/api/settings/social", tags=["Social Settings"])


@router_social_settings.put("")
def update_social_settings(
    data: SocialSettingsUpdate,
    db: Session = Depends(get_db_for_request),
    current_user=Depends(get_current_user)
):
    """Update social media platform credentials"""
    from app.crud.crud import update_settings
    from app.schemas.schemas import SettingUpdate
    
    settings = get_settings(db)
    update_dict = {}
    
    if data.facebook_page_id:
        update_dict["facebook_page_id"] = data.facebook_page_id
    if data.facebook_access_token:
        update_dict["facebook_access_token"] = data.facebook_access_token
    if data.instagram_business_id:
        update_dict["instagram_business_id"] = data.instagram_business_id
    if data.instagram_access_token:
        update_dict["instagram_access_token"] = data.instagram_access_token
    if data.tiktok_access_token:
        update_dict["tiktok_access_token"] = data.tiktok_access_token
    if data.tiktok_video_id:
        update_dict["tiktok_video_id"] = data.tiktok_video_id
    if data.website_banner:
        update_dict["website_banner"] = data.website_banner
    
    setting_update = SettingUpdate(**update_dict)
    updated = update_settings(db, setting_update)
    return {"message": "Paramètres sociaux mis à jour", "settings": updated}


# ─── Public API for Website ───────────────────────────────────────────────────

router_public = APIRouter(prefix="/api/public", tags=["Public Website"])


@router_public.get("/posts", response_model=list[PostOut])
def get_public_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db_for_request)):
    """Get published posts for website display"""
    from app.models.models import PostStatus
    posts = db.query(Post).filter(
        Post.status == PostStatus.published,
        Post.deleted_at == None
    ).order_by(Post.published_at.desc()).offset(skip).limit(limit).all()
    return posts


@router_public.get("/settings")
def get_public_settings(db: Session = Depends(get_db_for_request)):
    """Get public settings for website"""
    from app.crud.crud import get_settings as get_settings_crud
    settings = get_settings_crud(db)
    return {
        "store_name": settings.store_name,
        "address": settings.address,
        "phone": settings.phone,
        "email": settings.email,
        "logo": settings.logo,
        "website_banner": settings.website_banner,
        "currency": settings.currency,
        "currency_symbol": settings.currency_symbol,
    }


@router_public.get("/products", response_model=list[ProductOut])
def get_public_products(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    skip: Optional[int] = 0,
    limit: Optional[int] = 200,
    db: Session = Depends(get_db_for_request)
):
    """Get all products for public website (no auth required)"""
    q = db.query(Product).filter(Product.status == True)
    
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))
    
    if category_id:
        q = q.filter(Product.category_id == category_id)
    
    products = q.offset(skip).limit(limit).all()
    return products


@router_public.get("/categories", response_model=list[CategoryOut])
def get_public_categories(db: Session = Depends(get_db_for_request)):
    """Get all categories for public website (no auth required)"""
    return db.query(Category).filter(Category.status == True).all()
