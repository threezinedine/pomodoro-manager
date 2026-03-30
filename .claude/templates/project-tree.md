# The Complete Guide for Constructing a Custom Web Application Project Tree

This template defines the standard directory structure for a custom web project. It is designed to be modular — add or remove sections based on your project's needs.

---

## Project Overview

A complete web project may consist of the following top-level components:

| Component | Description | Required |
| --- | --- | --- |
| **Frontend** | Client-side application users interact with (e.g., React, Vue, Svelte) | Yes |
| **Backend** | Server-side application handling business logic and data | Yes |
| **Mobile** | Native mobile app (e.g., React Native, Flutter) | Optional |
| **Shared** | Shared library for code across frontend, mobile, and backend (types, utilities) | Optional |
| **Nginx** | Reverse proxy for routing and serving | Optional |
| **E2E Tests** | End-to-end test suite (e.g., Cypress) | Optional |

---

## Root Project Tree

```plaintext
project-root/
├── .claude/              # Claude Code config, commands, and hooks
├── .design/              # Design outputs: generated files, assets, references
├── frontend/             # Frontend application
├── backend/              # Backend application
├── mobile/               # (optional) Mobile application
├── shared/               # (optional) Shared library (types, utilities)
├── nginx/                # (optional) Nginx reverse proxy config
├── cypress/              # End-to-end test suite
│   └── e2e/
├── README.md
├── .gitignore
├── pyproject.toml        # Python dependencies (uv)
├── uv.lock
├── docker-compose.dev.yml # Dev environment
├── docker-compose.prod.yml # Prod environment
├── .env                  # Environment variables (root only)
├── .env.example          # Template for environment variables
├── cypress.config.ts
├── package.json          # Root package / npm workspace config
└── tsconfig.json          # Root TypeScript configuration
```

---

## Key Design Decisions

### 1. Monorepo with `uv`

The root manages **both** Python and Node.js:

- `pyproject.toml` + `uv.lock` → Python dependencies (via `uv`)
- `package.json` + `tsconfig.json` → Node.js / TypeScript dependencies (for the frontend/workspace)

### 2. Environment Variables at Root Only

Only the **project root** contains `.env` and `.env.example`.

> Internal projects (`frontend/`, `backend/`, `mobile/`, etc.) should **NOT** have their own `.env` files. This keeps environment variables centralized and avoids confusion.

### 3. Docker Compose for Both Environments

- `docker-compose.dev.yml` — local development stack (hot-reload, debug ports, etc.)
- `docker-compose.prod.yml` — production stack (optimized builds, healthchecks, etc.)

### 4. Design Files in `.design/`

Generated design assets (UI mocks, architecture diagrams, notes) live in `.design/`, not mixed with application code. Use this folder as a reference for future iterations.

### 5. Architecture Files in `archs/`

Each project component has its own architecture document:

| Component | Architecture File |
| --- | --- |
| Frontend | `archs/fe.arch.md` |
| Backend | `archs/be.arch.md` |
| Mobile | `archs/mobile.arch.md` |

> **Note:** Each internal project may have its own `archs/<component>.arch.md` documenting its architecture in detail.

**Note:** In plan mode or use `/plan` command, garenteee that only the `designs/` folder is modified, no changes should be made for other projects or files.
