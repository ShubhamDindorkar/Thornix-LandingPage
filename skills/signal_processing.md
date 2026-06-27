---
name: signal_processing
description: "Hampel median filter, CUSUM, EWMA, MAD-based robust σ, windowed regression slope — all in Python"
risk: safe
source: internal
date_added: "2026-06-24"
---

# Signal Processing Algorithms (Python)

You are an expert in **SAFE-CORE / Triggers**. Use this skill to implement, review, and debug all signal processing algorithms in `backend/src/thronix/core/`.

> ⚠️ All code in this skill must be **pure Python** (no SQLAlchemy, no Redis, no httpx). The `core/` package must survive edge deployment with no infrastructure.

---

## 🧠 Context

The Thronix signal processing layer sits between raw telemetry and trigger logic:

```
Raw TelemetrySample
    → Hampel Despike Filter  (core/layer0/hampel.py)
    → Range Check            (core/layer0/validation.py)
    → Slew Rate Check        (core/layer0/validation.py)
    → Frozen Value Check     (core/layer0/validation.py)
    → Staleness Check        (core/layer0/validation.py)
    → ValidatedSample
    → Trigger Engine (T1/T2/T3)
```

---

## 🛠️ Instructions & Best Practices

### 1. Hampel Despike Filter (5-sample median)
Used in Layer-0 to reject transient spikes before any trigger evaluates.

```python
from collections import deque
import statistics

class HampelFilter:
    """
    5-sample sliding window Hampel filter.
    Rejects values where |x - median| > threshold * MAD * 1.4826
    """
    WINDOW = 5
    DEFAULT_THRESHOLD = 3.0  # sigma-equivalent

    def __init__(self, threshold: float = DEFAULT_THRESHOLD):
        self.threshold = threshold
        self._buffer: deque[float] = deque(maxlen=self.WINDOW)

    def push(self, value: float) -> tuple[float, bool]:
        """
        Returns (output_value, is_outlier).
        If outlier: returns median of window as proxy, marks sample SUSPECT.
        """
        self._buffer.append(value)
        if len(self._buffer) < self.WINDOW:
            return value, False

        median = statistics.median(self._buffer)
        mad = statistics.median(abs(x - median) for x in self._buffer)
        mad_scaled = mad * 1.4826  # consistency constant for normal distribution

        if mad_scaled > 0 and abs(value - median) > self.threshold * mad_scaled:
            return median, True  # replace spike with median proxy
        return value, False
```

### 2. CUSUM (Cumulative Sum) for T2-A GOR Drift
```python
class CUSUM:
    """
    Detects gradual upward drift from baseline.
    Used for T2-A GOR trend detection.
    """
    def __init__(self, k: float, h: float):
        """
        k: allowance (half the shift to detect, in robust-σ units)
        h: decision threshold (trigger when S+ exceeds h)
        """
        self.k = k
        self.h = h
        self._s_plus = 0.0

    def update(self, value: float, baseline: float, robust_sigma: float) -> bool:
        """Returns True if cumulative drift exceeds threshold."""
        z = (value - baseline) / robust_sigma if robust_sigma > 0 else 0.0
        self._s_plus = max(0.0, self._s_plus + z - self.k)
        return self._s_plus >= self.h

    def reset(self) -> None:
        self._s_plus = 0.0
```

### 3. Robust Sigma (MAD-based) for Baseline Thresholds
```python
import statistics

def robust_sigma(values: list[float]) -> float:
    """
    MAD-based robust standard deviation estimate.
    Resistant to outliers unlike std(). Required by Framework §6.7.
    """
    if not values:
        return 0.0
    med = statistics.median(values)
    mad = statistics.median(abs(x - med) for x in values)
    return mad * 1.4826  # scale to be consistent with normal σ
```

### 4. EWMA (Exponential Weighted Moving Average)
```python
class EWMA:
    """Rolling EWMA for real-time signal smoothing."""
    def __init__(self, alpha: float = 0.1):
        """alpha: smoothing factor (0 < α ≤ 1). Smaller = more smoothing."""
        self.alpha = alpha
        self._value: float | None = None

    def update(self, x: float) -> float:
        if self._value is None:
            self._value = x
        else:
            self._value = self.alpha * x + (1 - self.alpha) * self._value
        return self._value
```

### 5. Windowed Regression Slope (T2-B WCUT Slow Trend)
```python
def regression_slope(times: list[float], values: list[float]) -> float:
    """
    Least-squares slope over a time window.
    Used for T2-B water cut slow trend arm (≥1.5 pts/week threshold).
    Returns slope in [value_units / time_units].
    """
    n = len(times)
    if n < 2:
        return 0.0
    mean_t = sum(times) / n
    mean_v = sum(values) / n
    numerator = sum((t - mean_t) * (v - mean_v) for t, v in zip(times, values))
    denominator = sum((t - mean_t) ** 2 for t in times)
    return numerator / denominator if denominator != 0 else 0.0
```

### 6. Frozen Value Detection (Layer-0)
```python
class FrozenDetector:
    """Detects flatline sensors: same value ≥ 15 consecutive samples = FAILED."""
    FROZEN_THRESHOLD = 15

    def __init__(self):
        self._last_value: float | None = None
        self._frozen_count: int = 0

    def push(self, value: float) -> bool:
        """Returns True if sensor is considered FAILED (flatline)."""
        if self._last_value is not None and value == self._last_value:
            self._frozen_count += 1
        else:
            self._frozen_count = 0
        self._last_value = value
        return self._frozen_count >= self.FROZEN_THRESHOLD
```

### 7. Anti-Patterns to Avoid
- ❌ **Using `numpy`/`pandas` in `core/`**: These are heavy dependencies. Pure Python only.
- ❌ **Mean + std instead of Median + MAD**: Mean is skewed by the outliers you're trying to detect.
- ❌ **Fixed absolute thresholds**: Always compute relative to the well's baseline. Fixed thresholds cause flood alarms on high-GOR or sour wells (prohibited §14).
- ❌ **Resetting CUSUM on every sample**: Only reset when explicitly re-anchored or after T2 cycle completes.

## 📊 Quality Gates
- All algorithms must pass unit tests in `tests/unit/core/test_*.py`.
- Hampel filter: must reject a spike of 10× IQR within 5 samples.
- CUSUM: must detect a 1σ drift within 30 minutes at 3-second sample rate.
- Frozen detector: must flag FAILED after exactly 15 identical consecutive values.
