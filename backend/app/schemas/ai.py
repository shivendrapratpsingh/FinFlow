"""FinFlow — AI Assistant Pydantic Schemas."""
from typing import List, Optional, Any, Dict
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ChatAction(BaseModel):
    type: str   # create_invoice, navigate, download_report
    label: str
    data: Optional[Dict] = None


class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    actions: List[ChatAction] = []
    data: Optional[Dict] = None


class OCRResponse(BaseModel):
    document_type: str
    extracted_data: Dict[str, Any]
    confidence: float
    raw_text: str


class InsightItem(BaseModel):
    type: str      # warning | tip | celebration | alert
    title: str
    message: str
    action_label: Optional[str] = None
    action_url: Optional[str] = None
    data: Optional[Dict] = None


class InsightResponse(BaseModel):
    period: str
    insights: List[InsightItem]
    summary: str


class OCRRequest(BaseModel):
    document_type: str = "expense"

class VoiceRequest(BaseModel):
    audio_base64: str
    format: str = "wav"
