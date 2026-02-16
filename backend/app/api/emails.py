from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.mail_account import MailAccount
from app.models.email_message import EmailMessage
from app.schemas.email_message import EmailMessageResponse, EmailListResponse
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=list[EmailListResponse])
async def list_emails(
    category: str | None = None,
    urgency: str | None = None,
    is_read: bool | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get user's account IDs
    accounts_result = await db.execute(
        select(MailAccount.id).where(MailAccount.user_id == user.id)
    )
    account_ids = [row[0] for row in accounts_result.all()]
    if not account_ids:
        return []

    # Eagerly load suggestions to check has_suggestion
    query_with_sug = (
        select(EmailMessage)
        .options(selectinload(EmailMessage.suggestions))
        .where(EmailMessage.account_id.in_(account_ids))
        .order_by(EmailMessage.received_at.desc())
    )
    if category:
        query_with_sug = query_with_sug.where(EmailMessage.category == category)
    if urgency:
        query_with_sug = query_with_sug.where(EmailMessage.urgency == urgency)
    if is_read is not None:
        query_with_sug = query_with_sug.where(EmailMessage.is_read == is_read)
    query_with_sug = query_with_sug.offset(skip).limit(limit)

    result = await db.execute(query_with_sug)
    emails = result.scalars().unique().all()

    response = []
    for email in emails:
        item = EmailListResponse.model_validate(email)
        item.has_suggestion = len(email.suggestions) > 0
        response.append(item)

    return response


@router.get("/{email_id}", response_model=EmailMessageResponse)
async def get_email(
    email_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    accounts_result = await db.execute(
        select(MailAccount.id).where(MailAccount.user_id == user.id)
    )
    account_ids = [row[0] for row in accounts_result.all()]

    result = await db.execute(
        select(EmailMessage)
        .options(selectinload(EmailMessage.suggestions))
        .where(EmailMessage.id == email_id, EmailMessage.account_id.in_(account_ids))
    )
    email = result.scalar_one_or_none()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    # Mark as read
    if not email.is_read:
        email.is_read = True
        await db.commit()

    return email


@router.get("/stats/summary")
async def email_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    accounts_result = await db.execute(
        select(MailAccount.id).where(MailAccount.user_id == user.id)
    )
    account_ids = [row[0] for row in accounts_result.all()]
    if not account_ids:
        return {"total": 0, "unread": 0, "categories": {}, "urgency": {}}

    base = select(func.count()).where(EmailMessage.account_id.in_(account_ids))

    total = (await db.execute(base)).scalar()
    unread = (await db.execute(base.where(EmailMessage.is_read == False))).scalar()

    cat_result = await db.execute(
        select(EmailMessage.category, func.count())
        .where(EmailMessage.account_id.in_(account_ids), EmailMessage.category.isnot(None))
        .group_by(EmailMessage.category)
    )
    categories = {row[0]: row[1] for row in cat_result.all()}

    urg_result = await db.execute(
        select(EmailMessage.urgency, func.count())
        .where(EmailMessage.account_id.in_(account_ids), EmailMessage.urgency.isnot(None))
        .group_by(EmailMessage.urgency)
    )
    urgency = {row[0]: row[1] for row in urg_result.all()}

    return {"total": total, "unread": unread, "categories": categories, "urgency": urgency}
