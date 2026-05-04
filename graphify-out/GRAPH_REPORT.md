# Graph Report - .  (2026-05-04)

## Corpus Check
- 47 files · ~9,504 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 108 nodes · 133 edges · 23 communities (21 shown, 2 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 9|Community 9]]

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
- `collectStats()` --calls--> `getDb()`  [INFERRED]
  src/lib/stats-collector.ts → src/lib/db.ts
- `insertMetric()` --calls--> `getDb()`  [INFERRED]
  src/lib/ssh-collector.ts → src/lib/db.ts
- `register()` --calls--> `pollAllServices()`  [INFERRED]
  src/instrumentation.ts → src/lib/poller.ts
- `runRetention()` --calls--> `getDb()`  [INFERRED]
  src/lib/retention.ts → src/lib/db.ts
- `pollService()` --calls--> `getDb()`  [INFERRED]
  src/lib/poller.ts → src/lib/db.ts

## Communities (23 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (12): DELETE(), GET(), PUT(), getDb(), getDbPath(), runRetention(), RegistryPage(), GET() (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (3): IncidentList(), StatusBadge(), Tabs()

### Community 2 - "Community 2"
Cohesion: 0.23
Nodes (7): collectHost(), insertMetric(), parseDf(), parseFree(), parseHumanSize(), getKeyPath(), getSSHConfig()

### Community 3 - "Community 3"
Cohesion: 0.31
Nodes (7): buildDiscordPayload(), buildGenericPayload(), buildNtfyPayload(), getActiveWebhooks(), sendNotifications(), sendWebhook(), POST()

### Community 4 - "Community 4"
Cohesion: 0.24
Nodes (6): POST(), POST(), collectAllInfra(), collectAllStats(), collectStats(), register()

### Community 7 - "Community 7"
Cohesion: 0.47
Nodes (4): detectIncident(), pollAllServices(), pollService(), POST()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.380) - this node is a cross-community bridge._
- **Why does `pollAllServices()` connect `Community 7` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
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