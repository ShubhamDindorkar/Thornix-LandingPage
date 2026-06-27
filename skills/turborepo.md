---
name: turborepo
description: "monorepo workspace setup for Next.js frontend — FRONTEND ONLY, does not apply to Python backend"
risk: safe
source: internal
date_added: "2026-06-24"
---

# Turborepo Workspace Config (Frontend Only)

You are an expert in **Frontend / Infrastructure**. Use this skill when working on the Next.js frontend build pipeline, shared TypeScript packages, or `turbo.json` configuration.

> ⚠️ **Scope: Frontend only.** The Python backend (`backend/`) does **not** use Turborepo. It uses standard Python tooling: `pyproject.toml` for dependencies, `pytest` for tests, and Docker Compose for orchestration. Do not apply Turborepo patterns to any file under `backend/`.

---

## 🧠 Monorepo Structure

```
Thronix/
├── frontend/          # Managed by Turborepo + npm workspaces
│   ├── src/app/       # Next.js App Router
│   └── package.json
├── shared/            # TypeScript types shared with frontend
│   ├── types/
│   └── constants/
├── turbo.json         # Frontend build pipeline config
└── backend/           # Python — NOT part of Turborepo pipeline
    └── pyproject.toml
```

---

## 🛠️ Instructions & Best Practices

### 1. Core Principles
- **Topological Builds**: Ensure `build` depends on `^build` in `turbo.json`.
- **Caching**: Explicitly define `outputs` for cache hits.
- **Shared Packages**: TypeScript types and configs are extracted to `shared/` for the frontend to consume. The Python backend defines its own types in `backend/src/thronix/domain/`.

### 2. turbo.json Pattern
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": { "outputs": [] },
    "test": {
      "outputs": ["coverage/**"],
      "dependsOn": []
    }
  }
}
```

### 3. Adding a Shared TypeScript Package
```bash
# Add to shared/
cd shared && npm init -y
# Reference from frontend
# frontend/package.json: { "dependencies": { "@thronix/shared": "*" } }
```

### 4. Anti-Patterns to Avoid
- ❌ **Running Python tests via Turborepo**: Python tests run via `pytest`, not `turbo run test`.
- ❌ **Sharing types between Python backend and TypeScript frontend via Turborepo**: They are maintained separately. Python uses Pydantic models in `domain/`; frontend uses TypeScript types in `shared/`.
- ❌ **Adding `backend/` to turbo workspaces**: Turborepo is a Node.js tool; it must not try to manage the Python backend.

## 📊 Metrics & Quality Gates
- `turbo run build` must succeed without errors.
- All shared TypeScript packages must be built before the frontend.
- Frontend build artifacts should be cache-hit on second run (verify with `--dry-run`).
