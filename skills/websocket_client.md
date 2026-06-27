---
name: websocket_client
description: "live alert and sensor-health streaming to the UI"
risk: safe
source: internal
date_added: "2026-06-21"
---

# WebSocket Client Streaming

You are an expert in **Frontend**. Use this skill to implement, review, and debug systems related to: **live alert and sensor-health streaming to the UI**.

## 🎯 When to Use
- Building or refactoring components within the `Frontend` domain.
- Reviewing Pull Requests related to WebSocket Client Streaming.
- Troubleshooting architecture or implementation issues involving live alert and sensor-health streaming to the UI.

## 🧠 Context & Architecture
In the Thornix system, WebSocket Client Streaming plays a critical role. We require high reliability, clean code, and strict adherence to architectural standards. Our primary focus for this component is ensuring that the operations are executed securely, deterministically, and efficiently without side effects.

## 📋 Requirements
- `$ARGUMENTS`
- Target context: Ensure your workspace includes the relevant source code and config files before making changes.

## 🛠️ Instructions & Best Practices

### 1. Core Principles
- **Auto-Reconnect**: Always implement backoff reconnection logic.
- **State Sync**: Handle dropped packets by requesting full state sync upon reconnection.
- **Unmounting**: Always close the socket or remove listeners when the component unmounts.

### 2. Implementation Strategy & Workflows
1. **Analyze Requirements**: Understand the target metric or functional requirement.
2. **Follow Patterns**: Refer to the examples below instead of inventing new paradigms.
3. **Write Tests**: Implement unit/integration tests covering edge cases.
4. **Deploy & Monitor**: Ensure metrics and logs validate the new behavior.

### 3. Concrete Examples & Code Snippets

```typescript
// Example snippet for WebSocket Client Streaming
useEffect(() => {
  const ws = new WebSocket(WSS_URL);
  ws.onmessage = (msg) => updateChart(JSON.parse(msg.data));
  return () => ws.close();
}, []);
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
