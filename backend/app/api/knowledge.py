from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.knowledge_base import KnowledgeBase
from app.schemas.knowledge_base import KnowledgeCreate, KnowledgeUpdate, KnowledgeResponse
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=list[KnowledgeResponse])
async def list_knowledge(
    entry_type: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(KnowledgeBase).where(KnowledgeBase.user_id == user.id)
    if entry_type:
        query = query.where(KnowledgeBase.entry_type == entry_type)
    query = query.order_by(KnowledgeBase.updated_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=KnowledgeResponse, status_code=201)
async def create_knowledge(
    data: KnowledgeCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entry = KnowledgeBase(
        user_id=user.id,
        entry_type=data.entry_type,
        title=data.title,
        content=data.content,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    # Add to ChromaDB
    from app.services.vector_store import add_knowledge_entry
    await add_knowledge_entry(
        entry_id=str(entry.id),
        content=f"{entry.title}: {entry.content}",
        metadata={"user_id": str(user.id), "entry_type": entry.entry_type, "title": entry.title},
    )

    return entry


@router.put("/{entry_id}", response_model=KnowledgeResponse)
async def update_knowledge(
    entry_id: UUID,
    data: KnowledgeUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeBase).where(KnowledgeBase.id == entry_id, KnowledgeBase.user_id == user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")

    if data.entry_type is not None:
        entry.entry_type = data.entry_type
    if data.title is not None:
        entry.title = data.title
    if data.content is not None:
        entry.content = data.content

    await db.commit()
    await db.refresh(entry)

    # Update in ChromaDB
    from app.services.vector_store import add_knowledge_entry
    await add_knowledge_entry(
        entry_id=str(entry.id),
        content=f"{entry.title}: {entry.content}",
        metadata={"user_id": str(user.id), "entry_type": entry.entry_type, "title": entry.title},
    )

    return entry


@router.delete("/{entry_id}", status_code=204)
async def delete_knowledge(
    entry_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeBase).where(KnowledgeBase.id == entry_id, KnowledgeBase.user_id == user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")

    await db.delete(entry)
    await db.commit()
