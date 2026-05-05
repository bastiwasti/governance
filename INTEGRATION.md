# Integration Guide — Neuen Service anbinden

Anleitung um einen neuen Service in Governance aufzunehmen. Zwei Endpoints im App-Repo, ein Eintrag in der Governance Registry, optional eine Custom-Stats-Komponente.

---

## Überblick

Jede App stellt bis zu zwei HTTP-Endpoints bereit:

| Endpoint | Pflicht | Beschreibung |
|---|---|---|
| `GET /api/health` | Ja | Technischer Healthcheck — wird stündlich gepollt |
| `GET /api/stats` | Nein | App-spezifische Kennzahlen — wird täglich um 00:30 erhoben |

Governance pollt über das interne Docker-Netzwerk (`internal_url`), nicht über die öffentliche URL. Die Endpoints sind von außen nicht erreichbar.

---

## Schritt 1: Health Endpoint im App-Repo

### Pflicht-Response

```ts
// GET /api/health
{
  "status": "ok",       // "ok" | "degraded" | "down"
  "timestamp": "2026-05-04T14:00:00.000Z"
}
```

### Empfohlene Response (mit DB-Check + Version)

```ts
app.get('/api/health', async (_req, res) => {
  const dbOk = await checkDatabase() // z.B. "SELECT 1"

  res.json({
    status: dbOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? 'unknown',
    db: dbOk ? 'ok' : 'error',
  })
})
```

### Wichtig

- Endpoint muss **vor dem SPA-Fallback** registriert sein (sonst liefert er HTML + 200 zurück)
- Response muss gültiges JSON sein
- HTTP-Status 2xx = erreichbar, non-2xx = down
- Response-Zeit < 2000ms = up, >= 2000ms = degraded, > 5000ms = down

### Status-Klassifikation durch Governance

Governance misst den Status **unabhängig** vom `status`-Feld im Response-Body:

| Bedingung | Governance Status |
|---|---|
| HTTP 2xx + < 2000ms | `up` |
| HTTP 2xx + >= 2000ms | `degraded` |
| Timeout / non-2xx | `down` |

Das `status`-Feld im Body wird nur im Dashboard angezeigt (als `app_status`), nicht für die Uptime-Berechnung verwendet.

---

## Schritt 2: Stats Endpoint im App-Repo (optional)

### Minimale Response

```ts
// GET /api/stats
{
  "timestamp": "2026-05-04T14:00:00.000Z"
}
```

### Beispiel: Karten

```ts
app.get('/api/stats', async (_req, res) => {
  const [players, sessions, rounds, games] = await Promise.all([
    db.player.count(),
    db.session.count({ where: { createdAt: { gte: thirtyDaysAgo() } } }),
    db.round.count(),
    db.game.count(),
  ])

  res.json({
    timestamp: new Date().toISOString(),
    players: { total: players.total, active_30d: players.recent },
    sessions: { total: sessions.total, active_30d: sessions.recent },
    rounds: { total: rounds },
    games: { total: games },
  })
})
```

### Beispiel: WebScraper (CLI-App)

```ts
app.get('/api/stats', async (_req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    last_run: lastRunTimestamp,
    events_scraped: scrapedCount,
    events_rated: ratedCount,
    sources: sourceCount,
  })
})
```

### Regeln

- Nur `timestamp` ist Pflicht
- Alles andere ist 100% frei definierbar
- Governance speichert den gesamten Response-Body als JSON-Snapshot
- Kein Parsing, keine Auswertung durch Governance — die Custom-Komponente interpretiert die Daten

---

## Schritt 3: Service in Governance registrieren

1. Governance öffnen → **Registry**
2. **"+ Service hinzufügen"** klicken
3. Felder ausfüllen:

| Feld | Beschreibung | Beispiel |
|---|---|---|
| **Name** | Anzeigename | `Karten` |
| **Slug** | Eindeutiger Bezeichner (URL-safe) | `karten` |
| **URL** | Öffentliche URL (nur Dashboard-Link) | `https://karten.eventig.app` |
| **Internal URL** | Docker-interne Basis-URL für Polling | `http://karten:3002` |
| **Type** | `app`, `infra` oder `cli` | `app` |
| **Repo** | GitHub Repo (Link) | `bastiwasti/karten` |
| **Health Endpoint** | Pfad zum Health-Endpoint | `/api/health` |
| **Stats Endpoint** | Pfad zum Stats-Endpoint (optional) | `/api/stats` |
| **Status** | `active`, `maintenance` oder `deprecated` | `active` |
| **Notes** | Notizen (optional) | `PostgreSQL + Prisma` |

### Internal URL

Die `internal_url` ist die Docker-interne Adresse. Da alle Container im `traefik-public` Netzwerk sind, können sie sich unter ihrem Container-Namen erreichen:

```
http://<container-name>:<port>
```

Beispiele:
- `http://karten:3002`
- `http://sofia:3002`
- `http://frontend:3002`

### CLI-Services

CLI-Apps (z.B. WebScraper) ohne Webserver werden als `type=cli` registriert. Sie brauchen keine `internal_url` und keine Endpoints. Governance trackt sie in der Registry, führt aber keine Polls durch.

---

## Schritt 4: Custom Stats-Komponente (optional)

Wenn ein Service einen Stats-Endpoint hat, wird standardmäßig das Raw-JSON-Fallback angezeigt. Für eine hübschere Darstellung kann eine Custom-Komponente erstellt werden.

### 4.1 Komponente erstellen

Datei: `src/components/stats/<slug>.tsx`

```tsx
interface MyStatsData {
  timestamp: string;
  users: { total: number };
  posts: { total: number };
}

export function MyStats({ data }: { data: MyStatsData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Benutzer" value={data.users?.total} />
      <StatCard label="Posts" value={data.posts?.total} />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-100">
        {value ?? "--"}
      </p>
    </div>
  )
}
```

### 4.2 Dispatcher erweitern

Datei: `src/components/stats/index.tsx`

```tsx
import { MyStats } from "./my-slug";

// im switch:
case "my-slug":
  return <MyStats data={data as Parameters<typeof MyStats>[0]["data"]} />;
```

### Existierende Komponenten als Referenz

| Datei | App | Felder |
|---|---|---|
| `sofia.tsx` | Sofia Guide | Benutzer, GPS aktiv, Orte, Notizen, Events |
| `karten.tsx` | Karten | Spieler, Sessions, Runden, Spiele |
| `schafkopf-tracker.tsx` | Schafkopf Tracker | Spieler, Sessions, Runden |
| `webscraper.tsx` | WebScraper | Letzter Run, Events gescrapt/bewertet, Quellen |

---

## Vollständiges Beispiel: Neuen Service von null

### Im App-Repo (z.B. Express)

```ts
// server/index.ts — VOR dem SPA-Fallback!

app.get('/api/health', async (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? 'unknown',
  })
})

app.get('/api/stats', async (_req, res) => {
  const users = await db.user.count()
  const items = await db.item.count()

  res.json({
    timestamp: new Date().toISOString(),
    users: { total: users },
    items: { total: items },
  })
})

// SPA-Fallback NACH den API-Routes:
app.get('/*path', (_req, res) => res.sendFile(join(__dirname, '../dist/index.html')))
```

### Im Governance-Repo

1. Registry → Service anlegen (Name, Slug, URLs, Endpoints)
2. Warten bis erster Health-Poll durchläuft (stündlich, oder `POST /api/poll` manuell triggern)
3. Optional: Custom Stats-Komponente + Dispatcher-Eintrag
4. Deploy: `git push main`

### Prüfen

- Dashboard: Service-Karte erscheint mit grünem Status
- Detailseite: Overview-Tab zeigt Uptime-Graph
- Stats-Tab: Zeigt Custom-Komponente oder Raw JSON
- `/settings`: Webhook für Push-Notifications konfigurieren

---

## Notifications einrichten (ntfy.sh)

### Einmalig pro Handy

1. **ntfy App** installieren (Android: Play Store / F-Droid, iOS: App Store)
2. Topic abonnieren: **"+"** → Namen wählen (z.B. `governance-basti`)
3. Topic-Name wie Passwort wählen — jeder der die URL kennt kann lesen

### In Governance

1. `/settings` öffnen
2. **"+ Webhook hinzufügen"**
3. URL: `https://ntfy.sh/<dein-topic>`
4. Events: "Down + Up" (Standard)
5. **Test-Button** klicken → Push-Notification sollte sofort kommen

###支持的 Provider

| Provider | Erkennung | Format |
|---|---|---|
| ntfy.sh | URL enthält `ntfy.sh` | Title/Priority Header + Plaintext |
| Discord | URL enthält `discord.com` | JSON mit `content`-Feld |
| Generic | Alle anderen | JSON-Payload: `{ event, service, timestamp }` |

---

## Datenmodell-Referenz

### services

| Spalte | Typ | Beschreibung |
|---|---|---|
| id | INTEGER PK | Auto-Increment |
| name | TEXT | Anzeigename |
| slug | TEXT UNIQUE | URL-Identifier |
| url | TEXT | Öffentliche URL (Dashboard-Link) |
| internal_url | TEXT | Docker-interne URL (Polling) |
| type | TEXT | `app` / `infra` / `cli` |
| repo | TEXT | GitHub Repo-URL |
| health_endpoint | TEXT | Pfad z.B. `/api/health` |
| stats_endpoint | TEXT | Pfad z.B. `/api/stats` (optional) |
| status | TEXT | `active` / `maintenance` / `deprecated` |
| notes | TEXT | Freitext |

### uptime_checks

Gespeichert bei jedem Health-Poll (stündlich).

| Spalte | Typ | Beschreibung |
|---|---|---|
| service_id | INTEGER FK | Referenz auf services |
| timestamp | TEXT | Zeitpunkt des Checks |
| status | TEXT | `up` / `degraded` / `down` |
| response_ms | INTEGER | Antwortzeit in ms |
| http_status_code | INTEGER | HTTP Status Code |
| app_status | TEXT | status-Feld aus JSON-Body |
| version | TEXT | version-Feld aus JSON-Body |
| error_message | TEXT | Fehler bei Timeout/Exception |

### incidents

Statuswechsel werden automatisch erkannt.

| Spalte | Typ | Beschreibung |
|---|---|---|
| service_id | INTEGER FK | Betroffener Service |
| status | TEXT | `open` / `resolved` |
| severity | TEXT | `down` / `degraded` |
| started_at | TEXT | Erster down-Check |
| resolved_at | TEXT | Erster up-Check danach |
| duration_minutes | INTEGER | Dauer in Minuten |

### stats_snapshots

Kompletter Response-Body als JSON.

| Spalte | Typ | Beschreibung |
|---|---|---|
| service_id | INTEGER FK | Referenz auf services |
| collected_at | TEXT | Zeitpunkt der Erhebung |
| endpoint_available | INTEGER | 0 = Endpoint nicht erreichbar |
| data_json | TEXT | Kompletter JSON-Body |

### webhooks

| Spalte | Typ | Beschreibung |
|---|---|---|
| url | TEXT | Webhook-URL |
| label | TEXT | Anzeigename |
| events | TEXT | Kommasepariert: `down,up,degraded` |
| is_active | INTEGER | 1 = aktiv, 0 = inaktiv |

### Data Retention

| Tabelle | Retention |
|---|---|
| `uptime_checks` | 90 Tage |
| `stats_snapshots` | 365 Tage |
| `infra_metrics` | 30 Tage |
| `incidents` | Nie (Historie) |
