from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, extract
from datetime import datetime, date, timedelta
from typing import Optional, List
from app.models.models import (
    User, Category, Product, Customer, Supplier,
    Sale, SaleItem, StockMovement, Setting,
    StockMovementType, SaleStatus, Post, PostStatus,
    ClientOrder, ClientOrderItem, OrderStatus
)
from app.schemas.schemas import (
    UserCreate, UserUpdate, CategoryCreate, CategoryUpdate,
    ProductCreate, ProductUpdate, CustomerCreate, CustomerUpdate,
    SupplierCreate, SupplierUpdate, SaleCreate, StockMovementCreate,
    SettingUpdate, PostCreate, PostUpdate, ClientOrderCreate, SocialSettingsUpdate
)
from app.core.security import get_password_hash
import random
import string


# ─── User ────────────────────────────────────────────────────────────────────

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_users(db: Session, skip=0, limit=100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        password_hash=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: UserUpdate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    update_data = user.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    for k, v in update_data.items():
        setattr(db_user, k, v)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.is_active = False
        db.commit()
    return db_user


# ─── Category ────────────────────────────────────────────────────────────────

def get_categories(db: Session, skip=0, limit=100):
    return db.query(Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: CategoryCreate):
    db_cat = Category(**category.model_dump())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

def update_category(db: Session, category_id: int, category: CategoryUpdate):
    db_cat = db.query(Category).filter(Category.id == category_id).first()
    if not db_cat:
        return None
    for k, v in category.model_dump(exclude_unset=True).items():
        setattr(db_cat, k, v)
    db.commit()
    db.refresh(db_cat)
    return db_cat

def delete_category(db: Session, category_id: int):
    db_cat = db.query(Category).filter(Category.id == category_id).first()
    if db_cat:
        db.delete(db_cat)
        db.commit()
    return db_cat


# ─── Product ─────────────────────────────────────────────────────────────────

def get_products(db: Session, skip=0, limit=100, search: Optional[str] = None,
                 category_id: Optional[int] = None, low_stock: bool = False):
    q = db.query(Product).options(joinedload(Product.category))
    if search:
        q = q.filter(
            (Product.name.ilike(f"%{search}%")) |
            (Product.reference.ilike(f"%{search}%")) |
            (Product.barcode.ilike(f"%{search}%"))
        )
    if category_id:
        q = q.filter(Product.category_id == category_id)
    if low_stock:
        q = q.filter(Product.stock_quantity <= Product.alert_threshold)
    return q.offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int):
    return db.query(Product).options(joinedload(Product.category)).filter(Product.id == product_id).first()

def create_product(db: Session, product: ProductCreate):
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: ProductUpdate):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        return None
    for k, v in product.model_dump(exclude_unset=True).items():
        setattr(db_product, k, v)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db_product.status = False
        db.commit()
    return db_product


# ─── Customer ─────────────────────────────────────────────────────────────────

def get_customers(db: Session, skip=0, limit=100, search: Optional[str] = None):
    q = db.query(Customer)
    if search:
        q = q.filter(
            (Customer.first_name.ilike(f"%{search}%")) |
            (Customer.last_name.ilike(f"%{search}%")) |
            (Customer.phone.ilike(f"%{search}%"))
        )
    return q.offset(skip).limit(limit).all()

def create_customer(db: Session, customer: CustomerCreate):
    db_cust = Customer(**customer.model_dump())
    db.add(db_cust)
    db.commit()
    db.refresh(db_cust)
    return db_cust

def update_customer(db: Session, customer_id: int, customer: CustomerUpdate):
    db_cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_cust:
        return None
    for k, v in customer.model_dump(exclude_unset=True).items():
        setattr(db_cust, k, v)
    db.commit()
    db.refresh(db_cust)
    return db_cust

def delete_customer(db: Session, customer_id: int):
    db_cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if db_cust:
        db.delete(db_cust)
        db.commit()
    return db_cust


# ─── Supplier ─────────────────────────────────────────────────────────────────

def get_suppliers(db: Session, skip=0, limit=100, search: Optional[str] = None):
    q = db.query(Supplier)
    if search:
        q = q.filter(Supplier.name.ilike(f"%{search}%"))
    return q.offset(skip).limit(limit).all()

def create_supplier(db: Session, supplier: SupplierCreate):
    db_sup = Supplier(**supplier.model_dump())
    db.add(db_sup)
    db.commit()
    db.refresh(db_sup)
    return db_sup

def update_supplier(db: Session, supplier_id: int, supplier: SupplierUpdate):
    db_sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not db_sup:
        return None
    for k, v in supplier.model_dump(exclude_unset=True).items():
        setattr(db_sup, k, v)
    db.commit()
    db.refresh(db_sup)
    return db_sup

def delete_supplier(db: Session, supplier_id: int):
    db_sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if db_sup:
        db.delete(db_sup)
        db.commit()
    return db_sup


# ─── Sale ────────────────────────────────────────────────────────────────────

def _generate_ticket_number():
    prefix = "TK"
    ts = datetime.now().strftime("%Y%m%d%H%M%S")
    suffix = ''.join(random.choices(string.digits, k=3))
    return f"{prefix}{ts}{suffix}"

def create_sale(db: Session, sale: SaleCreate, user_id: int):
    subtotal = 0.0
    tax_amount = 0.0
    items_data = []
    for item in sale.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue
        line_total = (item.unit_price * item.quantity) - item.discount
        tax_amount += line_total * (product.tax_rate / 100)
        subtotal += line_total
        items_data.append((product, item, line_total))
    total = subtotal + tax_amount - sale.discount_amount
    change = sale.paid_amount - total
    db_sale = Sale(
        ticket_number=_generate_ticket_number(),
        customer_id=sale.customer_id,
        user_id=user_id,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=sale.discount_amount,
        total_amount=total,
        paid_amount=sale.paid_amount,
        change_amount=max(change, 0),
        payment_method=sale.payment_method,
        notes=sale.notes,
    )
    db.add(db_sale)
    db.flush()
    for product, item, line_total in items_data:
        db_item = SaleItem(
            sale_id=db_sale.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            discount=item.discount,
            line_total=line_total,
        )
        db.add(db_item)
        old_stock = product.stock_quantity
        product.stock_quantity = max(0, old_stock - item.quantity)
        movement = StockMovement(
            product_id=product.id,
            movement_type=StockMovementType.vente,
            quantity=item.quantity,
            old_stock=old_stock,
            new_stock=product.stock_quantity,
            user_id=user_id,
            note=f"Vente #{db_sale.ticket_number}",
        )
        db.add(movement)
    db.commit()
    db.refresh(db_sale)
    return db_sale

def get_sales(db: Session, skip=0, limit=50, user_id: Optional[int] = None,
              customer_id: Optional[int] = None, date_from: Optional[date] = None,
              date_to: Optional[date] = None):
    q = db.query(Sale).options(
        joinedload(Sale.customer),
        joinedload(Sale.user),
        joinedload(Sale.items).joinedload(SaleItem.product)
    )
    if user_id:
        q = q.filter(Sale.user_id == user_id)
    if customer_id:
        q = q.filter(Sale.customer_id == customer_id)
    if date_from:
        q = q.filter(func.date(Sale.created_at) >= date_from)
    if date_to:
        q = q.filter(func.date(Sale.created_at) <= date_to)
    return q.order_by(Sale.created_at.desc()).offset(skip).limit(limit).all()

def get_sale(db: Session, sale_id: int):
    return db.query(Sale).options(
        joinedload(Sale.customer),
        joinedload(Sale.user),
        joinedload(Sale.items).joinedload(SaleItem.product).joinedload(Product.category)
    ).filter(Sale.id == sale_id).first()

def cancel_sale(db: Session, sale_id: int, user_id: int):
    sale = get_sale(db, sale_id)
    if not sale or sale.status != SaleStatus.completed:
        return None
    sale.status = SaleStatus.cancelled
    for item in sale.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            old_stock = product.stock_quantity
            product.stock_quantity += item.quantity
            movement = StockMovement(
                product_id=product.id,
                movement_type=StockMovementType.retour,
                quantity=item.quantity,
                old_stock=old_stock,
                new_stock=product.stock_quantity,
                user_id=user_id,
                note=f"Annulation vente #{sale.ticket_number}",
            )
            db.add(movement)
    db.commit()
    db.refresh(sale)
    return sale


# ─── Stock ───────────────────────────────────────────────────────────────────

def add_stock_movement(db: Session, movement: StockMovementCreate, user_id: int):
    product = db.query(Product).filter(Product.id == movement.product_id).first()
    if not product:
        return None
    old_stock = product.stock_quantity
    if movement.movement_type in [StockMovementType.approvisionnement, StockMovementType.retour]:
        product.stock_quantity += movement.quantity
    elif movement.movement_type in [StockMovementType.vente, StockMovementType.perte]:
        product.stock_quantity = max(0, product.stock_quantity - movement.quantity)
    else:
        product.stock_quantity = movement.quantity
    db_movement = StockMovement(
        product_id=movement.product_id,
        movement_type=movement.movement_type,
        quantity=movement.quantity,
        old_stock=old_stock,
        new_stock=product.stock_quantity,
        user_id=user_id,
        note=movement.note,
    )
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement

def get_stock_movements(db: Session, product_id: Optional[int] = None, skip=0, limit=100):
    q = db.query(StockMovement).options(
        joinedload(StockMovement.product),
        joinedload(StockMovement.user)
    )
    if product_id:
        q = q.filter(StockMovement.product_id == product_id)
    return q.order_by(StockMovement.created_at.desc()).offset(skip).limit(limit).all()


# ─── Settings ─────────────────────────────────────────────────────────────────

def get_settings(db: Session):
    s = db.query(Setting).first()
    if not s:
        s = Setting()
        db.add(s)
        db.commit()
        db.refresh(s)
    return s

def update_settings(db: Session, data: SettingUpdate):
    s = get_settings(db)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s


# ─── Dashboard ───────────────────────────────────────────────────────────────

def get_dashboard_stats(db: Session):
    today = date.today()
    today_sales = db.query(Sale).filter(
        func.date(Sale.created_at) == today,
        Sale.status == SaleStatus.completed
    ).all()
    today_revenue = sum(s.total_amount for s in today_sales)
    month_start = today.replace(day=1)
    monthly = db.query(func.sum(Sale.total_amount)).filter(
        func.date(Sale.created_at) >= month_start,
        Sale.status == SaleStatus.completed
    ).scalar() or 0.0
    low_stock = db.query(func.count(Product.id)).filter(
        Product.stock_quantity <= Product.alert_threshold,
        Product.status == True
    ).scalar()
    total_products = db.query(func.count(Product.id)).filter(Product.status == True).scalar()
    total_customers = db.query(func.count(Customer.id)).scalar()
    total_suppliers = db.query(func.count(Supplier.id)).scalar()
    top_products_raw = (
        db.query(SaleItem.product_id, func.sum(SaleItem.quantity).label("total_qty"), func.sum(SaleItem.line_total).label("revenue"))
        .join(Sale)
        .filter(Sale.status == SaleStatus.completed)
        .group_by(SaleItem.product_id)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(5)
        .all()
    )
    top_products = []
    for row in top_products_raw:
        product = db.query(Product).filter(Product.id == row.product_id).first()
        if product:
            top_products.append({"name": product.name, "qty": row.total_qty, "revenue": row.revenue})
    daily_chart = []
    for i in range(7):
        d = today - timedelta(days=6 - i)
        rev = db.query(func.sum(Sale.total_amount)).filter(
            func.date(Sale.created_at) == d,
            Sale.status == SaleStatus.completed
        ).scalar() or 0.0
        daily_chart.append({"date": str(d), "revenue": rev})
    return {
        "today_revenue": today_revenue,
        "today_sales_count": len(today_sales),
        "total_products": total_products,
        "low_stock_count": low_stock,
        "total_customers": total_customers,
        "total_suppliers": total_suppliers,
        "monthly_revenue": monthly,
        "top_products": top_products,
        "daily_sales_chart": daily_chart,
    }


# ─── Posts (Social Media) ────────────────────────────────────────────────────

def create_post(db: Session, post: PostCreate):
    db_post = Post(
        title=post.title,
        content=post.content,
        image_url=post.image_url,
        video_url=post.video_url,
        platforms=",".join(post.platforms),
        status=PostStatus.scheduled if post.scheduled_at else PostStatus.draft,
        scheduled_at=post.scheduled_at
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_posts(db: Session, status: Optional[str] = None, skip=0, limit=50):
    q = db.query(Post).filter(Post.deleted_at == None)
    if status:
        q = q.filter(Post.status == PostStatus[status])
    return q.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

def get_post(db: Session, post_id: int):
    return db.query(Post).filter(Post.id == post_id, Post.deleted_at == None).first()

def update_post(db: Session, post_id: int, post: PostUpdate):
    db_post = get_post(db, post_id)
    if not db_post:
        return None
    update_data = post.model_dump(exclude_unset=True)
    if "platforms" in update_data:
        update_data["platforms"] = ",".join(update_data["platforms"])
    for k, v in update_data.items():
        setattr(db_post, k, v)
    db.commit()
    db.refresh(db_post)
    return db_post

def publish_post(db: Session, post_id: int):
    db_post = get_post(db, post_id)
    if not db_post:
        return None
    db_post.status = PostStatus.published
    db_post.published_at = datetime.utcnow()
    db.commit()
    db.refresh(db_post)
    return db_post

def delete_post(db: Session, post_id: int):
    db_post = get_post(db, post_id)
    if db_post:
        db_post.deleted_at = datetime.utcnow()
        db.commit()
    return db_post


# ─── Client Orders ──────────────────────────────────────────────────────────

def create_client_order(db: Session, order: ClientOrderCreate):
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    confirmation_token = "".join(random.choices(string.ascii_uppercase + string.digits, k=20))
    
    subtotal = 0.0
    tax_amount = 0.0
    
    items = []
    for item_data in order.items:
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            raise ValueError(f"Produit introuvable : {item_data.product_id}")
        if product.stock_quantity is None:
            product.stock_quantity = 0
        if product.stock_quantity < item_data.quantity:
            raise ValueError(f"Stock insuffisant pour {product.name}")

        line_total = (item_data.unit_price * item_data.quantity) - item_data.discount
        subtotal += line_total
        
        item = ClientOrderItem(
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            discount=item_data.discount,
            line_total=line_total
        )
        items.append(item)
    
    settings = get_settings(db)
    tax_amount = (subtotal * settings.default_tax) / 100
    total_amount = subtotal + tax_amount + order.shipping_cost - order.discount_amount
    
    db_order = ClientOrder(
        order_number=order_number,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        customer_address=order.customer_address,
        delivery_notes=order.delivery_notes,
        subtotal=subtotal,
        shipping_cost=order.shipping_cost,
        tax_amount=tax_amount,
        discount_amount=order.discount_amount,
        total_amount=total_amount,
        payment_method=order.payment_method,
        confirmation_token=confirmation_token,
        items=items
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_client_orders(db: Session, status: Optional[str] = None, start_date: Optional[date] = None, end_date: Optional[date] = None, skip=0, limit=50):
    q = db.query(ClientOrder).options(joinedload(ClientOrder.items).joinedload(ClientOrderItem.product))
    if status:
        q = q.filter(ClientOrder.status == OrderStatus[status])
    if start_date:
        q = q.filter(ClientOrder.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        end_of_day = datetime.combine(end_date + timedelta(days=1), datetime.min.time())
        q = q.filter(ClientOrder.created_at < end_of_day)
    return q.order_by(ClientOrder.created_at.desc()).offset(skip).limit(limit).all()

def get_client_order(db: Session, order_id: int):
    return db.query(ClientOrder).options(joinedload(ClientOrder.items).joinedload(ClientOrderItem.product)).filter(ClientOrder.id == order_id).first()

def get_client_order_by_number(db: Session, order_number: str):
    return db.query(ClientOrder).options(joinedload(ClientOrder.items).joinedload(ClientOrderItem.product)).filter(ClientOrder.order_number == order_number).first()

def update_client_order_status(db: Session, order_id: int, status, user_id: Optional[int] = None):
    db_order = get_client_order(db, order_id)
    if not db_order:
        return None

    if isinstance(status, str):
        try:
            status = OrderStatus[status]
        except KeyError:
            return None

    if db_order.status == status:
        return db_order

    # Decrement stock when the order is confirmed
    if status == OrderStatus.confirmed and db_order.status != OrderStatus.confirmed:
        for item in db_order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product or product.stock_quantity < item.quantity:
                raise ValueError(f"Stock insuffisant pour {item.product.name if item.product else item.product_id}")
            old_stock = product.stock_quantity
            product.stock_quantity = max(0, old_stock - item.quantity)
            if user_id is not None:
                movement = StockMovement(
                    product_id=product.id,
                    movement_type=StockMovementType.vente,
                    quantity=item.quantity,
                    old_stock=old_stock,
                    new_stock=product.stock_quantity,
                    user_id=user_id,
                    note=f"Commande client #{db_order.order_number} confirmée",
                )
                db.add(movement)

    # Restore stock when a confirmed order is cancelled or refunded
    if db_order.status == OrderStatus.confirmed and status in {OrderStatus.cancelled, OrderStatus.refunded}:
        for item in db_order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                old_stock = product.stock_quantity
                product.stock_quantity += item.quantity
                if user_id is not None:
                    movement = StockMovement(
                        product_id=product.id,
                        movement_type=StockMovementType.retour,
                        quantity=item.quantity,
                        old_stock=old_stock,
                        new_stock=product.stock_quantity,
                        user_id=user_id,
                        note=f"Commande client #{db_order.order_number} annulée",
                    )
                    db.add(movement)

    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order

def update_client_order_tracking(db: Session, order_id: int, tracking_number: str):
    db_order = get_client_order(db, order_id)
    if db_order:
        db_order.tracking_number = tracking_number
        db.commit()
        db.refresh(db_order)
    return db_order
