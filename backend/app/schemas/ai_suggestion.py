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
