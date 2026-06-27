---
name: redis
description: "degradation_score caching, alert state, flood-control counters, Redis Streams ingestion queue"
risk: safe
source: internal
date_added: "2026-06-24"
---

# Redis Caching & State Management

You are an expert in **Backend / Core Engine**. Use this skill to implement, review, and debug all Redis usage in Thronix: state cache, flood control, holdoff timers, and stream publishing.

> ℹ️ **See also `redis_streams.md`** for the full Redis Streams ingestion pipeline pattern.

---

## 🧠 Redis Roles in Thronix

| Role | Key Pattern | TTL |
|------|-------------|-----|
| Well state cache | `well:{id}:state` | 24h (refresh on each sample) |
| Degradation score | `well:{id}:degradation` | 24h |
| Active alert count | `alerts:active:{id}:{tier}` | 1h rolling window |
| Trigger holdoff | `trigger:{id}:{code}:holdoff` | Duration of holdoff (e.g. 300s) |
| Sensor history | `sensor:{id}:{channel}:history` | 1h |
| Celery broker | Built-in via `CELERY_BROKER_URL=redis://...` | Managed by Celery |
| Ingestion stream | `telemetry:raw` (Redis Stream) | `maxlen=100_000` |
| Alert event stream | `alerts:new` (Redis Pub/Sub) | N/A |

---

## 🛠️ Instructions & Best Practices

### 1. Connection Pattern (async)
```python
import redis.asyncio as aioredis
from thronix.config import settings

# Created once in FastAPI lifespan, shared via dependency injection
redis_pool = aioredis.ConnectionPool.from_url(
    settings.REDIS_URL,
    max_connections=20,
    decode_responses=True,
)

async def get_redis() -> aioredis.Redis:
    return aioredis.Redis(connection_pool=redis_pool)
```

### 2. Well State Cache
```python
import json

async def set_well_state(redis: aioredis.Redis, well_id: str, state: dict) -> None:
    key = f"well:{well_id}:state"
    await redis.setex(key, 86400, json.dumps(state))  # 24h TTL

async def get_well_state(redis: aioredis.Redis, well_id: str) -> dict | None:
    raw = await redis.get(f"well:{well_id}:state")
    return json.loads(raw) if raw else None
```

### 3. Trigger Holdoff (Chatter Guard)
```python
async def is_in_holdoff(redis: aioredis.Redis, well_id: str, code: str) -> bool:
    """Returns True if trigger is in holdoff (chatter guard active)."""
    return await redis.exists(f"trigger:{well_id}:{code}:holdoff") > 0

async def set_holdoff(redis: aioredis.Redis, well_id: str, code: str, seconds: int) -> None:
    """Arms holdoff timer. Trigger cannot fire again until TTL expires."""
    await redis.setex(f"trigger:{well_id}:{code}:holdoff", seconds, "1")
```

### 4. Flood Control (EEMUA 191)
```python
async def alert_allowed(redis: aioredis.Redis, well_id: str, tier: str) -> bool:
    """EEMUA 191: T2 ≤ 18, T3 ≤ 35 concurrent per console. T1 = unlimited."""
    budgets = {"T2": 18, "T3": 35}
    limit = budgets.get(tier)
    if limit is None:
        return True  # T1 — never flood-controlled
    key = f"alerts:active:{well_id}:{tier}"
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, 3600)
    return count <= limit
```

### 5. Publishing Alert Events (WebSocket Push)
```python
async def publish_alert(redis: aioredis.Redis, alert: dict) -> None:
    """Publish alert to Pub/Sub channel for live WebSocket clients."""
    await redis.publish("alerts:new", json.dumps(alert))
```

### 6. Anti-Patterns to Avoid
- ❌ **No TTL on state keys**: Every key set per well must have a TTL. Memory is bounded.
- ❌ **Using Redis as a primary store**: Redis is volatile. TimescaleDB is the durable record.
- ❌ **Storing large blobs**: Redis values should be compact JSON. Full telemetry history goes to TimescaleDB.
- ❌ **Sync `redis-py` in async context**: Always use `redis.asyncio` for FastAPI and worker code.

## 📊 Metrics & Quality Gates
- **Memory**: Monitor `used_memory_human`. Alert if > 2GB on pilot instance.
- **Hit rate**: `keyspace_hits / (keyspace_hits + keyspace_misses)` should be > 90% for state cache.
- **Connected clients**: Should not exceed `max_connections` pool size.
