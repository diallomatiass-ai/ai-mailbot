from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class AiSuggestionResponse(BaseModel):
    id: UUID
    email_id: UUID
    suggested_text: str
    status: str
    edited_text: str | None
    sent_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SuggestionAction(BaseModel):
    action: str  # approve, edit, reject
    edited_text: str | None = None


class RefineRequest(BaseModel):
    prompt: str  # User instruction, e.g. "gør det mere formelt"
    current_text: str | None = None  # Current text to refine (uses suggested_text if None)


class RefineResponse(BaseModel):
    refined_text: str
