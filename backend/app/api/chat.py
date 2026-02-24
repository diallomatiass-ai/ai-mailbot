"""
AI Command Chat — naturligt sprog til email-handlinger.
Brugeren skriver hvad de vil, AI'en fortolker og udfører.
"""
import json
import logging
import uuid
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, delete as sql_delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.email_message import EmailMessage
from app.models.mail_account import MailAccount
from app.models.ai_suggestion import AiSuggestion
from app.utils.auth import get_current_user
from app.models.user import User
from app.services.mail_gmail import send_reply
from app.services.ai_engine import generate_reply, _call_ollama_generate

logger = logging.getLogger(__name__)
router = APIRouter()


class CommandRequest(BaseModel):
    message: str
    confirm: bool = False        # Bruger bekræfter en afventende handling
    pending_action: dict | None = None  # Handling der afventer bekræftelse


class CommandResponse(BaseModel):
    response: str
    actions_taken: list[str] = []
    requires_confirmation: bool = False
    pending_action: dict | None = None
    data: dict | None = None


async def _get_user_emails(user: User, db: AsyncSession, limit: int = 100) -> list[EmailMessage]:
    """Hent alle emails for brugeren."""
    accounts = (await db.execute(
        select(MailAccount).where(MailAccount.user_id == user.id)
    )).scalars().all()
    if not accounts:
        return []
    account_ids = [a.id for a in accounts]
    result = await db.execute(
        select(EmailMessage)
        .where(EmailMessage.account_id.in_(account_ids))
        .order_by(EmailMessage.received_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


async def _parse_intent(message: str, emails_summary: str) -> dict:
    """Brug Ollama til at fortolke brugerens hensigt og returner struktureret JSON."""
    prompt = f"""Du er en email-assistent. Analyser denne kommando og returner KUN valid JSON.

TILGÆNGELIGE HANDLINGER:
- search: Søg/find emails (ikke destruktiv)
- summary: Giv overblik over indbakken (ikke destruktiv)
- suggest: Foreslå prioriterede emails der kræver handling (ikke destruktiv)
- mark_read: Marker emails som læst (ikke destruktiv)
- generate_reply: Generer et svarudkast til en email (ikke destruktiv)
- delete: SLET emails (DESTRUKTIV - kræver bekræftelse)
- send: SEND email/svar (DESTRUKTIV - kræver bekræftelse)
- chat: Svar på et spørgsmål om emails eller giv råd (ikke destruktiv)

EMAILS I INDBAKKEN (opsummering):
{emails_summary}

BRUGERENS KOMMANDO: "{message}"

Returner JSON i dette format:
{{
  "action": "search|summary|suggest|mark_read|generate_reply|delete|send|chat",
  "description": "Hvad du forstår kommandoen som på dansk",
  "filters": {{
    "category": "spam|inquiry|complaint|order|support|other eller null",
    "is_read": true/false/null,
    "from_address": "email eller null",
    "search_text": "søgetekst eller null",
    "urgency": "high|medium|low eller null"
  }},
  "reply_instructions": "instruktioner til svar hvis action=generate_reply, ellers null",
  "send_to": "email-adresse hvis action=send, ellers null",
  "send_subject": "emne hvis action=send, ellers null",
  "send_body": "beskedtekst hvis action=send, ellers null"
}}

Svar KUN med JSON, ingen forklaringer."""

    try:
        raw = await _call_ollama_generate(prompt)
        # Rens JSON fra markdown
        raw = raw.strip()
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception as e:
        logger.warning("Intent parsing fejlede: %s", e)
        return {"action": "summary", "description": "Kunne ikke fortolke kommandoen", "filters": {}}


async def _execute_search(filters: dict, emails: list[EmailMessage]) -> tuple[list[EmailMessage], str]:
    """Filtrer emails baseret på intent-filters."""
    results = emails
    if filters.get("category"):
        results = [e for e in results if e.category == filters["category"]]
    if filters.get("is_read") is not None:
        results = [e for e in results if e.is_read == filters["is_read"]]
    if filters.get("from_address"):
        term = filters["from_address"].lower()
        results = [e for e in results if term in (e.from_address or "").lower()]
    if filters.get("search_text"):
        term = filters["search_text"].lower()
        results = [e for e in results if
                   term in (e.subject or "").lower() or
                   term in (e.body_text or "").lower() or
                   term in (e.from_address or "").lower()]
    if filters.get("urgency"):
        results = [e for e in results if e.urgency == filters["urgency"]]

    if not results:
        return [], "Ingen emails matcher søgningen."

    lines = [f"Fandt {len(results)} email(s):"]
    for e in results[:10]:
        lines.append(f"- [{e.category or '?'}] {e.subject or '(intet emne)'} fra {e.from_address}")
    if len(results) > 10:
        lines.append(f"... og {len(results) - 10} mere.")
    return results, "\n".join(lines)


@router.post("", response_model=CommandResponse)
async def command(
    req: CommandRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    emails = await _get_user_emails(user, db)

    # --- Bekræftelse af afventende handling ---
    if req.confirm and req.pending_action:
        action = req.pending_action.get("action")
        email_ids = req.pending_action.get("email_ids", [])
        actions_taken = []

        if action == "delete":
            if email_ids:
                await db.execute(
                    sql_delete(AiSuggestion).where(
                        AiSuggestion.email_id.in_([uuid.UUID(i) for i in email_ids])
                    )
                )
                await db.execute(
                    sql_delete(EmailMessage).where(
                        EmailMessage.id.in_([uuid.UUID(i) for i in email_ids])
                    )
                )
                await db.commit()
                actions_taken.append(f"Slettede {len(email_ids)} email(s)")
            return CommandResponse(
                response=f"Færdig. Jeg har slettet {len(email_ids)} email(s).",
                actions_taken=actions_taken
            )

        if action == "send":
            send_data = req.pending_action.get("send_data", {})
            accounts = (await db.execute(
                select(MailAccount).where(MailAccount.user_id == user.id, MailAccount.is_active == True)
            )).scalars().first()
            if not accounts:
                return CommandResponse(response="Ingen aktiv mailkonto fundet. Forbind Gmail først under Indstillinger.")
            success = await send_reply(
                account=accounts, db=db,
                to=send_data.get("to", ""),
                subject=send_data.get("subject", ""),
                body=send_data.get("body", ""),
                thread_id=send_data.get("thread_id"),
            )
            if success:
                return CommandResponse(
                    response=f"Email sendt til {send_data.get('to')}.",
                    actions_taken=["Email sendt"]
                )
            return CommandResponse(response="Afsendelse mislykkedes. Tjek at Gmail er forbundet.")

    # --- Ny kommando: lav email-opsummering til AI ---
    emails_summary = "\n".join([
        f"- ID:{str(e.id)[:8]} [{e.category or '?'}] [{e.urgency or '?'}] "
        f"{'ULÆST' if not e.is_read else 'læst'} "
        f"'{e.subject or '(intet emne)'}' fra {e.from_address}"
        for e in emails[:30]
    ]) or "Ingen emails i indbakken."

    # --- Fortolk intent ---
    intent = await _parse_intent(req.message, emails_summary)
    action = intent.get("action", "summary")
    description = intent.get("description", req.message)
    filters = intent.get("filters", {})

    # --- SUGGEST ---
    if action == "suggest":
        unread = [e for e in emails if not e.is_read]
        high = [e for e in emails if e.urgency == "high"]
        unanswered = [e for e in emails if not e.is_read and e.urgency in ("high", "medium")][:5]
        lines = ["**Forslag til hvad du bør gøre nu:**\n"]
        if high:
            lines.append(f"🔴 **Høj prioritet ({len(high)} stk):**")
            for e in high[:3]:
                lines.append(f"  - {e.subject or '(intet emne)'} fra {e.from_address}")
        if unanswered:
            lines.append(f"\n📬 **Ulæste der kræver svar:**")
            for e in unanswered:
                lines.append(f"  - [{e.category or '?'}] {e.subject or '(intet emne)'} fra {e.from_address}")
        if not high and not unanswered:
            lines.append("Ingen emails kræver øjeblikkelig handling. Indbakken ser godt ud!")
        lines.append(f"\n📊 I alt: {len(emails)} emails, {len(unread)} ulæste.")
        return CommandResponse(
            response="\n".join(lines),
            data={"urgent_count": len(high), "unread_count": len(unread)}
        )

    # --- CHAT (fri AI-snak om emails) ---
    if action == "chat":
        chat_prompt = (
            f"Du er en hjælpsom email-assistent. Svar på brugerens spørgsmål på dansk.\n\n"
            f"EMAILS I INDBAKKEN:\n{emails_summary}\n\n"
            f"SPØRGSMÅL: {req.message}\n\n"
            f"Svar kortfattet og præcist på dansk."
        )
        answer = await _call_ollama_generate(chat_prompt)
        return CommandResponse(response=answer)

    # --- SUMMARY ---
    if action == "summary":
        unread = [e for e in emails if not e.is_read]
        high = [e for e in emails if e.urgency == "high"]
        cats: dict[str, int] = {}
        for e in emails:
            if e.category:
                cats[e.category] = cats.get(e.category, 0) + 1
        cat_lines = ", ".join(f"{v}× {k}" for k, v in sorted(cats.items(), key=lambda x: -x[1]))
        response = (
            f"**Indbakke overblik:**\n"
            f"- {len(emails)} emails i alt\n"
            f"- {len(unread)} ulæste\n"
            f"- {len(high)} med høj prioritet\n"
            f"- Kategorier: {cat_lines or 'ingen'}"
        )
        return CommandResponse(response=response, data={"total": len(emails), "unread": len(unread)})

    # --- SEARCH ---
    if action == "search":
        matched, msg = await _execute_search(filters, emails)
        return CommandResponse(
            response=msg,
            data={"email_ids": [str(e.id) for e in matched]}
        )

    # --- MARK READ ---
    if action == "mark_read":
        matched, _ = await _execute_search(filters, emails)
        if not matched:
            return CommandResponse(response="Fandt ingen emails der matcher.")
        for e in matched:
            e.is_read = True
        await db.commit()
        return CommandResponse(
            response=f"Markerede {len(matched)} email(s) som læst.",
            actions_taken=[f"Markerede {len(matched)} emails som læst"]
        )

    # --- GENERATE REPLY ---
    if action == "generate_reply":
        matched, _ = await _execute_search(filters, emails)
        if not matched:
            return CommandResponse(response="Fandt ingen email at svare på.")
        email = matched[0]
        instructions = intent.get("reply_instructions") or ""
        reply_text = await generate_reply(email, user, db)
        if instructions:
            refine_prompt = (
                f"Tilpas dette email-svar: {instructions}\n\n"
                f"Original email: {email.subject}\n{email.body_text or ''}\n\n"
                f"Nuværende svar:\n{reply_text}"
            )
            reply_text = await _call_ollama_generate(refine_prompt)
        suggestion = AiSuggestion(
            email_id=email.id,
            suggested_text=reply_text,
            status="pending"
        )
        db.add(suggestion)
        await db.commit()
        return CommandResponse(
            response=f"Svarudkast oprettet til '{email.subject}':\n\n{reply_text}",
            actions_taken=["Svarudkast oprettet"],
            data={"email_id": str(email.id), "suggested_text": reply_text}
        )

    # --- DELETE (kræver bekræftelse) ---
    if action == "delete":
        matched, msg = await _execute_search(filters, emails)
        if not matched:
            return CommandResponse(response="Fandt ingen emails at slette.")
        preview = "\n".join(
            f"- {e.subject or '(intet emne)'} fra {e.from_address}"
            for e in matched[:5]
        )
        if len(matched) > 5:
            preview += f"\n... og {len(matched) - 5} mere"
        return CommandResponse(
            response=f"Er du sikker på at du vil slette {len(matched)} email(s)?\n\n{preview}",
            requires_confirmation=True,
            pending_action={
                "action": "delete",
                "email_ids": [str(e.id) for e in matched]
            }
        )

    # --- SEND (kræver bekræftelse) ---
    if action == "send":
        to = intent.get("send_to", "")
        subject = intent.get("send_subject", "")
        body = intent.get("send_body", "")
        if not to or not body:
            return CommandResponse(response="Angiv hvem emailen skal sendes til og hvad den skal indeholde.")
        return CommandResponse(
            response=f"Er du sikker på at du vil sende denne email?\n\n**Til:** {to}\n**Emne:** {subject}\n\n{body}",
            requires_confirmation=True,
            pending_action={
                "action": "send",
                "send_data": {"to": to, "subject": subject, "body": body}
            }
        )

    # Fallback: lad AI svare frit med email-kontekst
    fallback_prompt = (
        f"Du er en hjælpsom email-assistent. Svar på brugerens henvendelse på dansk.\n\n"
        f"EMAILS I INDBAKKEN:\n{emails_summary}\n\n"
        f"BRUGERENS BESKED: {req.message}\n\n"
        f"Svar kortfattet og hjælpsomt på dansk."
    )
    answer = await _call_ollama_generate(fallback_prompt)
    return CommandResponse(response=answer)
