"""
FinFlow — Authentication Routes
Email/OTP/Google login, JWT tokens, user registration.
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    generate_otp, decode_token,
    get_current_active_user,
)
from app.db.models.user import User, Business, BusinessMember, UserRole
from app.schemas.auth import (
    UserRegisterRequest, UserLoginResponse,
    OTPRequest, OTPVerifyRequest,
    GoogleAuthRequest, RefreshTokenRequest,
    UserResponse, BusinessCreateRequest,
)
from app.services.notifications.email_service import send_verification_email
from app.services.notifications.sms_service import send_otp_sms

router = APIRouter()


@router.post("/register", response_model=UserLoginResponse, status_code=201)
async def register(
    data: UserRegisterRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user and create their first business."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This email is already registered. Please log in instead.")

    # Check if phone already exists (if provided)
    if data.phone:
        result = await db.execute(select(User).where(User.phone == data.phone))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="This phone number is already registered.")

    # Check GSTIN uniqueness (if provided)
    if data.gstin:
        result = await db.execute(select(Business).where(Business.gstin == data.gstin))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="This GSTIN is already registered.")

    try:
        # Create user
        user = User(
            email=data.email,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            phone=data.phone,  # Already None if empty (schema validator)
        )
        db.add(user)
        await db.flush()

        # Create their first business
        business = Business(
            name=data.business_name,
            gstin=data.gstin,   # Already None if empty (schema validator)
            phone=data.phone,
        )
        db.add(business)
        await db.flush()

        # Link user to business as owner
        membership = BusinessMember(
            user_id=user.id,
            business_id=business.id,
            role=UserRole.OWNER,
            is_default=True,
        )
        db.add(membership)
        await db.commit()
        await db.refresh(user)

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

    # Send verification email (background, non-blocking)
    background_tasks.add_task(send_verification_email, user.email, user.full_name)

    token = create_access_token(user.id, business.id)
    refresh = create_refresh_token(user.id)

    return UserLoginResponse(
        access_token=token,
        refresh_token=refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        business_id=str(business.id),
    )


@router.post("/login", response_model=UserLoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Login with email + password."""
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    # Get default business
    result = await db.execute(
        select(BusinessMember).where(
            BusinessMember.user_id == user.id,
            BusinessMember.is_default == True,
        )
    )
    membership = result.scalar_one_or_none()
    business_id = str(membership.business_id) if membership else None

    token = create_access_token(user.id, business_id)
    refresh = create_refresh_token(user.id)

    return UserLoginResponse(
        access_token=token,
        refresh_token=refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        business_id=business_id,
    )


@router.post("/send-otp")
async def send_otp(
    data: OTPRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Send OTP to phone number for login."""
    otp = generate_otp()
    # Upsert user by phone
    result = await db.execute(select(User).where(User.phone == data.phone))
    user = result.scalar_one_or_none()

    if not user:
        user = User(phone=data.phone, full_name="")
        db.add(user)

    import datetime
    user.otp_code = hash_password(otp)  # Store hashed OTP
    user.otp_expires_at = str(
        (datetime.datetime.utcnow() + datetime.timedelta(minutes=10)).timestamp()
    )
    await db.commit()

    background_tasks.add_task(send_otp_sms, data.phone, otp)
    return {"message": "OTP sent successfully", "phone": data.phone}


@router.post("/verify-otp", response_model=UserLoginResponse)
async def verify_otp(
    data: OTPVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify OTP and return tokens."""
    import datetime
    result = await db.execute(select(User).where(User.phone == data.phone))
    user = result.scalar_one_or_none()

    if not user or not user.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP request")

    # Check expiry
    if float(user.otp_expires_at or 0) < datetime.datetime.utcnow().timestamp():
        raise HTTPException(status_code=400, detail="OTP has expired")

    if not verify_password(data.otp, user.otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Clear OTP
    user.otp_code = None
    user.is_verified = True
    await db.commit()

    token = create_access_token(user.id)
    refresh = create_refresh_token(user.id)

    return UserLoginResponse(
        access_token=token,
        refresh_token=refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        business_id=None,
    )


@router.post("/refresh", response_model=UserLoginResponse)
async def refresh_token(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Get new access token using refresh token."""
    payload = decode_token(data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    token = create_access_token(user.id)
    refresh = create_refresh_token(user.id)

    return UserLoginResponse(
        access_token=token,
        refresh_token=refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        business_id=None,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current logged-in user profile."""
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile (full_name, etc.)."""
    allowed = {"full_name", "language", "timezone"}
    for key, value in payload.items():
        if key in allowed:
            setattr(current_user, key, value)
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/change-password")
async def change_password(
    payload: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Change current user's password."""
    current_password = payload.get("current_password", "")
    new_password = payload.get("new_password", "")

    if not verify_password(current_password, current_user.hashed_password or ""):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")

    current_user.hashed_password = hash_password(new_password)
    await db.commit()
    return {"message": "Password changed successfully"}


@router.post("/google", response_model=UserLoginResponse)
async def google_auth(
    data: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate with Google OAuth2 token."""
    from app.services.auth.google_auth import verify_google_token
    google_user = await verify_google_token(data.access_token)

    result = await db.execute(select(User).where(User.email == google_user["email"]))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=google_user["email"],
            full_name=google_user.get("name", ""),
            avatar_url=google_user.get("picture"),
            google_id=google_user["sub"],
            is_verified=True,
            auth_provider="google",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(user.id)
    refresh = create_refresh_token(user.id)

    return UserLoginResponse(
        access_token=token,
        refresh_token=refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        business_id=None,
    )


@router.post("/login-json", response_model=UserLoginResponse)
async def login_json(
    payload: dict,
    db: AsyncSession = Depends(get_db),
):
    """Login with JSON body (email + password). Alternative to OAuth2 form."""
    email = payload.get("email", "")
    password = payload.get("password", "")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.hashed_password or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    result = await db.execute(
        select(BusinessMember).where(
            BusinessMember.user_id == user.id,
            BusinessMember.is_default == True,
        )
    )
    membership = result.scalar_one_or_none()
    business_id = str(membership.business_id) if membership else None

    token = create_access_token(user.id, business_id)
    refresh = create_refresh_token(user.id)

    return UserLoginResponse(
        access_token=token,
        refresh_token=refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        business_id=business_id,
    )




@router.get("/debug-reset-admin")
async def debug_reset_admin(db: AsyncSession = Depends(get_db)):
    """ONE-TIME: Force-reset admin password via ORM. Remove after first login."""
    import base64, hashlib, bcrypt
    from sqlalchemy import select
    from app.db.models.user import User, Business, BusinessMember, UserRole, AuthProvider

    admin_email = "pratapsinghshivendra21@gmail.com"

    def hash_pw(p: str) -> str:
        digest = base64.b64encode(hashlib.sha256(p.encode()).digest())
        return bcrypt.hashpw(digest, bcrypt.gensalt()).decode()

    hashed = hash_pw("FinFlow@123")

    result = await db.execute(select(User).where(User.email == admin_email))
    user = result.scalar_one_or_none()

    if user:
        user.hashed_password = hashed
        user.is_verified = True
        user.is_active = True
        user.auth_provider = AuthProvider.EMAIL
        await db.commit()
        return {"status": "reset", "email": admin_email, "password": "FinFlow@123"}

    import uuid as _uuid
    user = User(
        email=admin_email,
        full_name="Shivendra Pratap",
        hashed_password=hashed,
        auth_provider=AuthProvider.EMAIL,
        is_verified=True,
        is_active=True,
        language="en",
    )
    db.add(user)
    await db.flush()

    from app.db.models.user import Business, BusinessMember
    biz = Business(name="My Business")
    db.add(biz)
    await db.flush()

    mem = BusinessMember(
        user_id=user.id,
        business_id=biz.id,
        role=UserRole.OWNER,
        is_default=True,
    )
    db.add(mem)
    await db.commit()
    return {"status": "created", "email": admin_email, "password": "FinFlow@123"}
