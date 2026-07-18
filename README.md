# AI Project Tracker Pro

Production-oriented SaaS dashboard for creating, managing, and monitoring engineering projects and tasks. The app centralizes portfolio health—status, ownership, priorities, Kanban workflows, and analytics—so teams share one system of record instead of scattered spreadsheets and chat threads.

This monorepo ships a **Next.js** frontend and an **Express + Prisma + SQLite** backend with validated REST APIs, seed data, and automated tests suitable for local evaluation and handoff.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Folder structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Prisma migrate](#prisma-migrate)
- [Prisma seed](#prisma-seed)
- [Running the backend](#running-the-backend)
- [Running the frontend](#running-the-frontend)
- [Running both applications](#running-both-applications)
- [Running tests](#running-tests)
- [Build commands](#build-commands)
- [API overview](#api-overview)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Screenshots](#screenshots)
- [License](#license)

---

## Features

- **Project lifecycle** — Create, view, update, archive, and restore projects with status, priority, owner, dates, progress, and risk notes
- **Search, filter & sort** — Case-insensitive search, AND-combined filters (status / priority / owner), and multi-field sorting
- **Task management** — Tasks linked to projects with assignees, priorities, due dates, and soft archive/restore
- **Kanban board** — Four columns (`TODO` → `IN_PROGRESS` → `IN_REVIEW` → `DONE`), drag-and-drop with optimistic UI, API sync, and keyboard-accessible status controls
- **Dashboard & analytics** — Metric cards, recent activity, four charts (progress, task status, team workload, monthly activity), and mock Smart Insights
- **Operational UX** — Skeleton loaders, empty/error states, confirmation dialogs, toast notifications, responsive Material UI shell
- **API platform** — Zod validation, layered Express architecture, standard success/error envelopes, Prisma + SQLite persistence

> **Out of MVP:** JWT authentication is a stretch goal and is not required to run the app locally.

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Material UI, Redux Toolkit, React Hook Form, Zod, Axios, Recharts, @dnd-kit, Framer Motion |
| **Backend** | Express 5, TypeScript, Prisma 6, SQLite, Zod, CORS, Morgan |
| **Testing** | Jest + Supertest (backend), Vitest + Testing Library (frontend) |
| **Tooling** | npm workspaces, Node.js ≥ 20.9.0 |

---

## Folder structure

```text
.
├── frontend/                 # Next.js App Router UI
│   └── src/
│       ├── app/              # Routes, layouts, pages
│       ├── components/       # Shared UI primitives
│       ├── features/         # Domain modules (projects, kanban, dashboard, …)
│       ├── hooks/
│       ├── services/         # Axios API clients
│       ├── store/            # Redux Toolkit
│       ├── theme/
│       ├── types/
│       ├── constants/
│       └── utils/
├── backend/                  # Express REST API
│   ├── prisma/               # schema.prisma, migrations, seed, SQLite files
│   ├── scripts/              # Test runner (ephemeral DB)
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       ├── validators/
│       ├── middleware/
│       ├── prisma/           # Prisma client singleton
│       ├── lib/
│       └── config/
├── docs/                     # Feature, API, database, and testing docs
│   ├── api/
│   ├── features/
│   └── frontend/
├── tool-specific/
│   └── cursor-workflow/      # Spec, acceptance criteria, tasks, project context
├── prompt-history/           # Agent prompt history (handoff)
├── package.json              # Workspace scripts
└── README.md
```

---

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| **Node.js** | `>= 20.9.0` (see root `package.json` `engines`) |
| **npm** | Comes with Node; workspaces are used (`frontend`, `backend`) |
| **Git** | To clone the repository |

No external database server is required. Prisma uses **SQLite** files under `backend/prisma/`.

---

## Installation

From the repository root:

```bash
# 1. Install all workspace dependencies
npm install

# 2. Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Apply database migrations
cd backend && npx prisma migrate deploy && cd ..

# 4. Seed demo data (projects, tasks, users)
cd backend && npx prisma db seed && cd ..
```

`npm install` also runs the backend `postinstall` script (`prisma generate`) so the Prisma Client is available after install.

---

## Environment variables

Copy the example files; **never commit** real `.env` / `.env.local` files or secrets.

### Backend — `backend/.env.example` → `backend/.env`

| Variable | Example | Description |
|----------|---------|-------------|
| `PORT` | `4000` | HTTP port for the API server |
| `NODE_ENV` | `development` | Runtime environment |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Allowed CORS origin (Next.js app) |
| `DATABASE_URL` | `file:./dev.db` | SQLite path relative to `backend/prisma/` |

```env
# Backend environment variables (copy to .env — never commit secrets)

PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

Automated tests use an isolated `prisma/test.db` and **never** write to `dev.db`. See [docs/testing.md](docs/testing.md).

### Frontend — `frontend/.env.example` → `frontend/.env.local`

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000/api` | Axios base URL for the REST API |

```env
# Frontend environment variables (copy to .env.local — never commit secrets)

NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

---

## Prisma migrate

Migrations live in `backend/prisma/migrations/`. Run commands from `backend/`:

```bash
cd backend

# Development: create / apply migrations interactively
npm run prisma:migrate
# equivalent: npx prisma migrate dev

# CI / local deploy-style apply (non-interactive)
npx prisma migrate deploy

# Regenerate Prisma Client only
npm run prisma:generate

# Inspect data in the browser
npm run prisma:studio
```

Recommended first-time setup after copying `.env`:

```bash
cd backend
npx prisma migrate deploy
```

More detail: [docs/database.md](docs/database.md).

---

## Prisma seed

The seed script (`backend/prisma/seed.ts`) loads demo users, projects, and tasks so lists, Kanban, and charts are non-empty. It is **idempotent** (clears then re-inserts).

```bash
cd backend
npx prisma db seed
```

To reset the database, re-apply all migrations, and seed in one step (**destructive** — development only):

```bash
cd backend
npx prisma migrate reset
```

Seed contents (summary): 5 users, 5 projects (one per project status), 27 tasks across Kanban columns. See [docs/database.md](docs/database.md#seed-process).

---

## Running the backend

```bash
# From repo root
npm run dev:backend

# Or from backend/
cd backend
npm run dev
```

- Default URL: [http://localhost:4000](http://localhost:4000)
- Health check: `GET http://localhost:4000/api/health`
- API base: `http://localhost:4000/api`

Production-style (after build):

```bash
cd backend
npm run build
npm start
```

---

## Running the frontend

Ensure the backend is reachable and `NEXT_PUBLIC_API_BASE_URL` points at it.

```bash
# From repo root
npm run dev:frontend

# Or from frontend/
cd frontend
npm run dev
```

- Default URL: [http://localhost:3000](http://localhost:3000)

Production-style (after build):

```bash
cd frontend
npm run build
npm start
```

---

## Running both applications

**Recommended start order:** migrate → seed → API → web.

```bash
# Terminal 1 — API
npm run dev:backend

# Terminal 2 — UI
npm run dev:frontend
```

Alternatively, from the root:

```bash
npm run dev
```

This runs `dev` in each workspace that defines it (backend + frontend). Prefer two terminals if you want clearer logs.

Then open [http://localhost:3000](http://localhost:3000) and confirm [http://localhost:4000/api/health](http://localhost:4000/api/health) returns success.

---

## Running tests

Tests are CI-friendly and do **not** require a seeded `dev.db`. Backend tests use an ephemeral SQLite file (`prisma/test.db`) that is deleted after the run.

```bash
# From repo root — backend then frontend
npm test

# Individually
npm run test:backend
npm run test:frontend

# CI alias (same as npm test)
npm run test:ci
```

| Suite | Runner | Location |
|-------|--------|----------|
| Backend | Jest + Supertest via `backend/scripts/run-tests.mjs` | `backend/src/**/*.test.ts` |
| Frontend | Vitest (non-watch) | `frontend/src/**/*.{test,spec}.{ts,tsx}` |

Full details: [docs/testing.md](docs/testing.md).

---

## Build commands

```bash
# Build both workspaces
npm run build

# Build individually
npm run build:frontend
npm run build:backend

# Typecheck / lint (where defined)
npm run lint
```

| Package | Build output | Start |
|---------|--------------|--------|
| `backend` | `backend/dist/` (`tsc`) | `npm start` in `backend/` |
| `frontend` | Next.js `.next/` | `npm start` in `frontend/` |

---

## API overview

Base URL (local): `http://localhost:4000/api`  
Content-Type: `application/json`  
Auth: not required for MVP

Responses use a standard envelope:

- Success (resource): `{ "data": { ... } }`
- Success (collection): `{ "data": [ ... ], "meta": { "total", "page", "pageSize" } }`
- Error: `{ "error": { "message", "code", "details?" } }`

| Area | Documentation |
|------|----------------|
| **Projects API** | [docs/api/projects.md](docs/api/projects.md) — list, get, create, update, archive, restore |
| **Tasks API** | [docs/api/tasks.md](docs/api/tasks.md) — list, get, create, update, archive, restore (Kanban status) |
| **Dashboard API** | [docs/api/dashboard.md](docs/api/dashboard.md) — summary metrics/charts, Smart Insights |

Quick reference:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` / `POST` | `/api/projects` | List / create projects |
| `GET` / `PATCH` | `/api/projects/:id` | Get / update project |
| `POST` | `/api/projects/:id/archive` | Soft-archive project |
| `POST` | `/api/projects/:id/restore` | Restore project |
| `GET` / `POST` | `/api/tasks` | List / create tasks |
| `GET` / `PATCH` | `/api/tasks/:id` | Get / update task |
| `POST` | `/api/tasks/:id/archive` | Soft-archive task |
| `POST` | `/api/tasks/:id/restore` | Restore task |
| `GET` | `/api/dashboard/summary` | Metric cards + chart series |
| `GET` | `/api/dashboard/insights` | Mock AI insight cards |

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/database.md](docs/database.md) | Entities, migrate, seed |
| [docs/testing.md](docs/testing.md) | Unit/integration tests and ephemeral DB |
| [docs/frontend/conventions.md](docs/frontend/conventions.md) | Frontend folder & theme conventions |
| [docs/features/projects.md](docs/features/projects.md) | Projects UI flows |
| [docs/features/kanban.md](docs/features/kanban.md) | Kanban behavior & failure handling |
| [docs/features/dashboard.md](docs/features/dashboard.md) | Dashboard, charts, insights |
| [tool-specific/cursor-workflow/project-context.md](tool-specific/cursor-workflow/project-context.md) | Business context & architecture |
| [tool-specific/cursor-workflow/spec.md](tool-specific/cursor-workflow/spec.md) | Software specification |
| [tool-specific/cursor-workflow/acceptance-criteria.md](tool-specific/cursor-workflow/acceptance-criteria.md) | Given/When/Then acceptance criteria |
| [tool-specific/cursor-workflow/tasks.md](tool-specific/cursor-workflow/tasks.md) | Milestone task list |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Frontend cannot load data / network errors | Backend not running or wrong API URL | Start `npm run dev:backend`; confirm `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api` in `frontend/.env.local` |
| CORS errors in the browser | `FRONTEND_ORIGIN` mismatch | Set `FRONTEND_ORIGIN=http://localhost:3000` in `backend/.env` to match the Next.js origin |
| Port already in use (`4000` or `3000`) | Another process bound to the port | Stop the other process, or change `PORT` / run Next on another port (`npx next dev -p 3001`) and update env vars |
| Prisma Client / schema errors | Client not generated or migrations not applied | `cd backend && npm run prisma:generate && npx prisma migrate deploy` |
| Empty lists / empty charts | Database not seeded | `cd backend && npx prisma db seed` |
| Migration failures on fresh clone | Missing `.env` or bad `DATABASE_URL` | Copy `backend/.env.example` → `backend/.env`; ensure `DATABASE_URL="file:./dev.db"` |
| Tests failing or touching `dev.db` | Incorrect `DATABASE_URL` during Jest | Use `npm run test:backend` from root; do not point tests at `dev.db` (see [docs/testing.md](docs/testing.md)) |
| `EADDRINUSE` after crash | Orphan Node process | Find and kill the process using the port, then restart |

Health check for a quick sanity test:

```bash
curl -s http://localhost:4000/api/health
```

---

## Screenshots

> Placeholders — add PNGs under `docs/screenshots/` and update the links below.

| Screen | Preview |
|--------|---------|
| Dashboard | ![Dashboard](docs/screenshots/dashboard.png) |
| Projects list | ![Projects](docs/screenshots/projects.png) |
| Project detail | ![Project detail](docs/screenshots/project-detail.png) |
| Kanban board | ![Kanban](docs/screenshots/kanban.png) |
| Analytics | ![Analytics](docs/screenshots/analytics.png) |

---

## License

This project is provided as an evaluation / handoff deliverable.

Unless a `LICENSE` file is added to the repository root, all rights are reserved by the authors. Contributors may adopt an open-source license (for example MIT) by adding a `LICENSE` file and updating this section.
