import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AiSuggestion(Base):
    __tablename__ = "ai_suggestions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("email_messages.id"), nullable=False)
    suggested_text: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, approved, edited, rejected
    edited_text: Mapped[str | None] = mapped_column(Text)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    email = relationship("EmailMessage", back_populates="suggestions")
    feedback = relationship("FeedbackLog", back_populates="suggestion", uselist=False)
