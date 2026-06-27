# Thronix — Exhaustive Repository Guide

> **Last Updated:** 2026-06-24
> **Purpose:** This is the single source of truth for understanding every folder, file, and component in the Thronix monorepo. Written for developers, AI agents, and technical reviewers onboarding to the project.

---

## Table of Contents

1. [What is Thronix?](#1-what-is-thronix)
2. [Repository Root](#2-repository-root)
3. [Backend (`backend/`)](#3-backend)
   - 3.1 [Infrastructure Files](#31-infrastructure-files)
   - 3.2 [Docker Configuration](#32-docker-configuration)
   - 3.3 [Source Package (`src/thronix/`)](#33-source-package-srcthronix)
   - 3.4 [Domain Models (`domain/`)](#34-domain-models-domain)
   - 3.5 [Core Engine (`core/`)](#35-core-engine-core)
   - 3.6 [Ingestion Pipeline (`ingestion/`)](#36-ingestion-pipeline-ingestion)
   - 3.7 [Storage Layer (`storage/`)](#37-storage-layer-storage)
   - 3.8 [API Layer (`api/`)](#38-api-layer-api)
   - 3.9 [Background Tasks (`tasks/`)](#39-background-tasks-tasks)
   - 3.10 [Security (`security/`)](#310-security-security)
   - 3.11 [AI / GenAI Layer (`ai/`)](#311-ai--genai-layer-ai)
   - 3.12 [Reporting (`reporting/`)](#312-reporting-reporting)
   - 3.13 [Observability (`observability/`)](#313-observability-observability)
   - 3.14 [Database Migrations (`alembic/`)](#314-database-migrations-alembic)
   - 3.15 [Monitoring (`monitoring/`)](#315-monitoring-monitoring)
   - 3.16 [Scripts (`scripts/`)](#316-scripts-scripts)
   - 3.17 [Tests (`tests/`)](#317-tests-tests)
4. [Shared TypeScript (`shared/`)](#4-shared-typescript-shared)
5. [Skills (AI Instructions) (`skills/`)](#5-skills-ai-instructions-skills)
6. [Data (`data/`)](#6-data-data)
7. [Documentation (`docs/`)](#7-documentation-docs)
8. [Root Configuration Files](#8-root-configuration-files)
9. [End-to-End Data Flow](#9-end-to-end-data-flow)

---

## 1. What is Thronix?

Thronix is a **real-time industrial asset monitoring platform** for oil and gas wells. It ingests high-frequency telemetry from edge devices (sensors on wellheads), runs a multi-tier safety trigger evaluation engine, and broadcasts live alerts to field operators.

**Scale:** Designed for 10–15 wells in the pilot, extensible to ~4,000 wells at a 3-second sample rate.
**Stack:** Python 3.12 / FastAPI / TimescaleDB (PostgreSQL) / Redis Streams / Celery / Next.js / TypeScript

---

## 2. Repository Root

```
thronix/
├── .gitignore          ← Files/dirs excluded from git
├── Plan                ← Original Field Operations Framework document (source of truth)
├── README.md           ← Public-facing project overview
├── REPO.md             ← This file
├── SKILL.md            ← AI agent routing instructions
├── SKILLS_MIGRATION.md ← Log of AI skill changes (local only, gitignored via md-files/)
├── backend/            ← Python backend (FastAPI, TimescaleDB, Redis)
├── data/               ← Local-only datasets (gitignored)
├── docs/               ← PRD and specification PDFs
├── md-files/           ← Local markdown scratch files (gitignored)
├── shared/             ← TypeScript types used by the frontend
├── skills/             ← AI agent instruction files
└── turbo.json          ← Turborepo config for frontend build pipeline
```

### Root Files

| File | Description |
|------|-------------|
| `.gitignore` | Excludes `data/raw/*.csv.gz` (too large), `.env` files, Python caches (`__pycache__`, `.venv`), Node.js artefacts (`node_modules`, `.next`), and the `md-files/` folder from git. |
| `Plan` | The original Field Operations Framework specification. The engineering thresholds (e.g., H₂S limits, EEMUA 191 budgets) in this document are the canonical source of truth for all trigger logic. |
| `README.md` | High-level project description, tech stack summary, and quick-start instructions for new developers. |
| `REPO.md` | This file — the exhaustive guide to every file in the repository. |
| `SKILL.md` | The AI instruction router. When an AI agent needs to work on a specific part of the project, this file tells it which `skills/*.md` file to read first for domain-specific rules. |
| `turbo.json` | Turborepo pipeline for the Next.js frontend. Defines task dependencies (e.g., `build` depends on `^build`). Does **not** manage the Python backend. |

---

## 3. Backend

The entire backend is a Python package called `thronix`. The code lives in `backend/src/thronix/`.

### 3.1 Infrastructure Files

| File | Description |
|------|-------------|
| `backend/pyproject.toml` | Defines the `thronix` Python package: dependencies (`fastapi`, `sqlalchemy`, `pydantic`, `redis`, `celery`, `structlog`, `prometheus-client`), dev dependencies (`pytest`, `testcontainers`, `ruff`, `mypy`), and tool configuration for `pytest`, `ruff`, and `mypy`. |
| `backend/alembic.ini` | Alembic migration tool configuration. Points to `alembic/env.py` and sets the database URL variable name. **This file is gitignored** because it contains the live database URL. |
| `backend/.env.example` | Template for all required environment variables. Developers copy this to `.env` and fill in real values. Variables include `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`, `CELERY_BROKER_URL`, and others. Never commit `.env`. |
| `backend/README.md` | Backend-specific documentation: how to start the development server, run tests, and apply migrations. |

### 3.2 Docker Configuration

| File | Description |
|------|-------------|
| `backend/Dockerfile` | Container for the main **FastAPI API server**. Uses a multi-stage build: installs Python deps in a builder stage, copies only the final package in the runtime stage. Exposes port 8000. Runs `uvicorn thronix.api.app:app`. |
| `backend/Dockerfile.worker` | Container for the **Redis Streams ingestion worker**. Same base image as Dockerfile but runs `python -m thronix.ingestion.worker` instead of uvicorn. Designed to scale horizontally. |
| `backend/Dockerfile.celery` | Container for the **Celery background task runner**. Runs `celery -A thronix.tasks.celery_app worker` and `celery beat` for scheduled tasks. |
| `backend/docker-compose.yml` | Orchestrates the full pilot stack: FastAPI server, ingestion worker, Celery worker, Celery beat scheduler, TimescaleDB (PostgreSQL + TimescaleDB extension), Redis, Prometheus, and Grafana. All services share a Docker network. Mounts `./data/raw` as a read-only volume for replay harness access. |

### 3.3 Source Package (`src/thronix/`)

The root `thronix` package.

| File | Description |
|------|-------------|
| `__init__.py` | Marks the directory as a Python package. Contains the package `__version__` string. |
| `config.py` | Pydantic `Settings` class loaded from environment variables. Contains `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`, `CELERY_BROKER_URL`, `LOG_LEVEL`, `ENVIRONMENT` ("development" vs "production"), and `PILOT_WELL_LIMIT` (max number of monitored wells). Imported everywhere configuration is needed, preventing scattered `os.getenv()` calls. |

---

### 3.4 Domain Models (`domain/`)

**Rule:** This package is 100% pure Python. Zero infrastructure imports. Models here must be usable in edge environments with no database or network.

| File | Purpose |
|------|---------|
| `__init__.py` | Exports all domain model classes for convenient importing. |
| `telemetry.py` | Defines `TelemetrySample` — the 39-channel Pydantic model for a single raw sensor reading from a wellhead. Fields include: `well_id` (string), `timestamp` (datetime), pressure channels (`tubing_pressure_psi`, `casing_pressure_psi`, `wellhead_pressure_psi`), temperature channels, flow rates (`oil_rate_bopd`, `gas_rate_mmscfd`, `water_rate_bwpd`), ESP parameters (`esp_frequency_hz`, `esp_current_amps`, `esp_vibration_mms`), H₂S ppm readings, and the labeled `ground_truth_event` field (used only by the replay harness). |
| `alerts.py` | Defines `TriggerCode` (enum: `H2S_AREA_SAFETY`, `SCP_SUSPECT`, `WELL_KICK`, `ESP_FAILURE`, `LINE_THEFT`, `GOR_DRIFT`, `WATERCUT_EXCEEDANCE`, `HYDRATE_RISK`, `SAND_PRODUCTION`, `RESERVOIR_DEPLETION`, `PRODUCTION_DECLINE`, `ESP_DEGRADATION_TREND`), `AlertSeverity` (HIGH / MEDIUM / LOW / ADVISORY), `AlertState` (ACTIVE / ACKNOWLEDGED / CLOSED), and the `Alert` Pydantic model aggregating all these fields. |
| `reference.py` | Defines `WellReferenceData` — the commissioning parameters for a single well (e.g., baseline pressures, ESP nameplate data, H₂S design limits, field location). Also defines `SiteReferenceData` for site-level grouping. These are loaded once at startup and used by `core/` triggers. |
| `well_state.py` | Defines `WellState` (`FLOWING`, `SHUT_IN`, `TEST`, `STARTUP`, `EMERGENCY_SHUTDOWN`), `StateSource` (`INFERRED`, `SCADA`, `OPERATOR_MANUAL`), and `OperatingMode` (`NORMAL`, `RESTRICTED`, `SURVEILLANCE_ONLY`). Also defines `WellStateRecord` which packages the inferred state with its source and confidence. |
| `enums.py` | Miscellaneous domain enums: `WeatherCondition` (CLEAR, SANDSTORM, RAIN), `PowerQuality` (STABLE, UNSTABLE, GENERATOR), `SensorHealthClass` (`HEALTHY`, `DEGRADED`, `SUSPECT`, `FAILED`), and `GroundTruthEvent` (the labeled event types in the training datasets). |
| `constants.py` | The single source of truth for all engineering thresholds. Values here are derived directly from the `Plan` document and the `shared/constants/thresholds.ts` file. Examples: `H2S_AREA_ALERT_PPM = 10.0`, `H2S_AREA_HIGH_PPM = 20.0`, `H2S_IDLH_PPM = 50.0`, `EEMUA_T2_MAX_CONCURRENT = 18`, `FROZEN_VALUE_SAMPLE_THRESHOLD = 15`, `HAMPEL_WINDOW_SIZE = 5`. Centralizing here prevents magic numbers in logic files. |

---

### 3.5 Core Engine (`core/`)

**Rule:** Zero infrastructure imports. No SQLAlchemy, Redis, or HTTP calls. This package can run in complete isolation on an edge device.

#### `core/__init__.py`
Exports the top-level `process_sample()` entry point, which orchestrates Layer-0 → Trigger evaluation in sequence.

#### `core/confidence.py`
Stub module for computing a confidence score on the output of the trigger evaluation (0.0–1.0). Accounts for sensor health and data quality.

#### `core/layer0/` — Signal Validation Pipeline

This sub-package runs on every raw `TelemetrySample` before any trigger logic. It produces a validated (or rejected/flagged) sample.

| File | Purpose |
|------|---------|
| `__init__.py` | Exports `process()` — the top-level Layer-0 function that chains all sub-validators. |
| `pipeline.py` | Chains `validation.py` checks, then `hampel.py` spike filtering, then `proxy.py` sensor substitution. Returns a `ValidatedSample` or a `RejectedSample` with a reason code. |
| `hampel.py` | Implements the 5-sample sliding-window Hampel outlier filter. Uses Median Absolute Deviation (MAD). For each channel value: computes the median of the last 5 samples, computes MAD, and if the current value exceeds `3.5 × MAD × 1.4826`, it replaces the value with the median proxy and marks the sample as `SUSPECT` for that channel. Prevents spike-triggered false alarms. |
| `validation.py` | Four checks per channel: (1) **Range Check** — value within engineering limits from `constants.py`. (2) **Slew Rate Check** — rate of change between samples doesn't exceed physical limits (catches sensor runaway). (3) **Frozen Value Detection** — if the same value repeats for ≥15 samples, the sensor is marked `FAILED`. (4) **Staleness Check** — if the sample timestamp is >30 seconds behind wall-clock time, data is flagged as stale. |
| `proxy.py` | Sensor proxy substitution logic. When a sensor is `FAILED`, substitutes a proxy value from a correlated sensor (e.g., uses casing pressure to infer tubing pressure). Implements the dual-path sensor architecture from the Field Operations Framework. |

#### `core/well_state/` — Well State Inference

| File | Purpose |
|------|---------|
| `__init__.py` | Exports `infer_state()`. |
| `machine.py` | Infers the current well state (`FLOWING`, `SHUT_IN`, etc.) from pressure, choke position, and flow rates. This is critical because many triggers only fire (or are suppressed) based on current well state. |
| `trust.py` | Determines the "trust level" of the current well state. If the state was set manually by an operator, it is given higher trust than an inferred state. Used to decide whether conflicting sensor data can override the state. |
| `suppression.py` | Contains the logic for alert suppression based on well state. For example, a `SHUT_IN` well with zero flow should not generate a `GOR_DRIFT` alert. **Critical exception: H₂S alerts (`T1-B`) are never suppressed by any well state** — see `domain/constants.py`. |

#### `core/triggers/` — Alert Evaluation Engine

| File | Purpose |
|------|---------|
| `__init__.py` | Exports trigger classes for each tier. |
| `base.py` | Abstract base class `BaseTrigger`. Defines the `evaluate(sample, well_context) -> Alert | None` interface that all 12 triggers must implement. Also implements chatter guard logic (holdoff timer) to prevent the same trigger from firing multiple times within a cooldown window. |
| `registry.py` | `TriggerRegistry` — a dictionary that maps `TriggerCode` to `BaseTrigger` instances. Used by the ingestion worker to dynamically look up and invoke the correct trigger(s) for each sample. |

##### `core/triggers/t1/` — Tier 1: Life-Safety & Equipment (per-sample, 3-second rate)

| File | Trigger | Description |
|------|---------|-------------|
| `__init__.py` | — | Exports all T1 trigger classes. |
| `h2s.py` | `T1-B: H2S Area Safety` | Evaluates `h2s_ppm` against three thresholds from `constants.py`: ALERT (10 ppm), HIGH (20 ppm), IDLH (50 ppm). Each level generates a progressively higher severity alert. **This trigger is NEVER suppressed by well state.** |
| `esp.py` | `T1-D: ESP Failure` | Evaluates ESP vibration (`esp_vibration_mms`), motor temperature, and VSD frequency for abnormalities. Detects gas-lock, pump-off, and bearing failure signatures. |
| `kick.py` | `T1-C: Well Kick / Blowout` | Detects influx from a reservoir. Evaluates rapid increase in pit volume, pit gain rate, and simultaneous pressure changes in tubing vs casing. |
| `integrity.py` | `T1-A: Well Integrity / SCP` | Detects Sustained Casing Pressure (SCP). Checks for persistent positive pressure on casing annuli after bleed-off tests, indicating a breach in tubing, casing, or packer. |
| `theft.py` | `T1-E: Line Theft Advisory` | Detects anomalous pressure-loss patterns at metering points inconsistent with normal drawdown. **Important: This trigger produces an ADVISORY only when pressure sensor is the sole evidence — it does not produce an executive action.** |

##### `core/triggers/t2/` — Tier 2: Process Limits (calculated per 4-hour shift)

| File | Trigger | Description |
|------|---------|-------------|
| `__init__.py` | — | Exports all T2 trigger classes. |
| `gor.py` | `T2-A: GOR Drift` | Gas-to-Oil Ratio drift detection. Uses the CUSUM (Cumulative Sum) algorithm to detect gradual upward drift from the well's established GOR baseline. Configurable per-well (not a global fixed threshold) to avoid false alarms on high-GOR wells. |
| `watercut.py` | `T2-B: Water Cut Exceedance` | Two-armed detection: (1) Absolute threshold arm: fires if water cut exceeds a per-well configured limit. (2) Slow trend arm: uses windowed regression slope to detect if water cut is rising ≥1.5 percentage points/week. |
| `hydrate.py` | `T2-C: Hydrate Formation Risk` | Monitors temperature and pressure against the hydrate formation envelope for the specific gas composition at that well. Fires an advisory when conditions enter the hydrate formation zone, allowing preventive methanol injection. |
| `sand.py` | `T2-D: Sand Production` | Evaluates sand detector readings and vibration harmonics against per-well production rates. Excessive sand production accelerates ESP wear. |
| `depletion.py` | `T2-E: Reservoir Depletion` | Tracks static bottomhole pressure (or estimated via surface measurements) against the well's expected decline curve to detect accelerated depletion. |

##### `core/triggers/t3/` — Tier 3: Reservoir & Long-Term (calculated per 24-hour cycle)

| File | Trigger | Description |
|------|---------|-------------|
| `__init__.py` | — | Exports all T3 trigger classes. |
| `decline.py` | `T3-A: Production Decline` | Fits a production decline curve (exponential or hyperbolic) to the last 30 days of production data. Fires an alert when actual production deviates below the expected curve by a configured margin. |
| `esp_trend.py` | `T3-B: ESP Long-Term Degradation` | Tracks long-term ESP efficiency decline using power/flow relationships. Distinguishes from acute T1-D failures by focusing on gradual multi-week trends in motor current vs. flow rate. |

#### `core/alerts/` — Alert Lifecycle Manager

| File | Purpose |
|------|---------|
| `__init__.py` | Exports `AlertEngine`. |
| `engine.py` | `AlertEngine` orchestrates the full alert lifecycle: deduplication (don't re-fire the same alert if one is already ACTIVE), severity escalation (upgrade an existing alert's severity), and ring escalation. |
| `flood_control.py` | Enforces EEMUA 191 alarm management budgets. Tracks concurrent active alerts per tier per console. Prevents systems from presenting more than 18 T2 or 35 T3 concurrent alerts per console. T1 (life-safety) is exempt. |
| `gas_response.py` | H₂S-specific response protocol. When an H₂S alert fires, this module validates the required automated response steps (muster, PA system, evacuation routing) are recorded. |
| `grouping.py` | Groups alerts from the same well that fired within a 30-second window into a single compound alert, reducing operator cognitive load. |
| `ring_escalation.py` | If an alert is not acknowledged within the configured time window, this module escalates the alert's ring/notification level to a supervisory contact. |

#### `core/degradation/` — Well Degradation Scoring

| File | Purpose |
|------|---------|
| `__init__.py` | Exports `compute_score()`. |
| `modes.py` | Defines degradation modes: NONE (0), MILD (1–25), MODERATE (26–50), SEVERE (51–75), CRITICAL (76–100). Maps combinations of active alerts to a degradation mode. |
| `score.py` | Calculates a normalized 0–100 degradation score by combining active alert counts, severities, and durations. Used by the frontend dashboard to display well health at a glance. |
| `simplification.py` | Simplification logic for the frontend: converts the raw degradation score into a human-readable label ("Well Healthy", "Maintenance Recommended", "Critical — Inspect Immediately"). |

#### `core/baselines/` — Dynamic Baselining

| File | Purpose |
|------|---------|
| `__init__.py` | Exports baselining classes. |
| `anchored.py` | `AnchoredBaseline` — set once at commissioning. Used for absolute parameters like tubing OD or max ESP nameplate current. Never automatically updated. |
| `rolling.py` | `RollingBaseline` — sliding-window statistical baseline (median + MAD). Updates continuously. Used for parameters like GOR, flow rates. |
| `intermediate.py` | `IntermediateBaseline` — mid-way between anchored and rolling. Re-assessed on a weekly schedule by a Celery task. Used for water cut and temperature profiles. |
| `reanchor.py` | `ReanchorManager` — logic for deliberately re-anchoring a baseline (e.g., after a workover). Requires an operator action or explicit Celery task trigger. |

#### `core/sensor_health/` — Sensor Health Classification

| File | Purpose |
|------|---------|
| `__init__.py` | Exports `SensorHealthClassifier`. |
| `classifier.py` | Classifies each sensor channel as `HEALTHY`, `DEGRADED`, `SUSPECT`, or `FAILED` based on layer-0 outputs (range violations, frozen value, slew rate violations). This class drives the proxy substitution logic in `layer0/proxy.py`. |
| `h2s_honesty.py` | Special "honesty" check for H₂S sensors. Cross-validates the H₂S ppm reading against temperature, atmospheric pressure, and other sensors to detect whether the sensor is actively reading (not failed or zeroed-out by contamination). |

#### `core/profiles/` — Field Profiles

| File | Purpose |
|------|---------|
| `__init__.py` | Exports `BaseProfile` and all regional profiles. |
| `base.py` | Abstract `BaseProfile` class. Defines overridable threshold multipliers and operational rules. |
| `gcc_desert.py` | Profile for UAE / Saudi GCC desert onshore wells. Adjusts: higher ambient temperature baseline, tighter H₂S thresholds for sour fields. |
| `gcc_heavyoil.py` | Profile for heavy oil (steamflood). Adjusts: dramatically higher temperature baselines (steam injection up to ~450°F), wider water cut thresholds (high-WOR typical). |
| `africa_onshore.py` | Profile for African Delta onshore wells. Adjusts: higher baseline GOR, sand production sensitivity. |
| `africa_offshore.py` | Profile for offshore African wells. Adjusts: hydrate risk profile, stricter integrity thresholds. |

---

### 3.6 Ingestion Pipeline (`ingestion/`)

| File | Purpose |
|------|---------|
| `__init__.py` | Package marker. |
| `worker.py` | The main ingestion loop. Connects to Redis using `XREADGROUP` on the `telemetry:raw` stream with consumer group `ingestion-workers`. For each message: deserializes JSON → validates into `TelemetrySample` → calls `core.layer0.pipeline.process()` → calls trigger engine → writes telemetry and any alerts to TimescaleDB via `storage.repositories` → updates Redis state cache → publishes alert events to `alerts:new` Pub/Sub channel → ACKs the stream message. Only ACKs after a successful full pipeline run. |
| `processor.py` | Stateless `process_sample()` helper that wraps the core pipeline: Layer-0 → Well State → Triggers → Alerts. Called by `worker.py` with the deserialized sample and the well context loaded from cache/DB. |
| `well_context.py` | `WellContext` data class that holds the in-memory state for a single well during a processing cycle: the `WellReferenceData`, the current `WellStateRecord`, the active `Baseline` instances, and the last-seen sensor history needed by Hampel and CUSUM. Loaded from Redis cache at start of each processing batch; written back after processing. |

---

### 3.7 Storage Layer (`storage/`)

#### `storage/database.py`
Creates the async SQLAlchemy engine pointing to TimescaleDB. Defines `AsyncSessionLocal` (the session factory) and `get_db()` — a FastAPI dependency that yields a scoped async session.

#### `storage/redis_client.py`
Creates the `redis.asyncio` connection pool from `settings.REDIS_URL`. Defines `get_redis()` — a FastAPI dependency.

#### `storage/models/` — SQLAlchemy Table Definitions

| File | Table | Description |
|------|-------|-------------|
| `__init__.py` | — | Exports all model classes and `Base` (the SQLAlchemy declarative base). |
| `telemetry.py` | `telemetry_samples` | The primary TimescaleDB **hypertable** (time-partitioned by `timestamp`). Stores every validated `TelemetrySample`. Indexed by `well_id + timestamp`. Chunks by 7-day intervals. |
| `alerts.py` | `alerts` | Stores fired alerts. Columns: `alert_id`, `well_id`, `trigger_code`, `severity`, `state`, `fired_at`, `acknowledged_at`, `acknowledged_by`, `closed_at`, `raw_evidence` (JSON). |
| `well_reference.py` | `well_reference` | Stores `WellReferenceData` commissioning parameters. One row per well. |
| `baselines.py` | `baselines` | Stores computed baselines (rolling and anchored) per well per channel. Used by Celery tasks to persist and reload baselines across restarts. |
| `audit.py` | `audit_log` | Immutable audit trail. Records every operator action: alert ACK, well state override, report generation. Columns: `timestamp`, `user_id`, `action`, `resource_id`, `payload` (JSON). |
| `users.py` | `users` | Stores user accounts: `user_id`, `email`, `hashed_password`, `role` (ADMIN / OPERATOR / VIEWER), `created_at`. |
| `reports.py` | `reports` | Stores generated shift reports and their delivery status. |

#### `storage/repositories/` — Database Access Layer

All repositories are injected with an `AsyncSession` from `get_db()`. They abstract all raw SQL/ORM queries.

| File | Class | Key Methods |
|------|-------|-------------|
| `__init__.py` | — | Exports all repository classes. |
| `telemetry_repo.py` | `TelemetryRepository` | `insert_sample()`, `query_range(well_id, start, end)`, `latest(well_id)` |
| `alert_repo.py` | `AlertRepository` | `create()`, `list(well_id, state)`, `acknowledge(alert_id, user_id)`, `close(alert_id)` |
| `well_repo.py` | `WellRepository` | `get(well_id)`, `list_all()`, `update_state(well_id, state)` |
| `baseline_repo.py` | `BaselineRepository` | `save(well_id, channel, baseline)`, `load(well_id, channel)` |
| `audit_repo.py` | `AuditRepository` | `log(user_id, action, resource_id, payload)` |

#### `storage/cache/` — Redis State Cache

Abstracts all Redis key operations. Key patterns and TTLs are defined here (not scattered in business logic).

---

### 3.8 API Layer (`api/`)

| File | Purpose |
|------|---------|
| `__init__.py` | Package marker. |
| `app.py` | Creates the `FastAPI()` application instance. Registers all routers (from `routes/`). Defines the `@asynccontextmanager` lifespan that initializes the Redis connection pool and Alembic migrations on startup. Configures CORS origins, middleware, and the OpenAPI documentation title. |
| `dependencies.py` | Defines FastAPI dependency injection functions: `get_db()` (yields `AsyncSession`), `get_redis()` (yields `aioredis.Redis`), and `get_current_user()` (decodes JWT token, returns user). |

#### `api/routes/` — REST Endpoints

| File | Prefix | Endpoints |
|------|--------|-----------|
| `auth.py` | `/api/v1/auth` | `POST /login` — validates credentials, returns JWT. |
| `wells.py` | `/api/v1/wells` | `GET /` — list all monitored wells; `GET /{well_id}` — get well state & KPIs; `POST /{well_id}/state` — operator override of well state. |
| `alerts.py` | `/api/v1/alerts` | `GET /` — list alerts (filterable by well, state, severity, trigger); `GET /{alert_id}` — alert detail; `POST /{alert_id}/acknowledge` — operator ACK. |
| `telemetry.py` | `/api/v1/telemetry` | `POST /ingest` — publish a raw sample to the Redis Stream; `GET /{well_id}/history` — query time-ranged data from TimescaleDB. |
| `kpi.py` | `/api/v1/kpi` | `GET /{well_id}` — returns computed KPIs (uptime, alert rate, MTTR, degradation score). |
| `reports.py` | `/api/v1/reports` | `GET /` — list generated reports; `POST /generate` — trigger an on-demand report. |
| `sensor_health.py` | `/api/v1/sensor-health` | `GET /{well_id}` — returns the health classification of each sensor channel for a well. |

#### `api/schemas/` — API Request/Response Models

Separate Pydantic models for the API boundary (distinct from `domain/` models). Prevents leaking internal field names to external clients.

#### `api/websockets/` — Live Push

| File | Purpose |
|------|---------|
| `realtime.py` | WebSocket endpoint at `/ws/v1/live`. On connection, subscribes to the Redis Pub/Sub channel `alerts:new`. Streams JSON alert payloads to the browser in real time. Handles disconnection and reconnection gracefully. |

---

### 3.9 Background Tasks (`tasks/`)

| File | Purpose |
|------|---------|
| `__init__.py` | Package marker. |
| `celery_app.py` | Creates and configures the `Celery` application. Broker and result backend both point to Redis (`settings.REDIS_URL`). Configures the beat schedule for periodic tasks. |
| `t2_cycle.py` | Celery task: runs T2-tier trigger evaluations (`gor`, `watercut`, `hydrate`, `sand`, `depletion`) every 4 hours for all active wells. Pulls aggregated sensor data from TimescaleDB for the 4-hour window, then calls `core/triggers/t2/` for each well. |
| `t3_cycle.py` | Celery task: runs T3-tier trigger evaluations (`decline`, `esp_trend`) every 24 hours. Pulls the last 30-day history from TimescaleDB and runs regression/decline curve fitting. |
| `baseline_update.py` | Celery task: updates `RollingBaseline` and `IntermediateBaseline` for all wells every hour. Writes results to the `baselines` table and refreshes the Redis cache. |
| `kpi_computation.py` | Celery task: computes and caches well KPIs (uptime %, MTTR, alert frequency) every 15 minutes per well. |
| `report_generation.py` | Celery task: generates automated shift reports at shift boundaries (06:00, 14:00, 22:00). Formats data, creates PDF/Excel via the `reporting/` package. |
| `staleness_check.py` | Celery task: checks every 30 seconds whether any well has stopped sending telemetry (no new samples in >90 seconds). Fires a `COMMS_LOST` advisory alert if detected. |

---

### 3.10 Security (`security/`)

| File | Purpose |
|------|---------|
| `__init__.py` | Package marker. |
| `auth.py` | JWT authentication: `create_access_token(user_id, role)` — signs a JWT with `SECRET_KEY`; `decode_token(token)` — validates and returns the payload. Uses `python-jose`. |
| `hashing.py` | Password hashing utilities using `passlib` with the `bcrypt` scheme. `hash_password()` and `verify_password()`. |
| `rbac.py` | Role-Based Access Control decorator. `require_role(*roles)` — FastAPI dependency that checks the current user's role against the allowed roles. Roles: `ADMIN`, `OPERATOR`, `VIEWER`. |
| `audit.py` | Audit logging helper. `log_action(user_id, action, resource_id, payload)` — writes to the `audit_log` table via `AuditRepository`. Called on every state-changing API operation. |

---

### 3.11 AI / GenAI Layer (`ai/`)

> **Status:** Phase 1C stubs. Interfaces are defined but logic is not yet implemented.

| File | Purpose |
|------|---------|
| `__init__.py` | Package marker. Exports `AIAgent`. |
| `agent/interface.py` | Abstract `AIAgentInterface` class. Defines the contract for `triage()` and `diagnose()` methods that Phase 1C implementations must fulfill. |
| `agent/triage.py` | Stub for AI-assisted alert triage. Will use an LLM to prioritize the most critical alerts when a well has multiple concurrent alerts. |
| `agent/diagnosis.py` | Stub for AI-assisted root cause analysis. Given a set of sensor readings and active alerts, will generate a natural language explanation and recommended action. |
| `analytics/predictions.py` | Stub for predictive analytics. Time-series forecasting for production decline and ESP failure. |
| `analytics/trends.py` | Stub for long-term trend analysis and reporting summaries. |

---

### 3.12 Reporting (`reporting/`)

| File | Purpose |
|------|---------|
| `__init__.py` | Package marker. |
| `delivery.py` | Handles report delivery: email via SMTP, file save to S3/local storage. |
| `generators/` | Report template generators for different report types (shift summary, weekly KPI, monthly production). |

---

### 3.13 Observability (`observability/`)

| File | Purpose |
|------|---------|
| `__init__.py` | Package marker. Initializes logging on import. |
| `logging.py` | Configures `structlog` for JSON-formatted logging. Binds `well_id`, `trigger_code`, and `environment` to every log line automatically. Outputs structured JSON in production; pretty-prints in development. |
| `metrics.py` | Defines Prometheus metrics counters and histograms: `telemetry_samples_processed_total`, `alerts_fired_total` (labeled by `trigger_code`), `ingestion_latency_seconds`, `db_write_latency_seconds`. Exposed at `/metrics` for Prometheus scraping. |

---

### 3.14 Database Migrations (`alembic/`)

| File | Purpose |
|------|---------|
| `env.py` | Alembic environment. Imports the SQLAlchemy `Base` from `storage.models` and configures the async migration runner with the `DATABASE_URL` from the environment. Supports both online (live DB) and offline (SQL script generation) migration modes. |
| `versions/` | Contains the auto-generated and hand-written migration scripts. Each migration file has an `upgrade()` and `downgrade()` function. |

---

### 3.15 Monitoring (`monitoring/`)

| File | Purpose |
|------|---------|
| `prometheus.yml` | Prometheus scrape configuration. Defines scrape targets: the FastAPI `/metrics` endpoint, the Celery worker metrics endpoint, and Redis/PostgreSQL exporters. Scrape interval: 15s. |
| `grafana/dashboards/` | JSON dashboard definitions for Grafana. One dashboard per concern: (1) Ingestion Pipeline Throughput (samples/sec, latency), (2) Alert Activity (alerts fired/hour by trigger code), (3) System Health (Redis memory, DB connections, Celery queue depth). |

---

### 3.16 Scripts (`scripts/`)

| File | Purpose |
|------|---------|
| `seed_reference_data.py` | One-shot seeding script. Loads the well reference JSON files from `data/reference/` and inserts `WellReferenceData` rows into the `well_reference` table. Run once during initial deployment. |

---

### 3.17 Tests (`tests/`)

#### `tests/conftest.py`
Global pytest configuration. Defines shared fixtures:
- `sample_telemetry()` — returns a valid default `TelemetrySample` for UAE-profile wells.
- `flowing_well_context()` — returns a `WellContext` with `FLOWING` state.
- `shutin_well_context()` — returns a `WellContext` with `SHUT_IN` state.
- `timescaledb_container()` — (session-scoped) spins up `timescale/timescaledb:latest-pg15` via Testcontainers for integration tests.
- `redis_container()` — (session-scoped) spins up a Redis container for integration tests.

#### `tests/unit/` — Pure Logic Tests (no infrastructure)

Tests the math in `core/` with no mocking required (because `core/` has no infrastructure deps).

| File | Tests |
|------|-------|
| `core/test_hampel.py` | Hampel filter: normal pass-through, spike rejection, MAD calculation. |
| `core/test_validation.py` | Range, slew rate, frozen value, and staleness checks. |
| `core/test_well_state_machine.py` | State inference from pressure/choke combos. |
| `core/test_trust.py` | Trust level calculation for inferred vs. manual states. |
| `core/test_flood_control.py` | EEMUA 191 concurrent alert budget enforcement. |
| `core/test_degradation_score.py` | Score computation from mock alert combinations. |
| `core/test_modes.py` | Degradation mode classification from scores. |
| `core/triggers/test_h2s.py` | H₂S trigger at all three threshold levels; non-suppression by SHUT_IN state. |
| `core/triggers/test_esp.py` | ESP vibration and temperature thresholds; gas-lock detection. |
| `core/triggers/test_kick.py` | Pit gain rate and simultaneous pressure divergence. |
| `core/triggers/test_integrity.py` | SCP detection after bleed-off; thermal SCP exception for WELL_401. |
| `core/triggers/test_theft.py` | Pressure-loss pattern; advisory-only constraint for pressure-sole evidence. |
| `core/triggers/test_gor.py` | CUSUM drift detection; no false alarm on high-GOR baseline wells. |
| `core/triggers/test_watercut.py` | Absolute threshold arm; slow trend (regression slope) arm. |
| `core/triggers/test_hydrate.py` | Hydrate envelope intersection detection. |
| `core/triggers/test_sand.py` | Sand production limit evaluation. |
| `core/triggers/test_decline.py` | Decline curve fitting and deviation detection. |
| `core/triggers/test_esp_trend.py` | Long-term ESP power/flow relationship degradation. |
| `domain/test_constants.py` | Sanity-checks that constants match the Field Operations Framework values (prevents accidental edits). |
| `domain/test_models.py` | Pydantic model validation: required fields, field bounds, cross-field validators. |

#### `tests/integration/` — Infrastructure Integration Tests

Require real Postgres (TimescaleDB) and Redis via Testcontainers.

| File | Tests |
|------|-------|
| `test_ingestion_pipeline.py` | Full pipeline from `XADD` to TimescaleDB write. Verifies the sample lands in the DB with correct values. |
| `test_telemetry_storage.py` | `TelemetryRepository.insert_sample()` and `query_range()` against a real hypertable. |
| `test_alert_lifecycle.py` | Alert creation → ACK → CLOSE flow via repository and API. |
| `test_api_endpoints.py` | FastAPI routes via `httpx.AsyncClient`. Tests authentication, well listing, and alert retrieval. |

#### `tests/replay/` — Dataset-Driven Validation Gate

The most critical test suite. Streams historical CSVs through the actual production core to measure Precision, Recall, and Lead-Time.

| File | Purpose |
|------|---------|
| `__init__.py` | Pytest plugin hooks: registers `--replay-profile` CLI option, loads dataset paths from environment. |
| `loader.py` | `stream_dataset(path)` — streams a gzip CSV row-by-row using Python's built-in `csv` and `gzip` modules. **Never loads the full file into RAM.** Parses each row into a `TelemetrySample`, separating the `ground_truth_event` column from the telemetry payload. |
| `harness.py` | `ReplayHarness.run(config)` — iterates the dataset stream, feeds each sample through `core.layer0.pipeline.process()` and the trigger engine, and accumulates fired alerts with timestamps. |
| `scorer.py` | `score(fired_alerts, ground_truth)` — calculates per-trigger Precision, Recall, F1, and median Lead-Time by comparing the fired alert timestamps to the labeled `ground_truth_event` column. |
| `reporter.py` | Formats the scoring results as a Markdown table and a JSON summary. JSON output committed to `tests/replay/reports/` for regression tracking. |
| `runner.py` | CLI entry point: `python -m tests.replay.runner --profile uae` runs the full harness for a given profile. |
| `configs/uae.py` | UAE profile config: path to `uae_gcc_onshore_sour_1mo.csv.gz`, well IDs, and pass criteria per trigger (e.g., H₂S recall must be `1.0`). |
| `configs/africa.py` | Africa Delta onshore profile config and pass criteria. |
| `configs/heavyoil.py` | GCC heavy oil (steamflood) profile config. Adjusted pass criteria for high water cut and temperature. |
| `configs/offshore.py` | Offshore high-GOR profile config. |
| `test_replay_uae.py` | pytest entry point: calls `run_replay(UAEConfig)` and asserts all pass criteria using `assert_replay_pass(results)`. |
| `test_replay_africa.py` | Same pattern for Africa dataset. |
| `test_replay_heavyoil.py` | Same pattern for Heavy Oil dataset. |
| `test_replay_offshore.py` | Same pattern for Offshore dataset. |

#### `tests/adversarial/` — Prohibited Behavior Tests (Framework §14)

Designed to actively try to violate the safety rules and verify the system blocks them.

| File | Tests |
|------|-------|
| `test_spoofed_state.py` | Verifies H₂S alert fires even when `well_state` is spoofed to `SHUT_IN`. |
| `test_frozen_value.py` | Verifies a frozen H₂S sensor is classified as `FAILED` and triggers a `SENSOR_DEGRADED` alert rather than silently passing zeros. |
| `test_replay_attack.py` | Verifies that replaying an old (duplicate timestamp) sample does not double-trigger an alert. |
| `test_theft_simulation.py` | Verifies that pressure-only theft evidence produces an ADVISORY and not an executive action. |
| `test_prohibited_behaviors.py` | Tests the remaining §14 prohibited behaviors: thermal SCP not firing on WELL_401; WELL_403 high-temperature sensor not being quarantined as SUSPECT; etc. |

#### `tests/load/`

| File | Purpose |
|------|---------|
| `locustfile.py` | Locust load test. Simulates 15 wells × 20 samples/sec ingestion via HTTP POST to `/api/v1/telemetry/ingest`. Verifies the system sustains ≥75 samples/sec at P99 < 200ms. |

---

## 4. Shared TypeScript (`shared/`)

These files are shared exclusively between the **frontend** and any TypeScript side-scripts. The Python backend does **not** import from here — it maintains its own Pydantic models in `backend/src/thronix/domain/`.

### `shared/types/`

| File | Purpose |
|------|---------|
| `telemetry.ts` | TypeScript interface for a single telemetry reading. Mirrors `domain/telemetry.py`. |
| `alerts.ts` | TypeScript interfaces for `Alert`, `TriggerCode`, `AlertSeverity`, `AlertState`. |
| `reference.ts` | TypeScript interfaces for `WellReferenceData`. |
| `index.ts` | Re-exports all types for convenient importing. |

### `shared/constants/`

| File | Purpose |
|------|---------|
| `thresholds.ts` | The TypeScript version of the engineering thresholds. **This file is the original source of truth** that was used to populate `domain/constants.py`. The two must be kept in sync manually. |
| `index.ts` | Re-exports all constants. |

---

## 5. Skills (AI Instructions) (`skills/`)

These `.md` files are not application code. They are **instruction files for AI agents** (like Antigravity/Copilot) that assist with development. When an AI works on a task in this project, it reads the relevant skill file first to understand architectural rules and coding standards.

| File | When to Use |
|------|------------|
| `python_fastapi.md` | **Backend coding** — FastAPI routes, Pydantic models, async patterns, structlog. |
| `python_pytest.md` | **Backend testing** — pytest, testcontainers, GWT pattern. |
| `redis_streams.md` | **Ingestion pipeline** — XADD, XREADGROUP, ACK patterns. |
| `redis.md` | **Redis state management** — well state cache, flood control, holdoff timers. |
| `signal_processing.md` | **Core algorithms** — Hampel, CUSUM, EWMA, MAD (pure Python). |
| `replay_harness.md` | **Validation gate** — streaming loader, pass criteria, adversarial cases. |
| `timescaledb.md` | **Database schema** — hypertable design, partitioning, indexing. |
| `turborepo.md` | **Frontend build pipeline only** — do not apply to Python backend. |
| `typescript-e2e-testing.md` | **Frontend E2E testing only**. |
| `unit_testing_ts.md` | **Frontend unit testing only**. |
| `kafka.md` | ⛔ **Deprecated** — Kafka is not used. Replaced by `redis_streams.md`. |
| `typescript_node.md` | ⛔ **Deprecated** — Node.js backend is replaced by Python. |

---

## 6. Data (`data/`)

> ⚠️ **All files under `data/raw/` are gitignored.** These are too large for Git (≈780 MB total gzip).

### `data/raw/` — Historical Telemetry Datasets

These are the labeled training/validation datasets used by the Replay Harness:

| File | Size | Profile | Contents |
|------|------|---------|----------|
| `uae_gcc_onshore_sour_1mo.csv.gz` | 135 MB gzip | UAE GCC Sour | 1 month, ~2.5M rows, sour H₂S gas fields |
| `africa_delta_onshore_1mo.csv.gz` | 180 MB gzip | Africa Delta | 1 month, ~3.1M rows, high-GOR Niger Delta wells |
| `gcc_heavyoil_steamflood_1mo.csv.gz` | 190 MB gzip | Heavy Oil Steamflood | 1 month, high-water-cut, high-temperature |
| `gcc_heavyoil_thermal_clean_1mo.csv.gz` | 48 MB gzip | Thermal Clean | Subset used for thermal SCP validation |
| `offshore_highgor_1mo.csv.gz` | 188 MB gzip | Offshore High-GOR | Offshore wells with elevated gas ratios |

### `data/reference/` — Well Commissioning Data

JSON files containing `WellReferenceData` for each field. Loaded by `scripts/seed_reference_data.py`.

| File | Contents |
|------|---------|
| `uae_wells.json` | Reference data for UAE sour field wells. |
| `africa_wells.json` | Reference data for Africa delta wells. |
| `heavyoil_wells.json` | Reference data for heavy oil steamflood wells. |
| `offshore_wells.json` | Reference data for offshore wells. |

---

## 7. Documentation (`docs/`)

These are the primary specification documents that define what the system must do.

| File | Contents |
|------|---------|
| `Field_Operations_Framework.pdf` | **The master specification.** Contains all 18 sections of the operational framework including H₂S protocols (§5), EEMUA 191 alarm budgets (§6), trigger definitions (§8–§12), prohibited behaviors (§14), and replay validation requirements (§18). |
| `Backend_PRD_Phase1_postNDA.pdf` | Phase 1 Backend Product Requirements Document. Describes the system architecture, API contracts, data models, and performance targets. |
| `Frontend_PRD.pdf` | Frontend Product Requirements Document. Describes the UI, dashboards, alert panels, and UX flows. |
| `THRONIX_Oil_and_Gas_Deck.pptx` | Business/pitch deck. Contains the product vision, market context, and high-level technical overview. |

---

## 8. Root Configuration Files

| File | Purpose |
|------|---------|
| `.gitignore` | Excludes: `data/raw/*.csv.gz`, `.env*` (except `.env.example`), Python artifacts (`__pycache__`, `.venv`, `.pytest_cache`, `*.pyc`), Node.js artifacts (`node_modules`, `.next`, `dist`), IDE files (`.vscode`, `.idea`), OS files (`.DS_Store`, `Thumbs.db`), `md-files/` folder, and `backend/alembic.ini`. |
| `SKILL.md` | The master AI routing file. Routes AI agents to the correct `skills/*.md` file based on the task domain. Contains a "Deprecated Skills" table listing skills that no longer apply to the backend. |
| `turbo.json` | Turborepo pipeline for the frontend. Tasks: `build` (depends on `^build`), `lint`, `test`. Does not manage the Python backend. |

---

## 9. End-to-End Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          EDGE DEVICE (Wellhead)                         │
│  Sensor → 39-channel JSON payload every 3 seconds                       │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ HTTP POST /api/v1/telemetry/ingest
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      FastAPI API Server (api/app.py)                    │
│  Validates JWT → Parses TelemetrySample → Publishes to Redis Stream     │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ XADD telemetry:raw
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                   Redis Stream ("telemetry:raw")                        │
│  Consumer Group: "ingestion-workers"   maxlen: 100,000                  │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ XREADGROUP
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│             Ingestion Worker (ingestion/worker.py)                      │
│  1. Deserialize JSON → TelemetrySample                                  │
│  2. Load WellContext from Redis cache                                   │
│  3. Call core.layer0.pipeline.process() → ValidatedSample              │
│     ├─ Hampel filter (spike rejection)                                  │
│     ├─ Range / slew rate / frozen / staleness checks                    │
│     └─ Proxy substitution (failed sensor replacement)                   │
│  4. Infer WellState (core.well_state.machine)                           │
│  5. Evaluate T1 triggers (h2s, esp, kick, integrity, theft)             │
│  6. Update Redis state cache (well state, degradation, baselines)       │
│  7. Write sample to TimescaleDB (storage/repositories/telemetry_repo)  │
│  8. If alerts fired: write to alerts table + PUBLISH to alerts:new     │
│  9. XACK (message permanently removed from pending list)                │
└──┬──────────────────────────────────────────────────┬────────────────────┘
   │                                                  │
   │ Every 4h (Celery Beat)                           │ PUBLISH alerts:new
   ▼                                                  ▼
┌──────────────────┐                     ┌─────────────────────────────────┐
│  Celery Worker   │                     │  FastAPI WebSocket Server       │
│  T2 Triggers:    │                     │  (api/websockets/realtime.py)   │
│  GOR, WCUT,      │                     │  SUBSCRIBE alerts:new           │
│  Hydrate, Sand,  │                     │  → Push JSON to browser clients │
│  Depletion       │                     └────────────────┬────────────────┘
│                  │                                      │
│  Every 24h:      │                                      │ WebSocket
│  T3 Triggers:    │                                      ▼
│  Decline,        │              ┌───────────────────────────────────────┐
│  ESP Trend       │              │        Next.js Frontend               │
│                  │              │  Live alert feed, well dashboard,     │
│  Every 1h:       │              │  sensor health panels, KPI charts     │
│  Baseline update │              └───────────────────────────────────────┘
└──────────────────┘
```

This completes the full Thronix repository guide. Every folder, every file, and the responsibility of every significant code component is documented above.
