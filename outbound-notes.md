# Ahmes Outbound — Projektnoter

## Hvad det er
B2B outreach-pipeline til danske håndværker-SMV'er (VVS, El, Maler, Tømrer, Murer).
Personlig video + AI-drevet email i skala via Clay.com + Instantly.ai.

## Byggede filer (i dette repo)
| Fil | URL | Status |
|-----|-----|--------|
| `frontend/src/app/gratis/page.tsx` | `/gratis` | Klar |
| `frontend/src/app/video/[name]/page.tsx` | `/video/martin-jensen` | Klar — mangler VIDEO_EMBED_URL |
| `frontend/src/app/afmeld/page.tsx` | `/afmeld?email=...` | Klar — mangler Instantly API-nøgle |

## Hvad der mangler inden launch
1. `video/[name]/page.tsx` linje 14 — `VIDEO_EMBED_URL` fra Sendspark
2. `afmeld/page.tsx` linje 33-36 — Instantly.ai API-nøgle
3. `gratis/page.tsx` linje 122+128 — Links til vilkår + privatlivspolitik
4. Opvarm 3 afsenderdomæner i Instantly.ai (14 dage)

## Tools i stacken
| Tool | Formål | Pris |
|------|--------|------|
| Clay.com | Find + berig lead-liste | ~$149/md |
| Hunter.io | Find email via navn + domæne | ~$49/md |
| Instantly.ai | Send + track email-kampagne | ~$37/md |
| Sendspark | Personaliseret video i skala | Gratis tier til start |

## Dokumentation
Al dokumentation ligger i `/home/ahmes/Skrivebord/ahmes-outbound/`:
- `01-strategi-overblik.md` — Strategi + estimater
- `02-clay-workflow.md` — Komplet Clay-opsætning (20 kolonner)
- `03-instantly-sekvens.md` — 4 mails med merge tags
- `04-frontend-sider.md` — Hvad er bygget + hvad mangler
- `05-launch-tjekliste.md` — Trin-for-trin inden launch

## Sekvens-flow
```
Dag 0  →  Mail 1: Video intro + personaliseret linje
Dag 4  →  Mail 2: Video follow-up
Dag 9  →  Mail 3: FOMO / breakup
Dag 21 →  Mail 4: Reaktivering (kun til "åbnede men klikkede ikke")
```

## Forventet performance
- Open rate: 45-60%
- Click rate: 8-15%
- Bookinger per 1.000 mails: 10-20

## Næste skridt — Prioritet
1. [ ] Optag Sendspark-video (90 sek demo)
2. [ ] Køb 3 afsenderdomæner + opvarm i Instantly.ai (14 dage)
3. [ ] Byg første lead-liste i Clay (500 leads)
4. [ ] Udfyld de 3 TODO-punkter i frontend-filerne
5. [ ] Kør kampagnen med 30 mails/dag
