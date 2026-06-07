# Graph Report - .  (2026-06-07)

## Corpus Check
- 60 files · ~15,179 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 268 nodes · 452 edges · 18 communities (14 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 44 edges
2. `compilerOptions` - 16 edges
3. `Service` - 12 edges
4. `register()` - 9 edges
5. `runBackupCheck()` - 9 edges
6. `listBackupFiles()` - 8 edges
7. `scripts` - 6 edges
8. `FrontendStats()` - 6 edges
9. `getRecentChecks()` - 6 edges
10. `getSSHConfig()` - 6 edges

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

## Communities (18 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (23): WebhookManager(), GET(), DATA_DIR, __dirname, getDb(), getDbPath(), globalForDb, RETENTION (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (30): dependencies, better-sqlite3, lucide-react, next, node-cron, react, react-dom, recharts (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (16): FitnessStats(), FitnessStatsData, TopExercise, StatsView(), formatNumber(), GAME_META, GameTypeStats, KartenStats() (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (17): BackupsPage(), GET(), POST(), BackupBrowser(), Props, formatDate(), DbCheckResult, EXPECTED_DBS (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (12): ResponseTimeChart(), UptimeChart(), IncidentList(), RegistryClient(), emptyForm, RegistryForm(), Tabs(), Incident (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (16): POST(), collectAllInfra(), collectHost(), ContainerInfo, CpuInfo, DiskInfo, insertMetric(), MemoryInfo (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (13): ContainerInfo, ContainerTable(), formatGb(), HostCard(), HostCardProps, MetricBarProps, timeAgo(), ChartProps (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.21
Nodes (11): buildDiscordPayload(), buildGenericPayload(), buildNtfyPayload(), getActiveWebhooks(), sendBackupNotification(), sendNotifications(), sendWebhook(), WebhookRow (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (8): DashboardPage(), formatUptime(), ServiceCard(), timeAgo(), config, Status, StatusBadge(), ServiceWithLatestCheck

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (6): POST(), pollAllServices(), collectAllStats(), collectStats(), POST(), register()

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (6): formatDateTime(), formatDuration(), formatThousands(), formatUsers(), FrontendStats(), FrontendStatsData

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (5): geistMono, geistSans, metadata, Navbar(), navItems

## Knowledge Gaps
- **80 isolated node(s):** `$schema`, `plugin`, `eslintConfig`, `nextConfig`, `name` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 0` to `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 8`, `Community 9`, `Community 10`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **Why does `Service` connect `Community 4` to `Community 8`, `Community 9`, `Community 10`, `Community 0`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `register()` connect `Community 10` to `Community 0`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `getDb()` (e.g. with `GET()` and `DELETE()`) actually correct?**
  _`getDb()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `plugin`, `eslintConfig` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10967741935483871 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._