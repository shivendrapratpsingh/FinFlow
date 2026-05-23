"""FinFlow — Inventory & Product Routes."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.db.models.inventory import Product, ProductType
from app.db.models.user import User

router = APIRouter()


@router.get("/products")
async def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    low_stock: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    biz_id = current_user.active_business_id
    q = select(Product).where(Product.business_id == biz_id, Product.is_active == True)
    if search:
        q = q.where(Product.name.ilike(f"%{search}%"))
    if category:
        q = q.where(Product.category == category)
    if low_stock:
        q = q.where(Product.current_stock <= Product.reorder_point)

    count_q = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_q.scalar()
    q = q.order_by(Product.name).offset((page-1)*page_size).limit(page_size)
    result = await db.execute(q)
    products = result.scalars().all()

    return {
        "products": [_product_dict(p) for p in products],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/products", status_code=201)
async def create_product(
    data: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    biz_id = current_user.active_business_id
    allowed = {"name","code","description","product_type","category","brand","unit",
               "hsn_sac_code","gst_rate","purchase_price","selling_price","mrp",
               "opening_stock","current_stock","reorder_point","track_inventory"}
    fields = {k: v for k, v in data.items() if k in allowed}
    product = Product(business_id=biz_id, **fields)
    if product.opening_stock and not product.current_stock:
        product.current_stock = product.opening_stock
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return _product_dict(product)


@router.get("/products/{product_id}")
async def get_product(
    product_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).where(Product.id == product_id,
                              Product.business_id == current_user.active_business_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(404, "Product not found")
    return _product_dict(product)


@router.patch("/products/{product_id}")
async def update_product(
    product_id: str,
    data: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).where(Product.id == product_id,
                              Product.business_id == current_user.active_business_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(404, "Product not found")
    allowed = {"name","code","description","category","brand","unit","hsn_sac_code",
               "gst_rate","purchase_price","selling_price","mrp","reorder_point",
               "track_inventory","is_active"}
    for k, v in data.items():
        if k in allowed:
            setattr(product, k, v)
    await db.commit()
    await db.refresh(product)
    return _product_dict(product)


@router.post("/products/{product_id}/adjust-stock")
async def adjust_stock(
    product_id: str,
    data: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually adjust stock (e.g. after physical count)."""
    result = await db.execute(
        select(Product).where(Product.id == product_id,
                              Product.business_id == current_user.active_business_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(404, "Product not found")
    adjustment = float(data.get("quantity", 0))
    product.current_stock = float(product.current_stock or 0) + adjustment
    await db.commit()
    return {"id": product.id, "current_stock": float(product.current_stock)}


@router.get("/summary")
async def inventory_summary(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    biz_id = current_user.active_business_id
    total_q = await db.execute(select(func.count(Product.id)).where(Product.business_id == biz_id))
    low_q = await db.execute(
        select(func.count(Product.id)).where(
            Product.business_id == biz_id,
            Product.track_inventory == True,
            Product.current_stock <= Product.reorder_point,
        )
    )
    value_q = await db.execute(
        select(func.coalesce(func.sum(Product.current_stock * Product.purchase_price), 0))
        .where(Product.business_id == biz_id)
    )
    return {
        "total_products": total_q.scalar() or 0,
        "low_stock_count": low_q.scalar() or 0,
        "inventory_value": float(value_q.scalar() or 0),
    }


def _product_dict(p: Product) -> dict:
    return {
        "id": p.id, "name": p.name, "code": p.code,
        "category": p.category, "unit": p.unit,
        "hsn_sac_code": p.hsn_sac_code,
        "gst_rate": float(p.gst_rate or 0),
        "selling_price": float(p.selling_price or 0),
        "purchase_price": float(p.purchase_price or 0),
        "current_stock": float(p.current_stock or 0),
        "reorder_point": float(p.reorder_point or 0) if p.reorder_point else None,
        "track_inventory": p.track_inventory,
        "is_active": p.is_active,
        "created_at": str(p.created_at),
    }
