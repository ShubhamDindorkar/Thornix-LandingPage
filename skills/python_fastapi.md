---
name: python_fastapi
description: "Python 3.12, FastAPI, Pydantic v2, async patterns, pyproject.toml, uv/pip"
risk: safe
source: internal
date_added: "2026-06-24"
---

# Python + FastAPI Backend

You are an expert in **Backend / Core Engine**. Use this skill to implement, review, and debug all Python-based backend components in Thronix: FastAPI routes, Pydantic models, async patterns, and project tooling.

## 🎯 When to Use
- Building or refactoring components in `backend/src/thronix/` (api/, ingestion/, storage/, tasks/, security/, observability/).
- Reviewing PRs related to the FastAPI application or any Python module.
- Troubleshooting architecture, dependency, or async issues in the Python backend.

---

## 🧠 Context & Architecture

The Thronix backend is a **pure Python monorepo package** (`src/thronix/`) with the following key design constraints:

| Rule | Reason |
|------|--------|
| `core/` has **zero** infrastructure imports | Edge deployment + unit-test isolation |
| All models are **Pydantic v2** | Validation-first, type-safe by default |
| **async/await** everywhere in API & DB | FastAPI + SQLAlchemy 2.0 async engine |
| Secrets from **environment only** | Never hardcode, never log |
| **structlog** for all logging | JSON output with `well_id`, `trigger_code` context |

---

## 🛠️ Instructions & Best Practices

### 1. Project Structure Rules
- Source is at `backend/src/thronix/`. The root package is `thronix`.
- `domain/` = Pydantic models only. Zero infrastructure imports (no SQLAlchemy, no Redis).
- `core/` = Pure Python logic. Zero infrastructure imports.
- `storage/` = SQLAlchemy models + repositories + Redis cache abstractions.
- `api/` = FastAPI routes and Pydantic API schemas (separate from `domain/` models).

### 2. Pydantic v2 Patterns
```python
from __future__ import annotations
from pydantic import BaseModel, Field, model_validator

class TelemetrySample(BaseModel):
    well_id: str
    pressure_psi: float = Field(..., ge=0, le=20_000)
    h2s_ppm: float = Field(..., ge=0)

    @model_validator(mode="after")
    def validate_h2s_limits(self) -> "TelemetrySample":
        if self.h2s_ppm > 1000:
            raise ValueError("H2S exceeds IDLH — check sensor calibration")
        return self
```

### 3. FastAPI Route Patterns
```python
from fastapi import APIRouter, Depends, HTTPException, status
from thronix.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])

@router.get("/", response_model=list[AlertResponse])
async def list_alerts(
    well_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
) -> list[AlertResponse]:
    repo = AlertRepository(db)
    alerts = await repo.list(well_id=well_id)
    return [AlertResponse.model_validate(a) for a in alerts]
```

### 4. SQLAlchemy 2.0 Async Patterns
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

async def get_well(db: AsyncSession, well_id: str):
    result = await db.execute(select(WellReference).where(WellReference.well_id == well_id))
    return result.scalar_one_or_none()
```

### 5. structlog Pattern
```python
import structlog

log = structlog.get_logger()

# Always bind well_id and trigger_code for filtering
bound_log = log.bind(well_id=sample.well_id, trigger_code="T1-B")
bound_log.info("trigger_fired", h2s_ppm=sample.h2s_ppm, threshold=20.0)
# NEVER log raw sample dicts — too verbose for 4,000-well scale
```

### 6. Anti-Patterns to Avoid
- ❌ **`import *`**: Always use explicit imports.
- ❌ **`Any` in Pydantic models**: Use `Optional[T]` or `T | None` instead.
- ❌ **Blocking I/O in async functions**: Never call `requests`, `time.sleep()`, or synchronous DB calls inside `async def`.
- ❌ **`core/` importing from `storage/`**: This violates the edge-deployment constraint.
- ❌ **`print()` for logging**: Always use structlog.
- ❌ **Secrets in source code or logs**: Read from env vars via `thronix.config`.

## 📊 Metrics & Quality Gates
- **Type checking**: `mypy src/` must pass with zero errors.
- **Linting**: `ruff check src/` must pass.
- **Code coverage**: ≥ 80% for new logic; 100% branch coverage for `core/` safety triggers.
- **Performance**: Ingestion worker must sustain ≥ 75 samples/sec on pilot hardware.

## 🚨 Limitations
- The `core/` package must remain infrastructure-free. If you find yourself importing SQLAlchemy, Redis, or httpx in `core/`, STOP and restructure.
- Do not add new top-level dependencies without updating `pyproject.toml`.
