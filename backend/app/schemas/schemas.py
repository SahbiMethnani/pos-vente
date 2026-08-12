from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.models import UserRole, PaymentMethod, SaleStatus, StockMovementType, PostStatus, OrderStatus


# ─── Auth ────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"

class LoginForm(BaseModel):
    username: str
    password: str


# ─── User ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.caissier

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

Token.model_rebuild()


# ─── Category ────────────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: bool = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[bool] = None

class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ─── Product ─────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    reference: str
    barcode: Optional[str] = None
    name: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    purchase_price: float = 0.0
    selling_price: float
    stock_quantity: float = 0.0
    alert_threshold: float = 5.0
    tax_rate: float = 0.0
    status: bool = True
    image: Optional[str] = None

class ProductUpdate(BaseModel):
    reference: Optional[str] = None
    barcode: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    stock_quantity: Optional[float] = None
    alert_threshold: Optional[float] = None
    tax_rate: Optional[float] = None
    status: Optional[bool] = None
    image: Optional[str] = None

class ProductOut(BaseModel):
    id: int
    reference: str
    barcode: Optional[str]
    name: str
    description: Optional[str]
    category_id: Optional[int]
    category: Optional[CategoryOut]
    purchase_price: float
    selling_price: float
    stock_quantity: float
    alert_threshold: float
    tax_rate: float
    status: bool
    image: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True


# ─── Customer ─────────────────────────────────────────────────────────────────

class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    status: Optional[bool] = None

class CustomerOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    status: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ─── Supplier ─────────────────────────────────────────────────────────────────

class SupplierCreate(BaseModel):
    name: str
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    tax_number: Optional[str] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    tax_number: Optional[str] = None

class SupplierOut(BaseModel):
    id: int
    name: str
    contact: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    tax_number: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True


# ─── Sale ────────────────────────────────────────────────────────────────────

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    discount: float = 0.0

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    items: List[SaleItemCreate]
    discount_amount: float = 0.0
    payment_method: PaymentMethod = PaymentMethod.especes
    paid_amount: float
    notes: Optional[str] = None

class SaleItemOut(BaseModel):
    id: int
    product_id: int
    product: Optional[ProductOut]
    quantity: float
    unit_price: float
    discount: float
    line_total: float
    class Config:
        from_attributes = True

class SaleOut(BaseModel):
    id: int
    ticket_number: str
    customer_id: Optional[int]
    customer: Optional[CustomerOut]
    user_id: int
    user: Optional[UserOut]
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    paid_amount: float
    change_amount: float
    payment_method: PaymentMethod
    status: SaleStatus
    notes: Optional[str]
    items: List[SaleItemOut]
    created_at: datetime
    class Config:
        from_attributes = True


# ─── Stock ───────────────────────────────────────────────────────────────────

class StockMovementCreate(BaseModel):
    product_id: int
    quantity: float
    movement_type: Optional[StockMovementType] = None
    note: Optional[str] = None

class StockMovementOut(BaseModel):
    id: int
    product_id: int
    product: Optional[ProductOut]
    movement_type: StockMovementType
    quantity: float
    old_stock: float
    new_stock: float
    user_id: int
    note: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True


# ─── Settings ─────────────────────────────────────────────────────────────────

class SettingUpdate(BaseModel):
    store_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    currency: Optional[str] = None
    currency_symbol: Optional[str] = None
    default_tax: Optional[float] = None
    receipt_footer: Optional[str] = None
    logo: Optional[str] = None
    website_banner: Optional[str] = None
    facebook_page_id: Optional[str] = None
    facebook_access_token: Optional[str] = None
    instagram_business_id: Optional[str] = None
    instagram_access_token: Optional[str] = None
    tiktok_access_token: Optional[str] = None
    tiktok_video_id: Optional[str] = None

class SettingOut(BaseModel):
    id: int
    store_name: str
    address: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    currency: str
    currency_symbol: str
    default_tax: float
    receipt_footer: Optional[str]
    logo: Optional[str]
    website_banner: Optional[str]
    facebook_page_id: Optional[str]
    facebook_access_token: Optional[str]
    instagram_business_id: Optional[str]
    instagram_access_token: Optional[str]
    tiktok_access_token: Optional[str]
    tiktok_video_id: Optional[str]
    class Config:
        from_attributes = True


# ─── Dashboard ───────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    today_revenue: float
    today_sales_count: int
    total_products: int
    low_stock_count: int
    total_customers: int
    total_suppliers: int
    monthly_revenue: float
    top_products: List[dict]
    daily_sales_chart: List[dict]


# ─── Social Media Posts ───────────────────────────────────────────────────────

class PostCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    platforms: List[str]  # ["website", "facebook", "instagram", "tiktok"]
    scheduled_at: Optional[datetime] = None

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    platforms: Optional[List[str]] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[PostStatus] = None

class PostOut(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str]
    video_url: Optional[str]
    platforms: str
    status: PostStatus
    scheduled_at: Optional[datetime]
    published_at: Optional[datetime]
    likes_count: int
    comments_count: int
    shares_count: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ─── Client Orders ────────────────────────────────────────────────────────────

class ClientOrderItemCreate(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    discount: float = 0.0

class ClientOrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    delivery_notes: Optional[str] = None
    items: List[ClientOrderItemCreate]
    discount_amount: float = 0.0
    shipping_cost: float = 0.0
    payment_method: str = "card"

class ClientOrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: float
    unit_price: float
    discount: float
    line_total: float
    product: Optional[ProductOut]
    class Config:
        from_attributes = True

class ClientOrderOut(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    subtotal: float
    shipping_cost: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    payment_method: str
    status: OrderStatus
    tracking_number: Optional[str]
    notes: Optional[str]
    items: List[ClientOrderItemOut]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ─── Settings Extended ────────────────────────────────────────────────────────

class SocialSettingsUpdate(BaseModel):
    facebook_page_id: Optional[str] = None
    facebook_access_token: Optional[str] = None
    instagram_business_id: Optional[str] = None
    instagram_access_token: Optional[str] = None
    tiktok_access_token: Optional[str] = None
    tiktok_video_id: Optional[str] = None
    website_banner: Optional[str] = None
