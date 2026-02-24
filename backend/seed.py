"""
Seed script — opretter testdata i databasen.
Kør med: docker compose exec backend python seed.py
"""
import asyncio
import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session, engine, Base
from app.models.user import User
from app.models.mail_account import MailAccount
from app.models.email_message import EmailMessage
from app.models.ai_suggestion import AiSuggestion
from app.models.template import Template
from app.models.knowledge_base import KnowledgeBase
from app.utils.auth import hash_password


async def seed():
    # Opret tabeller hvis de ikke findes
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # --- Bruger ---
        user = User(
            id=uuid.uuid4(),
            email="test@mailbot.dk",
            password_hash=hash_password("test1234"),
            name="Test Bruger",
        )
        db.add(user)
        await db.flush()
        print(f"Created user: {user.email}")

        # --- Mailkonto ---
        account = MailAccount(
            id=uuid.uuid4(),
            user_id=user.id,
            email_address="test@mailbot.dk",
            provider="gmail",
            is_active=True,
        )
        db.add(account)
        await db.flush()
        print(f"Created mail account: {account.email_address}")

        # --- Emails (14 stk) ---
        now = datetime.now(timezone.utc)
        emails_data = [
            ("kunde@firma.dk", "Spørgsmål om levering", "Hvornår kan jeg forvente min pakke? Bestilte for 3 dage siden.", "inquiry", "high"),
            ("peter@gmail.com", "Faktura mangler", "Jeg har ikke modtaget min faktura for bestilling #1234.", "inquiry", "medium"),
            ("lars@virksomhed.dk", "Klage over produkt", "Produktet jeg modtog var beskadiget. Jeg er meget utilfreds.", "complaint", "high"),
            ("mia@hotmail.com", "Tilbud på bulk-ordre", "Vi ønsker at bestille 500 enheder. Kan I give en pris?", "order", "high"),
            ("info@butik.dk", "Teknisk problem med login", "Jeg kan ikke logge ind på min konto. Adgangskoden virker ikke.", "support", "medium"),
            ("anders@company.com", "Returneringsprocedure", "Hvordan returnerer jeg et produkt? Det passer ikke til formålet.", "inquiry", "low"),
            ("sofia@mail.dk", "Tak for god service", "Vil bare sige tusind tak for den hurtige og professionelle hjælp!", "other", "low"),
            ("thomas@gmail.com", "Pris på forsendelse", "Hvad koster det at sende til Sverige?", "inquiry", "low"),
            ("anne@firma.dk", "Abonnement opsigelse", "Jeg ønsker at opsige mit abonnement fra næste måned.", "support", "medium"),
            ("jens@outlook.com", "Manglende vare i ordre", "Min ordre mangler 2 af de 5 bestilte varer.", "complaint", "high"),
            ("nina@yahoo.dk", "Spørgsmål om garanti", "Hvor lang er garantiperioden på jeres produkter?", "inquiry", "low"),
            ("david@startup.io", "Samarbejdsforespørgsel", "Vi er interesserede i at indgå et forhandlersamarbejde.", "other", "medium"),
            ("maria@private.dk", "Opdatering af adresse", "Jeg er flyttet og vil gerne opdatere min leveringsadresse.", "support", "low"),
            ("spam@promo.com", "Vind en iPhone!", "Klik her for at vinde en gratis iPhone!!!", "spam", "low"),
        ]

        email_objects = []
        for i, (from_addr, subject, body, category, urgency) in enumerate(emails_data):
            email = EmailMessage(
                id=uuid.uuid4(),
                account_id=account.id,
                provider_id=f"msg_{i+1:04d}",
                from_address=from_addr,
                from_name=from_addr.split("@")[0].capitalize(),
                to_address="test@mailbot.dk",
                subject=subject,
                body_text=body,
                received_at=now - timedelta(hours=i * 3),
                category=category,
                urgency=urgency,
                processed=True,
                is_read=i > 5,
            )
            db.add(email)
            email_objects.append(email)

        await db.flush()
        print(f"Created {len(email_objects)} emails")

        # --- AI-forslag (6 stk) ---
        suggestions_data = [
            (0, "Kære kunde,\n\nTak for din henvendelse. Din pakke er afsendt og forventes leveret inden for 2-3 hverdage. Du vil modtage en sporingskode på email.\n\nMed venlig hilsen\nKundeservice"),
            (1, "Kære Peter,\n\nBeklager ulejligheden. Jeg sender dig fakturaen for bestilling #1234 med det samme. Du kan også finde den i din kontohistorik.\n\nMed venlig hilsen\nKundeservice"),
            (2, "Kære Lars,\n\nVi er meget kede af at høre om dit beskadigede produkt. Vi sender øjeblikkeligt et erstatningsprodukt til dig uden beregning.\n\nMed venlig hilsen\nKundeservice"),
            (4, "Kære kunde,\n\nVi har nulstillet din adgangskode. Du vil modtage en email med et link til at oprette en ny. Kontakt os igen, hvis du fortsat har problemer.\n\nMed venlig hilsen\nSupport"),
            (9, "Kære Jens,\n\nBeklager at din ordre var ufuldstændig. Vi afsender de manglende 2 varer i dag som ekspreslevering uden ekstra omkostninger.\n\nMed venlig hilsen\nKundeservice"),
            (7, "Hej Thomas,\n\nForsendelse til Sverige koster 89 kr. for standardlevering (5-7 dage) eller 149 kr. for ekspres (2-3 dage).\n\nMed venlig hilsen\nKundeservice"),
        ]

        for email_idx, text in suggestions_data:
            suggestion = AiSuggestion(
                id=uuid.uuid4(),
                email_id=email_objects[email_idx].id,
                suggested_text=text,
                status="pending",
            )
            db.add(suggestion)

        print(f"Created {len(suggestions_data)} AI suggestions")

        # --- Skabeloner (4 stk) ---
        templates = [
            Template(id=uuid.uuid4(), user_id=user.id, name="Standardkvittering", body="Kære {{navn}},\n\nTak for din henvendelse. Vi vender tilbage inden for 24 timer.\n\nMed venlig hilsen\nKundeservice", category="inquiry"),
            Template(id=uuid.uuid4(), user_id=user.id, name="Klagehåndtering", body="Kære {{navn}},\n\nVi beklager meget de problemer du har oplevet. Vi tager din henvendelse meget alvorligt og vil løse dette hurtigst muligt.\n\nMed venlig hilsen\nKundeservice", category="complaint"),
            Template(id=uuid.uuid4(), user_id=user.id, name="Teknisk support", body="Kære {{navn}},\n\nTak for din henvendelse til vores support. Lad os hjælpe dig med at løse dette.\n\nMed venlig hilsen\nTeknisk Support", category="support"),
            Template(id=uuid.uuid4(), user_id=user.id, name="Ordrebekræftelse", body="Kære {{navn}},\n\nTak for din ordre. Din bestilling er modtaget og behandles nu.\n\nMed venlig hilsen\nSalg", category="order"),
        ]
        for t in templates:
            db.add(t)
        print(f"Created {len(templates)} templates")

        # --- Videnbase (5 poster) ---
        kb_entries = [
            KnowledgeBase(id=uuid.uuid4(), user_id=user.id, title="Leveringstider", content="Standardlevering: 3-5 hverdage. Ekspreslevering: 1-2 hverdage. International: 7-14 dage.", entry_type="faq"),
            KnowledgeBase(id=uuid.uuid4(), user_id=user.id, title="Returpolitik", content="Vi tilbyder 30 dages returret på alle produkter. Produktet skal returneres i original emballage.", entry_type="faq"),
            KnowledgeBase(id=uuid.uuid4(), user_id=user.id, title="Garantivilkår", content="Alle produkter leveres med 2 års garanti. Garantien dækker fabrikationsfejl men ikke slitage.", entry_type="faq"),
            KnowledgeBase(id=uuid.uuid4(), user_id=user.id, title="Åbningstider", content="Mandag-fredag: 08:00-17:00. Weekend: Lukket. Telefonsupport: 09:00-15:00 på hverdage.", entry_type="hours"),
            KnowledgeBase(id=uuid.uuid4(), user_id=user.id, title="Tone of voice", content="Brug altid en venlig, professionel og hjælpsom tone. Undgå jargon. Start altid med 'Kære [navn]' og slut med 'Med venlig hilsen'.", entry_type="tone"),
        ]
        for kb in kb_entries:
            db.add(kb)
        print(f"Created {len(kb_entries)} knowledge base entries")

        await db.commit()
        print("\nSeed completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
