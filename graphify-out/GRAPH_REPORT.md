# Graph Report - .  (2026-05-05)

## Corpus Check
- 49 files · ~11,959 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 115 nodes · 141 edges · 22 communities (21 shown, 1 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 35 edges
2. `pollAllServices()` - 5 edges
3. `sendNotifications()` - 5 edges
4. `collectAllStats()` - 5 edges
5. `register()` - 4 edges
6. `detectIncident()` - 4 edges
7. `sendWebhook()` - 4 edges
8. `collectAllInfra()` - 4 edges
9. `getSSHConfig()` - 4 edges
10. `DELETE()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `insertMetric()` --calls--> `getDb()`  [INFERRED]
  src/lib/ssh-collector.ts → src/lib/db.ts
- `register()` --calls--> `collectAllInfra()`  [INFERRED]
  src/instrumentation.ts → src/lib/ssh-collector.ts
- `runRetention()` --calls--> `getDb()`  [INFERRED]
  src/lib/retention.ts → src/lib/db.ts
- `pollService()` --calls--> `getDb()`  [INFERRED]
  src/lib/poller.ts → src/lib/db.ts
- `detectIncident()` --calls--> `getDb()`  [INFERRED]
  src/lib/poller.ts → src/lib/db.ts

## Communities (22 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (13): DELETE(), GET(), PUT(), getDb(), getDbPath(), runRetention(), collectStats(), RegistryPage() (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (9): POST(), collectAllInfra(), collectHost(), insertMetric(), parseDf(), parseFree(), parseHumanSize(), getKeyPath() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (4): formatThousands(), FrontendStats(), RawJsonStats(), SofiaStats()

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (3): IncidentList(), StatusBadge(), Tabs()

### Community 4 - "Community 4"
Cohesion: 0.24
Nodes (7): POST(), detectIncident(), pollAllServices(), pollService(), collectAllStats(), POST(), register()

### Community 5 - "Community 5"
Cohesion: 0.31
Nodes (7): buildDiscordPayload(), buildGenericPayload(), buildNtfyPayload(), getActiveWebhooks(), sendNotifications(), sendWebhook(), POST()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 0` to `Community 1`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.335) - this node is a cross-community bridge._
- **Why does `pollAllServices()` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 18 inferred relationships involving `getDb()` (e.g. with `runRetention()` and `pollService()`) actually correct?**
  _`getDb()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `pollAllServices()` (e.g. with `register()` and `getDb()`) actually correct?**
  _`pollAllServices()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `sendNotifications()` (e.g. with `detectIncident()` and `POST()`) actually correct?**
  _`sendNotifications()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `collectAllStats()` (e.g. with `register()` and `getDb()`) actually correct?**
  _`collectAllStats()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `register()` (e.g. with `pollAllServices()` and `collectAllStats()`) actually correct?**
  _`register()` has 3 INFERRED edges - model-reasoned connections that need verification._