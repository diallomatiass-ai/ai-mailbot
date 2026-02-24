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
            ("lars@toemrerfirma.dk", "Prisforespørgsel på køkkenrenovering", "Hej, vi overvejer at renovere vores køkken. Kan I give et tilbud på arbejdet? Ca. 15 m².", "tilbud", "high"),
            ("mia@privat.dk", "Booking af maler", "Jeg vil gerne booke jer til at male stue og gang, ca. 80 m². Hvornår er I ledige?", "booking", "high"),
            ("peter@gmail.com", "Klage over udført arbejde", "Det tag I lagde for 2 uger siden lækker allerede. Jeg er meget utilfreds og forventer I retter det.", "reklamation", "high"),
            ("info@grossisten.dk", "Faktura #4521 forfalden", "Vi henleder opmærksomheden på, at faktura #4521 på kr. 8.750 er forfalden til betaling.", "faktura", "high"),
            ("thomas@bygge.dk", "Ny leverandøraftale", "Vi er et nyt grossistfirma og ønsker at præsentere vores sortiment af byggematerialer.", "leverandor", "medium"),
            ("henrik@firma.dk", "Tilbud på badeværelse", "Hvad koster det at omlægge et badeværelse på 6 m²? Inkl. fliser og sanitet.", "tilbud", "high"),
            ("anne@privat.dk", "Booking af elektriker", "Har brug for hjælp til at sætte en ny elinstallation op i bryggers. Hvornår kan I komme?", "booking", "medium"),
            ("jens@outlook.com", "Reklamation — revnede fliser", "De fliser I lagde i gangen er begyndt at revne. Det er kun 3 måneder siden I var her.", "reklamation", "high"),
            ("sofia@mail.dk", "Betaling for faktura #3312", "Vedhæfter betalingsbekræftelse for faktura #3312. Tak for godt arbejde!", "faktura", "low"),
            ("leverandor@ror.dk", "Nyt rørfitting-sortiment 2026", "Kære kunde, vi præsenterer hermed vores nye sortiment af VVS-fittings til priser fra 12 kr.", "leverandor", "low"),
            ("michael@toemrerfirma.dk", "Sygemelding fredag", "Hej chef, jeg er desværre syg og kan ikke møde fredag. Hilsen Michael.", "intern", "medium"),
            ("david@firma.dk", "Tilbud på tagudskiftning", "Vi har et ca. 200 m² hus og taget skal skiftes. Hvad er jeres pris for tagtjærepap + arbejde?", "tilbud", "high"),
            ("nina@yahoo.dk", "Booking: Haveplanlægning", "Kan I komme og se på vores have? Vi vil gerne have den omlagt med nye belægningssten.", "booking", "medium"),
            ("spam@promo.com", "Tjen 10.000 kr hjemmefra!", "Klik her for at lære hemmeligheden bag passiv indkomst!! Gratis webinar!!!", "spam", "low"),
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
