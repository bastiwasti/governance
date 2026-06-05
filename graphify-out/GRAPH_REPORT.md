# Graph Report - .  (2026-06-05)

## Corpus Check
- 56 files · ~13,028 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 242 nodes · 381 edges · 17 communities (13 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 40 edges
2. `compilerOptions` - 16 edges
3. `Service` - 12 edges
4. `register()` - 8 edges
5. `scripts` - 6 edges
6. `FrontendStats()` - 6 edges
7. `sendNotifications()` - 5 edges
8. `detectIncident()` - 5 edges
9. `pollAllServices()` - 5 edges
10. `collectAllStats()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getDb()`  [INFERRED]
  src/app/api/services/[id]/route.ts → src/lib/db.ts
- `PUT()` --calls--> `getDb()`  [INFERRED]
  src/app/api/services/[id]/route.ts → src/lib/db.ts
- `DELETE()` --calls--> `getDb()`  [INFERRED]
  src/app/api/services/[id]/route.ts → src/lib/db.ts
- `DELETE()` --calls--> `getDb()`  [INFERRED]
  src/app/api/webhooks/[id]/route.ts → src/lib/db.ts
- `PUT()` --calls--> `getDb()`  [INFERRED]
  src/app/api/webhooks/[id]/route.ts → src/lib/db.ts

## Import Cycles
- None detected.

## Communities (17 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (28): POST(), GET(), DATA_DIR, __dirname, getDb(), getDbPath(), globalForDb, detectIncident() (+20 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (16): FitnessStats(), FitnessStatsData, TopExercise, StatsView(), formatNumber(), GAME_META, GameTypeStats, KartenStats() (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (15): ResponseTimeChart(), UptimeChart(), IncidentList(), RegistryClient(), emptyForm, RegistryForm(), Tabs(), WebhookManager() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (16): POST(), collectAllInfra(), collectHost(), ContainerInfo, CpuInfo, DiskInfo, insertMetric(), MemoryInfo (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (13): ContainerInfo, ContainerTable(), formatGb(), HostCard(), HostCardProps, MetricBarProps, timeAgo(), ChartProps (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (18): dependencies, better-sqlite3, lucide-react, next, node-cron, react, react-dom, recharts (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.24
Nodes (8): DashboardPage(), formatUptime(), ServiceCard(), timeAgo(), config, Status, StatusBadge(), ServiceWithLatestCheck

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/better-sqlite3, @types/node, @types/node-cron (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (8): buildDiscordPayload(), buildGenericPayload(), buildNtfyPayload(), getActiveWebhooks(), sendNotifications(), sendWebhook(), WebhookRow, POST()

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (6): formatDateTime(), formatDuration(), formatThousands(), formatUsers(), FrontendStats(), FrontendStatsData

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (5): geistMono, geistSans, metadata, Navbar(), navItems

## Knowledge Gaps
- **77 isolated node(s):** `plugin`, `eslintConfig`, `nextConfig`, `name`, `version` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 0` to `Community 2`, `Community 3`, `Community 4`, `Community 7`, `Community 9`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Why does `Service` connect `Community 2` to `Community 0`, `Community 9`, `Community 7`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `register()` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `getDb()` (e.g. with `GET()` and `DELETE()`) actually correct?**
  _`getDb()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `plugin`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09446693657219973 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07956989247311828 - nodes in this community are weakly interconnected._