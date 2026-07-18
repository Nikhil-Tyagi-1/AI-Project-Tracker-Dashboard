# AI Project Tracker Pro

Monorepo for the AI Project Tracker Pro dashboard (Next.js frontend + Express/Prisma backend).

## Workspace layout

| Path | Description |
|------|-------------|
| `frontend/` | Next.js 16 App Router + Material UI + Redux Toolkit |
| `backend/` | Express API + Prisma + SQLite |
| `docs/` | API, database, and frontend conventions |
| `tool-specific/cursor-workflow/` | Project context, spec, acceptance criteria, tasks |

## Quick start

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run dev:backend
npm run dev:frontend
```

See backend docs for migrate/seed. Frontend conventions (folder structure, theme, shared UI): [`docs/frontend/conventions.md`](docs/frontend/conventions.md).

## Documentation

- [Frontend conventions](docs/frontend/conventions.md)
- [Database](docs/database.md)
- [Projects API](docs/api/projects.md)
- [Tasks API](docs/api/tasks.md)
- [Dashboard API](docs/api/dashboard.md)
