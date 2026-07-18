# AI Project Tracker Pro — Implementation Tasks

**Related documents:** `project-context.md`, `spec.md`, `acceptance-criteria.md`, `cursor-rules-or-instructions.md`

Each task is independently completable. Complete milestones in order unless a task explicitly allows parallel work.

**Legend:** `[BE]` backend · `[FE]` frontend · `[TEST]` testing · `[DOC]` documentation · `[OPS]` deployment/ops · `[STRETCH]` optional  
**Note:** Tasks marked `[x]` are ready for review.

---

## Milestone 0 — Repository & foundations

- [x] `[OPS]` Initialize monorepo or sibling `frontend` / `backend` apps with agreed package managers
- [x] `[BE]` Scaffold Express + TypeScript backend with `src/{controllers,routes,services,prisma,middleware,validators}`
- [x] `[FE]` Scaffold Next.js 16 (App Router) + TypeScript frontend with `src/{app,components,features,hooks,services,store,types,constants,utils}`
- [x] `[FE]` Add Material UI, Redux Toolkit, React Hook Form, Zod, Axios dependencies (pin versions)
- [x] `[BE]` Add Prisma, Zod, and Express-related TypeScript tooling (pin versions)
- [x] `[OPS]` Add root/workspace scripts to run frontend and backend in development
- [x] `[OPS]` Add `.env.example` files for frontend and backend (no secrets)
- [x] `[OPS]` Add `.gitignore` covering `node_modules`, `.env`, SQLite DB files, build outputs
- [x] `[DOC]` Write initial README with repo layout and how to install dependencies

---

## Milestone 1 — Data model & API platform

- [x] `[BE]` Define Prisma schema for `Project` and `Task` (and optional `User` / `Activity` if chosen)
- [x] `[BE]` Add enums for project status, task status, and priority per `spec.md`
- [x] `[BE]` Run initial migration and verify SQLite database file creation
- [x] `[BE]` Create Prisma client singleton module
- [x] `[BE]` Implement shared success/error response helpers matching the standard envelope
- [x] `[BE]` Implement centralized error-handling middleware (`VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`)
- [x] `[BE]` Implement request logging middleware (minimal)
- [x] `[BE]` Add health check route `GET /api/health`
- [x] `[BE]` Seed database with demo projects, tasks, owners, and assignees
- [x] `[DOC]` Document database entities and how to migrate/seed
- [x] `[TEST]` Add a smoke test that health endpoint returns success

---

## Milestone 2 — Projects API

- [x] `[BE]` Create Zod validators for project create/update bodies and list query params
- [x] `[BE]` Implement `ProjectService` (list with search/filter/sort, getById, create, update, archive, restore)
- [x] `[BE]` Enforce project field validation and status transition rules in the service layer
- [x] `[BE]` Enforce unique project name among non-archived projects (if adopted)
- [x] `[BE]` Implement project routes/controllers: `GET/POST /projects`, `GET/PATCH /projects/:id`, archive/restore
- [x] `[BE]` Exclude archived projects from default list queries
- [x] `[TEST]` Unit-test project validators (required fields, progress 0–100, date ordering)
- [x] `[TEST]` Integration-test project CRUD, archive, restore, and validation error shapes
- [x] `[DOC]` Document project API with request/response examples

---

## Milestone 3 — Tasks API

- [x] `[BE]` Create Zod validators for task create/update bodies and list query params
- [x] `[BE]` Implement `TaskService` (list by project/filters, getById, create, update, archive, restore)
- [x] `[BE]` Reject tasks linked to missing or archived projects
- [x] `[BE]` Support status + `sortOrder` updates for Kanban persistence
- [x] `[BE]` Implement task routes/controllers under `/api/tasks`
- [x] `[TEST]` Unit-test task validators and project-link rules
- [x] `[TEST]` Integration-test task CRUD, archive/restore, and status update
- [x] `[DOC]` Document task API with request/response examples

---

## Milestone 4 — Dashboard & analytics API

- [x] `[BE]` Implement `GET /api/dashboard/summary` returning metric card aggregates
- [x] `[BE]` Return chart-ready series for: project progress, task status pie, team workload, monthly activity
- [x] `[BE]` Implement `GET /api/dashboard/insights` returning mock Smart Insights derived from current data
- [x] `[BE]` Optionally implement `GET /api/projects/stats` if kept separate from summary — deferred; covered by `/api/dashboard/summary`
- [x] `[TEST]` Integration-test summary/insights against seeded data (non-empty aggregates)
- [x] `[DOC]` Document dashboard endpoints and example payloads

---

## Milestone 5 — Frontend shell & design system

- [x] `[FE]` Configure MUI theme tokens (primary/secondary, typography, spacing, elevation, radius)
- [x] `[FE]` Configure CssBaseline and AppThemeProvider
- [x] `[FE]` Build app shell: top bar, side navigation, content area
- [x] `[FE]` Add nav links for Dashboard, Projects, Kanban, Analytics, Settings
- [x] `[FE]` Implement responsive drawer navigation for tablet/mobile breakpoints
- [x] `[FE]` Add global toast notification host
- [x] `[FE]` Add shared Skeleton, EmptyState, ErrorState, and ConfirmDialog components
- [x] `[FE]` Configure Axios API client with base URL from env
- [x] `[FE]` Configure Redux Toolkit store scaffolding
- [x] `[FE]` Add shared constants/enums mirroring backend status and priority values
- [x] `[FE]` Add basic 404 `not-found` page
- [x] `[DOC]` Document frontend folder conventions and theme usage

---

## Milestone 6 — Projects UI

- [x] `[FE]` Add projects API service methods (list, get, create, update, archive, restore)
- [x] `[FE]` Add Redux slice (or feature state) for projects list/detail loading and errors
- [x] `[FE]` Build Projects list page with table/cards layout
- [x] `[FE]` Add debounced search input (`q`) with clear control
- [x] `[FE]` Add filters for status, priority, owner + reset filters control
- [x] `[FE]` Add sort controls (`sortBy`, `sortOrder`)
- [x] `[FE]` Build Create Project form page with React Hook Form + Zod
- [x] `[FE]` Build Edit Project form page reusing the same form component
- [x] `[FE]` Build Project Details page (metadata, risk notes, task summary, link to board)
- [x] `[FE]` Wire archive/restore with confirmation dialog + toasts
- [x] `[FE]` Implement loading, empty, and error states for list/detail/forms
- [x] `[TEST]` Component or integration tests for project form validation errors
- [x] `[DOC]` Document Projects feature usage and main flows

---

## Milestone 7 — Kanban & tasks UI

- [x] `[FE]` Add tasks API service methods (list, create, update, archive, restore)
- [x] `[FE]` Build Kanban page with four columns: TODO, IN_PROGRESS, IN_REVIEW, DONE
- [x] `[FE]` Add project selector / context for board scope
- [x] `[FE]` Render task cards (title, priority, assignee, due date)
- [x] `[FE]` Implement drag-and-drop between columns with immediate UI update
- [x] `[FE]` Persist status changes via API; roll back UI and toast on failure
- [x] `[FE]` Add non-drag status alternative (select/menu) for accessibility
- [x] `[FE]` Add create-task dialog/form with RHF + Zod
- [x] `[FE]` Add Kanban filters (priority, assignee) and task title search
- [x] `[FE]` Support horizontal column scroll on small screens
- [x] `[TEST]` Test optimistic update rollback behavior (unit or integration)
- [x] `[DOC]` Document Kanban behavior and failure handling

---

## Milestone 8 — Dashboard, Analytics, Smart Insights

- [x] `[FE]` Build Dashboard page layout with metric cards
- [x] `[FE]` Fetch and render `/dashboard/summary` into cards
- [x] `[FE]` Add Project Progress chart
- [x] `[FE]` Add Task Status pie/donut chart
- [x] `[FE]` Add Team Workload bar chart
- [x] `[FE]` Add Monthly Activity line chart
- [x] `[FE]` Add recent activity list (API or derived/mock feed)
- [x] `[FE]` Add Smart Insights panel from `/dashboard/insights`
- [x] `[FE]` Build Analytics page (deeper chart/layout view; may reuse dashboard widgets)
- [x] `[FE]` Add skeletons, empty, and error states for all dashboard/analytics sections
- [x] `[FE]` Ensure charts reflow responsively without horizontal page overflow
- [x] `[TEST]` Smoke-test Dashboard and Analytics pages render with mocked API data
- [x] `[DOC]` Document chart data contracts and Insights mock behavior

---

## Milestone 9 — Testing hardening

- [x] `[TEST]` Backend: expand integration coverage for search, combined filters, and sort
- [x] `[TEST]` Backend: cover invalid status transitions and archived-update rejection
- [x] `[TEST]` Backend: cover dashboard aggregates with known seed fixtures
- [x] `[TEST]` Frontend: test projects filter/search UI state (reset filters)
- [x] `[TEST]` Frontend: test Kanban status alternative control updates task
- [x] `[TEST]` Add CI-friendly test scripts for backend and frontend
- [x] `[OPS]` Ensure tests run against ephemeral/test SQLite DB (not developer personal DB)
- [x] `[DOC]` Document how to run unit and integration tests locally

---

## Milestone 10 — Documentation & handoff

- [x] `[DOC]` Complete root README: prerequisites, install, migrate, seed, run FE/BE, test, env vars
- [x] `[DOC]` Add API overview linking to project/task/dashboard examples
- [x] `[DOC]` Add feature docs for Projects, Kanban, Dashboard/Analytics, Settings — see `docs/features/` (Settings is placeholder-only)
- [x] `[DOC]` Cross-link `project-context.md`, `spec.md`, `acceptance-criteria.md`, and this task list — each feature doc has a Cross-references section
- [x] `[DOC]` Note Stretch Auth as explicitly out of MVP unless completed — noted in feature docs and `docs/database.md`
- [x] `[DOC]` Record known limitations and future enhancements summary — `docs/known-limitations.md`, `docs/future-enhancements.md`
- [x] `[DOC]` Create meaningful Git commits after each completed milestone
- [x] `[DOC]` Maintain prompt-history folder — see `prompt-history/README.md` (71 prompts, grouped by milestone)
- [x] `[DOC]` Add reflection.md
- [x] `[DOC]` Add pull-request-description.md

---

## Milestone 11 — Deployment readiness

- [x] `[OPS]` Production build scripts for frontend and backend succeed locally — verified `npm run build:backend` + `npm run build:frontend` (2026-07-18)
- [x] `[OPS]` Document recommended process start order (migrate → seed → API → web) — covered in root README
- [x] `[OPS]` Configure frontend production API base URL via env — `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.example`
- [ ] `[OPS]` Verify SQLite path is configurable and writable in target environment
- [ ] `[OPS]` Add simple deployment notes (e.g., single VM/container, or separate FE/BE hosts)
- [ ] `[OPS]` Optional: Dockerfile(s) or compose file for API + web (justify if added)
- [ ] `[OPS]` Smoke-test deployed/local-prod-mode flow: list projects, create task, move Kanban card, open dashboard
- [x] `[DOC]` Add troubleshooting section (port conflicts, migration failures, CORS if applicable) — root README
- [ ] `[TEST]` Final acceptance pass against `spec.md` §15 checklist

---

## Milestone 12 — Stretch: Authentication (optional)

- [ ] `[STRETCH][BE]` Add `User` model with password hash field; never return hash in API
- [ ] `[STRETCH][BE]` Implement register/login with JWT issuance
- [ ] `[STRETCH][BE]` Add auth middleware and protect project/task/dashboard routes
- [ ] `[STRETCH][FE]` Build Login and Register pages
- [ ] `[STRETCH][FE]` Attach token to Axios requests; handle 401 redirect to login
- [ ] `[STRETCH][TEST]` Test protected route rejection and successful authenticated CRUD
- [ ] `[STRETCH][DOC]` Document auth flow, token storage choice, and security notes

---

## Suggested parallel tracks

| Track | Can start after | Tasks |
|-------|-----------------|-------|
| Backend APIs | Milestone 1 | Milestones 2–4 |
| Frontend shell | Milestone 0 | Milestone 5 (mock data OK until APIs ready) |
| Projects UI | Milestone 2 + 5 | Milestone 6 |
| Kanban UI | Milestone 3 + 5 | Milestone 7 |
| Dashboard UI | Milestone 4 + 5 | Milestone 8 |
| Docs | Anytime | Keep `[DOC]` tasks updated per milestone |

---

## Definition of milestone done

A milestone is done when:

1. All checklist items in that milestone are complete or explicitly deferred with a written note  
2. Related `[DOC]` items for that milestone are updated  
3. The app still boots (FE + BE) and prior milestone smoke paths still work
