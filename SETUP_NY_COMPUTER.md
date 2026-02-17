# AI Mailbot — Opsætning på ny computer

## Forudsætninger
- Windows med WSL2 installeret
- Min. 16 GB RAM (til Mistral 7B AI-model)
- Internet

---

## Trin 1: Åbn WSL2 terminal

Start WSL2 og kør alle kommandoer nedenfor i WSL.

---

## Trin 2: Installér Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

Verificér at Docker virker:
```bash
docker --version
```

---

## Trin 3: Klon projektet fra GitHub

```bash
git clone https://github.com/diallomatiass-ai/ai-mailbot ~/mailbot
cd ~/mailbot
```

---

## Trin 4: Opret .env fil

```bash
cp .env.example .env
```

Åbn .env og sæt disse værdier (eller kør kommandoerne nedenfor):

```bash
# Generer sikker SECRET_KEY
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
sed -i "s/^SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env

# Generer ENCRYPTION_KEY
ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())" 2>/dev/null || echo "tCEhTiFXrZ9r9maotMTZtbdpLgQcQ-2w_ydjseQXxL4=")
sed -i "s|^ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|" .env

# Sæt database password
sed -i 's/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=mailbot_prod_2026/' .env
sed -i 's|^DATABASE_URL=.*|DATABASE_URL=postgresql+asyncpg://mailbot:mailbot_prod_2026@postgres:5432/mailbot|' .env

# VIGTIGT: Sæt AI-model til Mistral 7B (denne computer har nok RAM)
sed -i 's/^OLLAMA_MODEL=.*/OLLAMA_MODEL=mistral:7b-instruct/' .env
```

---

## Trin 5: Start alle services

```bash
cd ~/mailbot
docker compose up -d
```

Vent til alle 9 containere kører:
```bash
docker compose ps
```

Du bør se: postgres, redis, chromadb, ollama, backend, celery-worker, celery-beat, frontend, nginx — alle med status "Up".

---

## Trin 6: Pull AI-modeller (tager 5-10 min)

```bash
# Mistral 7B — hovedmodel til klassificering og svar (4.4 GB)
docker compose exec ollama ollama pull mistral:7b-instruct

# Nomic Embed — til embeddings/vektorsøgning (274 MB)
docker compose exec ollama ollama pull nomic-embed-text
```

---

## Trin 7: Opret testdata

```bash
docker compose exec backend python seed.py
```

Output skal vise:
```
Created user: test@mailbot.dk
Created mail account: test@mailbot.dk
Created 14 emails
Created 6 AI suggestions
Created 4 templates
Created 5 knowledge base entries
Seed completed successfully!
```

---

## Trin 8: Test at det virker

Åbn i browser: **http://localhost**

Login:
- **Email:** test@mailbot.dk
- **Password:** test1234

Du bør se et dashboard med 14 emails, kategorier og prioriteter.

---

## Trin 9: (Valgfrit) Cloudflare Tunnel for ekstern adgang

Hvis du vil dele en offentlig URL:

```bash
# Installér cloudflared
sudo curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:80 --protocol http2
```

Den printer en URL som `https://xxx-xxx.trycloudflare.com` — del den med hvem som helst.

---

## Fejlfinding

### "permission denied" ved docker compose
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Backend starter ikke (tjek logs)
```bash
docker compose logs backend --tail 30
```

### Ollama "not enough memory"
Tjek at ingen andre tunge programmer kører. Mistral 7B kræver ~4.5 GB ledig RAM.

### Frontend viser "Failed to fetch"
```bash
docker compose restart backend
```

### Ændringer i .env slår ikke igennem
```bash
docker compose up -d --force-recreate backend celery-worker celery-beat
```

---

## Oversigt over services

| Service | Port | Beskrivelse |
|---|---|---|
| nginx | 80 | Reverse proxy (brug denne i browser) |
| frontend | 3000 | Next.js UI |
| backend | 8000 | FastAPI API |
| postgres | 5432 | Database |
| redis | 6379 | Cache/message broker |
| chromadb | 8001 | Vektordatabase |
| ollama | 11434 | Lokal AI (Mistral 7B) |

---

## Vigtige filer
- `.env` — al konfiguration (passwords, API keys, model valg)
- `docker-compose.yml` — alle 9 services
- `backend/seed.py` — testdata script
- `backend/app/` — al backend kode
- `frontend/src/` — al frontend kode

---

*Genereret 2026-02-17 til opsætning af AI Mailbot på ny computer med 16 GB RAM.*
