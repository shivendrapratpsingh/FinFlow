"""FinFlow - Admin Routes"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.db.models.user import User, BusinessMember
from app.db.models.analytics import UserSession, AppRating, FeatureUsage

router = APIRouter()
ADMIN_EMAIL = "pratapsinghshivendra21@gmail.com"

def require_admin(current_user: User = Depends(get_current_active_user)):
    if current_user.email != ADMIN_EMAIL and not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/stats")
async def admin_stats(db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar()
    total_sessions = (await db.execute(select(func.count()).select_from(UserSession))).scalar()
    avg_rating = (await db.execute(select(func.avg(AppRating.rating)).select_from(AppRating))).scalar()
    total_ratings = (await db.execute(select(func.count()).select_from(AppRating))).scalar()
    return {"total_users": total_users, "total_sessions": total_sessions,
            "average_rating": round(float(avg_rating or 0), 1), "total_ratings": total_ratings}

@router.get("/users")
async def admin_users(db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    out = []
    for u in users:
        sess_r = await db.execute(select(UserSession).where(UserSession.user_id == u.id).order_by(UserSession.login_at.desc()).limit(1))
        last_sess = sess_r.scalar_one_or_none()
        dur_r = await db.execute(select(func.sum(UserSession.duration_min)).where(UserSession.user_id == u.id))
        total_dur = float(dur_r.scalar() or 0)
        sess_count_r = await db.execute(select(func.count()).select_from(UserSession).where(UserSession.user_id == u.id))
        sess_count = sess_count_r.scalar() or 0
        feat_r = await db.execute(select(FeatureUsage).where(FeatureUsage.user_id == u.id))
        features = feat_r.scalars().all()
        out.append({
            "id": str(u.id), "email": u.email, "full_name": u.full_name,
            "is_active": u.is_active, "created_at": str(u.created_at) if hasattr(u, 'created_at') and u.created_at else None,
            "last_login": last_sess.login_at if last_sess else None,
            "total_sessions": sess_count, "total_duration_min": round(total_dur, 1),
            "features_used": [{"feature": f.feature, "count": f.usage_count, "last_used": f.last_used} for f in features],
        })
    return out

@router.get("/ratings")
async def admin_ratings(db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)):
    result = await db.execute(select(AppRating).order_by(AppRating.rated_at.desc()))
    ratings = result.scalars().all()
    return [{"email": r.email, "rating": r.rating, "comment": r.comment, "rated_at": r.rated_at} for r in ratings]

@router.post("/track-feature")
async def track_feature(payload: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    feature = payload.get("feature", "unknown")
    now = datetime.utcnow().isoformat()
    result = await db.execute(select(FeatureUsage).where(FeatureUsage.user_id == current_user.id, FeatureUsage.feature == feature))
    fu = result.scalar_one_or_none()
    if fu:
        fu.usage_count = (fu.usage_count or 0) + 1
        fu.last_used = now
    else:
        db.add(FeatureUsage(user_id=current_user.id, feature=feature, usage_count=1, last_used=now))
    await db.commit()
    return {"ok": True}

@router.post("/session-start")
async def session_start(payload: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    session = UserSession(user_id=current_user.id, email=current_user.email, login_at=datetime.utcnow().isoformat(), ip_address=payload.get("ip"), user_agent=payload.get("user_agent"))
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {"session_id": str(session.id)}

@router.post("/session-end")
async def session_end(payload: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    session_id = payload.get("session_id")
    if not session_id:
        return {"ok": False}
    result = await db.execute(select(UserSession).where(UserSession.id == session_id, UserSession.user_id == current_user.id))
    sess = result.scalar_one_or_none()
    if sess:
        now = datetime.utcnow()
        sess.logout_at = now.isoformat()
        try:
            login_dt = datetime.fromisoformat(sess.login_at)
            sess.duration_min = round((now - login_dt).total_seconds() / 60, 1)
        except Exception:
            pass
        sess.features_used = payload.get("features_used", [])
        await db.commit()
    return {"ok": True}

@router.post("/rate")
async def submit_rating(payload: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    rating_val = payload.get("rating", 0)
    if not (1 <= rating_val <= 5):
        raise HTTPException(status_code=400, detail="Rating must be 1-5")
    db.add(AppRating(user_id=current_user.id, email=current_user.email, rating=rating_val, comment=payload.get("comment", ""), rated_at=datetime.utcnow().isoformat()))
    await db.commit()
    return {"ok": True}
