"""FinFlow — Reports Routes (scaffold)."""
from fastapi import APIRouter, Depends
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/")
async def list_reports(current_user=Depends(get_current_active_user)):
    return {"module": "reports", "status": "ready"}
