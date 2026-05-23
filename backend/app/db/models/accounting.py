"""
FinFlow — Accounting Engine Models
Double-entry bookkeeping: Ledgers, Journal Entries, Transactions.
Users never see this directly — it's auto-managed by the system.
"""
import enum
from sqlalchemy import Column, String, Numeric, Boolean, Enum, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base


class LedgerGroup(str, enum.Enum):
    """Standard accounting ledger groups."""
    # Assets
    CURRENT_ASSETS = "current_assets"
    FIXED_ASSETS = "fixed_assets"
    BANK_ACCOUNTS = "bank_accounts"
    CASH_IN_HAND = "cash_in_hand"
    # Liabilities
    CURRENT_LIABILITIES = "current_liabilities"
    LOANS = "loans"
    # Income
    SALES = "sales"
    OTHER_INCOME = "other_income"
    # Expenses
    PURCHASE = "purchase"
    DIRECT_EXPENSES = "direct_expenses"
    INDIRECT_EXPENSES = "indirect_expenses"
    # Capital
    CAPITAL_ACCOUNT = "capital_account"
    RESERVES = "reserves"
    # Tax
    DUTIES_AND_TAXES = "duties_and_taxes"


class EntryType(str, enum.Enum):
    DEBIT = "debit"
    CREDIT = "credit"


class VoucherType(str, enum.Enum):
    SALES = "sales"
    PURCHASE = "purchase"
    RECEIPT = "receipt"
    PAYMENT = "payment"
    JOURNAL = "journal"
    CONTRA = "contra"
    DEBIT_NOTE = "debit_note"
    CREDIT_NOTE = "credit_note"


class Ledger(Base):
    """
    Chart of Accounts / Ledger.
    Automatically created by the system; can be customized by advanced users.
    """
    __tablename__ = "ledgers"

    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)

    name = Column(String(255), nullable=False, index=True)
    code = Column(String(20), nullable=True)
    group = Column(Enum(LedgerGroup), nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Opening balance
    opening_balance = Column(Numeric(15, 2), default=0)
    opening_balance_type = Column(Enum(EntryType), default=EntryType.DEBIT)
    current_balance = Column(Numeric(15, 2), default=0)

    # Flags
    is_system = Column(Boolean, default=False)  # System-created, can't delete
    is_active = Column(Boolean, default=True)
    allow_manual_entry = Column(Boolean, default=True)

    # GST account mapping
    is_gst_account = Column(Boolean, default=False)
    gst_type = Column(String(20), nullable=True)  # cgst, sgst, igst, cess

    business = relationship("Business", back_populates="ledgers")
    journal_entries = relationship("JournalEntryLine", back_populates="ledger")

    def __repr__(self):
        return f"<Ledger {self.name} ({self.group})>"


class JournalEntry(Base):
    """
    A financial transaction (voucher) — the core of double-entry accounting.
    Every invoice, payment, expense auto-creates a journal entry.
    """
    __tablename__ = "journal_entries"

    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)
    created_by_id = Column(ForeignKey("users.id"), nullable=False)

    # Reference
    voucher_number = Column(String(50), nullable=False, index=True)
    voucher_type = Column(Enum(VoucherType), nullable=False, index=True)
    reference_id = Column(String(50), nullable=True)   # Invoice ID, Payment ID etc.
    reference_type = Column(String(50), nullable=True) # "invoice", "payment", etc.

    # Entry details
    entry_date = Column(String(20), nullable=False, index=True)
    narration = Column(Text, nullable=True)  # Description in plain language
    total_amount = Column(Numeric(15, 2), nullable=False)

    # Flags
    is_posted = Column(Boolean, default=True)   # False = draft
    is_reversed = Column(Boolean, default=False)
    reversed_by_id = Column(String(50), nullable=True)

    lines = relationship("JournalEntryLine", back_populates="journal_entry", cascade="all, delete-orphan")


class JournalEntryLine(Base):
    """Individual debit/credit line in a journal entry (double-entry)."""
    __tablename__ = "journal_entry_lines"

    journal_entry_id = Column(ForeignKey("journal_entries.id"), nullable=False, index=True)
    ledger_id = Column(ForeignKey("ledgers.id"), nullable=False, index=True)

    entry_type = Column(Enum(EntryType), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    narration = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)

    journal_entry = relationship("JournalEntry", back_populates="lines")
    ledger = relationship("Ledger", back_populates="journal_entries")


class Expense(Base):
    """Business expense entry."""
    __tablename__ = "expenses"

    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)
    created_by_id = Column(ForeignKey("users.id"), nullable=False)
    ledger_id = Column(ForeignKey("ledgers.id"), nullable=True)

    # AI-classified category
    category = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    tax_amount = Column(Numeric(15, 2), default=0)
    total_amount = Column(Numeric(15, 2), nullable=False)

    expense_date = Column(String(20), nullable=False, index=True)
    payment_method = Column(String(50), default="cash")
    reference = Column(String(100), nullable=True)

    # OCR / Document
    receipt_url = Column(String(500), nullable=True)
    ocr_extracted = Column(Boolean, default=False)
    ocr_data = Column(JSON, nullable=True)

    notes = Column(Text, nullable=True)
    tags = Column(JSON, default=[])

    # AI classification confidence
    ai_category = Column(String(100), nullable=True)
    ai_confidence = Column(Numeric(5, 4), nullable=True)

    business = relationship("Business", back_populates="expenses")


class AuditLog(Base):
    """Audit trail for all financial actions."""
    __tablename__ = "audit_logs"

    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)
    user_id = Column(ForeignKey("users.id"), nullable=False, index=True)

    action = Column(String(100), nullable=False, index=True)  # CREATE, UPDATE, DELETE
    entity_type = Column(String(50), nullable=False, index=True)  # invoice, payment, etc.
    entity_id = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)

    # Change tracking
    old_data = Column(JSON, nullable=True)
    new_data = Column(JSON, nullable=True)

    # Request metadata
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    user = relationship("User", back_populates="audit_logs")
