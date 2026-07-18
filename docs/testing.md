# Testing Strategy

> **Stack:** Jest (backend) · Vitest (frontend) · Prisma + SQLite (ephemeral test DB)  
> **Locations:** `backend/src/**/*.test.ts`, `frontend/src/**/*.{test,spec}.{ts,tsx}`  
> **Related:** [`docs/database.md`](database.md) (migrate & seed), [`acceptance-criteria.md`](../tool-specific/cursor-workflow/acceptance-criteria.md) (§16 Testing)

This document describes how automated tests are organized, how to run them locally or in CI, how the isolated test database works, and how seed data relates to tests. No hosted CI provider is required — the npm scripts below are ready for any pipeline that can run Node 20+.

---

## Goals

| Goal | Approach |
|------|----------|
| Protect developer data | Backend tests never open `prisma/dev.db` |
| Stay CI-friendly | Non-interactive migrate, serial Jest, Vitest `run` (no watch) |
| Cover critical paths | Validators, API integration, form validation, Kanban optimistic moves |
| Keep setup light | SQLite + Prisma; no external database server |

---

## Expected test commands

Run from the **repository root** unless noted.

| Command | What it runs |
|---------|----------------|
| `npm test` | Backend suite, then frontend suite |
| `npm run test:backend` | Isolated SQLite + Jest (`backend/scripts/run-tests.mjs`) |
| `npm run test:frontend` | Vitest in non-watch mode |
| `npm run test:ci` | Alias for `npm test` (same entry point for CI) |

Workspace equivalents:

```bash
npm run test --workspace=backend
npm run test --workspace=frontend
```

### Prerequisites

```bash
npm install          # workspaces; Prisma client generates via backend postinstall
# Node >= 20.9.0
```

You do **not** need a populated `backend/.env` to run tests. The backend runner sets `NODE_ENV=test` and `DATABASE_URL=file:./test.db` itself.

### CI checklist

1. `npm install`
2. `npm test` (or `npm run test:ci`)
3. Optional: set `CI=true` so Jest adds `--ci --colors=false`

---

## Running backend tests

```bash
npm run test:backend
```

Or from `backend/`:

```bash
cd backend
npm test
```

### What the runner does

`backend/scripts/run-tests.mjs` orchestrates each run:

1. Sets `NODE_ENV=test` and `DATABASE_URL=file:./test.db` (file resolves under `backend/prisma/`)
2. Refuses to continue if the URL would target `dev.db`
3. Applies schema with `prisma migrate deploy` (non-interactive)
4. Runs Jest serially (`--runInBand`, `maxWorkers: 1`) — safer for SQLite
5. Deletes `prisma/test.db` and SQLite sidecars (`-journal`, `-wal`, `-shm`)

`backend/jest.setupEnv.js` is a second guard: even a bare `npx jest` rewrites a missing or `dev.db` URL to `file:./test.db` and throws if it still points at the developer database.

Prefer `npm test` / `npm run test:backend` so migrate + cleanup always run.

### Filtering Jest

```bash
cd backend
npm test -- --testPathPatterns=routes/project
npm test -- --testPathPatterns=validators
```

### Backend test layout

| Path pattern | Kind | Focus |
|--------------|------|--------|
| `src/validators/*.test.ts` | Unit | Zod schemas (projects, tasks) |
| `src/routes/*.test.ts` | Integration | HTTP + Prisma (projects, tasks, dashboard, health) |

---

## Running frontend tests

```bash
npm run test:frontend
```

Or from `frontend/`:

```bash
cd frontend
npm test                 # vitest run (CI / single pass)
npm run test:watch       # interactive local iteration
```

### Frontend test layout

| Area | Examples | Kind |
|------|----------|------|
| Zod / form schemas | `projectFormSchema.test.ts`, `taskFormSchema.test.ts` | Unit |
| Pure helpers | `moveTask.test.ts`, `groupTasksByStatus.test.ts`, `chartUtils.test.ts` | Unit |
| Components / views | `ProjectForm.test.tsx`, `ProjectsListView.test.tsx`, `TaskCard.test.tsx`, `DashboardView.test.tsx` | Component (mocked API / Redux) |
| Hooks | `useKanbanTaskMove.test.tsx` | Hook + Redux (mocked `updateTask`) |

Frontend tests do **not** hit the real Express API or SQLite. HTTP and navigation are mocked (`vi.mock` on API modules, `next/navigation`, etc.).

---

## Running all tests

```bash
npm test
# or
npm run test:ci
```

Order: **backend → frontend**. A backend failure stops the chain (frontend does not run until backend exits 0).

---

## Test database setup

| Database | Path | Purpose |
|----------|------|---------|
| Developer | `backend/prisma/dev.db` | Local `npm run dev:backend` / Studio / manual QA |
| Ephemeral test | `backend/prisma/test.db` | Created for Jest, deleted after the run |

### Isolation rules

- Automated tests **must not** use `DATABASE_URL` pointing at `dev.db`
- The runner always forces `file:./test.db`
- `.gitignore` ignores `backend/prisma/*.db` and SQLite sidecars
- Schema is applied with `prisma migrate deploy` against the test file only

### Lifecycle diagram

```text
npm run test:backend
        │
        ▼
  set DATABASE_URL=file:./test.db
        │
        ▼
  prisma migrate deploy     ← empty schema → current migrations
        │
        ▼
  jest --runInBand          ← suites create/cleanup their own rows
        │
        ▼
  delete test.db (+ sidecars)
```

Integration suites create dedicated users/projects (e.g. `*-test-*@test.invalid`) and tear them down in `afterEach` / `afterAll`. They do **not** rely on the demo seed for correctness, though dashboard tests plant known fixtures inside the ephemeral DB for aggregate assertions.

---

## Seed data

Demo seed is for **local development and manual evaluation**, not a required step before `npm test`.

| Concern | Seed (`prisma db seed`) | Automated tests |
|---------|-------------------------|-----------------|
| When | After migrate, for a non-empty UI | Every `npm run test:backend` |
| Database | Usually `dev.db` | Always `test.db` (ephemeral) |
| Contents | 5 users, 5 projects, 27 tasks | Per-suite fixtures + cleanup |
| Command | `cd backend && npx prisma db seed` | Handled by the test runner |

Full seed reference (users, project aliases, idempotent wipe): [`docs/database.md`](database.md) — **Seed Process**.

> Do not run `prisma migrate reset` or seed against `test.db` while relying on the test runner — the runner owns that file’s lifecycle.

---

## Integration vs unit tests

### Backend

| Kind | How to recognize | What it asserts |
|------|------------------|-----------------|
| **Unit** | `validators/*.test.ts`; no `supertest` / no Prisma | Schema accept/reject, field paths, defaults |
| **Integration** | `routes/*.test.ts`; `supertest` + `prisma` | Status codes, envelopes, DB side effects, business rules (transitions, archive) |

Integration tests boot the Express app (`createApp()`), call real routes, and persist through Prisma into the ephemeral SQLite file.

### Frontend

| Kind | How to recognize | What it asserts |
|------|------------------|-----------------|
| **Unit** | Pure functions / Zod helpers; no DOM | Move math, grouping, schema errors |
| **Component / hook** | Testing Library / `renderHook` + mocks | UI state, debounced search, status menu, optimistic Redux updates |

There is no end-to-end browser suite in MVP. Cross-stack confidence comes from backend API integration tests plus frontend tests with mocked HTTP.

---

## Tooling reference

| Package | Tool | Config / entry |
|---------|------|----------------|
| Backend | Jest + ts-jest + supertest | `backend/jest.config.js`, `backend/scripts/run-tests.mjs` |
| Frontend | Vitest + Testing Library | `frontend/vitest.config.ts`, `frontend/vitest.setup.ts` |
| DB | Prisma Migrate + SQLite | `backend/prisma/schema.prisma`, `DATABASE_URL` |

Optional environment variables:

| Variable | Effect |
|----------|--------|
| `CI=true` | Jest gets `--ci --colors=false` |
| `TEST_DATABASE_URL` | Override forced by `jest.setupEnv.js` (still must not be `dev.db`) |
| `DATABASE_DEBUG=true` | Prisma SQL logging in app code (not required for tests) |

---

## Troubleshooting common failures

### `Refusing to run tests` / mentions `dev.db`

**Cause:** `DATABASE_URL` still targets the developer database.  
**Fix:** Use `npm run test:backend` (or `npm test`). Do not export `DATABASE_URL=file:./dev.db` into the test process. The runner and `jest.setupEnv.js` are designed to block this.

### `prisma migrate deploy` fails during tests

**Cause:** Migrations missing, Prisma client out of date, or permissions under `backend/prisma/`.  
**Fix:**

```bash
cd backend
npx prisma generate
npx prisma migrate deploy   # with DATABASE_URL=file:./test.db if diagnosing manually
```

Ensure `backend/prisma/migrations/` is committed and present in CI checkouts.

### SQLite lock / flaky integration tests

**Cause:** Concurrent writers (multiple Jest workers) or a leftover process holding the DB.  
**Fix:** Always use `npm run test:backend` (`--runInBand` / `maxWorkers: 1`). Delete any stray `backend/prisma/test.db*` if a previous run was killed mid-flight:

```bash
rm -f backend/prisma/test.db backend/prisma/test.db-*
```

### Frontend: `Cannot find package '@/…'`

**Cause:** Vitest was started outside the `frontend/` workspace (wrong cwd / wrong config).  
**Fix:** Run `npm run test:frontend` from the repo root, or `cd frontend && npm test`.

### Frontend: MUI Select / menu not found

**Cause:** Async listbox options or missing `userEvent` await.  
**Fix:** Prefer `await user.click(...)` then `getByRole('option' | 'menuitem', …)` as in existing `ProjectsToolbar` / `TaskCard` tests. Do not assert options before the menu is open.

### Backend tests pass locally but CI fails on Node version

**Cause:** Engine requirement is Node `>=20.9.0`.  
**Fix:** Align the CI image / local runtime with that version (`package.json` `engines`).

### `dev.db` grew or changed after `npm test`

**Cause:** Unexpected — the runner should not touch `dev.db`.  
**Fix:** Confirm you used `npm run test:backend` / `npm test`, not a custom Jest invocation with `DATABASE_URL` pointing at `dev.db`. Check `git status` on `backend/prisma/dev.db` (usually gitignored) and restore from backup/seed if needed:

```bash
cd backend
npx prisma migrate reset   # destructive; re-migrates + seeds dev DB only when DATABASE_URL is dev.db
```

---

## Document control

| Version | Notes |
|---------|-------|
| 1.0 | Testing strategy: commands, isolated SQLite, seed vs fixtures, unit vs integration, troubleshooting |
