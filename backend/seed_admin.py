"""
FinFlow — Seed Admin User
Run locally:  python seed_admin.py
Run on Render: use the Render dashboard Shell tab
"""
import asyncio, os, uuid, hashlib, base64, bcrypt
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text

# Uses DATABASE_URL from environment if set, otherwise falls back to local Postgres
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://finflow:finflow_secret@127.0.0.1:5432/finflow_db"
)

ADMIN_EMAIL = "pratapsinghshivendra21@gmail.com"
ADMIN_NAME  = "Shivendra Pratap"
ADMIN_PASS  = "FinFlow@123"
BIZ_NAME    = "My Business"


def hash_pw(password: str) -> str:
    digest = base64.b64encode(hashlib.sha256(password.encode()).digest())
    return bcrypt.hashpw(digest, bcrypt.gensalt()).decode()


async def seed():
    engine = create_async_engine(DATABASE_URL, echo=False)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with Session() as db:
        row = (await db.execute(
            text("SELECT id FROM users WHERE email = :e"), {"e": ADMIN_EMAIL}
        )).fetchone()

        if row:
            print("✓ Admin already exists — you can log in now.")
            print(f"  Email:    {ADMIN_EMAIL}")
            print(f"  Password: {ADMIN_PASS}")
            await engine.dispose()
            return

        hashed  = hash_pw(ADMIN_PASS)
        user_id = str(uuid.uuid4())
        biz_id  = str(uuid.uuid4())
        mem_id  = str(uuid.uuid4())

        await db.execute(text("""
            INSERT INTO users
              (id, email, full_name, hashed_password, is_verified, is_active,
               auth_provider, language, created_at, updated_at)
            VALUES
              (:id, :email, :name, :pwd, true, true, 'email', 'en', NOW(), NOW())
        """), {"id": user_id, "email": ADMIN_EMAIL, "name": ADMIN_NAME, "pwd": hashed})

        await db.execute(text("""
            INSERT INTO businesses (id, name, created_at, updated_at)
            VALUES (:id, :name, NOW(), NOW())
        """), {"id": biz_id, "name": BIZ_NAME})

        await db.execute(text("""
            INSERT INTO business_members
              (id, user_id, business_id, role, is_default, created_at, updated_at)
            VALUES (:id, :uid, :bid, 'owner', true, NOW(), NOW())
        """), {"id": mem_id, "uid": user_id, "bid": biz_id})

        await db.commit()
        print("✓ Admin account created!")
        print(f"  Email:    {ADMIN_EMAIL}")
        print(f"  Password: {ADMIN_PASS}")

    await engine.dispose()


asyncio.run(seed())
