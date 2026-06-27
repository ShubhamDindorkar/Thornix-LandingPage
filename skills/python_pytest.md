---
name: python_pytest
description: "pytest, testcontainers, Given-When-Then, backend integration tests for Python/FastAPI/TimescaleDB"
risk: safe
source: internal
date_added: "2026-06-24"
---

# Python Backend Testing (pytest)

You are an expert in **Testing & Validation**. Use this skill to write, review, and debug all Python tests in the Thronix backend: unit tests, integration tests, replay harness tests, and adversarial tests.

> ⚠️ This skill is for the **Python backend only**. For frontend (Next.js/TypeScript) testing, use `typescript-e2e-testing.md`.

## 🎯 When to Use
- Writing tests in `backend/tests/unit/`, `backend/tests/integration/`, `backend/tests/replay/`, or `backend/tests/adversarial/`.
- Reviewing PRs that touch test files (`test_*.py`).
- Debugging failing pytest runs.

---

## 🧠 Test Architecture

```
backend/tests/
├── unit/           # No infrastructure needed — pure Python, no mocking
│   ├── core/       # All core/ algorithms (Hampel, triggers, state machine)
│   └── domain/     # Pydantic model validation, constants sanity checks
├── integration/    # Real TimescaleDB + Redis via testcontainers
├── replay/         # Dataset-driven: streams CSV → core/ → score against ground truth
├── adversarial/    # Prohibited behavior tests (§14)
└── load/           # Locust load tests
```

### Key Design Principle
`core/` has zero infrastructure deps, so **unit tests require zero mocking**. Pass a `TelemetrySample` in, assert the output. No patching, no fakes.

---

## 🛠️ Instructions & Best Practices

### 1. Given-When-Then Pattern (Mandatory)
All tests MUST use the Given-When-Then structure as comments:

```python
def test_h2s_trigger_fires_at_20ppm():
    # GIVEN: A sample with H2S at the HIGH threshold
    sample = make_sample(h2s_ppm=20.1, well_state=WellState.FLOWING)
    ctx = make_well_context()

    # WHEN: The T1-B trigger evaluates
    alert = h2s_trigger.evaluate(sample, ctx)

    # THEN: A HIGH-priority alert is raised
    assert alert is not None
    assert alert.trigger_code == TriggerCode.H2S_AREA_SAFETY
    assert alert.severity == AlertSeverity.HIGH
```

### 2. Unit Test Fixtures
Use `conftest.py` fixtures. Never create test data inline in multiple tests.

```python
# tests/conftest.py
@pytest.fixture
def flowing_sample(sample_well_reference) -> TelemetrySample:
    return TelemetrySample(
        well_id="WELL_101",
        well_state=WellState.FLOWING,
        h2s_ppm=5.0,
        pressure_psi=2800.0,
        # ... all required fields with safe defaults
    )
```

### 3. Integration Tests with Testcontainers
```python
import pytest
from testcontainers.postgres import PostgresContainer

@pytest.fixture(scope="session")
def timescaledb():
    with PostgresContainer("timescale/timescaledb:latest-pg15") as pg:
        yield pg.get_connection_url()

@pytest.mark.integration
async def test_telemetry_insert(timescaledb):
    # GIVEN: A validated telemetry sample
    # WHEN: Inserted into TimescaleDB
    # THEN: Queryable by well_id + time range
```

### 4. Replay Test Pattern
```python
@pytest.mark.replay
def test_replay_uae_h2s_recall():
    # GIVEN: UAE dataset loaded
    dataset_path = Path("../data/raw/uae_gcc_onshore_sour_1mo.csv.gz")
    config = UAEReplayConfig()

    # WHEN: Full dataset replayed through core/
    results = run_replay(dataset_path, config)

    # THEN: All H2S excursions detected, none suppressed
    h2s_results = results.by_trigger("T1-B")
    assert h2s_results.recall == 1.0, "H2S recall must be 100% — no misses allowed"
    assert h2s_results.false_alarm_rate < 0.05
```

### 5. Adversarial Test Pattern
```python
@pytest.mark.adversarial
def test_h2s_never_suppressed_by_spoofed_state():
    """§14.5: H2S alert must fire even when well state is SHUT_IN (spoofed)."""
    # GIVEN: A spoofed SHUT_IN state with active H2S excursion
    sample = make_sample(h2s_ppm=55.0, well_state=WellState.SHUT_IN)

    # WHEN: The trigger evaluates
    alert = h2s_trigger.evaluate(sample, ctx)

    # THEN: Alert still fires — H2S is NEVER suppressed
    assert alert is not None
    assert alert.trigger_code == TriggerCode.H2S_AREA_SAFETY
```

### 6. Running Tests
```bash
# Unit tests only (fast, no infra)
pytest tests/unit/ -v

# Integration tests (spins up testcontainers)
pytest tests/integration/ -v -m integration

# Replay harness (slow — streams full datasets)
pytest tests/replay/ -v -m replay --timeout=600

# Adversarial tests
pytest tests/adversarial/ -v -m adversarial

# All tests, show slowest
pytest tests/ -v --durations=20
```

### 7. Anti-Patterns to Avoid
- ❌ **`unittest.mock.patch` in unit tests**: If you need to mock, the code has wrong layer separation.
- ❌ **`time.sleep()` in tests**: Use deterministic input data or testcontainers health checks.
- ❌ **Shared mutable state between tests**: Each test must be fully isolated.
- ❌ **Skipping replay tests locally**: Replay is the validation gate — run it.
- ❌ **`assert result` without message**: Use `assert result, "Explain what failed and why"`.

## 📊 Metrics & Quality Gates
- **Unit coverage**: ≥ 80% overall; **100% branch coverage** for all `core/triggers/` modules.
- **Replay recall for H2S**: Must be **1.0** (zero misses allowed — life-safety).
- **Replay precision for T1**: Must be ≥ 0.90 (false alarm budget).
- **Adversarial**: All 29 prohibited behaviors from §14 must be blocked.
