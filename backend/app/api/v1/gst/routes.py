"""FinFlow — Gst Routes (scaffold)."""
from fastapi import APIRouter, Depends
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/")
async def list_gst(current_user=Depends(get_current_active_user)):
    return {"module": "gst", "status": "ready"}
