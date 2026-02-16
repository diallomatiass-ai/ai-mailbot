from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class TemplateCreate(BaseModel):
    name: str
    category: str | None = None
    body: str


class TemplateUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    body: str | None = None


class TemplateResponse(BaseModel):
    id: UUID
    name: str
    category: str | None
    body: str
    usage_count: int
    created_at: datetime

    model_config = {"from_attributes": True}
