---
name: redis_streams
description: "Redis Streams telemetry ingest pipeline, consumer groups, state cache, flood-control counters"
risk: safe
source: internal
date_added: "2026-06-24"
replaces: kafka.md
---

# Redis Streams — Telemetry Ingest Pipeline

You are an expert in **Backend / Core Engine**. Use this skill when working on the telemetry ingestion pipeline, Redis Streams consumer, or any Redis-backed state in Thronix.

> ℹ️ **Kafka is not used in Thronix.** The ingestion queue is Redis Streams (`telemetry:raw`). The broker for Celery is also Redis. There is a single Redis instance for the pilot.

---

## 🧠 Architecture

```
FastAPI POST /api/v1/telemetry/ingest
    │  (publish raw sample)
    ▼
Redis Stream: "telemetry:raw"
    │  (consumer group: "ingestion-workers")
    ▼
Ingestion Worker (backend/src/thronix/ingestion/worker.py)
    │  reads with XREADGROUP, processes, ACKs after successful write
    ▼
core/ pipeline → TimescaleDB write → Redis state cache update
    │
    ▼  (if alert fired)
Redis Stream: "alerts:new"
    │
    ▼
FastAPI WebSocket /ws/v1/live subscribes via Redis Pub/Sub
```

---

## 🛠️ Instructions & Best Practices

### 1. Publishing to Stream (FastAPI Ingest Route)
```python
import redis.asyncio as aioredis

async def publish_telemetry(redis: aioredis.Redis, sample: dict) -> str:
    """Publish raw sample to Redis Stream. Returns stream entry ID."""
    entry_id = await redis.xadd(
        "telemetry:raw",
        {"data": json.dumps(sample), "well_id": sample["well_id"]},
        maxlen=100_000,  # Trim to prevent unbounded growth
        approximate=True,
    )
    return entry_id
```

### 2. Consumer Group Pattern (Ingestion Worker)
```python
# Create consumer group once on startup
await redis.xgroup_create("telemetry:raw", "ingestion-workers", id="$", mkstream=True)

# Read in a loop
async def worker_loop(redis: aioredis.Redis):
    while True:
        entries = await redis.xreadgroup(
            groupname="ingestion-workers",
            consumername="worker-1",
            streams={"telemetry:raw": ">"},
            count=10,       # Process up to 10 samples per batch
            block=1000,     # Block up to 1s if stream is empty
        )
        for stream, messages in entries:
            for entry_id, fields in messages:
                try:
                    await process_sample(fields)
                    await redis.xack("telemetry:raw", "ingestion-workers", entry_id)
                except Exception as e:
                    log.error("sample_processing_failed", entry_id=entry_id, error=str(e))
                    # Do NOT ack — entry stays in PEL for retry/DLQ
```

### 3. Well State Cache (Key Conventions)
```python
# Key schema — always use these prefixes
WELL_STATE_KEY    = "well:{well_id}:state"          # JSON: WellState + metadata
DEGRADATION_KEY   = "well:{well_id}:degradation"    # JSON: score + mode
ALERT_COUNT_KEY   = "alerts:active:{well_id}"       # INT: flood control count
HOLDOFF_KEY       = "trigger:{well_id}:{code}:holdoff"  # TTL key: exists = in holdoff

# Always set TTL — no eternal keys
await redis.setex(HOLDOFF_KEY.format(well_id=wid, code=code), 300, "1")  # 5 min holdoff
```

### 4. Flood Control (EEMUA 191)
```python
async def check_flood_control(redis: aioredis.Redis, well_id: str, tier: str) -> bool:
    """Returns True if alert is allowed (under budget)."""
    budgets = {"T1": None, "T2": 18, "T3": 35}  # T1 = unlimited
    limit = budgets.get(tier)
    if limit is None:
        return True
    key = f"alerts:active:{well_id}:{tier}"
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, 3600)  # Reset window hourly
    return count <= limit
```

### 5. Anti-Patterns to Avoid
- ❌ **No consumer group ACK**: Always ACK after successful DB write. Unacked messages re-deliver on worker restart.
- ❌ **`XREAD` without consumer group**: Loses messages on worker restart. Always use `XREADGROUP`.
- ❌ **No `maxlen` on `XADD`**: Streams grow unboundedly. Always trim with `maxlen` + `approximate=True`.
- ❌ **TTL-less cache keys**: Every key that can grow per-well must have a TTL.
- ❌ **Kafka patterns**: There is no Kafka. Do not use topic partitioning, offset commits, or Kafka clients.

## 📊 Metrics & Quality Gates
- **Ingestion lag**: P99 time from `XADD` to `XACK` must be < 500ms at pilot scale (75 samples/sec).
- **PEL size**: Pending entries list should stay < 100. Alarm if growing unboundedly.
- **Stream length**: Monitor `XLEN telemetry:raw`. Should stay well below `maxlen=100_000`.
