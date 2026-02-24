"""Ollama-based AI engine for email classification and reply generation."""

from __future__ import annotations

import json
import logging
from typing import TYPE_CHECKING

import httpx
from sqlalchemy import select

from app.config import settings
from app.services.prompt_builder import build_classification_prompt, build_reply_prompt
from app.services.vector_store import search_knowledge, search_similar_replies

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

    from app.models.email_message import EmailMessage
    from app.models.user import User

logger = logging.getLogger(__name__)

# Default timeout for Ollama requests (generation can be slow on large models)
_OLLAMA_TIMEOUT = httpx.Timeout(300.0, connect=10.0)


async def get_embedding(text: str) -> list[float]:
    """Get an embedding vector from the Ollama nomic-embed-text model.

    Args:
        text: The text to embed.

    Returns:
        A list of floats representing the embedding vector.
    """
    url = f"{settings.ollama_base_url}/api/embeddings"
    payload = {
        "model": settings.ollama_embed_model,
        "prompt": text,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["embedding"]


async def _call_ollama_generate(prompt: str) -> str:
    """Send a generation request to the Ollama API and return the response text.

    Args:
        prompt: The full prompt to send to the model.

    Returns:
        The generated text response.
    """
    url = f"{settings.ollama_base_url}/api/generate"
    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "options": {"num_ctx": 2048},
    }

    async with httpx.AsyncClient(timeout=_OLLAMA_TIMEOUT) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "")


async def classify_email(subject: str, body: str) -> dict:
    """Classify an email using the Ollama LLM.

    Sends a classification prompt and parses the JSON response. Returns
    a dict with category, urgency, topic, and confidence.

    Args:
        subject: The email subject line.
        body: The plain-text email body.

    Returns:
        Dict with keys: category, urgency, topic, confidence.
        Falls back to safe defaults on parse errors.
    """
    prompt = build_classification_prompt(subject, body)

    try:
        raw_response = await _call_ollama_generate(prompt)
    except httpx.HTTPError as exc:
        logger.error("Ollama API error during classification: %s", exc)
        return _default_classification()

    return _parse_classification_response(raw_response)


def _parse_classification_response(raw: str) -> dict:
    """Attempt to parse the LLM classification response as JSON.

    Handles common issues like markdown code fences wrapping the JSON.

    Args:
        raw: The raw text response from the LLM.

    Returns:
        Parsed classification dict, or defaults on failure.
    """
    text = raw.strip()

    # Strip markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first line (```json or ```) and last line (```)
        lines = [
            line
            for line in lines
            if not line.strip().startswith("```")
        ]
        text = "\n".join(lines).strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON object in the response
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                data = json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                logger.warning("Failed to parse classification JSON: %s", text[:200])
                return _default_classification()
        else:
            logger.warning("No JSON object found in classification response: %s", text[:200])
            return _default_classification()

    # Validate and normalize fields
    valid_categories = {"inquiry", "complaint", "order", "support", "spam", "other"}
    valid_urgencies = {"high", "medium", "low"}

    category = str(data.get("category", "other")).lower()
    if category not in valid_categories:
        category = "other"

    urgency = str(data.get("urgency", "medium")).lower()
    if urgency not in valid_urgencies:
        urgency = "medium"

    topic = str(data.get("topic", ""))[:100]

    try:
        confidence = float(data.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))
    except (TypeError, ValueError):
        confidence = 0.5

    return {
        "category": category,
        "urgency": urgency,
        "topic": topic,
        "confidence": confidence,
    }


def _default_classification() -> dict:
    """Return safe default classification values."""
    return {
        "category": "other",
        "urgency": "medium",
        "topic": "",
        "confidence": 0.0,
    }


async def generate_reply(
    email: EmailMessage, user: User, db: AsyncSession
) -> str:
    """Orchestrate the full reply generation pipeline.

    Steps:
      1. Search ChromaDB for relevant knowledge base entries.
      2. Search ChromaDB for similar previously approved replies.
      3. Fetch matching templates from the database.
      4. Build the reply prompt with all context.
      5. Call Ollama to generate the reply.

    Args:
        email: The EmailMessage to reply to.
        user: The User who owns the mailbox.
        db: An async database session.

    Returns:
        The generated reply text.
    """
    user_id_str = str(user.id)
    query_text = f"{email.subject or ''} {email.body_text or ''}"

    # 1 & 2: Search ChromaDB in parallel-style (sequential but fast)
    try:
        knowledge_context = await search_knowledge(
            query=query_text, user_id=user_id_str, n_results=3
        )
    except Exception as exc:
        logger.warning("Knowledge search failed: %s", exc)
        knowledge_context = []

    try:
        similar_replies = await search_similar_replies(
            query=query_text, user_id=user_id_str, n_results=3
        )
    except Exception as exc:
        logger.warning("Similar replies search failed: %s", exc)
        similar_replies = []

    # 3: Fetch matching templates from the database
    from app.models.template import Template

    templates: list[Template] = []
    try:
        stmt = select(Template).where(Template.user_id == user.id)
        if email.category:
            stmt = stmt.where(Template.category == email.category)
        stmt = stmt.order_by(Template.usage_count.desc()).limit(3)
        result = await db.execute(stmt)
        templates = list(result.scalars().all())
    except Exception as exc:
        logger.warning("Template fetch failed: %s", exc)

    # 4: Build the prompt
    prompt = await build_reply_prompt(
        email=email,
        user=user,
        knowledge_context=knowledge_context,
        similar_replies=similar_replies,
        templates=templates,
    )

    # 5: Generate the reply
    try:
        reply_text = await _call_ollama_generate(prompt)
    except httpx.HTTPError as exc:
        logger.error("Ollama API error during reply generation: %s", exc)
        raise RuntimeError(f"Failed to generate reply: {exc}") from exc

    return reply_text.strip()
