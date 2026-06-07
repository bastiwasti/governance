# Graph Report - governance  (2026-06-07)

## Corpus Check
- 50 files · ~14,354 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 137 nodes · 183 edges · 25 communities (24 shown, 1 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4feb4e23`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 10|Community 10]]

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 39 edges
2. `listBackupFiles()` - 8 edges
3. `runBackupCheck()` - 8 edges
4. `getRecentChecks()` - 6 edges
5. `sendNotifications()` - 5 edges
6. `pollAllServices()` - 5 edges
7. `collectAllStats()` - 5 edges
8. `getSSHConfig()` - 5 edges
9. `register()` - 4 edges
10. `collectAllInfra()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `insertMetric()` --calls--> `getDb()`  [INFERRED]
  src/lib/ssh-collector.ts → src/lib/db.ts
- `getLatestCheck()` --calls--> `getDb()`  [INFERRED]
  src/lib/backup-checker.ts → src/lib/db.ts
- `collectStats()` --calls--> `getDb()`  [INFERRED]
  src/lib/stats-collector.ts → src/lib/db.ts
- `register()` --calls--> `pollAllServices()`  [INFERRED]
  src/instrumentation.ts → src/lib/poller.ts
- `collectHost()` --calls--> `getSSHConfig()`  [INFERRED]
  src/lib/ssh-collector.ts → src/lib/ssh-config.ts

## Communities (25 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (12): DELETE(), GET(), PUT(), getDb(), getDbPath(), runRetention(), RegistryPage(), GET() (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.21
Nodes (11): BackupsPage(), GET(), POST(), BackupBrowser(), getLatestCheck(), getRecentChecks(), getTodayStr(), listBackupFiles() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (4): formatThousands(), FrontendStats(), RawJsonStats(), SofiaStats()

### Community 3 - "Community 3"
Cohesion: 0.23
Nodes (7): collectHost(), insertMetric(), parseDf(), parseFree(), parseHumanSize(), getKeyPath(), getSSHConfig()

### Community 4 - "Community 4"
Cohesion: 0.26
Nodes (8): buildDiscordPayload(), buildGenericPayload(), buildNtfyPayload(), getActiveWebhooks(), sendBackupNotification(), sendNotifications(), sendWebhook(), POST()

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (3): IncidentList(), StatusBadge(), Tabs()

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (6): POST(), POST(), collectAllInfra(), collectAllStats(), collectStats(), register()

### Community 8 - "Community 8"
Cohesion: 0.47
Nodes (4): detectIncident(), pollAllServices(), pollService(), POST()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 0` to `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.376) - this node is a cross-community bridge._
- **Why does `getRecentChecks()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 21 inferred relationships involving `getDb()` (e.g. with `insertMetric()` and `getActiveWebhooks()`) actually correct?**
  _`getDb()` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `listBackupFiles()` (e.g. with `GET()` and `BackupsPage()`) actually correct?**
  _`listBackupFiles()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `runBackupCheck()` (e.g. with `getDb()` and `sendBackupNotification()`) actually correct?**
  _`runBackupCheck()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `getRecentChecks()` (e.g. with `getDb()` and `GET()`) actually correct?**
  _`getRecentChecks()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `sendNotifications()` (e.g. with `detectIncident()` and `POST()`) actually correct?**
  _`sendNotifications()` has 2 INFERRED edges - model-reasoned connections that need verification._