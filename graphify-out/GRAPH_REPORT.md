# Graph Report - .  (2026-05-04)

## Corpus Check
- 48 files · ~11,044 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 108 nodes · 133 edges · 23 communities (21 shown, 2 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Data Layer & Registry|Data Layer & Registry]]
- [[_COMMUNITY_SSH Infrastructure Collection|SSH Infrastructure Collection]]
- [[_COMMUNITY_Service Detail & Status UI|Service Detail & Status UI]]
- [[_COMMUNITY_Webhook Notifications|Webhook Notifications]]
- [[_COMMUNITY_Cron Scheduling & Collection|Cron Scheduling & Collection]]
- [[_COMMUNITY_Service Stats Display|Service Stats Display]]
- [[_COMMUNITY_Health Check Polling|Health Check Polling]]
- [[_COMMUNITY_Registry Client|Registry Client]]

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 35 edges
2. `sendNotifications()` - 5 edges
3. `pollAllServices()` - 5 edges
4. `collectAllStats()` - 5 edges
5. `register()` - 4 edges
6. `collectAllInfra()` - 4 edges
7. `sendWebhook()` - 4 edges
8. `detectIncident()` - 4 edges
9. `getSSHConfig()` - 4 edges
10. `DELETE()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `insertMetric()` --calls--> `getDb()`  [INFERRED]
  src/lib/ssh-collector.ts → src/lib/db.ts
- `collectStats()` --calls--> `getDb()`  [INFERRED]
  src/lib/stats-collector.ts → src/lib/db.ts
- `register()` --calls--> `pollAllServices()`  [INFERRED]
  src/instrumentation.ts → src/lib/poller.ts
- `getActiveWebhooks()` --calls--> `getDb()`  [INFERRED]
  src/lib/notifier.ts → src/lib/db.ts
- `detectIncident()` --calls--> `sendNotifications()`  [INFERRED]
  src/lib/poller.ts → src/lib/notifier.ts

## Communities (23 total, 2 thin omitted)

### Community 0 - "Data Layer & Registry"
Cohesion: 0.16
Nodes (12): DELETE(), GET(), PUT(), getDb(), getDbPath(), runRetention(), RegistryPage(), GET() (+4 more)

### Community 1 - "SSH Infrastructure Collection"
Cohesion: 0.23
Nodes (7): collectHost(), insertMetric(), parseDf(), parseFree(), parseHumanSize(), getKeyPath(), getSSHConfig()

### Community 2 - "Service Detail & Status UI"
Cohesion: 0.17
Nodes (3): IncidentList(), StatusBadge(), Tabs()

### Community 3 - "Webhook Notifications"
Cohesion: 0.31
Nodes (7): buildDiscordPayload(), buildGenericPayload(), buildNtfyPayload(), getActiveWebhooks(), sendNotifications(), sendWebhook(), POST()

### Community 4 - "Cron Scheduling & Collection"
Cohesion: 0.24
Nodes (6): POST(), POST(), collectAllInfra(), collectAllStats(), collectStats(), register()

### Community 6 - "Health Check Polling"
Cohesion: 0.47
Nodes (4): detectIncident(), pollAllServices(), pollService(), POST()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Data Layer & Registry` to `SSH Infrastructure Collection`, `Service Detail & Status UI`, `Webhook Notifications`, `Cron Scheduling & Collection`, `Health Check Polling`?**
  _High betweenness centrality (0.380) - this node is a cross-community bridge._
- **Why does `pollAllServices()` connect `Health Check Polling` to `Data Layer & Registry`, `Cron Scheduling & Collection`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 18 inferred relationships involving `getDb()` (e.g. with `insertMetric()` and `getActiveWebhooks()`) actually correct?**
  _`getDb()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `sendNotifications()` (e.g. with `detectIncident()` and `POST()`) actually correct?**
  _`sendNotifications()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `pollAllServices()` (e.g. with `register()` and `getDb()`) actually correct?**
  _`pollAllServices()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `collectAllStats()` (e.g. with `register()` and `getDb()`) actually correct?**
  _`collectAllStats()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `register()` (e.g. with `pollAllServices()` and `collectAllStats()`) actually correct?**
  _`register()` has 3 INFERRED edges - model-reasoned connections that need verification._