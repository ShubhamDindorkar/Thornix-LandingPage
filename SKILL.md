# AI Core Directives & Skills Routing

**CRITICAL INSTRUCTION FOR THE AI**: You MUST read and follow the skills defined in the `skills/` directory when performing tasks in this repository.
Do not rely on generic knowledge. Apply the specific architectural standards, anti-patterns, and metrics defined in these files.

## 🌟 Universal Mandatory Skills
Regardless of the task domain, you MUST apply these core principles to all code you write, review, or debug:
- **[Clean Code](skills/cleancode.md)**: Uncle Bob's clean code principles.
- **[Code Debt & Cleanup](skills/code_debt.md)**: Identify and remediate tech debt.
- **[Refactoring](skills/refactor.md)**: Safe and systematic code refactoring.
- **[Bug Fixing](skills/bugs.md)**: Debugging and root-cause analysis patterns.
- **[CI/CD Pipelines](skills/ci_cd.md)**: Adherence to build and deployment gates.

## 🛡️ Security & Testing (Mandatory for all new features)
Before completing any implementation, refer to these to ensure safety and test coverage:
- **[Security Review](skills/security_review.md)**: General security review practices.
- **[Security Bounty Hunter](skills/security_bounty_hunter.md)**: Practical vulnerability discovery.

**Backend (Python) Testing:**
- **[Python pytest](skills/python_pytest.md)**: pytest, testcontainers, GWT pattern for the Python backend.
- **[Replay Harness Testing](skills/replay_harness.md)**: Labeled dataset precision/recall gate — mandatory before any trigger ships.
- **[Adversarial Testing](skills/adversarial_testing.md)**: Spoofed state, replay attacks, §14 prohibited behaviors.

**Frontend (TypeScript) Testing:**
- **[TypeScript E2E Testing](skills/typescript-e2e-testing.md)**: E2E and integration testing for Next.js frontend using Docker and Given-When-Then.
- **[TypeScript Unit Testing](skills/unit_testing_ts.md)**: Jest/Vitest patterns — **frontend only**.

---

## 🧭 Domain-Specific Routing

When working on a specific part of the system, **YOU MUST READ AND APPLY** the relevant domain skills:

### ⚙️ Backend — Python / FastAPI / SAFE CORE
When writing Python services, telemetry ingest, or working anywhere under `backend/`:
- **[Python + FastAPI](skills/python_fastapi.md)** ← Primary backend skill
- **[Redis Caching & State](skills/redis.md)**
- **[Redis Streams Ingestion Pipeline](skills/redis_streams.md)** ← Replaces Kafka
- **[TimescaleDB Architecture](skills/timescaledb.md)**

> ⚠️ **There is no Kafka, no Node.js backend, no TypeScript in `backend/`.** Do NOT reference `kafka.md` or `typescript_node.md` for backend work.

### 🧠 SAFE-CORE / Triggers
When writing algorithms or business logic for anomaly detection, alerting, or the Layer-0 pipeline:
- **[Signal Processing](skills/signal_processing.md)** ← Hampel, CUSUM, MAD, regression (pure Python)
- **[Finite State Machines](skills/state_machine.md)**
- **[Threshold Engine](skills/threshold_engine.md)**

### 💾 Data & Storage
When making schema migrations, backup logic, or raw SQL queries:
- **[PostgreSQL Base Patterns](skills/postgresql.md)**
- **[Data Schema Design](skills/data_schema_design.md)**
- **[S3 Object Storage](skills/s3_object_storage.md)**

### 🔐 Security & Access Control
When writing authentication, authorization, or encryption logic:
- **[Role-Based Access Control](skills/rbac.md)**
- **[Vault Secrets Management](skills/vault_secrets.md)**
- **[TLS Encryption](skills/tls_encryption.md)**
- **[Audit Logging](skills/audit_logging.md)**

### 🤖 AI Layers
When integrating LLMs or predictive models (Phase 1C stubs under `backend/src/thronix/ai/`):
- **[LLM API Integration](skills/llm_api_integration.md)**
- **[Prompt Engineering](skills/prompt_engineering.md)**
- **[Anomaly Detection](skills/anomaly_detection.md)**

### 🎨 Frontend
When working in Next.js, React components, UI styling, or forms (under `frontend/`):
- **[Next.js Architecture](skills/nextjs.md)**
- **[Tailwind CSS Styling](skills/tailwind.md)**
- **[WebSocket Client](skills/websocket_client.md)**
- **[React State Management](skills/react_state.md)**
- **[SEO & Meta Tags](skills/seo_meta.md)**
- **[Form Validation](skills/form_validation.md)**
- **[Webapp Local Testing](skills/webapp.md)**

### 🏗️ Infrastructure & DevOps
When modifying Terraform, Kubernetes manifests, or Dockerfiles:
- **[Terraform Provisioning](skills/terraform.md)**
- **[Kubernetes Manifests](skills/kubernetes.md)**
- **[Docker Containers](skills/docker.md)**
- **[Turborepo Workspace](skills/turborepo.md)** ← Frontend pipeline only

### 📊 Observability
When instrumenting code with metrics or logging:
- **[Structured Logging](skills/structured_logging.md)**
- **[Metrics & KPIs](skills/metrics.md)**
- **[Ops Alerting](skills/alerting_ops.md)**

---

## ⚠️ Deprecated Skills (Do Not Use for Backend)

The following skills applied to the **old TypeScript/Node.js/Kafka backend** which has been deleted and rebuilt in Python. Do **not** apply these to `backend/`:

| Deprecated Skill | Replacement |
|-----------------|------------|
| `typescript_node.md` | `python_fastapi.md` |
| `kafka.md` | `redis_streams.md` |
| `unit_testing_ts.md` | `python_pytest.md` (backend); keep for frontend |
| `typescript-e2e-testing.md` | `python_pytest.md` (backend); keep for frontend |

These files remain in `skills/` for frontend reference only.

---
**FINAL DIRECTIVE**: Do not start a task without first reading the corresponding skill file. If a user asks you to implement a trigger, read `signal_processing.md`, `python_fastapi.md`, `replay_harness.md`, and `python_pytest.md` first.
