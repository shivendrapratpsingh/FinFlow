"""
FinFlow — Inventory & Product Models
"""
import enum
from sqlalchemy import Column, String, Numeric, Integer, Boolean, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class ProductType(str, enum.Enum):
    GOODS = "goods"
    SERVICE = "service"
    DIGITAL = "digital"
    COMPOSITE = "composite"


class StockMovementType(str, enum.Enum):
    IN = "in"           # Purchase / stock addition
    OUT = "out"         # Sale / consumption
    ADJUST = "adjust"   # Manual adjustment
    TRANSFER = "transfer"
    RETURN = "return"


class Product(Base):
    """Product / Service catalog item."""
    __tablename__ = "products"

    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)

    # Identity
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), nullable=True, index=True)     # SKU
    barcode = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    product_type = Column(Enum(ProductType), default=ProductType.GOODS)

    # Classification
    category = Column(String(100), nullable=True, index=True)
    brand = Column(String(100), nullable=True)
    unit = Column(String(20), default="pcs")  # pcs, kg, ltr, etc.

    # Tax
    hsn_sac_code = Column(String(10), nullable=True, index=True)
    gst_rate = Column(Numeric(5, 2), default=0)   # 0, 5, 12, 18, 28
    cess_rate = Column(Numeric(5, 2), default=0)

    # Pricing
    purchase_price = Column(Numeric(15, 2), nullable=True)
    selling_price = Column(Numeric(15, 2), nullable=True)
    mrp = Column(Numeric(15, 2), nullable=True)
    tax_inclusive = Column(Boolean, default=False)

    # Stock
    track_inventory = Column(Boolean, default=True)
    opening_stock = Column(Numeric(15, 3), default=0)
    current_stock = Column(Numeric(15, 3), default=0)
    reorder_point = Column(Numeric(15, 3), nullable=True)
    reorder_quantity = Column(Numeric(15, 3), nullable=True)
    warehouse_location = Column(String(100), nullable=True)

    # Images & metadata
    image_url = Column(String(500), nullable=True)
    images = Column(JSON, default=[])
    tags = Column(JSON, default=[])
    attributes = Column(JSON, default={})  # e.g. {"color": "red", "size": "M"}

    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    business = relationship("Business", back_populates="products")
    stock_movements = relationship("StockMovement", back_populates="product")
    batch_lots = relationship("BatchLot", back_populates="product")

    def __repr__(self):
        return f"<Product {self.name} ({self.code})>"


class Supplier(Base):
    """Supplier / vendor of the business."""
    __tablename__ = "suppliers"

    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    company_name = Column(String(255), nullable=True)
    gstin = Column(String(15), nullable=True, index=True)
    pan = Column(String(10), nullable=True)

    address_line1 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)

    payment_terms = Column(String(100), nullable=True)
    credit_days = Column(Integer, default=0)
    outstanding_amount = Column(Numeric(15, 2), default=0)

    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    business = relationship("Business", back_populates="suppliers")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")


class StockMovement(Base):
    """Tracks every stock in/out/adjustment."""
    __tablename__ = "stock_movements"

    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)
    product_id = Column(ForeignKey("products.id"), nullable=False, index=True)
    invoice_id = Column(ForeignKey("invoices.id"), nullable=True)

    movement_type = Column(Enum(StockMovementType), nullable=False, index=True)
    quantity = Column(Numeric(15, 3), nullable=False)
    rate = Column(Numeric(15, 2), nullable=True)
    balance_after = Column(Numeric(15, 3), nullable=False)

    notes = Column(Text, nullable=True)
    reference = Column(String(100), nullable=True)

    product = relationship("Product", back_populates="stock_movements")


class BatchLot(Base):
    """Batch / lot tracking for products with expiry."""
    __tablename__ = "batch_lots"

    business_id = Column(ForeignKey("businesses.id"), nullable=False)
    product_id = Column(ForeignKey("products.id"), nullable=False, index=True)

    batch_number = Column(String(100), nullable=False)
    lot_number = Column(String(100), nullable=True)
    manufacture_date = Column(String(20), nullable=True)
    expiry_date = Column(String(20), nullable=True, index=True)
    quantity = Column(Numeric(15, 3), default=0)
    purchase_price = Column(Numeric(15, 2), nullable=True)

    product = relationship("Product", back_populates="batch_lots")


class PurchaseOrder(Base):
    """Purchase order to a supplier."""
    __tablename__ = "purchase_orders"

    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)
    supplier_id = Column(ForeignKey("suppliers.id"), nullable=True, index=True)

    po_number = Column(String(50), nullable=False, index=True)
    status = Column(String(30), default="draft")  # draft, sent, received, cancelled
    order_date = Column(String(20), nullable=False)
    expected_date = Column(String(20), nullable=True)

    subtotal = Column(Numeric(15, 2), default=0)
    total_tax = Column(Numeric(15, 2), default=0)
    total_amount = Column(Numeric(15, 2), default=0)

    notes = Column(Text, nullable=True)
    items = Column(JSON, default=[])

    supplier = relationship("Supplier", back_populates="purchase_orders")
