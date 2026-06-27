# PHASE-WISE-EXECUTION-PLAN.md — Thronix Backend Implementation Bible

> **Last Updated:** 2026-06-24
> **Authority:** This file governs the exact sequence of implementation for the Thronix backend. No phase begins until the previous phase's pass criteria are met. Every phase maps to specific PRD and Framework sections. Every prohibited behaviour (§14) is assigned to exactly one phase.
>
> **Prerequisites:**
> - Read [PLAN.md](PLAN.md) first — it contains locked architecture decisions, the tech stack rationale, and non-negotiable design rules.
> - Read [REPO.md](REPO.md) for the file-by-file breakdown of every module.
>
> **Source Documents:**
> - Backend PRD Phase 1 (`docs/Backend_PRD_Phase1_postNDA.pdf`) — referenced as **PRD §N**
> - Field Operations Framework (`docs/Field_Operations_Framework.pdf`) — referenced as **FW §N**
> - Plan (original specification) (`Plan`) — referenced as **Plan §N**

---

## Table of Contents

| Phase | Name | Status |
|-------|------|--------|
| 0 | [Scaffolding & Domain Models](#phase-0--scaffolding--domain-models) | ✅ COMPLETE |
| 1 | [Replay Harness & Layer-0 Validation](#phase-1--replay-harness--layer-0-validation) | 🔲 NOT STARTED |
| 2 | [Well-State Machine & Sensor Health](#phase-2--well-state-machine--sensor-health) | 🔲 NOT STARTED |
| 3 | [T1 Triggers — Life-Safety](#phase-3--t1-triggers--life-safety) | 🔲 NOT STARTED |
| 4 | [Alert Architecture](#phase-4--alert-architecture) | 🔲 NOT STARTED |
| 5 | [Degradation, Modes & Baselines](#phase-5--degradation-modes--baselines) | 🔲 NOT STARTED |
| 6 | [Storage Layer & Database](#phase-6--storage-layer--database) | 🔲 NOT STARTED |
| 7 | [Ingestion Worker](#phase-7--ingestion-worker) | 🔲 NOT STARTED |
| 8 | [API & WebSocket Layer](#phase-8--api--websocket-layer) | 🔲 NOT STARTED |
| 9 | [T2 Triggers — Process Limits](#phase-9--t2-triggers--process-limits) | 🔲 NOT STARTED |
| 10 | [T3 Triggers — Reservoir & Long-Term](#phase-10--t3-triggers--reservoir--long-term) | 🔲 NOT STARTED |
| 11 | [Celery Tasks & Scheduling](#phase-11--celery-tasks--scheduling) | 🔲 NOT STARTED |
| 12 | [Security, Audit & RBAC](#phase-12--security-audit--rbac) | 🔲 NOT STARTED |
| 13 | [Reporting & Observability](#phase-13--reporting--observability) | 🔲 NOT STARTED |
| 14 | [Integration Testing & Load Testing](#phase-14--integration-testing--load-testing) | 🔲 NOT STARTED |
| 15 | [Full Replay Validation & Acceptance](#phase-15--full-replay-validation--acceptance) | 🔲 NOT STARTED |

---

## Prohibited Behaviours Distribution (FW §14)

Every prohibited behaviour from FW §14 is assigned to exactly one phase. The test that verifies the prohibition is listed in that phase's Test Cases section.

| # | Prohibited Behaviour | Phase | Test File |
|---|---------------------|-------|-----------|
| PB-1 | H₂S alert suppressed by SHUT_IN state | 3 | `test_spoofed_state.py` |
| PB-2 | H₂S alert suppressed by STARTUP state | 3 | `test_spoofed_state.py` |
| PB-3 | H₂S alert suppressed by TESTING state | 3 | `test_spoofed_state.py` |
| PB-4 | H₂S alert suppressed by WORKOVER state | 3 | `test_spoofed_state.py` |
| PB-5 | H₂S alert suppressed by any operating mode (DEGRADED/SURVIVAL) | 3 | `test_spoofed_state.py` |
| PB-6 | H₂S threshold lowered per-well or per-profile | 3 | `test_h2s.py` |
| PB-7 | Frozen H₂S sensor (0.0 ppm ×15) silently passes as "no gas" | 2 | `test_frozen_value.py` |
| PB-8 | H₂S calibration age >30 days with no advisory | 3 | `test_h2s.py` |
| PB-9 | Duplicate timestamp sample re-fires an already-active alert | 4 | `test_replay_attack.py` |
| PB-10 | Theft alert with pressure-only evidence produces EXECUTIVE action | 3 | `test_theft_simulation.py` |
| PB-11 | Thermal SCP fires on WELL_401 (steamflood thermal expansion) | 3 | `test_prohibited_behaviors.py` |
| PB-12 | WELL_403 temperature (418°F) quarantined as range violation | 1 | `test_prohibited_behaviors.py` |
| PB-13 | T2 trigger evaluates during SHUT_IN (non-flowing) without flow data | 9 | `test_gor.py` |
| PB-14 | T3 trigger evaluates during SHUT_IN (non-flowing) without flow data | 10 | `test_decline.py` |
| PB-15 | Baseline poisoned by non-flowing data (SHUT_IN samples included) | 5 | `test_baseline_poisoning.py` |
| PB-16 | Alert cleared without mandatory closure code | 4 | `test_alert_lifecycle.py` |
| PB-17 | EEMUA T2 budget exceeded (>18 concurrent T2 alerts) | 4 | `test_flood_control.py` |
| PB-18 | EEMUA T3 budget exceeded (>35 concurrent T3 alerts) | 4 | `test_flood_control.py` |
| PB-19 | T1 life-safety alert blocked by flood control | 4 | `test_flood_control.py` |
| PB-20 | Suppression gate applied at state probability <0.85 | 2 | `test_trust.py` |
| PB-21 | Ring de-escalation within <5 minutes of escalation | 4 | `test_ring_escalation.py` |
| PB-22 | Baseline re-anchor without operator acknowledgment | 5 | `test_reanchor.py` |
| PB-23 | Confidence score labeled as "calibrated probability" | 5 | `test_confidence.py` |
| PB-24 | `core/` imports from `storage/`, `api/`, `tasks/`, or `ai/` | 14 | `test_import_firewall.py` |
| PB-25 | `ground_truth_event` read by live trigger code (not replay) | 1 | `test_ground_truth_isolation.py` |
| PB-26 | Slew rate check fires during registered state change window (30s) | 1 | `test_validation.py` |
| PB-27 | GOR CUSUM fires on a well whose baseline GOR is naturally >5000 | 9 | `test_gor.py` |
| PB-28 | Audit log entry modified after creation (append-only violated) | 12 | `test_audit_immutability.py` |
| PB-29 | WebSocket pushes alert to unauthenticated client | 8 | `test_websocket_auth.py` |

---

## Phase 0 — Scaffolding & Domain Models

**Status: ✅ COMPLETE**

### What This Phase Is

Deletes the old TypeScript backend and establishes the complete Python package structure. Every file is created with stubs. All domain models, enums, and constants are implemented in full. After this phase, the codebase imports cleanly and `pytest --collect-only` finds all test modules.

### PRD Coverage

- PRD §2.1 (Telemetry Contract — 39-channel model) — **fully implemented** in `domain/telemetry.py`
- PRD §2.2 (Well Reference Data) — **fully implemented** in `domain/reference.py`
- PRD §2.3 (Site Reference Data) — **fully implemented** in `domain/reference.py`
- FW §2 (Telemetry Channels) — **fully implemented**
- FW §3 (Validation Defaults) — **constants only** in `domain/constants.py`
- FW §4 (Well States) — **enums only** in `domain/enums.py`
- FW §5 (Alert Architecture) — **models only** in `domain/alerts.py`
- FW §6 (Trigger Codes) — **enums only** in `domain/alerts.py`
- FW §10 (Regional Profiles) — **enums only** in `domain/enums.py`
- FW §15 (Default Thresholds) — **fully implemented** in `domain/constants.py`

### Pass Criteria

- ✅ All `__init__.py` files exist. `import thronix` succeeds.
- ✅ `pytest --collect-only` discovers all test files without import errors.
- ✅ All domain models validate test data without exceptions.
- ✅ `docker compose config` validates without errors.
- ✅ All files pushed to `main`.

---

## Phase 1 — Replay Harness & Layer-0 Validation

### What This Phase Is

Builds the validation gate and the signal processing pipeline. The replay harness is the primary quality assurance mechanism for the entire project — every subsequent phase runs its output through this harness. Layer-0 is the first code that touches raw telemetry: it filters noise, rejects bad data, and classifies sensor health. Without this, no trigger can be trusted.

This phase comes first because: (a) FW §18 mandates replay as step 1, and (b) Layer-0 must exist before any trigger can evaluate.

### PRD Coverage

- PRD §18.1 (Replay harness — streaming loader) — **fully implemented**
- PRD §18.2 (Replay harness — scoring: precision, recall, lead-time) — **fully implemented**
- FW §3.1 (Validation: range, slew rate, frozen detection, staleness) — **fully implemented**
- FW §3.1 (Hampel despike filter: 5-sample median, MAD-based sigma) — **fully implemented**
- FW §3.2 (Quarantine & proxy substitution) — **fully implemented**
- FW §3.3 (Gap handling: interpolation thresholds at 30s/60s/300s) — **implemented** for safety interpolation limits
- FW §3.7 (Comms latency bands) — **constants only** (bands defined; comms-driven behaviour deferred to Phase 7)

### Objectives

1. Implement `tests/replay/loader.py` — streaming gzip CSV parser using `gzip.open()` + `csv.DictReader`. One row in memory at a time. Parse all 39 channels + `ground_truth_event`.
2. Implement `tests/replay/harness.py` — feed dataset rows through `core/layer0/pipeline.process()`. Collect results.
3. Implement `tests/replay/scorer.py` — compute per-trigger precision, recall, F1, and median lead-time by comparing fired alerts against `ground_truth_event` labels.
4. Implement `tests/replay/reporter.py` — output results as JSON + markdown table.
5. Implement `tests/replay/runner.py` — CLI entry point for running replays by profile.
6. Implement `core/layer0/pipeline.py` — orchestrate: raw sample → Hampel → validate (range, slew, frozen, stale) → proxy → produce `ValidatedSample`.
7. Finalize `core/layer0/hampel.py` — the 5-sample sliding-window Hampel outlier filter (already scaffolded with numpy).
8. Finalize `core/layer0/validation.py` — the four validation checks (already scaffolded).
9. Finalize `core/layer0/proxy.py` — quarantine and proxy substitution (already scaffolded).
10. Write unit tests for all Layer-0 functions.

### Files Touched

**New / implement from stubs:**
- `backend/tests/replay/loader.py` — implement `stream_dataset()`
- `backend/tests/replay/harness.py` — implement `ReplayHarness.run()`
- `backend/tests/replay/scorer.py` — implement `score()`
- `backend/tests/replay/reporter.py` — implement `format_results()`
- `backend/tests/replay/runner.py` — implement CLI
- `backend/tests/replay/configs/uae.py` — UAE replay config
- `backend/tests/replay/configs/africa.py` — Africa replay config
- `backend/tests/replay/configs/heavyoil.py` — Heavy Oil replay config
- `backend/tests/replay/configs/offshore.py` — Offshore replay config
- `backend/src/thronix/core/layer0/pipeline.py` — implement `process()`

**Modify / finalize:**
- `backend/src/thronix/core/layer0/hampel.py` — already has implementation; verify correctness
- `backend/src/thronix/core/layer0/validation.py` — already has implementation; verify correctness
- `backend/src/thronix/core/layer0/proxy.py` — already has implementation; verify correctness

**Test files:**
- `backend/tests/unit/core/test_hampel.py` — implement
- `backend/tests/unit/core/test_validation.py` — implement
- `backend/tests/replay/test_replay_uae.py` — implement
- `backend/tests/replay/test_replay_africa.py` — implement
- `backend/tests/replay/test_replay_heavyoil.py` — implement
- `backend/tests/replay/test_replay_offshore.py` — implement

### Dependencies

- Phase 0 complete (all domain models, enums, constants exist)
- Datasets present in `data/raw/` (all 5 `.csv.gz` files)
- Reference data present in `data/reference/` (all 4 `.json` files)

### Implementation Notes

**Hampel filter math (FW §3.1):**
```
buffer = last W values (W = HAMPEL_WINDOW_SIZE = 5)
median = median(buffer ∪ {new_value})
MAD = median(|buffer ∪ {new_value} - median|)
sigma = MAD × 1.4826  (consistency constant for normal distribution)
if |new_value - median| > threshold_sigma × sigma → outlier → replace with median
```
The current implementation in `hampel.py` uses numpy. This is acceptable for Layer-0 (numpy is in `pyproject.toml` dependencies). The `threshold_sigma` default is 3.0 per FW §3.1.

**Slew rate suspension (FW §3.1):** Slew rate checks must be suspended for `SLEW_SUSPENSION_WINDOW_S = 30` seconds after a registered state change (e.g., SHUT_IN → FLOWING transition causes a pressure spike that is not a sensor fault). The pipeline must track `last_state_change_time` per well.

**Frozen value (FW §3.1):** `FROZEN_SAMPLE_THRESHOLD = 15` consecutive identical values → sensor classified as `FAILED`. This applies to ALL channels including H₂S — a frozen H₂S reading of 0.0 is not "no gas" but a dead sensor (PB-7, verified in Phase 2).

**Proxy substitution (FW §3.2):** When a channel is quarantined (range/slew failure), the proxy module substitutes the last known valid value. For H₂S, proxy substitution is NOT permitted — a quarantined H₂S channel must surface as a sensor health alert, not be silently proxied.

**Ground truth isolation:** The `ground_truth_event` column must NEVER be read by any module in `core/`. Only `tests/replay/scorer.py` reads it. This is PB-25.

**WELL_403 temperature exception (PB-12):** The `gcc_heavyoil` profile raises the instrument span for `wellhead_temp_f` to `(0, 600)`. When running the heavy oil replay, WELL_403's 418°F reading must pass range validation, not be quarantined.

**Constraint: `core/` import firewall.** All Layer-0 code lives in `core/layer0/`. It must not import from `storage/`, `api/`, `tasks/`, or `ai/`.

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_hampel.py` | `test_passthrough_normal` | Clean signal passes through unmodified |
| `test_hampel.py` | `test_spike_rejected` | A 10× outlier spike is replaced with median |
| `test_hampel.py` | `test_mad_calculation` | MAD computed correctly for a known distribution |
| `test_hampel.py` | `test_identical_values_no_false_spike` | Buffer of identical values does not flag as spike (sigma=0 guard) |
| `test_validation.py` | `test_range_pass` | Value within instrument span passes |
| `test_validation.py` | `test_range_fail` | Value outside instrument span fails with reason |
| `test_validation.py` | `test_slew_pass` | Normal rate of change passes |
| `test_validation.py` | `test_slew_fail` | Excessive rate of change fails |
| `test_validation.py` | `test_slew_suspended_during_state_change` | Slew check does not fire within 30s of state change (**PB-26**) |
| `test_validation.py` | `test_frozen_detected` | 15 identical values → FAILED |
| `test_validation.py` | `test_frozen_not_triggered_below_threshold` | 14 identical values → still VALID |
| `test_validation.py` | `test_staleness_detected` | No new sample for >2× rolling median → STALE |
| `test_validation.py` | `test_well_403_not_quarantined` | 418°F passes range check with raised span (**PB-12**) |
| `test_replay_uae.py` | `test_replay_uae_runs` | UAE dataset streams completely without crash; Layer-0 produces ValidatedSamples |
| `test_replay_heavyoil.py` | `test_well_403_passes_range` | WELL_403 temperature not quarantined during replay (**PB-12 replay**) |
| — | `test_ground_truth_isolation` | `grep` for `ground_truth_event` in `core/` returns zero hits (**PB-25**) |

### Pass Criteria

1. `pytest tests/unit/core/test_hampel.py tests/unit/core/test_validation.py -v` — all pass.
2. `pytest tests/replay/test_replay_uae.py -v` — UAE dataset streams start-to-finish without OOM or crash. All rows produce a `ValidatedSample`.
3. WELL_403 (418°F) in the heavy oil dataset passes range validation — zero quarantine flags for `wellhead_temp_f`.
4. No `import` from `storage`, `api`, `tasks`, or `ai` exists in any file under `core/`.
5. `ground_truth_event` is never referenced in any file under `core/`.

### What Must Not Be Built Here

- Trigger evaluation logic (Phase 3, 9, 10)
- Well-state machine (Phase 2)
- Sensor health classification beyond what Layer-0 validation produces (Phase 2)
- Database writes (Phase 6)
- Ingestion worker (Phase 7)

---

## Phase 2 — Well-State Machine & Sensor Health

### What This Phase Is

Implements the well-state inference engine and the sensor health classifier. Well state is critical because it gates trigger suppression — T2/T3 triggers only run on flowing wells, and certain T1 triggers are suppressed during STARTUP. Sensor health classification determines whether a channel's data can be trusted.

### PRD Coverage

- FW §4.1 (Well-state machine: 7 states, transitions) — **fully implemented**
- FW §4.2 (State probability fusion: signed 0.6, unsigned 0.2, inferred 0.2) — **fully implemented**
- FW §4.3 (Suppression gating: probability ≥0.85 + physics signature required) — **fully implemented**
- FW §3.6 (Sensor health classification: VERIFIED/PLAUSIBLE/DRIFT_SUSPECT/SUSPECT/FAILED/GHOST/INTERPOLATED) — **fully implemented**
- FW §3.2 (H₂S sensor honesty check) — **fully implemented**

### Objectives

1. Implement `core/well_state/machine.py` — 7-state FSM (FLOWING, SHUT_IN, STARTUP, RAMPING, TESTING, WORKOVER, UNKNOWN). Infer state from pressure, choke position, and flow rates. UNKNOWN defaults to FLOWING behaviour (fail-armed).
2. Implement `core/well_state/trust.py` — state probability fusion using weighted vote: SIGNED (0.6), UNSIGNED (0.2), INFERRED (0.2). Visual corroborator bonus (+0.1).
3. Implement `core/well_state/suppression.py` — suppression gating. A trigger may be suppressed ONLY if state probability ≥ 0.85. H₂S alerts are NEVER suppressed (carve-out hardcoded).
4. Implement `core/sensor_health/classifier.py` — classify each channel as one of the 7 health classes based on Layer-0 outputs (range violations, frozen count, slew violations, source agreement).
5. Implement `core/sensor_health/h2s_honesty.py` — special check for H₂S: cross-validate against temperature, atmospheric pressure, calibration age. Flag if calibration age > 30 days (`H2S_CALIBRATION_INTERVAL_DAYS`).

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/core/well_state/machine.py`
- `backend/src/thronix/core/well_state/trust.py`
- `backend/src/thronix/core/well_state/suppression.py`
- `backend/src/thronix/core/sensor_health/classifier.py`
- `backend/src/thronix/core/sensor_health/h2s_honesty.py`

**Test files:**
- `backend/tests/unit/core/test_well_state_machine.py`
- `backend/tests/unit/core/test_trust.py`
- `backend/tests/adversarial/test_frozen_value.py`

### Dependencies

- Phase 1 complete (Layer-0 pipeline produces `ValidatedSample`)
- `domain/constants.py` — state thresholds, H₂S calibration intervals

### Implementation Notes

**State probability fusion (FW §4.2):**
```
P(state) = w_signed × v_signed + w_unsigned × v_unsigned + w_inferred × v_inferred + bonus_visual
where:
  w_signed = 0.6 (STATE_CRYPTO_WEIGHT)
  w_unsigned = 0.2 (STATE_OPERATOR_WEIGHT)
  w_inferred = 0.2 (STATE_PHYSICS_WEIGHT)
  bonus_visual = 0.1 if visual corroborator present (STATE_VISUAL_CORROBORATOR_BONUS)
```

**Suppression gating (FW §4.3):** Suppression requires P(state) ≥ 0.85 AND a supporting physics signature. If either condition fails, the trigger runs unsuppressed. H₂S is exempt from this check entirely.

**UNKNOWN state defaults to FLOWING (fail-armed):** If the state machine cannot determine the state, all triggers run as if the well is flowing. This is the safe default.

**Startup grace period (FW §4):** `STATE_STARTUP_GRACE_MINUTES = 60`. During the first 60 minutes after a STARTUP transition, T2/T3 trigger margins are widened. T1 still fires normally.

**Frozen H₂S (PB-7):** A frozen H₂S sensor (value unchanged for ≥15 samples, including 0.0) must be classified as `FAILED` by the sensor health classifier, and must trigger a `SENSOR_DEGRADED` advisory. This prevents the dangerous case where a failed sensor reads 0.0 and the system interprets it as "no gas."

**Constraint: `core/` import firewall.** All well-state and sensor health code is in `core/`. No imports from `storage/`, `api/`, `tasks/`, or `ai/`.

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_well_state_machine.py` | `test_flowing_from_pressure_choke` | High pressure + open choke = FLOWING |
| `test_well_state_machine.py` | `test_shut_in_from_closed_choke` | Zero flow + closed choke = SHUT_IN |
| `test_well_state_machine.py` | `test_unknown_defaults_to_flowing` | UNKNOWN state runs fail-armed (as FLOWING) |
| `test_well_state_machine.py` | `test_startup_grace_period` | STARTUP → FLOWING within 60 minutes |
| `test_trust.py` | `test_signed_state_high_probability` | SIGNED source achieves P ≥ 0.6 |
| `test_trust.py` | `test_inferred_only_low_probability` | INFERRED-only achieves P = 0.2 |
| `test_trust.py` | `test_suppression_requires_085` | Trigger runs if P < 0.85 (**PB-20**) |
| `test_trust.py` | `test_h2s_never_suppressed` | H₂S trigger fires even at P = 1.0 (SHUT_IN confirmed) |
| `test_frozen_value.py` | `test_frozen_h2s_classified_failed` | H₂S frozen at 0.0 ×15 → FAILED classification (**PB-7**) |
| `test_frozen_value.py` | `test_frozen_h2s_generates_advisory` | FAILED H₂S sensor → SENSOR_DEGRADED advisory |

### Pass Criteria

1. `pytest tests/unit/core/test_well_state_machine.py tests/unit/core/test_trust.py -v` — all pass.
2. `pytest tests/adversarial/test_frozen_value.py -v` — frozen H₂S at 0.0 classified as FAILED (PB-7).
3. Suppression gating at P < 0.85 confirmed to let triggers through (PB-20).
4. No imports from infrastructure packages in any file under `core/`.

### What Must Not Be Built Here

- Trigger evaluation logic (Phase 3)
- Database persistence of well state (Phase 6)
- Redis well-state cache (Phase 7)

---

## Phase 3 — T1 Triggers — Life-Safety

### What This Phase Is

Implements the five life-safety triggers that run at sample rate (every 3 seconds). These are the most critical triggers in the system — they detect H₂S gas leaks, well kicks, blowouts, ESP failures, and line theft. This phase is where the majority of the prohibited behaviours are verified.

### PRD Coverage

- FW §6.2 (T1-B: H₂S area safety — HIGH/HIGH-HIGH/RAPID/IDLH/CHANGE + 2-of-3 voting + change detection TWA) — **fully implemented**
- FW §6.3 (T1-A: Well integrity — WHP high/low-low, SCP suspect/confirmed, thermal compensation) — **fully implemented**
- FW §6.4 (T1-C: Kick precursor — influx rate, leak rate, regression window, confirmation window) — **fully implemented**
- FW §6.5 (T1-D: ESP failure — vibration creep/alert, VSD underload/overload, drive fault, gas-lock, pump-off) — **fully implemented**
- FW §6.6 (T1-E: Theft — pressure step, custody mismatch, dual-arm logic, advisory vs executive) — **fully implemented**
- FW §5.3 (Gas response tiers: shelter → local muster → full muster/ESD → full emergency) — **gas_response.py implemented**

### Objectives

1. Implement `core/triggers/base.py` — `TriggerBase` abstract class with `code`, `tier`, `is_armed()`, `evaluate()` (already scaffolded).
2. Implement `core/triggers/registry.py` — `TriggerRegistry` mapping `TriggerCode` → `TriggerBase` instance.
3. Implement `core/triggers/t1/h2s.py` — all H₂S sub-triggers:
   - HIGH (≥20 ppm on any single head)
   - HIGH-HIGH (≥50 ppm on 2-of-3 vote)
   - RAPID (≥65 ppm or rate ≥5 ppm/s)
   - IDLH (≥100 ppm on any single head, sustained ≥5s → ESD)
   - CHANGE (15-min TWA delta ≥5 ppm on sweet wells)
4. Implement `core/triggers/t1/integrity.py` — WHP HIGH (+15%), WHP LOW-LOW (-20%), SCP SUSPECT, SCP CONFIRMED. Thermal compensation for steamflood wells.
5. Implement `core/triggers/t1/kick.py` — influx rate (50 psi/min), leak rate (100 psi/min), 30s regression window, 60s confirmation.
6. Implement `core/triggers/t1/esp.py` — vibration creep (+30% held 6h), vibration alert (+100%), VSD underload (<70% FLA held 60s), VSD overload (>110% FLA held 30s), drive fault (Δf >2 Hz), gas-lock (amps σ >15A), pump-off (flow <60% at normal amps).
7. Implement `core/triggers/t1/theft.py` — pressure step (≥10% of line pressure within 120s, persisted 120s), custody mismatch (≥5%). Dual-arm: pressure-only → ADVISORY; pressure + custody → EXECUTIVE.
8. Implement `core/alerts/gas_response.py` — H₂S-specific tiered response (shelter, muster, ESD).
9. Write unit tests for each trigger.
10. Write adversarial tests.

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/core/triggers/base.py` — already has good scaffolding; finalize chatter guard
- `backend/src/thronix/core/triggers/registry.py`
- `backend/src/thronix/core/triggers/t1/h2s.py`
- `backend/src/thronix/core/triggers/t1/integrity.py`
- `backend/src/thronix/core/triggers/t1/esp.py`
- `backend/src/thronix/core/triggers/t1/kick.py`
- `backend/src/thronix/core/triggers/t1/theft.py`
- `backend/src/thronix/core/alerts/gas_response.py`

**Test files:**
- `backend/tests/unit/core/triggers/test_h2s.py`
- `backend/tests/unit/core/triggers/test_integrity.py`
- `backend/tests/unit/core/triggers/test_kick.py`
- `backend/tests/unit/core/triggers/test_esp.py`
- `backend/tests/unit/core/triggers/test_theft.py`
- `backend/tests/adversarial/test_spoofed_state.py`
- `backend/tests/adversarial/test_theft_simulation.py`
- `backend/tests/adversarial/test_prohibited_behaviors.py`

### Dependencies

- Phase 1 complete (Layer-0 produces `ValidatedSample`)
- Phase 2 complete (well-state machine determines suppression gating)
- `domain/constants.py` — all T1 thresholds
- `domain/reference.py` — `WellReferenceData` for per-well limits (MAWP, MAASP, FLA, etc.)

### Implementation Notes

**H₂S 2-of-3 voting (FW §6.2):** Three H₂S sensor heads (`h2s_ppm`, `h2s_ppm_b`, `h2s_ppm_c`). For HIGH-HIGH (50 ppm), at least 2 of 3 must exceed the threshold. For IDLH, any single head ≥100 ppm sustained ≥5s triggers ESD.

**H₂S change detection TWA (FW §6.2):** Compute a 15-minute Time-Weighted Average. If the TWA increases by ≥5 ppm (`H2S_CHANGE_DETECTION_DELTA_PPM`) on a sweet well (baseline <10 ppm), fire `T1-B_H2S_CHANGE`.

**H₂S calibration check (FW §6.2):** If `h2s_cal_age_days > H2S_CALIBRATION_INTERVAL_DAYS (30)`, add a degradation note. In extreme heat (`ambient_temp_f > 120°F`), use `H2S_CALIBRATION_INTERVAL_EXTREME_HEAT_DAYS (14)`.

**Thermal SCP compensation (FW §6.3, PB-11):** On wells with `regional_profile = GCC_HEAVYOIL`, the SCP threshold is widened by a temperature-dependent factor. `WELL_401`'s casing pressure elevation due to steam injection must NOT fire SCP_SUSPECT.

**SCP seeding margin (FW §6.3):** When well reference data has <24h of history, add `SCP_SEEDED_WIDER_MARGIN (10%)` to the threshold.

**Theft dual-arm (FW §6.6, PB-10):** Arm 1 (pressure step): ≥10% of line pressure within 120s, sustained 120s. Arm 2 (custody mismatch): ≥5% discrepancy. Pressure-only → `T1-E_THEFT_ADVISORY`. Both arms → `T1-E_THEFT_EXECUTIVE`.

**ESP post-workover (FW §6.5):** Within 30 days of workover, ESP vibration thresholds are widened by +50% to allow for break-in period.

**Chatter guard (base.py):** Each trigger has a holdoff timer. If a trigger fires, it cannot re-fire the same code within its cooldown window. The holdoff is tracked per `(well_id, trigger_code)`.

**Constraint: `core/` import firewall.** All trigger code is in `core/triggers/`. No imports from infrastructure packages.

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_h2s.py` | `test_high_20ppm` | Single head ≥20 ppm → T1-B_H2S_HIGH |
| `test_h2s.py` | `test_high_high_2of3` | 2-of-3 heads ≥50 ppm → T1-B_H2S_HIGH_HIGH |
| `test_h2s.py` | `test_rapid_65ppm` | Any head ≥65 ppm → T1-B_H2S_RAPID |
| `test_h2s.py` | `test_idlh_100ppm_esd` | Any head ≥100 ppm sustained 5s → T1-B_H2S_IDLH + ESD |
| `test_h2s.py` | `test_change_detection_twa` | 15-min TWA delta ≥5 ppm on sweet well → T1-B_H2S_CHANGE |
| `test_h2s.py` | `test_h2s_thresholds_never_lowered` | No per-well config can reduce HIGH/HIGH-HIGH/RAPID/IDLH (**PB-6**) |
| `test_h2s.py` | `test_h2s_cal_age_advisory` | cal_age > 30 days → degradation note (**PB-8**) |
| `test_integrity.py` | `test_whp_high` | Pressure +15% above anchored → T1-A_WHP_HIGH |
| `test_integrity.py` | `test_scp_suspect` | Persistent casing pressure → T1-A_SCP_SUSPECT |
| `test_integrity.py` | `test_thermal_scp_well_401` | WELL_401 steamflood → SCP NOT fired (**PB-11**) |
| `test_kick.py` | `test_influx_rate` | Pressure rise ≥50 psi/min → T1-C_KICK_INFLUX |
| `test_kick.py` | `test_confirmation_window` | Alert requires 60s confirmation |
| `test_esp.py` | `test_vib_creep_30pct` | +30% vibration held 6h → T1-D_ESP_VIB_CREEP |
| `test_esp.py` | `test_gaslock` | Amps σ >15A → T1-D_ESP_GASLOCK |
| `test_esp.py` | `test_pumpoff` | Flow <60% at normal amps → T1-D_ESP_PUMPOFF |
| `test_theft.py` | `test_pressure_only_advisory` | Pressure-only evidence → ADVISORY severity (**PB-10**) |
| `test_theft.py` | `test_dual_arm_executive` | Pressure + custody → EXECUTIVE |
| `test_spoofed_state.py` | `test_h2s_fires_in_shut_in` | H₂S fires when well_state = SHUT_IN (**PB-1**) |
| `test_spoofed_state.py` | `test_h2s_fires_in_startup` | H₂S fires when well_state = STARTUP (**PB-2**) |
| `test_spoofed_state.py` | `test_h2s_fires_in_testing` | H₂S fires when well_state = TESTING (**PB-3**) |
| `test_spoofed_state.py` | `test_h2s_fires_in_workover` | H₂S fires when well_state = WORKOVER (**PB-4**) |
| `test_spoofed_state.py` | `test_h2s_fires_in_survival_mode` | H₂S fires when mode = SURVIVAL (**PB-5**) |
| `test_prohibited_behaviors.py` | `test_well_401_thermal_scp` | WELL_401 thermal SCP does NOT fire (**PB-11**) |
| `test_theft_simulation.py` | `test_pressure_only_not_executive` | Pressure-only theft → not executive (**PB-10**) |

### Pass Criteria

1. `pytest tests/unit/core/triggers/ -v` — all 11 trigger test files pass.
2. `pytest tests/adversarial/test_spoofed_state.py -v` — H₂S fires under all 5 spoofed conditions (PB-1 through PB-5).
3. `pytest tests/adversarial/test_theft_simulation.py -v` — pressure-only theft = ADVISORY (PB-10).
4. `pytest tests/adversarial/test_prohibited_behaviors.py -v` — WELL_401 thermal SCP not fired (PB-11).
5. Replay harness with T1 triggers active on UAE dataset: H₂S recall = **1.0** (every labeled `H2S_EXCURSION` event detected).
6. No imports from infrastructure packages in `core/`.

### What Must Not Be Built Here

- Alert deduplication/lifecycle (Phase 4)
- Flood control (Phase 4)
- T2/T3 triggers (Phase 9, 10)
- Database persistence (Phase 6)

---

## Phase 4 — Alert Architecture

### What This Phase Is

Implements the full alert lifecycle: creation, deduplication, grouping, flood control (EEMUA 191), ring escalation, and the state machine (OPEN → ACKNOWLEDGED → SUPPRESSED → ESCALATED → CLEARED). Without this, triggers fire raw results but have no lifecycle management.

### PRD Coverage

- FW §5.1 (Alert creation with full context snapshot) — **fully implemented**
- FW §5.2 (EEMUA 191 budgets: T2 ≤18, T3 ≤35, T1 exempt) — **fully implemented**
- FW §5.3 (Gas response tiers — completed in Phase 3, integrated here)
- FW §5.4 (Chatter guard, deadband at 3% of span) — **fully implemented**
- FW §5.5 (Alert grouping: same-well + trigger + 60s window) — **fully implemented**
- FW §10.2 (Ring escalation: well → cluster → field) — **fully implemented**
- FW §11 (Alert context capture: 13 fields at fire time) — **fully implemented**

### Objectives

1. Implement `core/alerts/engine.py` — alert creation with deduplication (don't re-fire if same code is already OPEN for this well), severity escalation, state machine transitions.
2. Implement `core/alerts/flood_control.py` — EEMUA 191 budget enforcement. Count active alerts per tier. Block T2 if >18 concurrent, T3 if >35. T1 is EXEMPT.
3. Implement `core/alerts/grouping.py` — group alerts from the same well within `ALERT_GROUPING_WINDOW_S (60s)` into a compound alert.
4. Implement `core/alerts/ring_escalation.py` — if alert not ACK'd within response time, escalate to supervisory ring. De-escalation hold: `RING_DEESCALATION_HOLD_MINUTES (5)`.
5. Mandate closure code on alert clearing.

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/core/alerts/engine.py`
- `backend/src/thronix/core/alerts/flood_control.py`
- `backend/src/thronix/core/alerts/grouping.py`
- `backend/src/thronix/core/alerts/ring_escalation.py`

**Test files:**
- `backend/tests/unit/core/test_flood_control.py`
- `backend/tests/adversarial/test_replay_attack.py`

### Dependencies

- Phase 3 complete (T1 triggers produce `TriggerResult`)
- `domain/alerts.py` — `Alert`, `AlertState`, `ClosureCode`
- `domain/constants.py` — `ALERT_BUDGET_T2_MAX`, `ALERT_BUDGET_T3_MAX`, etc.

### Implementation Notes

**Deduplication (FW §5.1):** Before creating a new alert, check if an alert with the same `(well_id, trigger_code)` is already in state OPEN or ACKNOWLEDGED. If so, update the existing alert's severity if the new evaluation produces a higher severity.

**Flood control (FW §5.2):** Track counts per tier. The count is the number of alerts in state OPEN or ACKNOWLEDGED (not CLEARED or SUPPRESSED).
- T2 max concurrent: 18 → new T2 alert is suppressed (logged but not surfaced)
- T3 max concurrent: 35 → same
- T1 is NEVER blocked by flood control (**PB-19**)
- First 10 minutes of incident: max 10 alerts total (**ALERT_FLOOD_FIRST_10_MIN_CAP**)
- Steady state: ≤1 alert per 10 minutes (**ALERT_STEADY_STATE_TARGET_PER_10_MIN**)
- Max per operator: 20 (**ALERT_OPERATOR_MAX_ACTIVE**)

**Deadband (FW §5.4):** 3% of instrument span. A value must return to within (threshold - deadband) before the alert can re-fire. This prevents chatter at the threshold boundary.

**Closure code (PB-16):** When transitioning an alert to CLEARED, a `ClosureCode` is mandatory: `TRUE_POSITIVE`, `FALSE_POSITIVE_SENSOR`, `FALSE_POSITIVE_PROCESS`, `FALSE_POSITIVE_WEATHER`, `NUISANCE`, `INDETERMINATE`.

**Replay attack (PB-9):** If a sample with a duplicate timestamp is received for a well that already has an active alert for the same trigger code, the system must NOT create a second alert.

**Ring de-escalation hold (PB-21):** Once an alert is escalated, it cannot be de-escalated for at least 5 minutes. This prevents oscillation.

**Constraint: `core/` import firewall.** Alert engine is in `core/alerts/`. No infrastructure imports.

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_flood_control.py` | `test_t2_budget_18` | 19th concurrent T2 alert is suppressed (**PB-17**) |
| `test_flood_control.py` | `test_t3_budget_35` | 36th concurrent T3 alert is suppressed (**PB-18**) |
| `test_flood_control.py` | `test_t1_exempt_from_flood` | T1 alert fires even when budgets exceeded (**PB-19**) |
| `test_flood_control.py` | `test_first_10_min_cap` | >10 alerts in first 10 min → excess suppressed |
| `test_flood_control.py` | `test_deadband_prevents_chatter` | Alert at threshold → clear → below deadband → re-arm |
| `test_replay_attack.py` | `test_duplicate_timestamp_no_double_fire` | Duplicate sample does not create second alert (**PB-9**) |
| `test_alert_lifecycle.py` | `test_mandatory_closure_code` | Alert cannot move to CLEARED without ClosureCode (**PB-16**) |
| `test_ring_escalation.py` | `test_deescalation_hold_5min` | De-escalation blocked within 5 minutes (**PB-21**) |

### Pass Criteria

1. `pytest tests/unit/core/test_flood_control.py -v` — all pass including EEMUA budget tests.
2. `pytest tests/adversarial/test_replay_attack.py -v` — duplicate timestamp does not double-fire (PB-9).
3. T1 alerts confirmed exempt from flood control (PB-19).
4. Closure code mandatory for CLEARED transition (PB-16).
5. No imports from infrastructure packages in `core/`.

### What Must Not Be Built Here

- Database persistence of alerts (Phase 6)
- REST API for alert management (Phase 8)
- WebSocket alert push (Phase 8)

---

## Phase 5 — Degradation, Modes & Baselines

### What This Phase Is

Implements the degradation scoring system, operating mode determination, and the baseline management framework. Degradation scores drive mode transitions (VERIFIED → DEGRADED → SURVIVAL), which in turn affect trigger margins. Baselines are the per-well, per-channel reference values that triggers compare against.

### PRD Coverage

- FW §3.4 (Degradation score: 0–100 normalized) — **fully implemented**
- FW §3.5 (Operating modes: VERIFIED 0–33, DEGRADED 34–66, SURVIVAL 67–100) — **fully implemented**
- FW §3.5 (Mode hysteresis: 5 points, 15-minute hold) — **fully implemented**
- FW §3.5 (DEGRADED mode widens T2/T3 margins by ~15%) — **fully implemented**
- FW §7.1 (Anchored baselines: engineering-signed, never auto-updated) — **fully implemented**
- FW §7.2 (Rolling baselines: 24h flowing median) — **fully implemented**
- FW §7.3 (Intermediate baselines: 90-day flowing median) — **fully implemented**
- FW §7.4 (Re-anchor protocol: requires operator acknowledgment) — **fully implemented**
- FW §7.5 (Baseline staleness: warning at 365 days, confidence drop at 540 days) — **fully implemented**
- FW §8 (Coarse confidence: HIGH/MEDIUM/LOW — never "calibrated probability") — **fully implemented**
- FW §12 (Simplification governor: FULL → SIMPLIFIED-1 → SAFE-CORE) — **fully implemented**

### Objectives

1. Implement `core/degradation/score.py` — compute 0–100 score from active alert counts, severities, and durations.
2. Implement `core/degradation/modes.py` — VERIFIED (0–33), DEGRADED (34–66), SURVIVAL (67–100) with hysteresis (+5 points, 15-min hold before upgrade).
3. Implement `core/degradation/simplification.py` — governor logic: FULL → SIMPLIFIED-1 (drop lowest-priority items when decision items >25) → SAFE-CORE (T1 only).
4. Implement `core/baselines/anchored.py` — engineering-signed baselines, immutable after commissioning.
5. Implement `core/baselines/rolling.py` — 24h flowing-only median. Uses Median Absolute Deviation (MAD) for robust sigma: `σ_MAD = 1.4826 × MAD`.
6. Implement `core/baselines/intermediate.py` — 90-day flowing-only median.
7. Implement `core/baselines/reanchor.py` — re-anchor protocol requiring operator acknowledgment. Track baseline staleness.
8. Implement `core/confidence.py` — coarse confidence computation (HIGH/MEDIUM/LOW) based on sensor health and margin distance. NEVER label as "calibrated probability."

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/core/degradation/score.py`
- `backend/src/thronix/core/degradation/modes.py`
- `backend/src/thronix/core/degradation/simplification.py`
- `backend/src/thronix/core/baselines/anchored.py`
- `backend/src/thronix/core/baselines/rolling.py`
- `backend/src/thronix/core/baselines/intermediate.py`
- `backend/src/thronix/core/baselines/reanchor.py`
- `backend/src/thronix/core/confidence.py`

**Test files:**
- `backend/tests/unit/core/test_degradation_score.py`
- `backend/tests/unit/core/test_modes.py`

### Dependencies

- Phase 4 complete (alert engine produces and tracks alerts)
- `domain/constants.py` — mode thresholds, baseline windows, staleness limits

### Implementation Notes

**Rolling baseline MAD (FW §7.2):**
```
values = [all FLOWING-only samples for this channel in last 24h]
median = median(values)
MAD = median(|values - median|)
σ_robust = 1.4826 × MAD
baseline = median
upper_limit = median + N × σ_robust  (N depends on trigger)
```

**Baseline poisoning prevention (PB-15):** The rolling and intermediate baseline computations must filter out ALL samples where `well_state ≠ FLOWING`. Including SHUT_IN data skews the baseline (zero flow rates, different pressure profiles) and causes false alarms when the well returns to production.

**Re-anchor protocol (PB-22):** A baseline cannot be re-anchored by an automated process alone. It requires an explicit operator action or an engineer-signed approval. The `reanchor.py` module enforces this by requiring a `signed_by` field.

**Confidence labeling (PB-23):** The `ConfidenceCoarse` model has `label = "coarse"` hardcoded. The system must NEVER output a confidence score labeled as "probability" or "calibrated." Per FW §8, these are coarse assessments only.

**Mode hysteresis (FW §3.5):** Mode upgrade (VERIFIED → DEGRADED) requires the score to exceed the threshold by ≥5 points and hold for ≥15 minutes. This prevents oscillation at mode boundaries.

**DEGRADED margin widening (FW §3.5):** In DEGRADED mode, T2/T3 trigger thresholds are widened by `DEGRADED_T2_T3_MARGIN_WIDEN = 15%`. This reduces nuisance alarms when data quality is poor, while T1 triggers remain unchanged.

**Constraint: `core/` import firewall.** No infrastructure imports.

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_degradation_score.py` | `test_score_no_alerts` | Zero active alerts → score 0 |
| `test_degradation_score.py` | `test_score_critical_alert` | Single CRITICAL alert → high score |
| `test_modes.py` | `test_verified_mode_below_33` | Score 30 → VERIFIED |
| `test_modes.py` | `test_degraded_mode_34_66` | Score 50 → DEGRADED |
| `test_modes.py` | `test_survival_mode_above_66` | Score 80 → SURVIVAL |
| `test_modes.py` | `test_hysteresis_upgrade` | Score 34 → wait 15 min → then transition |
| `test_modes.py` | `test_degraded_widens_margins` | DEGRADED mode → T2 thresholds widened by 15% |
| — | `test_baseline_poisoning.py` | SHUT_IN samples excluded from rolling baseline (**PB-15**) |
| — | `test_reanchor.py` | Re-anchor without signed_by field rejected (**PB-22**) |
| — | `test_confidence.py` | Confidence.label is always "coarse", never "probability" (**PB-23**) |

### Pass Criteria

1. `pytest tests/unit/core/test_degradation_score.py tests/unit/core/test_modes.py -v` — all pass.
2. Baseline poisoning prevented: SHUT_IN data excluded (PB-15).
3. Re-anchor requires `signed_by` (PB-22).
4. Confidence label confirmed as "coarse" (PB-23).

### What Must Not Be Built Here

- Database persistence of baselines (Phase 6)
- Celery task for baseline updates (Phase 11)
- Celery task for degradation recalculation (Phase 11)

---

## Phase 6 — Storage Layer & Database

### What This Phase Is

Implements all database models, the Alembic migration that creates TimescaleDB hypertables, the repository layer, and the Redis cache abstractions. After this phase, data can be persisted and queried.

### PRD Coverage

- PRD §3.1 (TimescaleDB schema: telemetry hypertable, alerts, well_reference, baselines, audit_log, users, reports) — **fully implemented**
- PRD §3.2 (Redis key schema: well state cache, degradation cache, holdoff timers, alert counts, Hampel buffers) — **fully implemented**
- PRD §3.3 (Hypertable configuration: 7-day chunks, compression at 7 days, retention at 90 days) — **fully implemented**
- PRD §3.4 (Continuous aggregate: 1-minute averages) — **fully implemented**

### Objectives

1. Implement `storage/database.py` — async SQLAlchemy engine, `AsyncSessionLocal`, `get_db()` dependency.
2. Implement all 8 models in `storage/models/`:
   - `telemetry.py` — `telemetry` hypertable
   - `alerts.py` — `alerts` + `alert_lifecycle` tables
   - `well_reference.py` — `well_reference` table
   - `baselines.py` — `baselines` table
   - `audit.py` — `audit_log` table (append-only with hash chain)
   - `users.py` — `users` table
   - `reports.py` — `generated_reports` table
3. Write Alembic migration `001_initial_schema.py` — creates all tables, hypertable, indexes, compression policy, retention policy, continuous aggregate.
4. Implement `storage/redis_client.py` — async Redis connection pool, `get_redis()` dependency.
5. Implement `storage/cache/`:
   - `well_state_cache.py` — get/set well state JSON at `well:{well_id}:state` with TTL
   - `degradation_cache.py` — get/set degradation score at `well:{well_id}:degradation`
   - `alert_count_cache.py` — increment/decrement at `alerts:active:{well_id}:{tier}`
   - `holdoff_cache.py` — set/check TTL key at `trigger:{well_id}:{code}:holdoff`
6. Implement all 5 repositories in `storage/repositories/`:
   - `telemetry_repo.py` — `insert_sample()`, `query_range()`, `latest()`
   - `alert_repo.py` — `create()`, `list()`, `acknowledge()`, `close()`
   - `well_repo.py` — `get()`, `list_all()`, `update_state()`
   - `baseline_repo.py` — `save()`, `load()`
   - `audit_repo.py` — `log()` with hash chain computation

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/storage/database.py`
- `backend/src/thronix/storage/redis_client.py`
- `backend/src/thronix/storage/models/telemetry.py`
- `backend/src/thronix/storage/models/alerts.py`
- `backend/src/thronix/storage/models/well_reference.py`
- `backend/src/thronix/storage/models/baselines.py`
- `backend/src/thronix/storage/models/audit.py`
- `backend/src/thronix/storage/models/users.py`
- `backend/src/thronix/storage/models/reports.py`
- `backend/src/thronix/storage/cache/well_state_cache.py`
- `backend/src/thronix/storage/cache/degradation_cache.py`
- `backend/src/thronix/storage/cache/alert_count_cache.py`
- `backend/src/thronix/storage/cache/holdoff_cache.py`
- `backend/src/thronix/storage/repositories/telemetry_repo.py`
- `backend/src/thronix/storage/repositories/alert_repo.py`
- `backend/src/thronix/storage/repositories/well_repo.py`
- `backend/src/thronix/storage/repositories/baseline_repo.py`
- `backend/src/thronix/storage/repositories/audit_repo.py`
- `backend/alembic/versions/001_initial_schema.py` [NEW]
- `backend/alembic/env.py` — finalize with Base import and async runner
- `backend/scripts/seed_reference_data.py` — implement

**Test files:**
- `backend/tests/integration/test_telemetry_storage.py`

### Dependencies

- Phase 0–5 complete (domain models, core engine)
- Docker Compose available (TimescaleDB + Redis containers)

### Implementation Notes

**Hypertable creation (PRD §3.3):**
```sql
SELECT create_hypertable('telemetry', 'time');
CREATE INDEX idx_telemetry_well_time ON telemetry (well_id, time DESC);
SELECT add_compression_policy('telemetry', INTERVAL '7 days');
SELECT add_retention_policy('telemetry', INTERVAL '90 days');
```

**Audit log hash chain (FW §11):** Each entry: `entry_hash = SHA-256(previous_hash + actor + action + timestamp + details)`. The first entry uses `previous_hash = "GENESIS"`. This creates a tamper-evident chain.

**Redis key patterns (PRD §3.2):**
```
well:{well_id}:state              → JSON { state, probability, source, updated_at } TTL: 300s
well:{well_id}:degradation        → JSON { score, mode, updated_at } TTL: 300s
trigger:{well_id}:{code}:holdoff  → TTL key (expires after holdoff period)
alerts:active:{well_id}:t2        → integer
sample:{well_id}:{channel}:buffer → LIST (last 5 values for Hampel)
```

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_telemetry_storage.py` | `test_insert_and_query` | Insert sample → query by range → row matches |
| `test_telemetry_storage.py` | `test_hypertable_exists` | `telemetry` is a TimescaleDB hypertable |
| `test_telemetry_storage.py` | `test_compression_policy` | Compression policy is configured |

### Pass Criteria

1. `docker compose up timescaledb redis -d` starts without errors.
2. Alembic migration applies cleanly: `alembic upgrade head`.
3. `telemetry` is confirmed as a TimescaleDB hypertable.
4. `pytest tests/integration/test_telemetry_storage.py -v` — insert and query work.
5. `scripts/seed_reference_data.py` loads all 4 reference JSON files into `well_reference`.

### What Must Not Be Built Here

- Ingestion worker (Phase 7)
- API endpoints (Phase 8)
- Celery tasks (Phase 11)

---

## Phase 7 — Ingestion Worker

### What This Phase Is

Implements the Redis Streams consumer that is the hot path of the system. It reads raw telemetry from `telemetry:raw`, runs the full `core/` pipeline, writes results to TimescaleDB, updates Redis state cache, and publishes alerts to `alerts:new`.

### PRD Coverage

- PRD §4.1 (Ingestion pipeline: Stream → process → persist → publish) — **fully implemented**
- FW §3.7 (Comms latency classification: NOMINAL/DEGRADED/IMPAIRED/PARTITIONED/ISOLATED) — **fully implemented**

### Objectives

1. Implement `ingestion/worker.py` — main loop: `XREADGROUP` on `telemetry:raw` → deserialize → `core/layer0` → well-state → T1 triggers → alert engine → `storage/repositories` write → `storage/cache` update → `PUBLISH alerts:new` → `XACK`.
2. Implement `ingestion/processor.py` — stateless `process_sample()` that chains core modules.
3. Implement `ingestion/well_context.py` — per-well in-memory state: Hampel buffers, holdoff timers, previous sample values for slew, rolling baseline accumulators.
4. ACK only after successful full pipeline execution. If the worker crashes, unACK'd messages are re-delivered by Redis.

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/ingestion/worker.py`
- `backend/src/thronix/ingestion/processor.py`
- `backend/src/thronix/ingestion/well_context.py`

**Test files:**
- `backend/tests/integration/test_ingestion_pipeline.py`

### Dependencies

- Phase 6 complete (storage layer exists)
- Phases 1–5 complete (`core/` engine exists)
- Docker Compose running (TimescaleDB + Redis)

### Implementation Notes

**Redis Streams consumer (XREADGROUP):**
```python
while True:
    messages = await redis.xreadgroup(
        groupname="ingestion-workers",
        consumername=f"worker-{os.getpid()}",
        streams={"telemetry:raw": ">"},
        count=10,
        block=1000,
    )
    for stream, entries in messages:
        for msg_id, fields in entries:
            sample = TelemetrySample.model_validate_json(fields[b"data"])
            result = process_sample(sample, well_context)
            await persist(result)
            await redis.xack("telemetry:raw", "ingestion-workers", msg_id)
```

**WellContext reconstruction:** On worker startup, reconstruct per-well context by loading the last N samples from TimescaleDB (where N = Hampel window size + 1 for slew). At pilot scale this takes <1s.

**Comms latency classification:** Compute `comms_latency_s` from the difference between sample timestamp and wall-clock time. Classify into bands per FW §3.7.

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_ingestion_pipeline.py` | `test_full_pipeline` | XADD → worker processes → row in TimescaleDB |
| `test_ingestion_pipeline.py` | `test_ack_after_write` | Message ACK'd only after DB write completes |
| `test_ingestion_pipeline.py` | `test_crash_recovery` | UnACK'd message re-delivered after worker restart |

### Pass Criteria

1. `docker compose up` — all services start, worker connects to Redis Stream.
2. `POST /api/v1/telemetry/ingest` with a sample → appears in TimescaleDB via the worker.
3. Integration test confirms ACK-after-write semantics.

### What Must Not Be Built Here

- REST API routes (Phase 8)
- WebSocket (Phase 8)
- T2/T3 evaluation in the worker (those are Celery tasks — Phase 11)

---

## Phase 8 — API & WebSocket Layer

### What This Phase Is

Implements the FastAPI application, all REST endpoints, the WebSocket live feed, and the dependency injection layer. After this phase, the frontend can connect to the backend.

### PRD Coverage

- PRD §4.2 (REST API: wells, alerts, telemetry, KPIs, reports, sensor-health, auth) — **fully implemented**
- PRD §4.3 (WebSocket: `/ws/v1/live` — real-time alert + state stream via Redis Pub/Sub) — **fully implemented**
- PRD §4.4 (CORS configuration for frontend at `localhost:3000`) — **fully implemented**
- PRD §4.5 (OpenAPI documentation auto-generated) — **fully implemented**

### Objectives

1. Implement `api/app.py` — FastAPI application with lifespan, CORS, router registration.
2. Implement `api/dependencies.py` — `get_db()`, `get_redis()`, `get_current_user()`.
3. Implement all 8 route files:
   - `auth.py` — `POST /login`
   - `wells.py` — `GET /`, `GET /{well_id}`, `POST /{well_id}/state`
   - `alerts.py` — `GET /`, `GET /{alert_id}`, `POST /{alert_id}/acknowledge`
   - `telemetry.py` — `POST /ingest`, `GET /{well_id}/history`
   - `kpi.py` — `GET /{well_id}`
   - `reports.py` — `GET /`, `POST /generate`
   - `sensor_health.py` — `GET /{well_id}`
4. Implement API schemas in `api/schemas/`.
5. Implement `api/websockets/live.py` — subscribe to `alerts:new` Pub/Sub, stream to clients.

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/api/app.py`
- `backend/src/thronix/api/dependencies.py`
- `backend/src/thronix/api/routes/auth.py`
- `backend/src/thronix/api/routes/wells.py`
- `backend/src/thronix/api/routes/alerts.py`
- `backend/src/thronix/api/routes/telemetry.py`
- `backend/src/thronix/api/routes/kpi.py`
- `backend/src/thronix/api/routes/reports.py`
- `backend/src/thronix/api/routes/sensor_health.py`
- `backend/src/thronix/api/schemas/auth.py`
- `backend/src/thronix/api/schemas/wells.py`
- `backend/src/thronix/api/schemas/alerts.py`
- `backend/src/thronix/api/schemas/telemetry.py`
- `backend/src/thronix/api/websockets/live.py`

**Test files:**
- `backend/tests/integration/test_api_endpoints.py`

### Dependencies

- Phase 6 complete (storage layer)
- Phase 7 complete (ingestion worker)
- Phase 12 (security) may be partially co-developed; auth stubs are sufficient here

### Implementation Notes

**WebSocket auth (PB-29):** The WebSocket endpoint at `/ws/v1/live` must validate a JWT token on connection. Unauthenticated clients must be rejected. Token can be passed as a query parameter: `/ws/v1/live?token=<jwt>`.

**Ingest endpoint flow:** `POST /api/v1/telemetry/ingest` receives JSON → validates via Pydantic → `XADD telemetry:raw` → returns `202 Accepted`. The actual processing happens asynchronously in the worker.

**API schemas vs domain models:** `api/schemas/alerts.py` defines `AlertResponse` which is a subset of `domain/alerts.py:Alert`. Internal fields like `confidence_coarse`, `data_quality`, and `sister_wells` are included in detail responses but omitted from list responses.

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_api_endpoints.py` | `test_login` | Valid credentials → JWT returned |
| `test_api_endpoints.py` | `test_list_wells` | GET /wells returns well list |
| `test_api_endpoints.py` | `test_alert_acknowledge` | POST /alerts/{id}/acknowledge → state = ACKNOWLEDGED |
| `test_api_endpoints.py` | `test_ingest_publishes_to_stream` | POST /ingest → message appears in Redis Stream |
| `test_api_endpoints.py` | `test_unauthorized_rejected` | No token → 401 |
| `test_websocket_auth.py` | `test_ws_no_token_rejected` | WebSocket connect without token → rejected (**PB-29**) |
| `test_websocket_auth.py` | `test_ws_valid_token_accepted` | WebSocket connect with valid token → accepted |

### Pass Criteria

1. `uvicorn thronix.api.app:app` starts without errors.
2. OpenAPI docs accessible at `/docs`.
3. All CRUD operations work via httpx integration tests.
4. WebSocket rejects unauthenticated connections (PB-29).

### What Must Not Be Built Here

- Celery tasks (Phase 11)
- Report generation logic (Phase 13)
- Full RBAC enforcement (Phase 12)

---

## Phase 9 — T2 Triggers — Process Limits

### What This Phase Is

Implements the five T2 triggers that evaluate accumulated data over 4-hour windows. These detect slower production anomalies that T1 cannot catch: GOR drift, water cut exceedance, reservoir depletion, sand production, and hydrate risk.

### PRD Coverage

- FW §6.7.1 (T2-A: GOR CUSUM — baseline-relative drift detection) — **fully implemented**
- FW §6.7.2 (T2-B: Water cut — 3-arm: absolute, fast step, slow trend) — **fully implemented**
- FW §6.7.3 (T2-C: Depletion — decline vs forecast) — **fully implemented**
- FW §6.7.4 (T2-D: Sand — rate step detection) — **fully implemented**
- FW §6.7.5 (T2-E: Hydrate/wax — margin monitoring) — **fully implemented**

### Objectives

1. Implement `core/triggers/t2/gor.py` — GOR CUSUM drift detection.
2. Implement `core/triggers/t2/watercut.py` — 3-arm water cut detection.
3. Implement `core/triggers/t2/depletion.py` — decline vs forecast comparison.
4. Implement `core/triggers/t2/sand.py` — sand rate step detection.
5. Implement `core/triggers/t2/hydrate.py` — hydrate/wax margin monitoring.

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/core/triggers/t2/gor.py`
- `backend/src/thronix/core/triggers/t2/watercut.py`
- `backend/src/thronix/core/triggers/t2/depletion.py`
- `backend/src/thronix/core/triggers/t2/sand.py`
- `backend/src/thronix/core/triggers/t2/hydrate.py`

**Test files:**
- `backend/tests/unit/core/triggers/test_gor.py`
- `backend/tests/unit/core/triggers/test_watercut.py`
- `backend/tests/unit/core/triggers/test_sand.py`
- `backend/tests/unit/core/triggers/test_hydrate.py`

### Dependencies

- Phase 5 complete (baselines exist — rolling and anchored)
- Phase 2 complete (well-state machine gates T2 to FLOWING-only)

### Implementation Notes

**GOR CUSUM (FW §6.7.1):**
```
k = T2_GOR_CUSUM_SIGMA × σ_rolling  (allowable drift)
S_high = max(0, S_high_prev + (GOR_sample - baseline_GOR) - k)
S_low = max(0, S_low_prev + (baseline_GOR - GOR_sample) - k)
if S_high > h → fire T2-A_GOR (upward drift)
if S_low > h → fire T2-A_GOR (downward drift)
```
Where `h` is the decision threshold (typically 4–5 × σ). Hold for `T2_GOR_HOLD_MINUTES (30)`.

**Natural high-GOR wells (PB-27):** Wells with a baseline GOR >5000 scf/bbl must not have their CUSUM trigger fire on normal production. The CUSUM uses the well's own rolling baseline, not a fixed global threshold. This is inherent in the design — confirm with a test.

**T2 flowing-only gate (PB-13):** T2 triggers must ONLY evaluate data collected during FLOWING state. If the 4h window contains SHUT_IN samples, they must be excluded. If no flowing data exists in the window, T2 does not fire.

**Water cut 3-arm (FW §6.7.2):**
1. **Absolute arm:** `water_cut_pct > wcut_limit_pct` (per-well, default 70%)
2. **Fast step arm:** ΔWC ≥ 15% of remaining oil fraction within one shift
3. **Slow trend arm:** Windowed linear regression slope ≥ 1.5 percentage points/week over 14-day window

**Hydrate margin (FW §6.7.5):** Compare wellhead temperature against the hydrate formation temperature (from `well_ref.hydrate_curve_f`). Margin is `temperature_f - hydrate_curve_f`. If margin < 3–5°F (`T2_HYDRATE_MARGIN_F`), fire advisory.

**Constraint: `core/` import firewall.** No infrastructure imports in T2 triggers.

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_gor.py` | `test_cusum_detects_drift` | Gradual GOR increase triggers CUSUM alarm |
| `test_gor.py` | `test_cusum_stable_no_alarm` | Stable GOR within baseline → no alarm |
| `test_gor.py` | `test_high_gor_well_no_false_alarm` | Well with GOR baseline >5000 → no spurious fire (**PB-27**) |
| `test_gor.py` | `test_flowing_only_evaluation` | SHUT_IN samples excluded from 4h window (**PB-13**) |
| `test_watercut.py` | `test_absolute_threshold` | WC > 70% → T2-B_WCUT_ABSOLUTE |
| `test_watercut.py` | `test_fast_step` | ΔWC ≥15% remaining oil → T2-B_WCUT_FAST_STEP |
| `test_watercut.py` | `test_slow_trend_regression` | Slope ≥1.5 pts/week over 14 days → T2-B_WCUT_SLOW_TREND |
| `test_hydrate.py` | `test_margin_advisory` | Temp within 5°F of hydrate curve → T2-E_HYDRATE |
| `test_sand.py` | `test_step_detection` | Sand rate doubles → T2-D_SAND |

### Pass Criteria

1. `pytest tests/unit/core/triggers/test_gor.py tests/unit/core/triggers/test_watercut.py tests/unit/core/triggers/test_sand.py tests/unit/core/triggers/test_hydrate.py -v` — all pass.
2. GOR CUSUM does not fire on naturally high-GOR wells (PB-27).
3. T2 evaluation excludes SHUT_IN samples (PB-13).
4. Replay harness with T2 triggers active: water cut events in heavy oil dataset detected.

### What Must Not Be Built Here

- Celery task scheduling for T2 cycle (Phase 11)
- T3 triggers (Phase 10)

---

## Phase 10 — T3 Triggers — Reservoir & Long-Term

### What This Phase Is

Implements the two T3 triggers that evaluate 30-day production trends on a 24-hour cycle.

### PRD Coverage

- FW §6.8.1 (T3-DECL: Production decline — exponential/hyperbolic fit vs actual) — **fully implemented**
- FW §6.8.2 (T3-ESP: ESP vibration trend — 24h trend vs reference) — **fully implemented**

### Objectives

1. Implement `core/triggers/t3/decline.py` — fit production decline curve (exponential model for Phase 1; hyperbolic reserved for Phase 2) to last 30 days. Fire if actual < 90% of expected (`T3_DECLINE_PERCENT`).
2. Implement `core/triggers/t3/esp_trend.py` — compute 24h rolling average of ESP vibration. Fire if +20% vs reference (`T3_ESP_VIB_PERCENT`).

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/core/triggers/t3/decline.py`
- `backend/src/thronix/core/triggers/t3/esp_trend.py`

**Test files:**
- `backend/tests/unit/core/triggers/test_decline.py`
- `backend/tests/unit/core/triggers/test_esp_trend.py`

### Dependencies

- Phase 5 complete (baselines)
- Phase 2 complete (well-state gates T3 to FLOWING-only)

### Implementation Notes

**Decline curve (FW §6.8.1):**
```
Phase 1: Exponential decline
q(t) = q_i × e^(-D × t)
where q_i = initial_rate, D = decline_rate from WellReferenceData.decline_forecast
if actual_30d_avg < T3_DECLINE_PERCENT (90%) × expected → fire T3-DECL
```

**T3 flowing-only gate (PB-14):** Same as T2 — only FLOWING state data.

**ESP vibration trend (FW §6.8.2):**
```
avg_24h = mean(esp_vibration over last 24h, FLOWING only)
if avg_24h > esp_vib_ref × (1 + T3_ESP_VIB_PERCENT) → fire T3-ESP_VIB_TREND
```

**Constraint: `core/` import firewall.**

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_decline.py` | `test_decline_detected` | Actual < 90% of expected → T3-DECL fires |
| `test_decline.py` | `test_stable_production_no_alarm` | Actual ≥ 90% → no alarm |
| `test_decline.py` | `test_flowing_only` | SHUT_IN data excluded (**PB-14**) |
| `test_esp_trend.py` | `test_vibration_trend_rise` | 24h avg vibration +20% → T3-ESP_VIB_TREND fires |
| `test_esp_trend.py` | `test_post_workover_relaxed` | Vibration within 30 days of workover → relaxed threshold |

### Pass Criteria

1. `pytest tests/unit/core/triggers/test_decline.py tests/unit/core/triggers/test_esp_trend.py -v` — all pass.
2. T3 evaluation excludes SHUT_IN data (PB-14).

### What Must Not Be Built Here

- Hyperbolic/harmonic decline models (Phase 2)
- Celery scheduling (Phase 11)

---

## Phase 11 — Celery Tasks & Scheduling

### What This Phase Is

Implements the Celery application configuration and all periodic tasks: T2 cycles, T3 cycles, baseline updates, KPI computation, report generation scheduling, and staleness checks.

### PRD Coverage

- PRD §4.6 (Celery Beat schedule for T2/T3/baseline/KPI/report/staleness) — **fully implemented**
- FW §6.7 (T2 runs every 4 hours) — **scheduling implemented**
- FW §6.8 (T3 runs every 24 hours) — **scheduling implemented**
- FW §7.2 (Rolling baseline recomputed hourly) — **scheduling implemented**

### Objectives

1. Implement `tasks/celery_app.py` — Celery application factory with Beat schedule.
2. Implement `tasks/t2_cycle.py` — every 4h: query TimescaleDB for 4h FLOWING window → run T2 triggers per well.
3. Implement `tasks/t3_cycle.py` — every 24h: query 30-day FLOWING window → run T3 triggers per well.
4. Implement `tasks/baseline_update.py` — every 1h: recompute rolling and intermediate baselines, write to DB and Redis cache.
5. Implement `tasks/kpi_computation.py` — every 15 min: compute uptime %, MTTR, alert frequency per well, cache in Redis.
6. Implement `tasks/report_generation.py` — at shift boundaries (06:00, 14:00, 22:00): generate shift summary.
7. Implement `tasks/staleness_check.py` — every 30s: check if any well has no new samples in >90s, fire COMMS_LOST advisory.

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/tasks/celery_app.py`
- `backend/src/thronix/tasks/t2_cycle.py`
- `backend/src/thronix/tasks/t3_cycle.py`
- `backend/src/thronix/tasks/baseline_update.py`
- `backend/src/thronix/tasks/kpi_computation.py`
- `backend/src/thronix/tasks/report_generation.py`
- `backend/src/thronix/tasks/staleness_check.py`

### Dependencies

- Phase 9, 10 complete (T2/T3 trigger logic exists)
- Phase 6 complete (storage layer for querying windows)
- Phase 5 complete (baseline computation logic)

### Test Cases

| Test | What It Verifies |
|------|-----------------|
| `test_t2_cycle_queries_flowing_only` | T2 task queries only FLOWING-state data from 4h window |
| `test_staleness_fires_comms_lost` | No samples for 90s → COMMS_LOST advisory |
| `test_celery_beat_schedule` | All tasks registered with correct intervals |

### Pass Criteria

1. `celery -A thronix.tasks.celery_app worker -l info` starts without errors.
2. `celery -A thronix.tasks.celery_app beat -l info` starts and schedules tasks.
3. T2 cycle runs, queries DB, evaluates triggers, writes alerts.
4. Staleness check fires COMMS_LOST after 90s silence.

### What Must Not Be Built Here

- Report content generation (Phase 13)
- Prometheus metrics (Phase 13)

---

## Phase 12 — Security, Audit & RBAC

### What This Phase Is

Implements authentication (JWT), password hashing, role-based access control, and the audit logging system.

### PRD Coverage

- PRD §5.1 (JWT authentication with HS256) — **fully implemented**
- PRD §5.2 (RBAC: ADMIN / OPERATOR / VIEWER) — **fully implemented**
- PRD §5.3 (Audit trail: append-only with hash chain) — **fully implemented**
- FW §11 (Tamper-evident audit log) — **fully implemented**

### Objectives

1. Implement `security/auth.py` — `create_access_token()`, `decode_token()` using `python-jose`.
2. Implement `security/hashing.py` — `hash_password()`, `verify_password()` using `passlib[bcrypt]`.
3. Implement `security/rbac.py` — `require_role(*roles)` FastAPI dependency.
4. Implement `security/audit.py` — `log_action()` with hash chain computation.
5. Add RBAC enforcement to all existing routes:
   - ADMIN: full access
   - OPERATOR: well state override, alert ACK, report generation
   - VIEWER: read-only access

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/security/auth.py`
- `backend/src/thronix/security/hashing.py`
- `backend/src/thronix/security/rbac.py`
- `backend/src/thronix/security/audit.py`

**Modify:**
- `backend/src/thronix/api/routes/*.py` — add RBAC dependencies to routes

**Test files:**
- `backend/tests/integration/test_alert_lifecycle.py` — verify audit trail
- New: `test_audit_immutability.py`

### Dependencies

- Phase 8 complete (API routes exist)
- Phase 6 complete (users table, audit_log table)

### Implementation Notes

**Audit immutability (PB-28):** The `audit_log` table must be append-only. There must be no `UPDATE` or `DELETE` operations on this table. The repository's `log()` method is the only entry point, and it only does `INSERT`. Verify with a test that attempts to modify an existing row.

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_audit_immutability.py` | `test_no_update_on_audit_log` | UPDATE on audit_log raises/is rejected (**PB-28**) |
| `test_audit_immutability.py` | `test_hash_chain_valid` | Hash chain validates from GENESIS to latest entry |
| `test_alert_lifecycle.py` | `test_ack_creates_audit_entry` | Alert ACK → audit_log entry created |

### Pass Criteria

1. JWT login returns valid token, subsequent requests authenticate.
2. RBAC enforced: VIEWER cannot ACK alerts.
3. Audit log is append-only (PB-28).
4. Hash chain validates.

### What Must Not Be Built Here

- User self-registration (Phase 2)
- Password reset flow (Phase 2)

---

## Phase 13 — Reporting & Observability

### What This Phase Is

Implements report generation (shift summaries, alert summaries, sensor health reports), structured logging, and Prometheus metrics.

### PRD Coverage

- PRD §4.6 (Report generation: shift, daily, sensor health) — **fully implemented**
- PRD §4.7 (Structured logging with structlog) — **fully implemented**
- PRD §4.8 (Prometheus metrics: samples processed, alerts fired, latency) — **fully implemented**
- PRD §4.9 (Grafana dashboards: ingestion, triggers, system) — **fully implemented**

### Objectives

1. Implement `reporting/generators/shift_report.py` — shift summary generator.
2. Implement `reporting/generators/alert_summary.py` — alert activity summary.
3. Implement `reporting/generators/sensor_health.py` — per-well sensor health report.
4. Implement `reporting/delivery.py` — save report to DB and filesystem.
5. Implement `observability/logging.py` — structlog JSON configuration with `well_id`, `trigger_code` context binding.
6. Implement `observability/metrics.py` — Prometheus counters/histograms.
7. Finalize Grafana dashboard JSON files in `monitoring/grafana/dashboards/`.
8. Finalize `monitoring/prometheus.yml`.

### Files Touched

**Implement from stubs:**
- `backend/src/thronix/reporting/generators/shift_report.py`
- `backend/src/thronix/reporting/generators/alert_summary.py`
- `backend/src/thronix/reporting/generators/sensor_health.py`
- `backend/src/thronix/reporting/delivery.py`
- `backend/src/thronix/observability/logging.py`
- `backend/src/thronix/observability/metrics.py`
- `backend/monitoring/grafana/dashboards/ingestion.json` [NEW]
- `backend/monitoring/grafana/dashboards/triggers.json` [NEW]
- `backend/monitoring/grafana/dashboards/system.json` [NEW]

### Dependencies

- Phase 8 complete (API exposing `/metrics`)
- Phase 11 complete (Celery tasks for report scheduling)

### Test Cases

| Test | What It Verifies |
|------|-----------------|
| `test_shift_report_generates` | Shift report produces valid JSON output |
| `test_prometheus_metrics_exposed` | GET /metrics returns Prometheus format |
| `test_structlog_json_output` | Log lines are valid JSON with well_id binding |

### Pass Criteria

1. Shift report generates without errors for a well with 4h of data.
2. `/metrics` endpoint returns Prometheus-format counters.
3. Grafana dashboards load in Grafana UI.
4. Log output is structured JSON with bound context.

### What Must Not Be Built Here

- Email delivery (Phase 2)
- PDF generation (Phase 2)

---

## Phase 14 — Integration Testing & Load Testing

### What This Phase Is

Runs the full integration test suite, verifies the `core/` import firewall, and executes load tests to confirm the system sustains pilot-scale throughput.

### PRD Coverage

- PRD §18.3 (Integration testing: full pipeline tests) — **fully executed**
- PRD §18.4 (Load testing: pilot-scale ingestion) — **fully executed**
- FW §12 (Edge separation: core/ import firewall) — **verified**

### Objectives

1. Run full integration test suite.
2. Implement `test_import_firewall.py` — automated verification that no file in `core/` imports from `storage/`, `api/`, `tasks/`, or `ai/`.
3. Implement `tests/load/locustfile.py` — simulate 15 wells × 20 samples/sec.
4. Run load test and verify P99 latency < 200ms at 75 samples/sec.

### Files Touched

**Implement:**
- `backend/tests/load/locustfile.py`
- `backend/tests/adversarial/test_import_firewall.py` [NEW]

### Dependencies

- All previous phases complete.

### Implementation Notes

**Import firewall test (PB-24):** Use `ast.parse()` or `grep` to scan every `.py` file under `core/` for import statements that reference `storage`, `api`, `tasks`, or `ai`. This is a structural test, not a runtime test.

### Test Cases

| Test File | Test Function | What It Verifies |
|-----------|--------------|-----------------|
| `test_import_firewall.py` | `test_core_has_no_infra_imports` | Zero imports from storage/api/tasks/ai in core/ (**PB-24**) |
| `locustfile.py` | — | System sustains ≥75 samples/sec at P99 < 200ms |

### Pass Criteria

1. `pytest tests/integration/ -v` — all integration tests pass.
2. `pytest tests/adversarial/test_import_firewall.py -v` — core/ import firewall confirmed (PB-24).
3. Locust load test at 75 samples/sec: P99 < 200ms, zero dropped messages.

### What Must Not Be Built Here

- Performance optimization (Phase 2)
- Chaos engineering (Phase 2)

---

## Phase 15 — Full Replay Validation & Acceptance

### What This Phase Is

The final validation gate. Runs the complete replay harness with ALL triggers (T1 + T2 + T3) active across ALL 4 datasets. Runs ALL adversarial tests. Runs ALL prohibited behaviour tests. This is the gate between "code complete" and "production-ready pilot."

### PRD Coverage

- FW §18 (Full replay validation as final acceptance gate) — **fully executed**
- FW §14 (All 29 prohibited behaviours verified) — **fully executed**
- PRD §18.5 (Per-trigger, per-dataset pass criteria) — **fully verified**

### Objectives

1. Run replay harness on ALL 4 datasets with FULL trigger suite active.
2. Compute per-trigger precision, recall, F1, and lead-time.
3. Run all 29 prohibited behaviour tests.
4. Generate final replay report (JSON + markdown).
5. Review results and confirm all pass criteria met.

### Files Touched

No new files. This phase executes existing tests.

### Dependencies

- ALL previous phases complete.
- All 5 datasets in `data/raw/`.
- All 4 reference files in `data/reference/`.

### Test Cases

Run in sequence:

```bash
# 1. Unit tests (no infra)
pytest tests/unit/ -v

# 2. Integration tests (testcontainers)
pytest tests/integration/ -v

# 3. Adversarial / prohibited behaviour tests
pytest tests/adversarial/ -v

# 4. Replay harness — all datasets
pytest tests/replay/ -v --timeout=1800

# 5. Load test (requires running stack)
locust -f tests/load/locustfile.py --host=http://localhost:8000 --headless -u 15 -r 5 -t 60s
```

### Pass Criteria

**Per-dataset replay:**

| Dataset | H₂S Recall | SCP Precision | ESP Recall | GOR F1 | Water Cut F1 |
|---------|-----------|---------------|-----------|--------|-------------|
| UAE GCC Sour | **1.0** (every H₂S event) | ≥0.85 | ≥0.80 | ≥0.75 | N/A |
| Africa Delta | N/A | ≥0.80 | ≥0.80 | ≥0.75 | N/A |
| Heavy Oil Steamflood | N/A | ≥0.80 (thermal exception for WELL_401) | ≥0.80 | N/A | ≥0.75 |
| Offshore High-GOR | N/A | ≥0.85 | ≥0.80 | ≥0.75 | N/A |

**Prohibited behaviours:** All 29 PB tests pass (see distribution table at top of document).

**System metrics:**
- Ingestion rate: ≥75 samples/sec sustained
- P99 latency: < 200ms
- Zero dropped messages during load test
- All Grafana dashboards render without errors

**Final deliverables:**
- `tests/replay/reports/final_report.json` — structured results
- `tests/replay/reports/final_report.md` — human-readable markdown table

### What Must Not Be Built Here

This phase builds nothing. It validates everything.

---

## PRD Coverage Cross-Reference

Every PRD/Framework section must appear in at least one phase. This table confirms 100% coverage.

| Section | Description | Phase |
|---------|-------------|-------|
| FW §2 | Telemetry Contract (39 channels) | 0 |
| FW §3.1 | Validation: range, slew, frozen, stale, Hampel | 1 |
| FW §3.2 | Quarantine, proxy, H₂S honesty | 1, 2 |
| FW §3.3 | Gap handling | 1 |
| FW §3.4 | Degradation score | 5 |
| FW §3.5 | Operating modes (VERIFIED/DEGRADED/SURVIVAL) | 5 |
| FW §3.6 | Sensor health classification | 2 |
| FW §3.7 | Comms latency bands | 1, 7 |
| FW §4 | Well-state machine | 2 |
| FW §5 | Alert architecture (EEMUA 191) | 4 |
| FW §5.3 | Gas response tiers | 3 |
| FW §6.2 | T1-B: H₂S | 3 |
| FW §6.3 | T1-A: Integrity / SCP | 3 |
| FW §6.4 | T1-C: Kick | 3 |
| FW §6.5 | T1-D: ESP | 3 |
| FW §6.6 | T1-E: Theft | 3 |
| FW §6.7 | T2: GOR, WCUT, Depletion, Sand, Hydrate | 9 |
| FW §6.8 | T3: Decline, ESP trend | 10 |
| FW §7 | Baselines | 5 |
| FW §8 | Confidence computation | 5 |
| FW §10 | Regional profiles, ring escalation | 3, 4 |
| FW §11 | Alert context capture, audit trail | 4, 12 |
| FW §12 | Simplification governor, edge separation | 5, 14 |
| FW §14 | Prohibited behaviours (29) | 1–14 (distributed) |
| FW §15 | Default thresholds | 0 |
| FW §18 | Replay validation | 1, 15 |
| PRD §2 | Data models | 0 |
| PRD §3 | Database schema, Redis keys | 6 |
| PRD §4 | API, WebSocket, Celery | 7, 8, 11 |
| PRD §5 | Security, auth, RBAC, audit | 12 |

---

*End of document. This plan is executed phase by phase, in order, with no skipping. Each phase's pass criteria must be met before the next phase begins. Every prohibited behaviour test must pass. The replay harness is the final authority.*
