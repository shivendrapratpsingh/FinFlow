"""
FinFlow — User & Business Models
Multi-tenant: one user can own/belong to multiple businesses.
"""
import enum
from sqlalchemy import Column, String, Boolean, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserRole(str, enum.Enum):
    OWNER = "owner"
    ACCOUNTANT = "accountant"
    STAFF = "staff"
    VIEWER = "viewer"


class AuthProvider(str, enum.Enum):
    EMAIL = "email"
    GOOGLE = "google"
    PHONE = "phone"


class User(Base):
    """Application user — can belong to multiple businesses."""
    __tablename__ = "users"

    # Identity
    email = Column(String(255), unique=True, nullable=True, index=True)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)

    # Auth
    hashed_password = Column(String(255), nullable=True)
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.EMAIL)
    google_id = Column(String(255), unique=True, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superadmin = Column(Boolean, default=False)

    # OTP (for phone/email verification)
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(String(50), nullable=True)

    # Preferences
    language = Column(String(10), default="en")
    timezone = Column(String(50), default="Asia/Kolkata")
    preferences = Column(JSON, default={})

    # Relationships
    business_memberships = relationship("BusinessMember", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

    def __repr__(self):
        return f"<User {self.email or self.phone}>"


class Business(Base):
    """A business entity (multi-tenant root)."""
    __tablename__ = "businesses"

    # Basic Info
    name = Column(String(255), nullable=False)
    legal_name = Column(String(255), nullable=True)
    type = Column(String(50), default="sole_proprietorship")  # pvt_ltd, llp, etc.
    industry = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)

    # Contact
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    website = Column(String(255), nullable=True)

    # Address
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    country = Column(String(100), default="India")

    # Tax / GST
    gstin = Column(String(15), unique=True, nullable=True, index=True)
    pan = Column(String(10), nullable=True)
    tan = Column(String(10), nullable=True)
    registration_number = Column(String(50), nullable=True)

    # Banking
    bank_name = Column(String(255), nullable=True)
    bank_account_number = Column(String(50), nullable=True)
    bank_ifsc = Column(String(11), nullable=True)
    bank_branch = Column(String(255), nullable=True)

    # Branding
    logo_url = Column(String(500), nullable=True)
    invoice_prefix = Column(String(20), default="INV")
    financial_year_start = Column(String(5), default="04-01")  # MM-DD
    currency = Column(String(3), default="INR")

    # Settings
    is_gst_registered = Column(Boolean, default=True)
    settings = Column(JSON, default={})

    # Relationships
    members = relationship("BusinessMember", back_populates="business")
    customers = relationship("Customer", back_populates="business")
    suppliers = relationship("Supplier", back_populates="business")
    products = relationship("Product", back_populates="business")
    invoices = relationship("Invoice", back_populates="business")
    expenses = relationship("Expense", back_populates="business")
    ledgers = relationship("Ledger", back_populates="business")


class BusinessMember(Base):
    """Many-to-many: User ↔ Business with role."""
    __tablename__ = "business_members"

    user_id = Column(ForeignKey("users.id"), nullable=False, index=True)
    business_id = Column(ForeignKey("businesses.id"), nullable=False, index=True)
    role = Column(Enum(UserRole), default=UserRole.STAFF)
    is_default = Column(Boolean, default=False)  # default business for user

    user = relationship("User", back_populates="business_memberships")
    business = relationship("Business", back_populates="members")
