from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class KnowledgeCreate(BaseModel):
    entry_type: str  # faq, pricing, hours, tone
    title: str
    content: str


class KnowledgeUpdate(BaseModel):
    entry_type: str | None = None
    title: str | None = None
    content: str | None = None


class KnowledgeResponse(BaseModel):
    id: UUID
    entry_type: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
