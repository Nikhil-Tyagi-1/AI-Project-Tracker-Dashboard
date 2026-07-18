# Documentation index

Central index for **AI Project Tracker Pro** docs. Start here when onboarding or preparing a GitHub submission.

> **Authentication** is outside the MVP unless Stretch Auth is implemented.

---

## Quick links

| Need | Document |
|------|----------|
| Setup & run | [`../README.md`](../README.md) |
| Reflection / lessons | [`../reflection.md`](../reflection.md) |
| PR template | [`../pull-request-description.md`](../pull-request-description.md) |
| Spec & acceptance | [`../tool-specific/cursor-workflow/`](../tool-specific/cursor-workflow/) |
| Development prompts | [`../prompt-history/README.md`](../prompt-history/README.md) |

---

## Folder layout

```text
docs/
├── README.md                 ← you are here
├── api/                      # REST API contracts + examples
│   ├── projects.md
│   ├── tasks.md
│   └── dashboard.md
├── features/                 # UI feature guides
│   ├── README.md
│   ├── projects.md
│   ├── kanban.md
│   ├── dashboard.md
│   ├── analytics.md
│   └── settings.md
├── frontend/
│   └── conventions.md        # FE structure, theme, shared UI
├── screenshots/              # PNG placeholders for README / PR
│   └── README.md
├── database.md               # Prisma entities, migrate, seed
├── testing.md                # Jest / Vitest / ephemeral DB
├── known-limitations.md      # MVP constraints
└── future-enhancements.md    # Post-MVP roadmap
```

---

## By topic

### Platform & data

| Doc | Description |
|-----|-------------|
| [database.md](./database.md) | Entities, migrate, seed |
| [testing.md](./testing.md) | How to run unit/integration tests |
| [frontend/conventions.md](./frontend/conventions.md) | App Router layout, theme, components |

### APIs

| Doc | Description |
|-----|-------------|
| [api/projects.md](./api/projects.md) | Projects CRUD, archive/restore |
| [api/tasks.md](./api/tasks.md) | Tasks / Kanban persistence |
| [api/dashboard.md](./api/dashboard.md) | Summary metrics, charts, insights |

### Features

| Doc | Description |
|-----|-------------|
| [features/README.md](./features/README.md) | Feature index |
| [features/projects.md](./features/projects.md) | Projects UI |
| [features/kanban.md](./features/kanban.md) | Kanban & tasks UI |
| [features/dashboard.md](./features/dashboard.md) | Dashboard |
| [features/analytics.md](./features/analytics.md) | Analytics |
| [features/settings.md](./features/settings.md) | Settings placeholder |

### Handoff

| Doc | Description |
|-----|-------------|
| [known-limitations.md](./known-limitations.md) | What MVP does not include |
| [future-enhancements.md](./future-enhancements.md) | Auth, notifications, AI, collaboration, … |
| [screenshots/README.md](./screenshots/README.md) | Where to drop UI captures |

### Workflow specs (source of truth for requirements)

| Doc | Path |
|-----|------|
| Project context | [`../tool-specific/cursor-workflow/project-context.md`](../tool-specific/cursor-workflow/project-context.md) |
| Specification | [`../tool-specific/cursor-workflow/spec.md`](../tool-specific/cursor-workflow/spec.md) |
| Acceptance criteria | [`../tool-specific/cursor-workflow/acceptance-criteria.md`](../tool-specific/cursor-workflow/acceptance-criteria.md) |
| Tasks | [`../tool-specific/cursor-workflow/tasks.md`](../tool-specific/cursor-workflow/tasks.md) |

---

## Suggested GitHub repository structure

Recommended top-level layout for submission (matches this repo):

```text
AI-Project-Tracker-Dashboard/
├── README.md
├── reflection.md
├── pull-request-description.md
├── package.json                 # npm workspaces root
├── package-lock.json
├── .gitignore
├── frontend/                    # Next.js App Router
├── backend/                     # Express + Prisma + SQLite
│   ├── prisma/                  # schema, migrations, seed
│   └── src/
├── docs/                        # This folder
├── prompt-history/              # Development prompts used with AI
└── tool-specific/
    └── cursor-workflow/         # Spec, AC, tasks, project context
```

**Do commit:** source, lockfile, migrations, docs, `.env.example` files, prompt-history.  
**Do not commit:** `node_modules/`, `.env` / `.env.local`, `*.db`, `.next/`, `dist/`, coverage, OS junk.
