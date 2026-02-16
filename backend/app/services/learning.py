"""Feedback loop: log edits to AI suggestions and feed them back into ChromaDB."""

from __future__ import annotations

import difflib
import logging
from typing import TYPE_CHECKING

from app.models.feedback_log import FeedbackLog
from app.services.vector_store import add_approved_reply

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

    from app.models.ai_suggestion import AiSuggestion

logger = logging.getLogger(__name__)


def calculate_edit_distance(original: str, edited: str) -> int:
    """Calculate a simple character-level edit distance.

    Uses difflib.SequenceMatcher to compute a similarity ratio,
    then derives a distance value as:
        distance = round((1 - ratio) * max(len(original), len(edited)))

    This gives 0 for identical strings and scales with the amount of change.

    Args:
        original: The original suggested text.
        edited: The edited/final text.

    Returns:
        An integer representing the approximate edit distance.
    """
    if original == edited:
        return 0

    matcher = difflib.SequenceMatcher(None, original, edited)
    ratio = matcher.ratio()
    max_len = max(len(original), len(edited))
    return round((1.0 - ratio) * max_len)


async def log_feedback(
    suggestion: AiSuggestion, edited_text: str, db: AsyncSession
) -> None:
    """Log feedback for an AI suggestion and store approved replies in ChromaDB.

    Creates a FeedbackLog entry with the edit distance between the original
    suggestion and the edited text. If the suggestion was approved or edited
    (i.e., not rejected), the final text is added to the ChromaDB approved
    replies collection for future RAG retrieval.

    Args:
        suggestion: The AiSuggestion that was reviewed.
        edited_text: The final text (may be identical to original if approved as-is).
        db: An async database session.
    """
    original_text = suggestion.suggested_text
    edit_dist = calculate_edit_distance(original_text, edited_text)

    # Create feedback log entry
    feedback = FeedbackLog(
        suggestion_id=suggestion.id,
        original_text=original_text,
        edited_text=edited_text,
        edit_distance=edit_dist,
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)

    logger.info(
        "Logged feedback for suggestion %s (edit_distance=%d)",
        suggestion.id,
        edit_dist,
    )

    # Add approved/edited text to ChromaDB for future retrieval
    # The suggestion status should be 'approved' or 'edited' at this point
    if suggestion.status in ("approved", "edited"):
        # Retrieve email metadata for the ChromaDB entry
        email = suggestion.email
        metadata: dict = {
            "user_id": str(email.account_id) if email else "",
            "suggestion_id": str(suggestion.id),
            "category": email.category or "" if email else "",
            "subject": email.subject or "" if email else "",
            "edit_distance": edit_dist,
        }

        try:
            await add_approved_reply(
                suggestion_id=str(suggestion.id),
                text=edited_text,
                metadata=metadata,
            )
            logger.info(
                "Added approved reply %s to ChromaDB vector store",
                suggestion.id,
            )
        except Exception as exc:
            logger.error(
                "Failed to add approved reply %s to ChromaDB: %s",
                suggestion.id,
                exc,
            )
