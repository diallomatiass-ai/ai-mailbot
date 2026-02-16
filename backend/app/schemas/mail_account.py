from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class MailAccountCreate(BaseModel):
    provider: str  # gmail / outlook
    email_address: str


class MailAccountResponse(BaseModel):
    id: UUID
    provider: str
    email_address: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
