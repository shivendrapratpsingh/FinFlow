"""FinFlow — Billing Pydantic Schemas."""
from typing import List, Optional
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel


class LineItemRequest(BaseModel):
    product_id: Optional[UUID] = None
    description: str
    hsn_sac_code: Optional[str] = None
    quantity: Decimal
    unit: str = "pcs"
    rate: Decimal
    discount_percent: Decimal = Decimal("0")
    gst_rate: Decimal = Decimal("0")


class InvoiceCreateRequest(BaseModel):
    customer_id: Optional[UUID] = None
    customer_name: Optional[str] = None  # Quick invoice without saved customer
    invoice_date: str
    due_date: Optional[str] = None
    place_of_supply: Optional[str] = None
    line_items: List[LineItemRequest]
    notes: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    payment_terms: Optional[str] = None
    discount_percent: Decimal = Decimal("0")


class InvoiceUpdateRequest(BaseModel):
    status: Optional[str] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None
    line_items: Optional[List[LineItemRequest]] = None


class LineItemResponse(BaseModel):
    id: str
    description: str
    hsn_sac_code: Optional[str]
    quantity: Decimal
    unit: str
    rate: Decimal
    discount_amount: Decimal
    taxable_amount: Decimal
    gst_rate: Decimal
    cgst_amount: Decimal
    sgst_amount: Decimal
    igst_amount: Decimal
    total_amount: Decimal

    model_config = {"from_attributes": True}


class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    status: str
    invoice_date: str
    due_date: Optional[str]
    customer_id: Optional[str]
    subtotal: Decimal
    discount_amount: Decimal
    taxable_amount: Decimal
    cgst_amount: Decimal
    sgst_amount: Decimal
    igst_amount: Decimal
    total_tax: Decimal
    total_amount: Decimal
    paid_amount: Decimal
    balance_due: Decimal
    is_igst: bool
    line_items: List[LineItemResponse] = []

    model_config = {"from_attributes": True}


class InvoiceListResponse(BaseModel):
    invoices: List[InvoiceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CustomerCreateRequest(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    gstin: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None


class CustomerResponse(BaseModel):
    id: str
    name: str
    email: Optional[str]
    phone: Optional[str]
    company_name: Optional[str]
    gstin: Optional[str]
    outstanding_amount: Decimal
    total_business: Decimal

    model_config = {"from_attributes": True}


class PaymentCreateRequest(BaseModel):
    amount: Decimal
    payment_date: str
    payment_method: str = "cash"
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: str
    amount: Decimal
    payment_date: str
    payment_method: str
    reference_number: Optional[str]

    model_config = {"from_attributes": True}


class InvoiceShareRequest(BaseModel):
    method: str  # whatsapp | email | sms
    recipient: str  # phone or email
