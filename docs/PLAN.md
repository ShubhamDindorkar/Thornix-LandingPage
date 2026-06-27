# PLAN.md — Thronix: Single Source of Truth

> **Last Updated:** 2026-06-24
> **Authority:** This file is the canonical reference for the Thronix project. Every architectural decision documented here is locked. Every rule listed here is non-negotiable. Any developer or AI agent working on this codebase must read this file before writing a single line of code.
>
> **Source Documents:**
> - [Backend PRD Phase 1](docs/Backend_PRD_Phase1_postNDA.pdf)
> - [Field Operations Framework](docs/Field_Operations_Framework.pdf)
> - [Frontend PRD](docs/Frontend_PRD.pdf)
> - [Plan (original specification)](Plan)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Decisions](#2-architecture-decisions)
3. [Tech Stack](#3-tech-stack)
4. [Repository Structure](#4-repository-structure)
5. [Confirmed Answers to Open Questions](#5-confirmed-answers-to-open-questions)
6. [Non-Negotiable Design Rules](#6-non-negotiable-design-rules)
7. [What Is Explicitly Out of Scope](#7-what-is-explicitly-out-of-scope)
8. [Data Available](#8-data-available)
9. [Build Order](#9-build-order)

---

## 1. Project Overview

### What Thronix Is

Thronix is a **real-time industrial asset monitoring platform** for oil and gas wells. It ingests high-frequency telemetry from wellhead sensors, runs a multi-tier anomaly detection engine against safety and production thresholds, and broadcasts actionable alerts to field operators within seconds.

The system is designed to prevent catastrophic failures — H₂S gas leaks, well kicks, blowouts, ESP failures — while simultaneously detecting slower production anomalies like GOR drift, water cut exceedance, and reservoir depletion.

### Who It Is For

- **Field Operators** — receive real-time alerts, acknowledge incidents, monitor well health dashboards.
- **Petroleum Engineers** — configure well commissioning data, review trigger thresholds, analyze production trends.
- **Site Supervisors** — receive escalated alerts, review shift reports, monitor multi-well KPIs.

### Scale

| Metric | Pilot (Phase 1) | Full Scale |
|--------|-----------------|------------|
| Wells monitored | 10–15 | ~4,000 |
| Sample cadence | 3 seconds per well | 3 seconds per well |
| Channels per sample | 39 | 39 |
| Ingest rate | ~75 samples/sec | ~1,333 samples/sec |
| Rows/day in TimescaleDB | ~432K | ~38.4M |
| Labeled dataset size | ~780 MB (gzip) across 5 datasets | — |

The architecture is designed for pilot scale but every decision includes documented extension points for the full 4,000-well target.

---

## 2. Architecture Decisions

Each decision below is locked. These are not open for reconsideration during Phase 1 implementation.

### AD-1: Pure Python `core/` Package — Zero Infrastructure Imports

**Decided:** The `core/` package (Layer-0 validation, well-state machine, all 12 triggers, alert lifecycle, degradation scoring, baselines, sensor health) must contain zero imports from `storage/`, `api/`, `tasks/`, `ai/`, or any database/cache library.

**Why:** The Field Operations Framework §8 and §12 require SAFE CORE to operate on edge hardware surviving communications loss. By keeping `core/` infrastructure-free:
1. It can be packaged as a standalone Python wheel for edge deployment.
2. Unit tests require zero mocking — they test the exact production code path.
3. The replay harness exercises identical logic to the live ingestion worker.

**Enforcement:** A CI lint rule will verify that `core/` never imports from infrastructure packages.

### AD-2: Three-Tier Trigger Architecture (T1 / T2 / T3)

**Decided:** Triggers are separated into three tiers with distinct evaluation cadences:
- **T1** (life-safety): evaluated per-sample at the 3-second rate. Runs in the ingestion worker.
- **T2** (process limits): evaluated every 4 hours over accumulated flowing-only data. Runs as a Celery task.
- **T3** (reservoir/long-term): evaluated every 24 hours over 30-day windows. Runs as a Celery task.

**Why:** Framework §6 defines these tiers explicitly. T1 triggers must fire within seconds of an anomaly. T2/T3 require statistical accumulation over longer windows and cannot be evaluated per-sample. Separating them prevents slow T2/T3 computations from blocking the T1 hot path.

### AD-3: Redis Streams for Ingestion Queue (Not Kafka)

**Decided:** Telemetry ingestion uses Redis Streams (`telemetry:raw`) with consumer groups, not Apache Kafka.

**Why:** At pilot scale (75 samples/sec), Kafka is operational overhead without benefit. Redis is already required for state caching, Celery brokering, and Pub/Sub. Using Redis Streams for ingestion means zero additional infrastructure. The ingestion worker uses `XREADGROUP` with `XACK` after successful processing — messages are only removed from the pending list after the full pipeline completes (Layer-0 → triggers → DB write). If the worker crashes, unacknowledged messages are re-delivered.

**Extension point:** At full scale, Kafka can replace Redis Streams by swapping only `ingestion/worker.py`. The `core/` package is unaffected.

### AD-4: Separate Ingestion Worker Process

**Decided:** The ingestion worker (`ingestion/worker.py`) runs as a standalone process, separate from the FastAPI API server.

**Why:** The API server handles HTTP requests and WebSocket connections. The ingestion worker performs CPU-intensive per-sample processing (Hampel filter, trigger evaluation). Coupling them means a slow trigger evaluation blocks API responses. Separating them allows independent scaling — at full scale, multiple workers consume from the same Redis Stream consumer group.

### AD-5: TimescaleDB Hypertable for Telemetry

**Decided:** Raw telemetry is stored in a TimescaleDB hypertable partitioned by `timestamp` with 7-day chunk intervals. Compression policy at 7 days. Retention policy at 90 days. A continuous aggregate (`telemetry_1min`) provides 1-minute averages for dashboard queries.

**Why:** Time-series data at 3-second cadence grows rapidly (432K rows/day at pilot). TimescaleDB's hypertables handle time-partitioned writes and range queries natively. Compression reduces storage 10–20×. The continuous aggregate prevents the frontend from querying millions of raw rows for trend charts.

### AD-6: Alert Lifecycle as Append-Only State Machine

**Decided:** Every alert state transition (OPEN → ACKNOWLEDGED → CLEARED) is recorded in the `alert_lifecycle` table as an append-only audit trail. The `alerts` table holds the current state; `alert_lifecycle` holds the full history.

**Why:** Framework §11 requires full context capture at fire time and a tamper-evident audit trail. Operators must be able to reconstruct exactly what happened, when, and who acknowledged it. The alert model captures 13 context fields at fire time including well state, degradation score, sensor health, wind direction (for gas alerts), and driving channel values.

### AD-7: Domain Models Separate from API Schemas

**Decided:** `domain/` contains internal Pydantic models (the full truth). `api/schemas/` contains separate Pydantic models for REST API request/response bodies.

**Why:** Internal models like `Alert` contain 28 fields including internal state, lifecycle tracking, and raw evidence. The API should expose a curated subset. Sharing the same model risks leaking internal fields to external clients and couples the internal structure to the API contract.

### AD-8: Structured Logging with structlog

**Decided:** All logging uses `structlog` with JSON output in production and pretty-print in development. Every log line automatically includes `well_id`, `trigger_code`, and `environment` as bound context.

**Why:** Safety-critical systems require machine-parseable logs for post-incident analysis. Free-form string logs are not queryable. Binding `well_id` to every log line means operators can filter the entire history of a single well's processing without regex.

### AD-9: Monorepo with Language Boundary

**Decided:** The repository is a monorepo. The backend is Python. The frontend is TypeScript/Next.js. The `shared/` folder contains TypeScript types for the frontend only. The Python backend maintains its own equivalent domain models in `backend/src/thronix/domain/`. The two are kept in sync manually against the PRD and Framework specifications.

**Why:** The backend was rebuilt from TypeScript to Python. Sharing types across languages adds tooling complexity (code generation, sync pipelines) that is not justified at pilot scale. Both derive from the same source documents. If they drift, the replay harness catches it — a mismatch between the Python domain model and the CSV dataset schema causes an immediate parse failure.

### AD-10: Audit Log with Hash Chain

**Decided:** The `audit_log` table includes `previous_hash` and `entry_hash` columns. Each entry's hash is `SHA-256(previous_hash + content)`. This creates a tamper-evident chain.

**Why:** Framework §11 and the PRD require an immutable audit trail. A hash chain means any post-hoc modification to a row breaks the chain from that point forward, making tampering detectable.

---

## 3. Tech Stack

Every tool in the stack, its role in this project, and why it was chosen.

### Runtime

| Tool | Version | Role | Why This Tool |
|------|---------|------|---------------|
| **Python** | ≥3.11 | Primary backend language | Required by client spec. Replaces the original TypeScript backend. Python's data science ecosystem (for T2/T3 statistical triggers) and FastAPI's async performance made it the clear choice. |
| **FastAPI** | ≥0.115 | REST API + WebSocket server | Native async, automatic OpenAPI docs, Pydantic integration for request validation. WebSocket support for real-time alert push. |
| **Uvicorn** | ≥0.32 | ASGI server | Production-grade ASGI server for FastAPI. Standard pairing. |
| **Pydantic** | ≥2.0 | Data validation | Validates all 39-channel telemetry samples at ingestion. Validates API requests. Defines the domain model. V2 for performance. |
| **pydantic-settings** | ≥2.0 | Configuration | Loads all settings from environment variables with type validation. Prevents scattered `os.getenv()` calls. |
| **SQLAlchemy** | ≥2.0 (async) | ORM / Database access | Async ORM for TimescaleDB. SQLAlchemy 2.0's `asyncio` support with `asyncpg` driver gives native async DB access without blocking the event loop. |
| **asyncpg** | ≥0.30 | PostgreSQL async driver | Fastest async PostgreSQL driver for Python. Required by SQLAlchemy async mode. |
| **TimescaleDB** | latest (PG16) | Primary database | PostgreSQL extension purpose-built for time-series. Hypertables, continuous aggregates, compression, and retention policies handle the telemetry workload natively. Chosen over InfluxDB because the alert lifecycle, audit log, and user tables benefit from relational semantics. |
| **Redis** | 7 (Alpine) | Cache + queue + broker | Triple duty: (1) State cache for well state, degradation scores, baselines, holdoffs. (2) Streams for telemetry ingestion queue. (3) Celery broker and result backend. One service, three roles — minimal infrastructure for pilot. |
| **Celery** | ≥5.4 | Background task scheduler | Runs T2 (4h), T3 (24h), baseline update (1h), KPI (15min), report generation, and staleness checks. Celery Beat provides reliable cron-like scheduling. Redis is the broker — no additional infrastructure. |
| **Alembic** | ≥1.14 | Database migrations | Standard migration tool for SQLAlchemy. Generates and applies schema changes to TimescaleDB. |

### Security

| Tool | Role |
|------|------|
| **python-jose** | JWT token creation and validation (HS256). |
| **passlib + bcrypt** | Password hashing. |

### Observability

| Tool | Role |
|------|------|
| **structlog** | JSON structured logging with bound context (well_id, trigger_code). |
| **prometheus-client** | Metrics: `telemetry_samples_processed_total`, `alerts_fired_total`, `ingestion_latency_seconds`. Exposed at `/metrics`. |
| **Prometheus** | Scrapes metrics from FastAPI, Celery, and infrastructure exporters. |
| **Grafana** | Dashboards for ingestion throughput, alert activity, and system health. |

### Testing

| Tool | Role |
|------|------|
| **pytest** | Test framework. Markers: `replay`, `integration`, `adversarial`, `load`. |
| **pytest-asyncio** | Async test support (auto mode). |
| **testcontainers** | Spins up real TimescaleDB and Redis containers for integration tests. No mocking of infrastructure. |
| **httpx** | Async HTTP client for testing FastAPI endpoints. |
| **locust** | Load testing. Simulates pilot-scale ingestion (75 samples/sec). |
| **factory-boy** | Test data factories for `TelemetrySample`, `WellReferenceData`. |

### Code Quality

| Tool | Role |
|------|------|
| **ruff** | Linter + formatter. Line length 100. Rules: pycodestyle, pyflakes, isort, pep8-naming, pyupgrade, bugbear, simplify. |
| **mypy** | Static type checker. Strict mode with Pydantic plugin. |
| **pre-commit** | Git hooks for lint/format on commit. |

### Frontend (unchanged from prior implementation)

| Tool | Role |
|------|------|
| **Next.js 14** | React framework with App Router. |
| **TypeScript** | Frontend language. |
| **Turborepo** | Frontend build orchestration only. Does NOT manage the Python backend. |

### Dependencies Explicitly NOT Used

| Tool | Why Not |
|------|---------|
| **Kafka** | Overkill for pilot scale. Redis Streams provides equivalent guarantees for 75 samples/sec. |
| **pandas** | Not used in `core/`. The replay harness loader uses `csv.DictReader` over `gzip.open` for memory efficiency. Pandas loads entire files into RAM. |
| **numpy** | Used only in `core/layer0/hampel.py` for median/MAD calculation. Not used elsewhere in `core/`. |
| **Django** | Too opinionated for this use case. FastAPI's async-first design is a better fit for WebSocket + high-throughput ingestion. |
| **MongoDB** | Time-series data with relational alert lifecycle requires a relational database. TimescaleDB provides both. |

---

## 4. Repository Structure

The full file-by-file breakdown is in [REPO.md](REPO.md). This section summarizes the module responsibilities and their relationships.

```
thronix/
├── backend/                          ← Python backend (the focus of this plan)
│   ├── src/thronix/
│   │   ├── domain/                   ← Pydantic models, enums, constants (pure Python)
│   │   ├── core/                     ← SAFE CORE engine (pure Python, zero infra imports)
│   │   │   ├── layer0/               ← Signal validation (Hampel, range, slew, frozen, proxy)
│   │   │   ├── well_state/           ← State machine, trust, suppression
│   │   │   ├── triggers/t1/          ← Life-safety triggers (per-sample)
│   │   │   ├── triggers/t2/          ← Process triggers (4h cycle)
│   │   │   ├── triggers/t3/          ← Reservoir triggers (24h cycle)
│   │   │   ├── alerts/               ← Lifecycle, flood control, gas response, grouping
│   │   │   ├── degradation/          ← 0–100 score, modes, simplification
│   │   │   ├── baselines/            ← Anchored, rolling, intermediate, reanchor
│   │   │   ├── sensor_health/        ← Classification, H₂S honesty check
│   │   │   └── profiles/             ← Regional threshold overrides
│   │   ├── ingestion/                ← Redis Stream consumer → core → DB write
│   │   ├── storage/                  ← SQLAlchemy models, repositories, Redis cache
│   │   ├── api/                      ← FastAPI routes, WebSocket, schemas
│   │   ├── tasks/                    ← Celery periodic tasks (T2, T3, baselines, reports)
│   │   ├── security/                 ← JWT auth, RBAC, audit, password hashing
│   │   ├── ai/                       ← Phase 1C stubs (triage, diagnosis, predictions)
│   │   ├── reporting/                ← Report generators and delivery
│   │   └── observability/            ← structlog config, Prometheus metrics
│   ├── tests/
│   │   ├── unit/                     ← Pure logic tests (no infra, no mocking)
│   │   ├── integration/              ← Real DB + Redis via testcontainers
│   │   ├── replay/                   ← THE validation gate (dataset-driven)
│   │   ├── adversarial/              ← Prohibited behavior tests (Framework §14)
│   │   └── load/                     ← Locust load tests
│   ├── alembic/                      ← Database migrations
│   ├── monitoring/                   ← Prometheus config, Grafana dashboards
│   └── scripts/                      ← Seeding, utilities
├── shared/                           ← TypeScript types (frontend only)
├── skills/                           ← AI agent instruction files
├── data/                             ← Labeled datasets + reference JSON (gitignored)
├── docs/                             ← PRD PDFs, Framework PDF, pitch deck
├── REPO.md                           ← Exhaustive file-by-file guide
├── PLAN.md                           ← This file
└── SKILL.md                          ← AI agent routing instructions
```

### Module Dependency Direction

```
domain/ ← core/ ← ingestion/ → storage/
                             → api/ → storage/
                             → tasks/ → core/ + storage/
```

`domain/` depends on nothing. `core/` depends only on `domain/`. Everything else depends on `core/` and `domain/`, but `core/` never depends on anything outside `domain/`. This is the architectural firewall.

---

## 5. Confirmed Answers to Open Questions

Five questions were raised during the architecture planning phase. All five have been answered and locked.

### Q1: Authentication Provider

**Question:** What authentication mechanism for Phase 1? JWT with FastAPI, or an external provider (Auth0, Firebase Auth)?

**Answer: JWT with FastAPI.** Simplest for pilot, no external dependency. `python-jose` for token signing (HS256), `passlib[bcrypt]` for password hashing. FastAPI's OAuth2 password flow. Roles: `ADMIN`, `OPERATOR`, `VIEWER`.

**Implemented in:** `security/auth.py`, `security/hashing.py`, `security/rbac.py`.

### Q2: Redis Deployment

**Question:** Single Redis instance or separate instances for cache, Streams, and Celery?

**Answer: Single Redis instance for pilot.** Three logical databases within one Redis instance: DB 0 for state cache + Streams, DB 1 for Celery broker, DB 2 for Celery result backend. At pilot scale (15 wells), memory usage is negligible. Extension point: at full scale, separate Redis instances with dedicated memory allocation.

**Implemented in:** `config.py` — `redis_url = "redis://localhost:6379/0"`, `celery_broker_url = "redis://localhost:6379/1"`, `celery_result_backend = "redis://localhost:6379/2"`.

### Q3: Pilot Scale Target

**Answer: 10–15 wells.** Confirmed. At 15 wells × 3-second cadence × 39 channels, the ingest rate is ~75 samples/sec and ~432K rows/day. Well within a single TimescaleDB instance and a single ingestion worker. The `max_wells` configuration parameter in `config.py` is set to 15. The architecture is designed with extension points (consumer groups, horizontal worker scaling) for the 4,000-well target but none of that infrastructure is built in Phase 1.

### Q4: Edge Deployment

**Answer: Code separation only, same Docker Compose for pilot.** The `core/` package is a pure Python package with zero infrastructure imports. It *could* be deployed standalone on edge hardware. For the pilot, it runs within the Docker Compose stack alongside everything else. The architectural firewall (no infra imports in `core/`) is the extension point — packaging `core/` as a wheel for edge deployment is a Phase 2 task.

### Q5: AI Layer Implementation

**Answer: Stub the interface now.** The `ai/` package defines `AIAgentInterface` (abstract class with `triage()` and `diagnose()` methods) and stub implementations. The interface is pluggable — when the LLM provider is chosen (Gemini, OpenAI, or local), only the concrete implementation changes. The stubs are scaffolded in `ai/agent/interface.py`, `ai/agent/triage.py`, `ai/agent/diagnosis.py`. No active AI logic is built in Phase 1A or 1B.

---

## 6. Non-Negotiable Design Rules

These rules cannot be broken regardless of timeline pressure, feature requests, or developer convenience. Each is derived from a specific section of the Field Operations Framework or the Backend PRD.

### Rule 1: H₂S Alerts Are Never Suppressed

**Source:** Framework §6.2, §14.5

H₂S alerts (`T1-B_H2S_HIGH`, `T1-B_H2S_HIGH_HIGH`, `T1-B_H2S_RAPID`, `T1-B_H2S_IDLH`, `T1-B_H2S_CHANGE`) must fire regardless of well state. No well state — SHUT_IN, STARTUP, TEST, EMERGENCY_SHUTDOWN — may suppress or delay an H₂S alert. No operating mode — VERIFIED, DEGRADED, SURVIVAL — may suppress or delay an H₂S alert.

**Verification:** `tests/adversarial/test_spoofed_state.py` — confirms H₂S fires even when `well_state` is spoofed to `SHUT_IN`.

### Rule 2: H₂S Thresholds Are Never Lowered

**Source:** Framework §6.2

The four H₂S threshold levels are absolute:
- HIGH: 20 ppm
- HIGH-HIGH: 50 ppm
- RAPID ESCALATION: 65 ppm
- IDLH: 100 ppm

No per-well configuration, regional profile, or degradation mode may lower these values. They may be tightened (lowered trigger points for sour fields), never relaxed.

**Implemented in:** `domain/constants.py` — hardcoded, not loaded from well reference data.

### Rule 3: Frozen H₂S Sensor Must Be Classified as FAILED

**Source:** Framework §3.2, §14

If an H₂S sensor reports the same value (including 0.0) for ≥15 consecutive samples, it must be classified as `FAILED`, not silently passed. A frozen sensor reading of 0.0 ppm does not mean "no gas" — it may mean the sensor is dead.

**Verification:** `tests/adversarial/test_frozen_value.py` — confirms a frozen H₂S sensor triggers a `SENSOR_DEGRADED` alert.

### Rule 4: Thermal SCP Exception for Thermal Wells

**Source:** Framework §14.27

WELL_401 and other thermal/steamflood wells experience elevated casing pressures due to steam injection. The SCP trigger (`T1-A_SCP_SUSPECT`) must NOT fire on thermal wells when the pressure elevation is consistent with steam injection thermal expansion. The `gcc_heavyoil` regional profile widens SCP thresholds for this class of well.

**Verification:** `tests/adversarial/test_prohibited_behaviors.py` — confirms WELL_401 thermal SCP does not fire.

### Rule 5: WELL_403 High Temperature Must NOT Be Quarantined

**Source:** Framework §14.26

WELL_403 has a legitimate wellhead temperature of 418°F due to steam injection. The validation pipeline must NOT quarantine this as a range violation or classify the sensor as `SUSPECT`. The `gcc_heavyoil` regional profile raises the instrument span upper bound for `wellhead_temp_f` to accommodate this.

**Verification:** `tests/adversarial/test_prohibited_behaviors.py`.

### Rule 6: Theft Advisory — Never Executive on Pressure-Only Evidence

**Source:** Framework §14.23

When the theft trigger (`T1-E`) fires based on pressure sensor evidence alone (no custody transfer mismatch corroboration), the alert severity must be `ADVISORY`. It must NOT produce an `EXECUTIVE` action or a high-severity alert. Executive theft alerts require corroboration from at least two independent evidence streams.

**Verification:** `tests/adversarial/test_theft_simulation.py`.

### Rule 7: `core/` Must Have Zero Infrastructure Imports

**Source:** AD-1 (this document), Framework §8, §12

The `core/` package must never import from `storage/`, `api/`, `tasks/`, `ai/`, `redis`, `sqlalchemy`, `celery`, `httpx`, or any other infrastructure library. It receives `TelemetrySample` and `WellContext` as input and returns `TriggerResult`, `Alert`, and state updates as output. The ingestion worker is responsible for bridging between `core/` and infrastructure.

### Rule 8: EEMUA 191 Alert Flood Control

**Source:** Framework §5, §6

The system must enforce EEMUA 191 alarm management budgets:
- Max concurrent T2 alerts per console: **18** (`ALERT_BUDGET_T2_MAX`)
- Max concurrent T3 alerts per console: **35** (`ALERT_BUDGET_T3_MAX`)
- Max alerts in first 10 minutes of an incident: **10** (`ALERT_FLOOD_FIRST_10_MIN_CAP`)
- Steady-state target: **≤1 per 10 minutes** (`ALERT_STEADY_STATE_TARGET_PER_10_MIN`)
- Max active alerts per operator: **20** (`ALERT_OPERATOR_MAX_ACTIVE`)

T1 (life-safety) alerts are **exempt** from flood control — they always fire.

**Implemented in:** `core/alerts/flood_control.py`, `domain/constants.py`.

### Rule 9: Well-State Suppression Requires High Confidence

**Source:** Framework §4, §14

Suppressing a trigger based on well state (e.g., not evaluating GOR drift during SHUT_IN) requires a state probability ≥ 0.85 (`STATE_SUPPRESSION_PROBABILITY_THRESHOLD`). If the state machine is uncertain, the trigger runs anyway. This prevents missed alerts due to incorrect state inference.

**Exception:** H₂S is never suppressed regardless of state probability (Rule 1).

### Rule 10: Replay Harness Exercises Exact Production Code

**Source:** Framework §18

The replay harness (`tests/replay/`) must call the exact same `core/` functions that the production ingestion worker calls. No "test mode" flag, no simplified code path, no mocked triggers. The harness feeds CSV rows through `core.layer0.pipeline.process()` and `core.triggers` — identical to `ingestion/processor.py`.

### Rule 11: Stream-Only Dataset Loading (No pandas.read_csv)

**Source:** Practical constraint — datasets are 135–200 MB gzip (~810 MB uncompressed)

The replay loader (`tests/replay/loader.py`) must stream rows using `gzip.open()` + `csv.DictReader`. Loading entire datasets into memory via `pandas.read_csv()` is prohibited. Only one row is in memory at any time.

### Rule 12: Baselines Must Not Be Poisoned by Non-Flowing Data

**Source:** Framework §7

Rolling and intermediate baselines must be computed only from `FLOWING` state data. Samples collected during `SHUT_IN`, `STARTUP`, `TEST`, or `EMERGENCY_SHUTDOWN` must be excluded from baseline calculations. Including non-flowing data poisons the baseline and causes cascading false alarms when the well returns to production.

### Rule 13: Every Alert Must Capture Full Context at Fire Time

**Source:** Framework §11

When an alert fires, it must snapshot and store:
1. Well state and state probability at fire time
2. State source (INFERRED / SCADA / OPERATOR_MANUAL)
3. Operating mode (VERIFIED / DEGRADED / SURVIVAL)
4. Degradation score
5. Logic profile
6. Coarse confidence assessment
7. Data quality snapshot (sensor health, comms latency, gap duration, baseline age)
8. Driving channels (which sensor values triggered the alert, and by how much they exceeded limits)
9. Sister well context (readings from wells on the same manifold)
10. Wind context (for gas alerts — direction, velocity, muster guidance)
11. Recommended immediate actions

This is implemented in the `Alert` model in `domain/alerts.py` (28 fields).

---

## 7. What Is Explicitly Out of Scope

Everything below must NOT be built in Phase 1. These boundaries come from the PRD and the Framework's phase definitions.

### Out of Scope: Infrastructure

| Item | Why Not Phase 1 | PRD Reference |
|------|-----------------|---------------|
| Kafka | Redis Streams handles pilot scale. Extension point documented in AD-3. | Backend PRD §3.2 |
| Kubernetes | Docker Compose for pilot. K8s is Phase 2 production hardening. | Backend PRD §7.1 |
| Separate Redis instances | Single instance for pilot (Q2 confirmed). | Backend PRD §3.2 |
| Edge deployment packaging | Code separation only (Q4 confirmed). Standalone edge wheel is Phase 2. | Framework §12 |
| Multi-region deployment | Pilot is single-region. | Backend PRD §7.2 |
| CI/CD pipeline | Git push to main. Automated CI is Phase 2. | — |

### Out of Scope: Features

| Item | Why Not Phase 1 | Reference |
|------|-----------------|-----------|
| AI-assisted triage and diagnosis | Interfaces stubbed (`ai/agent/`). Logic is Phase 1C. | Backend PRD §5.3 |
| Predictive analytics (ML forecasting) | Stubbed (`ai/analytics/`). Phase 1C. | Backend PRD §5.3 |
| Cross-well correlation analysis | Phase 2. Requires multi-well statistical modeling. | Framework §10 |
| Automated report delivery (email/SMS) | Report generation is Phase 1B. Automated delivery is Phase 2. | Backend PRD §4.6 |
| User self-registration / password reset | Admin creates users in Phase 1. Self-service is Phase 2. | Frontend PRD §3.1 |
| Mobile app / responsive UI | Desktop-only dashboard for pilot. | Frontend PRD §1.2 |
| Notification push (mobile, SMS) | WebSocket to browser only. Push notifications are Phase 2. | Backend PRD §4.5 |
| Data export (CSV/Excel download) | Phase 2. | Frontend PRD §4.7 |
| Well commissioning workflow UI | Reference data is seeded via `scripts/seed_reference_data.py`. UI for managing well configs is Phase 2. | Frontend PRD §3.4 |

### Out of Scope: Triggers

All 12 trigger codes are defined and scaffolded. The following are lower priority and may have simplified implementations in Phase 1:

| Trigger | Status | Note |
|---------|--------|------|
| T1-E Theft (dual-arm) | Implemented but advisory-only when pressure-only evidence. Full dual-arm with custody mismatch requires custody transfer data integration (Phase 2). | Framework §6.6 |
| T3-DECL Production Decline | Simplified exponential fit. Full hyperbolic/harmonic models are Phase 2. | Framework §6.8 |

### Out of Scope: Testing

| Item | Note |
|------|------|
| Performance benchmarking (P99 latency targets) | Locust scaffolded but formal benchmarks are Phase 2. |
| Chaos engineering (network partition, DB failure) | Phase 2. |
| Penetration testing | Phase 2. |

---

## 8. Data Available

Five labeled datasets are available in `data/raw/` for the replay harness. They are gitignored (too large) and must be present locally to run replay tests.

### Telemetry Datasets

| Dataset | File | Size (gzip) | Profile | Well Count | Duration | Key Characteristics |
|---------|------|-------------|---------|------------|----------|-------------------|
| **UAE GCC Sour** | `uae_gcc_onshore_sour_1mo.csv.gz` | 135 MB | `gcc_desert` | ~3 | 1 month | Sour gas fields with elevated H₂S baselines. Validates T1-B (H₂S) and T1-A (SCP). Primary H₂S recall target: 1.0. |
| **Africa Delta Onshore** | `africa_delta_onshore_1mo.csv.gz` | 180 MB | `africa_onshore` | ~4 | 1 month | High-GOR Niger Delta wells. Validates T2-A (GOR drift), T1-E (theft). High sand production. |
| **GCC Heavy Oil Steamflood** | `gcc_heavyoil_steamflood_1mo.csv.gz` | 190 MB | `gcc_heavyoil` | ~4 | 1 month | Steam injection wells. High water cut, elevated temperatures. Validates T2-B (water cut), thermal SCP exception (WELL_401), WELL_403 temperature non-quarantine. |
| **GCC Thermal Clean** | `gcc_heavyoil_thermal_clean_1mo.csv.gz` | 48 MB | `gcc_heavyoil` | ~2 | 1 month | Clean subset of heavy oil data. Used specifically for thermal SCP validation without noise from other trigger types. |
| **Offshore High-GOR** | `offshore_highgor_1mo.csv.gz` | 188 MB | `africa_offshore` | ~3 | 1 month | Offshore wells with elevated GOR. Validates T2-E (hydrate risk), T1-A (integrity), and T3-DECL (decline). |

**Total:** ~741 MB gzip, ~3.2 GB uncompressed, ~14.6M rows across all datasets.

### Reference Data

Well commissioning data is stored as JSON in `data/reference/`:

| File | Contents |
|------|----------|
| `uae_wells.json` | MAWP, MAASP, H₂S sour baseline, ESP nameplate data for UAE wells. |
| `africa_wells.json` | Reference data for Africa Delta wells including theft-prone metering configs. |
| `heavyoil_wells.json` | Thermal well configs: raised temperature spans, adjusted SCP thresholds, WELL_401/403 special rules. |
| `offshore_wells.json` | Hydrate curves, wax points, stricter integrity thresholds for offshore wells. |

These files are loaded into TimescaleDB's `well_reference` table by `scripts/seed_reference_data.py`.

### Dataset README Files

Each dataset has a companion README in `data/readme/` documenting its schema, labeled events, and intended validation targets:
- `UAE_dataset_README.md`
- `AfricaDelta_dataset_README.md`
- `HeavyOil_dataset_README.md`
- `Offshore_dataset_README.md`

---

## 9. Build Order

The backend is built in a strict sequence. Each phase depends on the previous phase's outputs. This order does not change.

### Phase 0: Scaffolding ✅ COMPLETE

**What:** Delete the old TypeScript backend. Create the Python package structure, Docker files, `pyproject.toml`, `.env.example`, Alembic setup. Stub every module with `__init__.py` and placeholder files. Create all domain models, enums, and constants.

**Output:** A codebase that imports cleanly, starts without errors, and has every file in place (even if the functions are stubs).

**Status:** Done. All files are scaffolded and pushed to `main`.

---

### Phase 1A: Replay Harness + Layer-0

**What:**
1. Implement `tests/replay/loader.py` — streaming gzip CSV parser.
2. Implement `core/layer0/hampel.py` — Hampel median despike filter.
3. Implement `core/layer0/validation.py` — range, slew rate, frozen value, staleness checks.
4. Implement `core/layer0/pipeline.py` — chain the validators.
5. Implement `tests/replay/harness.py` — feed datasets through Layer-0.
6. Implement `tests/replay/scorer.py` — precision/recall/lead-time computation.
7. Write unit tests for Hampel, validation, and pipeline.

**Validation gate:** Replay harness runs on the UAE dataset without crashing. Layer-0 correctly flags known spikes and frozen values.

**Why first:** Layer-0 is the foundation. No trigger can run without validated data. The replay harness is the primary validation mechanism — it must exist before any trigger logic is written.

---

### Phase 1A.2: Well-State Machine + Sensor Health

**What:**
1. Implement `core/well_state/machine.py` — state inference from pressure/choke/flow.
2. Implement `core/well_state/trust.py` — state probability fusion.
3. Implement `core/well_state/suppression.py` — suppression gating (with H₂S exception).
4. Implement `core/sensor_health/classifier.py` — channel health classification.
5. Implement `core/sensor_health/h2s_honesty.py` — H₂S special rules.
6. Write unit tests for state machine, trust, suppression, and sensor health.

**Validation gate:** State machine correctly infers FLOWING/SHUT_IN from test vectors. H₂S suppression exception verified.

---

### Phase 1A.3: T1 Triggers

**What:**
1. Implement all five T1 trigger classes: `h2s.py`, `integrity.py`, `kick.py`, `esp.py`, `theft.py`.
2. Implement `core/triggers/base.py` and `registry.py`.
3. Implement `core/alerts/engine.py` — alert creation and deduplication.
4. Implement `core/alerts/flood_control.py` — EEMUA 191 budgets.
5. Implement `core/alerts/gas_response.py` — H₂S tiered response.
6. Write unit tests for each trigger.
7. Write adversarial tests (`tests/adversarial/`).

**Validation gate:** Run replay harness with T1 triggers active on all 4 datasets. H₂S recall = 1.0 on UAE dataset. All adversarial/prohibited behavior tests pass.

---

### Phase 1B.1: Storage Layer + Ingestion Worker

**What:**
1. Implement `storage/database.py` — async SQLAlchemy engine.
2. Implement `storage/models/` — all SQLAlchemy table definitions.
3. Write Alembic migrations for all tables + hypertable creation.
4. Implement `storage/repositories/` — CRUD operations.
5. Implement `storage/redis_client.py` and `storage/cache/` — state cache.
6. Implement `ingestion/worker.py` — Redis Stream consumer → core → DB write → cache update → Pub/Sub publish.
7. Integration tests with Testcontainers.

**Validation gate:** `docker compose up` starts all services. A sample posted to the ingest endpoint flows through Redis Stream → worker → TimescaleDB. Query it back via repository.

---

### Phase 1B.2: API + WebSocket

**What:**
1. Implement all REST routes (`api/routes/`).
2. Implement API schemas (`api/schemas/`).
3. Implement WebSocket endpoint (`api/websockets/realtime.py`).
4. Implement `api/dependencies.py` — auth dependency, DB/Redis injection.
5. Implement `security/` — JWT, RBAC, audit.
6. Integration tests for all API endpoints.

**Validation gate:** All API endpoints return correct data. WebSocket pushes alerts in real time. Authentication and RBAC enforced.

---

### Phase 1B.3: T2/T3 Triggers + Celery Tasks

**What:**
1. Implement T2 triggers: `gor.py`, `watercut.py`, `depletion.py`, `sand.py`, `hydrate.py`.
2. Implement T3 triggers: `decline.py`, `esp_trend.py`.
3. Implement `core/baselines/` — anchored, rolling, intermediate, reanchor.
4. Implement `core/degradation/` — score, modes, simplification.
5. Implement all Celery tasks (`tasks/`).
6. Unit tests for all T2/T3 triggers and baseline logic.
7. Replay harness with T2/T3 active.

**Validation gate:** T2/T3 cycles run correctly on schedule. Replay harness passes all datasets with full trigger suite active.

---

### Phase 1B.4: Reporting + Observability + Polish

**What:**
1. Implement `reporting/` — shift reports, alert summaries.
2. Implement `observability/` — structlog config, Prometheus metrics.
3. Configure Grafana dashboards.
4. Run full integration + replay + adversarial + load test suite.
5. Fix any issues.

**Validation gate:** Full test suite green. Load test sustains ≥75 samples/sec at P99 < 200ms. All Grafana dashboards render.

---

### Phase 1C: AI Layer (Future)

Activate the stubs in `ai/`. Choose LLM provider. Implement triage and diagnosis logic. This phase is not scheduled and depends on provider selection.

---

*End of document. Every statement above is traceable to the Backend PRD, the Field Operations Framework, or a confirmed architectural decision. If a question arises during implementation that is not answered here, it must be raised and documented before code is written.*
