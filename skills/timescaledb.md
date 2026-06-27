---
name: timescaledb
description: "Time-series schema design, hypertables, continuous aggregates for signal history"
risk: safe
source: internal
date_added: "2026-06-21"
---

# TimescaleDB Architecture

You are an expert in **Backend / Core Engine**. Use this skill to implement, review, and debug systems related to: **Time-series schema design, hypertables, continuous aggregates for signal history**.

## 🎯 When to Use
- Building or refactoring components within the `Backend / Core Engine` domain.
- Reviewing Pull Requests related to TimescaleDB Architecture.
- Troubleshooting architecture or implementation issues involving Time-series schema design, hypertables, continuous aggregates for signal history.

## 🧠 Context & Architecture
In the Thornix system, TimescaleDB Architecture plays a critical role. We require high reliability, clean code, and strict adherence to architectural standards. Our primary focus for this component is ensuring that the operations are executed securely, deterministically, and efficiently without side effects.

## 📋 Requirements
- `$ARGUMENTS`
- Target context: Ensure your workspace includes the relevant source code and config files before making changes.

## 🛠️ Instructions & Best Practices

### 1. Core Principles
- **Hypertables**: Always convert time-series tables to hypertables partitioned by time.
- **Chunk Size**: Size chunks to fit 25% of RAM.
- **Downsampling**: Use continuous aggregates for real-time dashboards instead of querying raw data.

### 2. Implementation Strategy & Workflows
1. **Analyze Requirements**: Understand the target metric or functional requirement.
2. **Follow Patterns**: Refer to the examples below instead of inventing new paradigms.
3. **Write Tests**: Implement unit/integration tests covering edge cases.
4. **Deploy & Monitor**: Ensure metrics and logs validate the new behavior.

### 3. Concrete Examples & Code Snippets

```typescript
// Example snippet for TimescaleDB Architecture
SELECT create_hypertable('sensor_data', 'time', chunk_time_interval => INTERVAL '1 day');

CREATE MATERIALIZED VIEW sensor_hourly WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', time), avg(value) FROM sensor_data GROUP BY 1;
```

### 4. Anti-Patterns to Avoid
- ❌ **Magic Strings/Numbers**: Avoid hardcoded values in logic blocks. Use environment variables or config constants.
- ❌ **Silencing Errors**: Never catch errors without logging or re-throwing them.
- ❌ **Ignoring Scale**: Do not use in-memory arrays for large datasets; always prefer streaming or batching.

## 📊 Metrics & Quality Gates
- **Code Coverage**: Must be > 80% for new logic.
- **Performance**: Should not negatively impact existing latency baselines.
- **Security**: Zero exposed secrets, proper input validation.

## 🚨 Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
