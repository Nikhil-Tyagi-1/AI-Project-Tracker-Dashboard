# Reflection — AI Project Tracker Pro

Developer handoff notes on architecture choices, challenges, trade-offs, and what we would do next. Companion docs: [`docs/README.md`](docs/README.md), [`docs/known-limitations.md`](docs/known-limitations.md), [`docs/future-enhancements.md`](docs/future-enhancements.md), [`tool-specific/cursor-workflow/spec.md`](tool-specific/cursor-workflow/spec.md).

> **Scope note:** Authentication remains **outside the MVP** unless Stretch Auth (Milestone 12) is completed. The reflection below assumes the delivered MVP (Milestones 0–10).

---

## Architecture decisions

### Monorepo with npm workspaces

Frontend and backend live as sibling packages under one root. Shared scripts (`dev`, `test`, `build`) keep onboarding to a single `npm install`, while packages stay independently versioned and testable.

### Layered Express API

Routes → controllers → services → Prisma, with Zod at the HTTP boundary and centralized error middleware. Controllers stay thin; status transitions, uniqueness, and aggregates live in services. This matched the project context and made integration tests assert business rules without HTTP noise.

### Feature-based Next.js frontend

UI is grouped under `features/{projects,tasks,dashboard}` with shared primitives in `components/ui` and HTTP in `services/api`. Redux Toolkit holds list/detail/mutation state per domain; forms use React Hook Form + Zod aligned with backend validators.

### SQLite + Prisma for portability

SQLite removes external DB setup for evaluators. Prisma migrations and an idempotent seed give a reproducible demo portfolio. Automated tests use an ephemeral `test.db` so developer `dev.db` is never wiped.

### Optimistic Kanban with explicit rollback

Drag-and-drop and the accessible status menu share one persistence path (`persistTaskMove`). The board updates immediately, then `PATCH`es status/`sortOrder`; failures restore the previous task snapshot and toast. That satisfied AC-K02–AC-K05 without WebSockets.

### Chart-ready dashboard aggregates

`GET /api/dashboard/summary` returns metric cards and series shaped for Recharts. The UI stays presentation-focused; Smart Insights are separate deterministic heuristics so section failures stay isolated (AC-I02).

### Auth deferred by design

A `User` model (with unused `passwordHash`) supports owners/assignees today. JWT register/login and protected routes are Stretch only—intentional so MVP effort stayed on CRUD, Kanban, analytics, validation, and tests.

---

## Challenges encountered

1. **Keeping client and server validation in sync** — Zod schemas are duplicated across packages. Drift risk is real; we mirrored rules carefully and covered both with unit tests, but shared packages or codegen would help later.

2. **Kanban optimistic concurrency** — Ignoring in-flight moves for the same task id avoids races, but rapid multi-card drags still rely on last-write-wins at the API. True collaborative boards need a stronger model.

3. **Dashboard activity without an Activity entity** — Recent activity is derived from project/task timestamps. It works for demo feeds but cannot represent “archived,” “status changed,” or actor identity cleanly.

4. **Responsive Kanban** — Horizontal column scroll plus touch drag and a non-drag status control took iteration to stay usable on narrow viewports without trapping actions.

5. **Test isolation on SQLite** — Ensuring Jest never touches `dev.db` required a dedicated runner (`scripts/run-tests.mjs`) and setup guards, not just a different `DATABASE_URL` in docs.

6. **Scope discipline** — Wireframes list Settings and Auth; documenting them as placeholders/stretch avoided inventing product surface that the acceptance criteria did not require.

---

## Trade-offs

| Decision | Chose | Rejected / deferred | Why |
|----------|-------|---------------------|-----|
| Database | SQLite | Postgres (MVP) | Zero ops for evaluation; migrate path documented for later |
| Auth | Open local APIs | JWT on day one | Spec non-goal; assessment focus elsewhere |
| Insights | Deterministic mock | Live LLM | Cost, determinism, no provider secrets in repo |
| Progress | Manual on Project | Auto from tasks | Spec assumption; avoids surprising recalculation |
| State | Redux Toolkit | Server Components–only data | Shared list/board mutation UX across routes |
| Charts | Recharts | Heavier BI kits | Minimal justified dependency, chart-ready API |
| Soft delete | `isArchived` | Hard delete | Restore, audit-friendly rows, stable FKs |
| Settings | Placeholder page | Full preferences | No MVP settings requirements |
| Archive HTTP | `PATCH …/archive` | Spec’s `POST` wording | Consistent with other partial updates in this codebase |

---

## Lessons learned

- **Standard envelopes early** — Agreeing on `{ data }`, `{ data, meta }`, and `{ error }` up front simplified Axios mapping and error toasts.
- **One move path for Kanban** — Sharing persistence between drag and menu prevented “works on drag, broken on keyboard” bugs.
- **Section-level failure isolation** — Independent dashboard thunks made Insights failures recoverable without blanking the whole page.
- **Document as you ship** — Feature/API docs written per milestone reduced handoff churn in Milestone 10.
- **Ephemeral test DB is non-negotiable** — Once developers seed rich `dev.db` data, any test that shares that file destroys trust in the suite.
- **Placeholders need explicit docs** — Saying “Settings is intentionally empty” prevents reviewers from treating missing prefs as incomplete work.

---

## Possible improvements

Near-term engineering improvements (see also [`docs/future-enhancements.md`](docs/future-enhancements.md)):

1. Extract shared Zod schemas (or OpenAPI → client types) to eliminate FE/BE drift.
2. Add a first-class `Activity` table and write events from services.
3. Implement Stretch Auth with httpOnly cookies or documented token storage.
4. Replace SQLite with Postgres for concurrent writes and production hosting.
5. Add Playwright (or similar) smoke E2E for list → create task → Kanban move → dashboard.
6. Rate limiting, structured logging, and container/compose for Milestone 11 deployment readiness.
7. Optional auto-progress from task completion, behind a clear product rule.
8. Fill Settings with theme/defaults once preferences exist.

---

## Cross-references

| Document | Use |
|----------|-----|
| [`project-context.md`](tool-specific/cursor-workflow/project-context.md) | Goals, stack, architecture |
| [`spec.md`](tool-specific/cursor-workflow/spec.md) | Requirements and future enhancements §16 |
| [`acceptance-criteria.md`](tool-specific/cursor-workflow/acceptance-criteria.md) | Definition of done |
| [`tasks.md`](tool-specific/cursor-workflow/tasks.md) | Milestone breakdown |
| [`docs/README.md`](docs/README.md) | Documentation index |
| [`docs/known-limitations.md`](docs/known-limitations.md) | Current MVP constraints |
| [`docs/future-enhancements.md`](docs/future-enhancements.md) | Planned product direction |
| [`pull-request-description.md`](pull-request-description.md) | PR-ready summary for reviewers |
| [`prompt-history/README.md`](prompt-history/README.md) | Prompts used during AI-assisted development |
