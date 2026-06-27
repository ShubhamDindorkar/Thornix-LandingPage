---
name: replay_harness
description: "labeled dataset replay testing, precision/recall/lead-time measurement, pytest-based harness"
risk: safe
source: internal
date_added: "2026-06-24"
---

# Replay Harness Testing

You are an expert in **Testing & Validation**. Use this skill when building, extending, or debugging the Thronix replay/validation harness in `backend/tests/replay/`.

> ⚠️ **The replay harness is the #1 validation gate.** No trigger goes live without passing replay against all relevant labeled datasets. This is prescribed by Framework §18 Step 1.

---

## 🧠 Architecture

```
data/raw/*.csv.gz          (10.4M rows total, ~3.1 GB uncompressed)
        │
        ▼  loader.py (gzip CSV streamed row-by-row — never loaded into RAM)
TelemetrySample objects
        │
        ▼  harness.py (feeds through exact same core/ pipeline as production)
   core.layer0.pipeline.process()
   core.triggers.t1.*evaluate()
   core.triggers.t2.*evaluate()  (at 4h boundaries)
   core.triggers.t3.*evaluate()  (at 24h boundaries)
        │
        ▼  collector: list[FiredAlert]
        │
        ▼  scorer.py (compare vs ground_truth_event column)
   precision / recall / lead_time / false_alarm_rate per trigger per profile
        │
        ▼  reporter.py
   JSON + markdown table output
```

### Key Invariant
The harness calls the **exact same Python code** as production. There is no replay-specific logic in `core/`. This guarantees that replay results are valid predictors of production behavior.

---

## 🛠️ Instructions & Best Practices

### 1. Dataset Configurations
Each dataset has a `configs/*.py` that specifies:
- Path to the `.csv.gz` file
- Well reference data (commissioning params)
- Expected ground truth events
- Pass/fail thresholds per trigger

```python
# tests/replay/configs/uae.py
class UAEReplayConfig:
    dataset_path = Path("../data/raw/uae_gcc_onshore_sour_1mo.csv.gz")
    wells = ["WELL_101", "WELL_102", "WELL_103"]
    pass_criteria = {
        "T1-B": PassCriteria(recall=1.0, precision_min=0.90),  # H2S: zero misses
        "T1-D": PassCriteria(recall=0.90, precision_min=0.80), # ESP creep
        "T3-ESP": PassCriteria(recall=0.85, precision_min=0.75),
    }
```

### 2. Memory-Efficient Streaming
```python
# loader.py — NEVER use pandas.read_csv() — datasets are 500–825 MB uncompressed
import csv, gzip
from pathlib import Path

def stream_dataset(path: Path):
    with gzip.open(path, "rt", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            yield parse_row(row)  # yields TelemetrySample one at a time
```

### 3. Ground Truth Comparison
The `ground_truth_event` column is the labeled truth. Strip it before feeding to the trigger engine (it must never be visible to `core/`):

```python
def run_replay(dataset_path, config):
    fired_alerts = []
    ground_truth = []
    for sample in stream_dataset(dataset_path):
        gt = sample.ground_truth_event  # capture before stripping
        ground_truth.append((sample.timestamp, gt))
        sample_clean = sample.model_copy(update={"ground_truth_event": None})
        alerts = pipeline.process(sample_clean, well_ctx[sample.well_id])
        fired_alerts.extend(alerts)
    return scorer.score(fired_alerts, ground_truth)
```

### 4. Pass Criteria (Non-Negotiable)
| Trigger | Recall | Precision | Notes |
|---------|--------|-----------|-------|
| T1-B H₂S | **1.0** | ≥ 0.90 | Life-safety — zero misses ever |
| T1-A SCP | ≥ 0.90 | ≥ 0.85 | Thermal SCP must NOT false-alarm on WELL_401 |
| T1-C Kick | ≥ 0.90 | ≥ 0.80 | |
| T1-D ESP | ≥ 0.85 | ≥ 0.80 | |
| T1-E Theft | ≥ 0.90 | ≥ 0.85 | Pressure-only = advisory only, not executive |
| T2-A GOR | ≥ 0.85 | ≥ 0.80 | Must NOT flood a high-GOR baseline well |
| T2-B WCUT | ≥ 0.85 | ≥ 0.80 | Per-well limit, not fixed 70% |
| T3-ESP | ≥ 0.80 | ≥ 0.75 | 24h trend |

### 5. Adversarial Replay Tests
These must **block** (produce no executive alert) to pass:
- Thermal SCP on WELL_401 → must NOT fire `SCP_SUSPECT` (§14.27)
- WELL_403 temp at 418°F → must NOT be quarantined as SUSPECT (§14.26)
- Theft on WELL_201 pressure-only → must NOT be executive action (§14.23)
- H₂S with spoofed `SHUT_IN` state → must STILL fire (§14.5)

### 6. Anti-Patterns to Avoid
- ❌ **Loading full dataset into memory** (`pd.read_csv()`): Use the streaming `loader.py`.
- ❌ **Replay-specific code in `core/`**: The harness exercises unmodified production code.
- ❌ **Using `ground_truth_event` in trigger logic**: It must never reach `core/`.
- ❌ **Skipping replay because it's slow**: Use `pytest -m replay --timeout=600`. It must pass before any trigger is declared production-ready.
- ❌ **Partial dataset replay**: Always run the full 1-month window to catch edge cases near month boundaries.

## 📊 Quality Gates
- All 4 labeled datasets must pass before a trigger is merged.
- Replay results are committed to `tests/replay/reports/` as JSON for tracking regression.
- Lead time P50 should be ≥ 15 minutes before failure onset for T3-class triggers.
