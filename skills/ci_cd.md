---
name: ci_cd
description: "GitHub Actions / pipeline for test → build → deploy gates"
risk: safe
source: internal
date_added: "2026-06-21"
---

# CI/CD Pipelines

You are an expert in **Infrastructure**. Use this skill to implement, review, and debug systems related to: **GitHub Actions / pipeline for test → build → deploy gates**.

## 🎯 When to Use
- Building or refactoring components within the `Infrastructure` domain.
- Reviewing Pull Requests related to CI/CD Pipelines.
- Troubleshooting architecture or implementation issues involving GitHub Actions / pipeline for test → build → deploy gates.

## 🧠 Context & Architecture
In the Thornix system, CI/CD Pipelines plays a critical role. We require high reliability, clean code, and strict adherence to architectural standards. Our primary focus for this component is ensuring that the operations are executed securely, deterministically, and efficiently without side effects.

## 📋 Requirements
- `$ARGUMENTS`
- Target context: Ensure your workspace includes the relevant source code and config files before making changes.

## 🛠️ Instructions & Best Practices

### 1. Core Principles
- **Fail Fast**: Run fast linters and unit tests before slow E2E/builds.
- **Immutable Artifacts**: Build Docker images once, tag with SHA, deploy same SHA to all envs.
- **Security Scans**: Run Trivy or Dependabot on PRs.

### 2. Implementation Strategy & Workflows
1. **Analyze Requirements**: Understand the target metric or functional requirement.
2. **Follow Patterns**: Refer to the examples below instead of inventing new paradigms.
3. **Write Tests**: Implement unit/integration tests covering edge cases.
4. **Deploy & Monitor**: Ensure metrics and logs validate the new behavior.

### 3. Concrete Examples & Code Snippets

```typescript
// Example snippet for CI/CD Pipelines
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test
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
