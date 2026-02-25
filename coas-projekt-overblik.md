# Coas — Din AI-assistent
> Komplet projektfil. Alt hvad der er bygget, besluttet og planlagt.

---

## Hvad er Coas?
GDPR-venlig AI-mailassistent til danske SMV'er (håndværkere, servicevirksomheder).
Læser indgående mails, klassificerer dem automatisk, og foreslår svar via lokal AI.
Brugeren godkender med ét klik — al data forbliver lokalt, ingen cloud.

**Tidligere navn:** Ahmes (omdøbt til Coas)

---

## Stier & Links
| Hvad | Sti/URL |
|------|---------|
| Lokal repo | `/home/ahmes/ahmes/` |
| GitHub | `github.com/diallomatiass-ai/coas` |
| App (lokalt) | `http://localhost` |
| Dashboard | `http://localhost/dashboard` |
| Landing page | `http://localhost/` |
| Testlogin | `test@mailbot.dk` / `test1234` |

---

## Tech Stack
| Komponent | Teknologi |
|-----------|-----------|
| Backend | Python 3.12, FastAPI, SQLAlchemy async, Celery |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, lucide-react |
| Database | PostgreSQL 16 |
| Cache/Broker | Redis 7 |
| Vektorsøgning | ChromaDB |
| AI/LLM | Ollama — mistral:7b-instruct |
| Embeddings | Ollama (nomic-embed-text) |
| Reverse Proxy | Nginx |
| Container | Docker Compose (9 services) |

---

## Docker-kommandoer
```bash
# Start alt
sg docker "docker compose -f /home/ahmes/ahmes/docker-compose.yml up -d"

# Genbyg frontend
sg docker "docker compose -f /home/ahmes/ahmes/docker-compose.yml up -d --build --force-recreate frontend"

# Genbyg backend
sg docker "docker compose -f /home/ahmes/ahmes/docker-compose.yml up -d --build --force-recreate backend"

# Se logs
sg docker "docker compose -f /home/ahmes/ahmes/docker-compose.yml logs backend --tail 30"

# Seed testdata (rydder + genskaber)
sg docker "docker compose -f /home/ahmes/ahmes/docker-compose.yml exec backend python seed.py"
```

---

## Frontend-sider (alle byggede)
| URL | Fil | Formål |
|-----|-----|--------|
| `/` | `app/page.tsx` | Public landing page |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | App-dashboard (kræver login) |
| `/login` | `app/(auth)/login/page.tsx` | Login + registrering |
| `/inbox` | `app/(app)/inbox/page.tsx` | Indbakke med filtre |
| `/inbox/[id]` | `app/(app)/inbox/[id]/page.tsx` | Email-detalje + AI-forslag |
| `/templates` | `app/(app)/templates/page.tsx` | Skabelon-CRUD |
| `/knowledge` | `app/(app)/knowledge/page.tsx` | Videnbase-editor |
| `/settings` | `app/(app)/settings/page.tsx` | Kontoindstillinger |
| `/gratis` | `app/gratis/page.tsx` | Signup landing page (outbound CTA) |
| `/video/[name]` | `app/video/[name]/page.tsx` | Personaliseret videoside |
| `/afmeld` | `app/afmeld/page.tsx` | GDPR unsubscribe |

---

## Backend API-routes
| Endpoint | Formål |
|----------|--------|
| `POST /api/auth/register` | Opret konto |
| `POST /api/auth/login` | Login → JWT token |
| `GET /api/auth/me` | Nuværende bruger |
| `GET /api/emails/` | List emails (filter: kategori, prioritet) |
| `GET /api/emails/{id}` | Hent enkelt email |
| `POST /api/emails/{id}/generate-suggestion` | Tving AI-forslag |
| `GET /api/emails/dashboard/summary` | Dashboard-statistik |
| `POST /api/suggestions/{id}/action` | Godkend/afvis/rediger forslag |
| `POST /api/suggestions/{id}/send` | Send godkendt svar |
| `POST /api/suggestions/{id}/refine` | Forfin forslag med instruktion |
| `GET /api/templates/` | List skabeloner |
| `POST /api/chat` | AI Command Chat |
| `GET /api/webhooks/accounts` | List tilsluttede mailkonti |

---

## Outbound Pipeline (B2B salg)
**Formål:** Find + kontakt danske håndværker-SMV'er i skala.

### Stack
| Tool | Formål | Pris |
|------|--------|------|
| Clay.com | Find + berig lead-liste (CVR, email, LinkedIn, AI-personalisering) | ~$149/md |
| Hunter.io | Find email via navn + domæne | ~$49/md |
| Instantly.ai | Send + track email-kampagne (multi-domæne) | ~$37/md |
| Sendspark | Personaliseret video i skala | Gratis til start |

### Email-sekvens (4 mails)
- **Dag 0:** Video intro + personaliseret åbningslinje (fra Clay AI)
- **Dag 4:** Video follow-up
- **Dag 9:** FOMO / breakup mail
- **Dag 21:** Reaktivering (kun til "åbnede men klikkede ikke")

### Dokumentation
Alle filer i `/home/ahmes/Skrivebord/ahmes-outbound/`:
- `01-strategi-overblik.md`
- `02-clay-workflow.md` — 20 kolonner trin for trin
- `03-instantly-sekvens.md` — mails med merge tags
- `04-frontend-sider.md` — hvad er bygget
- `05-launch-tjekliste.md` — trin-for-trin inden launch

### Hvad mangler inden launch
- [ ] `VIDEO_EMBED_URL` i `video/[name]/page.tsx` linje 14 (Sendspark embed)
- [ ] Instantly.ai API-nøgle i `afmeld/page.tsx` linje 33
- [ ] Vilkår + privatlivspolitik sider
- [ ] 3 afsenderdomæner købt + opvarmet i Instantly.ai (14 dage)

---

## Rebrand: Ahmes → Coas (hvad mangler)
GitHub-repo er omdøbt. Men disse steder refererer stadig til "Ahmes":

| Fil | Hvad | Prioritet |
|-----|------|-----------|
| `frontend/public/logo.png` | Logo-fil (visuelt) | Høj |
| `frontend/public/logo-dark.png` | Mørkt logo | Høj |
| `app/page.tsx` | "Ahmes AI" i footer + meta | Medium |
| `app/gratis/page.tsx` | "Ahmes" i footer + tekst | Medium |
| `app/video/[name]/page.tsx` | "Ahmes" i tekst + email | Medium |
| `app/afmeld/page.tsx` | "Ahmes AI" i footer | Medium |
| `docker-compose.yml` | Service-navne (ahmes-backend etc.) | Lav |
| `outbound-notes.md` | Projektnavn | Lav |
| Systembruger | `/home/ahmes/` — kan ikke ændres | Ignorér |

---

## Priser (besluttet)
| Pakke | Pris | Hvad |
|-------|------|------|
| Starter | 499 kr/md | 1 bruger, 1 mailkonto |
| Pro | 999 kr/md | 5 brugere, 3 mailkonti |
| Business | 2.499 kr/md | 20 brugere, 10 mailkonti |

14 dages gratis prøve på alle pakker.

---

## Næste skridt (prioriteret)
1. **Nyt logo** til Coas — erstat `/public/logo.png` og `/logo-dark.png`
2. **Opdater tekst** i alle frontend-filer: "Ahmes" → "Coas"
3. **Optag Sendspark-video** → indsæt `VIDEO_EMBED_URL`
4. **Køb domæner** + opvarm i Instantly.ai
5. **Byg Clay lead-liste** (500 leads, håndværkere DK)
6. **VPS deploy** (Hetzner/DigitalOcean) + SSL
7. **Stripe** integration til betaling
8. **Google Cloud + Microsoft Entra** → OAuth credentials til rigtige mailkonti

---

## Historik (sessioner)
- **2026-02-16:** MVP bygget fra bunden (69+ filer, ~5000 linjer)
- **2026-02-24:** Docker setup, seed-data, AI Command Chat, dashboard revamp
- **2026-02-25:** Outbound pipeline, landing page, rebrand til Coas
