# Testing

CI-friendly scripts for local and automated runs. No hosted CI provider is required — these commands are ready for any pipeline that can run Node 20+.

## Commands (from repo root)

| Script | What it runs |
|--------|----------------|
| `npm test` | Backend then frontend (same as `test:ci`) |
| `npm run test:backend` | Isolated SQLite Jest suite |
| `npm run test:frontend` | Vitest (non-watch) |
| `npm run test:ci` | Alias for `npm test` |

Workspace equivalents:

```bash
npm run test --workspace=backend
npm run test --workspace=frontend
```

## Backend — isolated SQLite

`npm run test:backend` runs `backend/scripts/run-tests.mjs`, which:

1. Sets `NODE_ENV=test` and `DATABASE_URL=file:./test.db` (resolved under `backend/prisma/`)
2. Refuses to proceed if the URL would target `dev.db`
3. Applies migrations with `prisma migrate deploy` (non-interactive)
4. Runs Jest **serially** (`--runInBand`, `maxWorkers: 1`) for SQLite safety
5. Deletes `prisma/test.db` and SQLite sidecar files (`-journal`, `-wal`, `-shm`) afterward

Your developer database (`prisma/dev.db`) is never opened or modified by the test runner.

`jest.setupEnv.js` is an additional guard: even a bare `npx jest` will rewrite a missing or `dev.db` URL to `file:./test.db` and throw if it still points at `dev.db`.

Prefer `npm test` / `npm run test:backend` so migrations and cleanup always run.

### Passing Jest args

```bash
cd backend
npm test -- --testPathPatterns=routes/project
```

## Frontend

```bash
npm run test:frontend
```

Uses `vitest run` (single pass, no watch). For local iteration:

```bash
cd frontend
npm run test:watch
```

## CI checklist

1. `npm install` (workspaces; Prisma client generates on backend `postinstall`)
2. No need to copy `backend/.env` for tests — the runner sets `DATABASE_URL`
3. `npm test` (or `npm run test:ci`)
4. Ensure Node `>=20.9.0`

Optional environment:

| Variable | Effect |
|----------|--------|
| `CI=true` | Jest adds `--ci --colors=false` |
