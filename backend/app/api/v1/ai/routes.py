"""FinFlow — AI Assistant Routes."""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.db.models.user import User, BusinessMember
from app.schemas.ai import ChatRequest, ChatResponse, ChatAction, OCRResponse, InsightResponse, InsightItem
from app.services.ai.assistant import FinFlowAssistant
from app.services.ai.ocr_service import OCRService
from app.services.ai.insights_service import InsightsService

router = APIRouter()


async def _get_business_id(user: User, db: AsyncSession) -> Optional[str]:
    """Get the user's active business ID."""
    result = await db.execute(
        select(BusinessMember).where(
            BusinessMember.user_id == user.id,
            BusinessMember.is_default == True,
        )
    )
    membership = result.scalar_one_or_none()
    return str(membership.business_id) if membership else None


@router.post("/chat", response_model=ChatResponse)
async def chat(
    data: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """AI Accounting Assistant — ask anything in plain language."""
    business_id = await _get_business_id(current_user, db)
    assistant = FinFlowAssistant(db, business_id or "", str(current_user.id))
    reply = await assistant.chat(message=data.message)
    return ChatResponse(
        message=reply,
        conversation_id=data.conversation_id or str(uuid.uuid4()),
        actions=[],
    )


@router.post("/chat/stream")
async def chat_stream(
    data: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Streaming AI chat."""
    business_id = await _get_business_id(current_user, db)
    assistant = FinFlowAssistant(db, business_id or "", str(current_user.id))

    async def generate():
        async for chunk in assistant.stream_chat(message=data.message):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/ocr/scan", response_model=OCRResponse)
async def scan_document(
    file: UploadFile = File(...),
    document_type: str = "expense",
    current_user: User = Depends(get_current_active_user),
):
    """OCR document scanning — upload a bill/invoice photo to extract data."""
    if file.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and PDF are supported")
    contents = await file.read()
    service = OCRService()
    result = await service.extract_invoice_data(contents)
    return OCRResponse(
        document_type=document_type,
        extracted_data=result,
        confidence=0.0,
        raw_text="",
    )


@router.get("/insights", response_model=InsightResponse)
async def get_insights(
    period: str = "this_month",
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """AI-generated business insights and recommendations."""
    business_id = await _get_business_id(current_user, db)
    service = InsightsService(db, business_id)
    result = await service.get_business_insights(business_id or "")
    return InsightResponse(
        period=period,
        insights=[],
        summary="No insights yet — add some invoices and expenses to get started.",
    )


@router.post("/expense/classify")
async def classify_expense(
    description: str,
    amount: float,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """AI expense classification."""
    business_id = await _get_business_id(current_user, db)
    assistant = FinFlowAssistant(db, business_id or "", str(current_user.id))
    reply = await assistant.chat(f"Classify this expense: {description}, amount ₹{amount}")
    return {"category": "General", "ledger": "Expenses", "ai_note": reply}
