"""FinFlow — Auth Pydantic Schemas."""
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
import re


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    business_name: str
    gstin: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("phone", "gstin", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        """Convert empty strings to None so unique DB constraints aren't triggered."""
        if isinstance(v, str) and v.strip() == "":
            return None
        return v


class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    full_name: str
    avatar_url: Optional[str] = None
    is_verified: bool = False
    language: str = "en"

    model_config = {"from_attributes": True}


class UserLoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
    business_id: Optional[str] = None


class OTPRequest(BaseModel):
    phone: str

    @field_validator("phone")
    def validate_phone(cls, v):
        if not re.match(r'^\+?[1-9]\d{9,14}$', v):
            raise ValueError("Invalid phone number")
        return v


class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str


class GoogleAuthRequest(BaseModel):
    access_token: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class BusinessCreateRequest(BaseModel):
    name: str
    gstin: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
