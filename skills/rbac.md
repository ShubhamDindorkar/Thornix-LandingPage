---
name: rbac
description: "role-based access control, least-privilege patterns"
risk: safe
source: internal
date_added: "2026-06-21"
---

# Role-Based Access Control

You are an expert in **Security**. Use this skill to implement, review, and debug systems related to: **role-based access control, least-privilege patterns**.

## 🎯 When to Use
- Building or refactoring components within the `Security` domain.
- Reviewing Pull Requests related to Role-Based Access Control.
- Troubleshooting architecture or implementation issues involving role-based access control, least-privilege patterns.

## 🧠 Context & Architecture
In the Thornix system, Role-Based Access Control plays a critical role. We require high reliability, clean code, and strict adherence to architectural standards. Our primary focus for this component is ensuring that the operations are executed securely, deterministically, and efficiently without side effects.

## 📋 Requirements
- `$ARGUMENTS`
- Target context: Ensure your workspace includes the relevant source code and config files before making changes.

## 🛠️ Instructions & Best Practices

### 1. Core Principles
- **Least Privilege**: Grant only permissions explicitly required.
- **Role Hierarchy**: Define distinct roles (Viewer, Operator, Admin).
- **Middleware Guards**: Enforce RBAC at the API router level using JWT claims.

### 2. Implementation Strategy & Workflows
1. **Analyze Requirements**: Understand the target metric or functional requirement.
2. **Follow Patterns**: Refer to the examples below instead of inventing new paradigms.
3. **Write Tests**: Implement unit/integration tests covering edge cases.
4. **Deploy & Monitor**: Ensure metrics and logs validate the new behavior.

### 3. Concrete Examples & Code Snippets

```typescript
// Example snippet for Role-Based Access Control
@UseGuards(RolesGuard)
@Roles('Admin', 'Operator')
@Post('/override')
async overrideAlert() { ... }
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
