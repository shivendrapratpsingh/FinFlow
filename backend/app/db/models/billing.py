"""
FinFlow — Billing & Invoice Models
Supports GST invoices, credit notes, payment tracking.
"""
import enum
from decimal import Decimal
from sqlalchemy import (
    Column, String, Numeric, Integer, Boolean, Enum,
    ForeignKey, Text, JSON, Date
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class InvoiceStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class InvoiceType(str, enum.Enum):
    SALE = "sale"
    PURCHASE = "purchase"
    CREDIT_NOTE = "credit_note"
    DEBIT_NOTE = "debit_note"
    PROFORMA = "proforma"
    ESTIMATE = "estimate"


class Customer(Base):
    """Customer / client of the business."""
    __tablename__ = "customers"

    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)

    # Identity
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    company_name = Column(String(255), nullable=True)
    gstin = Column(String(15), nullable=True, index=True)
    pan = Column(String(10), nullable=True)

    # Address
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    country = Column(String(100), default="India")

    # Financial
    credit_limit = Column(Numeric(15, 2), default=0)
    outstanding_amount = Column(Numeric(15, 2), default=0)
    total_business = Column(Numeric(15, 2), default=0)

    notes = Column(Text, nullable=True)
    tags = Column(JSON, default=[])
    is_active = Column(Boolean, default=True)

    business = relationship("Business", back_populates="customers")
    invoices = relationship("Invoice", back_populates="customer")

    def __repr__(self):
        return f"<Customer {self.name}>"


class Invoice(Base):
    """Invoice / Bill — core billing document."""
    __tablename__ = "invoices"

    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)
    customer_id = Column(ForeignKey("customers.id"), nullable=True, index=True)
    created_by_id = Column(ForeignKey("users.id"), nullable=False)

    # Invoice Meta
    invoice_number = Column(String(50), nullable=False, index=True)
    invoice_type = Column(Enum(InvoiceType), default=InvoiceType.SALE)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT, index=True)

    # Dates
    invoice_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)
    supply_date = Column(Date, nullable=True)

    # Amounts (all in INR / business currency)
    subtotal = Column(Numeric(15, 2), default=0)     # before tax
    discount_amount = Column(Numeric(15, 2), default=0)
    taxable_amount = Column(Numeric(15, 2), default=0)
    cgst_amount = Column(Numeric(15, 2), default=0)
    sgst_amount = Column(Numeric(15, 2), default=0)
    igst_amount = Column(Numeric(15, 2), default=0)
    cess_amount = Column(Numeric(15, 2), default=0)
    total_tax = Column(Numeric(15, 2), default=0)
    total_amount = Column(Numeric(15, 2), default=0)
    paid_amount = Column(Numeric(15, 2), default=0)
    balance_due = Column(Numeric(15, 2), default=0)
    round_off = Column(Numeric(5, 2), default=0)

    # GST
    place_of_supply = Column(String(100), nullable=True)
    reverse_charge = Column(Boolean, default=False)
    is_igst = Column(Boolean, default=False)  # inter-state supply

    # Payment
    payment_terms = Column(String(100), nullable=True)
    payment_link = Column(String(500), nullable=True)

    # Shipping
    shipping_address = Column(JSON, nullable=True)
    shipping_charges = Column(Numeric(10, 2), default=0)

    # Content
    notes = Column(Text, nullable=True)
    terms_and_conditions = Column(Text, nullable=True)

    # Tracking
    sent_at = Column(String(50), nullable=True)
    viewed_at = Column(String(50), nullable=True)
    pdf_url = Column(String(500), nullable=True)

    # Relationships
    business = relationship("Business", back_populates="invoices")
    customer = relationship("Customer", back_populates="invoices")
    line_items = relationship("InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="invoice")

    def __repr__(self):
        return f"<Invoice {self.invoice_number}>"


class InvoiceLineItem(Base):
    """Individual line item on an invoice."""
    __tablename__ = "invoice_line_items"

    invoice_id = Column(ForeignKey("invoices.id"), nullable=False, index=True)
    product_id = Column(ForeignKey("products.id"), nullable=True)

    # Item details
    description = Column(String(500), nullable=False)
    hsn_sac_code = Column(String(10), nullable=True)
    quantity = Column(Numeric(15, 3), nullable=False, default=1)
    unit = Column(String(20), default="pcs")
    rate = Column(Numeric(15, 2), nullable=False)

    # Discount
    discount_percent = Column(Numeric(5, 2), default=0)
    discount_amount = Column(Numeric(15, 2), default=0)

    # Tax
    gst_rate = Column(Numeric(5, 2), default=0)   # e.g. 18.00 for 18%
    cgst_rate = Column(Numeric(5, 2), default=0)
    sgst_rate = Column(Numeric(5, 2), default=0)
    igst_rate = Column(Numeric(5, 2), default=0)
    cgst_amount = Column(Numeric(15, 2), default=0)
    sgst_amount = Column(Numeric(15, 2), default=0)
    igst_amount = Column(Numeric(15, 2), default=0)

    # Totals
    taxable_amount = Column(Numeric(15, 2), nullable=False)
    total_amount = Column(Numeric(15, 2), nullable=False)
    sort_order = Column(Integer, default=0)

    invoice = relationship("Invoice", back_populates="line_items")
    product = relationship("Product")


class Payment(Base):
    """Payment received against an invoice."""
    __tablename__ = "payments"

    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)
    invoice_id = Column(ForeignKey("invoices.id"), nullable=True, index=True)
    customer_id = Column(ForeignKey("customers.id"), nullable=True)

    # Payment details
    amount = Column(Numeric(15, 2), nullable=False)
    payment_date = Column(Date, nullable=False)
    payment_method = Column(String(50), default="cash")  # cash, upi, bank, card
    reference_number = Column(String(100), nullable=True)  # UTR, cheque no etc.

    # Gateway info
    gateway = Column(String(50), nullable=True)  # razorpay, stripe
    gateway_payment_id = Column(String(100), nullable=True)
    gateway_status = Column(String(50), nullable=True)

    notes = Column(Text, nullable=True)

    invoice = relationship("Invoice", back_populates="payments")
