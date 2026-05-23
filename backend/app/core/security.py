"""
FinFlow — Security & Authentication Utilities
JWT token creation, password hashing, OAuth2 setup.
"""
from datetime import datetime, timedelta
from typing import Optional, Union
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

# ── Password Hashing (raw bcrypt — bypasses passlib wrap-bug check) ──
import hashlib as _hashlib
import base64 as _base64
import bcrypt as _bcrypt

# ── OAuth2 ───────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def hash_password(password: str) -> str:
    digest = _base64.b64encode(_hashlib.sha256(password.encode()).digest())
    return _bcrypt.hashpw(digest, _bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    digest = _base64.b64encode(_hashlib.sha256(plain_password.encode()).digest())
    try:
        return _bcrypt.checkpw(digest, hashed_password.encode())
    except Exception:
        return False


def create_access_token(
    subject: Union[str, UUID],
    business_id: Optional[Union[str, UUID]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub": str(subject),
        "exp": expire,
        "type": "access",
    }
    if business_id:
        payload["business_id"] = str(business_id)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: Union[str, UUID]) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(subject),
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── OTP Generation ───────────────────────────────────────────
import random
import string


def generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


# ── Current User Dependency ──────────────────────────────────
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    from app.db.models.user import User
    from sqlalchemy import select

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise credentials_exception
    return user


async def get_current_active_user(current_user=Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
