"""
FinFlow — Analytics Models
Tracks user sessions, feature usage, and app ratings.
"""
from sqlalchemy import Column, String, Integer, Numeric, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserSession(Base):
    """Tracks each user login session."""
    __tablename__ = "user_sessions"

    user_id      = Column(ForeignKey("users.id"), nullable=False, index=True)
    email        = Column(String(255), nullable=True)
    login_at     = Column(String(50), nullable=False)   # ISO timestamp
    logout_at    = Column(String(50), nullable=True)
    duration_min = Column(Numeric(10, 1), default=0)    # minutes
    features_used = Column(JSON, default=list)          # ["billing", "gst", ...]
    ip_address   = Column(String(50), nullable=True)
    user_agent   = Column(String(500), nullable=True)

    user = relationship("User", foreign_keys=[user_id])


class AppRating(Base):
    """User-submitted app ratings on logout."""
    __tablename__ = "app_ratings"

    user_id   = Column(ForeignKey("users.id"), nullable=False, index=True)
    email     = Column(String(255), nullable=True)
    rating    = Column(Integer, nullable=False)          # 1-5
    comment   = Column(Text, nullable=True)
    rated_at  = Column(String(50), nullable=False)

    user = relationship("User", foreign_keys=[user_id])


class FeatureUsage(Base):
    """Counts per-feature usage per user."""
    __tablename__ = "feature_usage"

    user_id     = Column(ForeignKey("users.id"), nullable=False, index=True)
    feature     = Column(String(100), nullable=False)   # "billing","gst","inventory"...
    usage_count = Column(Integer, default=1)
    last_used   = Column(String(50), nullable=True)

    user = relationship("User", foreign_keys=[user_id])
