# Governance

Zentrales Monitoring-Dashboard für alle Homelab-Services.

**URL:** `governance.eventig.app` (Split DNS, nur lokal erreichbar)

## Features

- **Health Monitoring** — Stündlicher Poll aller registrierten Services (Uptime, Response Time, Version)
- **Incident Detection** — Automatische Erkennung von Statuswechseln (up/down/degraded), Incident-History mit Dauer
- **Push Notifications** — Webhooks bei Incident-Events (ntfy.sh, Discord, generisch)
- **Stats Collection** — Tägliche Erhebung app-spezifischer Kennzahlen
- **Infra Monitoring** — CPU/RAM/Disk per SSH von docker-host und dev-VM (alle 5 Min)
- **Data Retention** — Automatisches Cleanup alter Daten (90d/365d/30d)

## Seiten

| Route | Beschreibung |
|---|---|
| `/` | Dashboard — alle Services als Karten mit Status, Uptime, Incident-Banner |
| `/services/[slug]` | Detailseite — 3 Tabs: Overview, Stats, Incidents |
| `/registry` | Service Registry CRUD |
| `/infra` | Infra-Metriken (Host-Auslastung, Container-Tabelle) |
| `/settings` | Webhook-Verwaltung |

## Stack

- Next.js 16 (App Router, Turbopack)
- better-sqlite3 (WAL mode)
- Recharts (Charts)
- node-cron (Scheduling)
- ssh2 (Infra-Metriken)
- lucide-react (Icons)

## Cron-Jobs

| Schedule | Job | Beschreibung |
|---|---|---|
| `0 * * * *` | Health Poll | Pollt alle aktiven Services via `internal_url + health_endpoint` |
| `30 0 * * *` | Stats Collect | Sammelt Stats von allen Services mit `stats_endpoint` |
| `*/5 * * * *` | Infra Collect | SSH: CPU/RAM/Disk von docker-host + dev-VM |
| `0 3 * * *` | Retention Cleanup | Löscht alte Metriken (90d/365d/30d) |

## Entwicklung

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Scripts

| Script | Beschreibung |
|---|---|
| `npm run dev` | Development Server |
| `npm run build` | Production Build |
| `npm run lint` | ESLint |
| `npm test` | Lint + TypeScript Check (Pre-Push Hook) |

## Deployment

```
git push main → GitHub Actions (build + push) → ghcr.io → Watchtower → live
```

Docker auf docker-host, Traefik als Reverse Proxy, HTTPS via Cloudflare DNS-01 Challenge.

## Neuen Service anbinden

Siehe [INTEGRATION.md](./INTEGRATION.md) für die Schritt-für-Schritt Anleitung.
