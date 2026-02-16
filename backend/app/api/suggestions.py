from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.mail_account import MailAccount
from app.models.email_message import EmailMessage
from app.models.ai_suggestion import AiSuggestion
from app.schemas.ai_suggestion import AiSuggestionResponse, SuggestionAction
from app.utils.auth import get_current_user

router = APIRouter()


async def _verify_suggestion_access(suggestion_id: UUID, user: User, db: AsyncSession) -> AiSuggestion:
    result = await db.execute(select(AiSuggestion).where(AiSuggestion.id == suggestion_id))
    suggestion = result.scalar_one_or_none()
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    # Verify user owns the email's account
    email_result = await db.execute(select(EmailMessage).where(EmailMessage.id == suggestion.email_id))
    email = email_result.scalar_one_or_none()

    account_result = await db.execute(
        select(MailAccount).where(MailAccount.id == email.account_id, MailAccount.user_id == user.id)
    )
    if not account_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Access denied")

    return suggestion


@router.post("/{suggestion_id}/action", response_model=AiSuggestionResponse)
async def handle_suggestion_action(
    suggestion_id: UUID,
    action: SuggestionAction,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    suggestion = await _verify_suggestion_access(suggestion_id, user, db)

    if action.action == "approve":
        suggestion.status = "approved"
        suggestion.edited_text = suggestion.suggested_text
    elif action.action == "edit":
        if not action.edited_text:
            raise HTTPException(status_code=400, detail="edited_text required for edit action")
        suggestion.status = "edited"
        suggestion.edited_text = action.edited_text
    elif action.action == "reject":
        suggestion.status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    await db.commit()
    await db.refresh(suggestion)

    # Log feedback for learning
    if suggestion.status in ("approved", "edited"):
        from app.services.learning import log_feedback
        final_text = suggestion.edited_text or suggestion.suggested_text
        await log_feedback(suggestion, final_text, db)

    return suggestion


@router.post("/{suggestion_id}/send", response_model=AiSuggestionResponse)
async def send_suggestion(
    suggestion_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    suggestion = await _verify_suggestion_access(suggestion_id, user, db)

    if suggestion.status not in ("approved", "edited"):
        raise HTTPException(status_code=400, detail="Suggestion must be approved or edited before sending")

    # Get email and account
    email_result = await db.execute(select(EmailMessage).where(EmailMessage.id == suggestion.email_id))
    email = email_result.scalar_one()

    account_result = await db.execute(select(MailAccount).where(MailAccount.id == email.account_id))
    account = account_result.scalar_one()

    # Send via appropriate provider
    reply_text = suggestion.edited_text or suggestion.suggested_text

    if account.provider == "gmail":
        from app.services.mail_gmail import send_reply
        success = await send_reply(account, db, email.from_address, f"Re: {email.subject}", reply_text, email.thread_id)
    elif account.provider == "outlook":
        from app.services.mail_outlook import send_reply
        success = await send_reply(account, db, email.from_address, f"Re: {email.subject}", reply_text, email.provider_id)
    else:
        raise HTTPException(status_code=400, detail="Unknown provider")

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send reply")

    from datetime import datetime, timezone
    suggestion.sent_at = datetime.now(timezone.utc)
    email.is_replied = True
    await db.commit()
    await db.refresh(suggestion)

    return suggestion
