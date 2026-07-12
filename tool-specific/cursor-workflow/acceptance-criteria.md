# AI Project Tracker Pro — Acceptance Criteria

**Related documents:** `project-context.md`, `spec.md`, `tasks.md`  
**Format:** Given / When / Then  
**Rule:** A feature is accepted only when all of its MVP criteria pass. Stretch criteria are optional.

---

## 1. Projects — Create

### AC-P01 — Create project (happy path)
**Given** the user is on the Create Project page with a valid form  
**When** they submit name, description, status, priority, owner, dates, progress, and optional risk notes  
**Then** the UI shows a success toast, the project appears in the Projects list, and a corresponding row exists in the database with matching field values and `isArchived = false`

### AC-P02 — Client validation blocks invalid create
**Given** the Create Project form is open  
**When** the user submits with name shorter than 3 characters, progress outside 0–100, or endDate before startDate  
**Then** field-level validation errors are shown, no API create call succeeds, and no new project row is written to the database

### AC-P03 — Server validation rejects invalid create
**Given** a create request bypasses the client or sends an invalid body  
**When** `POST /api/projects` receives invalid data  
**Then** the API responds `400` with the standard error envelope (`VALIDATION_ERROR` + field `details`) and no project is persisted

### AC-P04 — Duplicate name conflict
**Given** a non-archived project named “Portal Redesign” already exists  
**When** the user attempts to create another non-archived project with the same name  
**Then** the API responds `409 CONFLICT`, the UI shows an error toast or form error, and no duplicate row is created

---

## 2. Projects — Read / List / Detail

### AC-P05 — List non-archived projects
**Given** the database contains active and archived projects  
**When** the user opens the Projects page (default filters)  
**Then** only non-archived projects are shown, with loading skeleton first and a populated list afterward

### AC-P06 — Empty list state
**Given** there are no non-archived projects  
**When** the user opens the Projects page  
**Then** an empty state is shown (not an error), with a clear call-to-action to create a project

### AC-P07 — Project detail view
**Given** a project exists  
**When** the user opens Project Details for that id  
**Then** the UI shows name, description, status, priority, owner, dates, progress, risk notes, and a task summary, loaded from `GET /api/projects/:id`

### AC-P08 — Missing project detail
**Given** no project exists for the requested id  
**When** the user opens that detail URL or `GET /api/projects/:id` is called  
**Then** the API returns `404 NOT_FOUND` and the UI shows an error/not-found state (not a blank page)

---

## 3. Projects — Update / Archive / Restore

### AC-P09 — Update project persists
**Given** an existing non-archived project  
**When** the user edits allowed fields and saves  
**Then** a success toast appears, detail/list reflect the new values, and the database row is updated (`updatedAt` changes)

### AC-P10 — Invalid status transition rejected
**Given** a project in `COMPLETED` (or another disallowed transition per `spec.md`)  
**When** an update requests an invalid status change  
**Then** the API rejects with a clear validation/business error, the UI shows the error, and the database status is unchanged

### AC-P11 — Archive requires confirmation
**Given** the user chooses Archive on a project  
**When** the confirmation dialog is shown  
**Then** no archive occurs until they confirm; cancel leaves the project unchanged

### AC-P12 — Archive soft-deletes
**Given** the user confirms archive  
**When** archive completes  
**Then** the UI removes the project from the default list, a success toast is shown, `isArchived = true` in the database, and default dashboard counts exclude it

### AC-P13 — Restore archived project
**Given** an archived project  
**When** the user restores it  
**Then** `isArchived = false` in the database, the project returns to the default list, and a success toast is shown

### AC-P14 — Updates blocked while archived
**Given** a project is archived  
**When** a `PATCH` update is attempted before restore  
**Then** the API rejects the update and the database fields (other than archive state) remain unchanged

---

## 4. Tasks

### AC-T01 — Create task under project
**Given** a non-archived project exists  
**When** the user creates a task with valid title, status, priority, and optional assignee/due date  
**Then** a success toast appears, the task is visible on the board/list for that project, and a Task row is stored with the correct `projectId`

### AC-T02 — Task validation
**Given** the create/edit task form or API  
**When** title is missing/too short, status/priority is invalid, or `projectId` is missing  
**Then** client and/or server validation errors are returned and no invalid task is persisted

### AC-T03 — Reject task on archived/missing project
**Given** the target project is missing or archived  
**When** `POST /api/tasks` is called for that project  
**Then** the API returns an error (`404` or validation/conflict as specified) and no task row is created

### AC-T04 — Update task fields
**Given** an existing task  
**When** the user updates title, description, assignee, priority, due date, or status  
**Then** the UI reflects the change, the API succeeds, and the database row matches

### AC-T05 — Archive / restore task
**Given** an existing task  
**When** the user archives then restores it (with confirmation on destructive archive)  
**Then** `isArchived` toggles correctly in the database and default board views exclude archived tasks

---

## 5. Kanban

### AC-K01 — Column layout
**Given** the user opens the Kanban page for a selected project  
**When** tasks are loaded  
**Then** four columns appear left-to-right: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, and each task card is in the column matching its status

### AC-K02 — Drag-and-drop immediate UI update
**Given** a task card is in `TODO`  
**When** the user drags it to `IN_PROGRESS`  
**Then** the card appears in `IN_PROGRESS` immediately without waiting for a full page reload

### AC-K03 — Drag-and-drop persistence
**Given** a successful drag to a new column  
**When** the status update API completes  
**Then** the task’s `status` (and optional `sortOrder`) is updated in the database

### AC-K04 — Drag-and-drop failure rollback
**Given** the status update API fails or times out  
**When** the optimistic move has already changed the UI  
**Then** the card returns to its previous column, an error toast is shown, and the database status is unchanged

### AC-K05 — Non-drag status alternative
**Given** a task card is visible on the board  
**When** the user changes status via select/menu (keyboard accessible)  
**Then** the same persistence and failure-rollback rules as drag-and-drop apply

### AC-K06 — Project context on board
**Given** multiple projects exist  
**When** the user selects a project context on Kanban  
**Then** only tasks for that project are shown in the columns

---

## 6. Dashboard

### AC-D01 — Metric cards
**Given** seeded or live project data exists  
**When** the user opens the Dashboard  
**Then** metric cards show correct aggregates (e.g., total, in progress, at risk, completed) from `/api/dashboard/summary`

### AC-D02 — Recent activity
**Given** dashboard data is available  
**When** the Dashboard renders  
**Then** a recent activity section shows items derived from API/mock feed, or an empty state if none exist

### AC-D03 — Dashboard loading and error
**Given** the Dashboard is opening  
**When** summary data is loading or the API fails  
**Then** skeletons appear while loading, and a visible error state appears on failure (no silent blank dashboard)

### AC-D04 — Dashboard empty portfolio
**Given** there are no projects/tasks  
**When** the Dashboard loads successfully  
**Then** empty states are shown for cards/charts/insights rather than broken widgets

---

## 7. Charts & Analytics

### AC-C01 — Project Progress chart
**Given** dashboard/analytics summary data includes progress series  
**When** the chart renders  
**Then** a Project Progress chart is visible with labels/legend or an empty-data state

### AC-C02 — Task Status pie chart
**Given** tasks exist across statuses  
**When** Analytics/Dashboard charts render  
**Then** the Task Status pie/donut reflects counts per `TODO` / `IN_PROGRESS` / `IN_REVIEW` / `DONE`

### AC-C03 — Team Workload bar chart
**Given** tasks have assignees (including unassigned)  
**When** the workload chart renders  
**Then** bars represent task counts by assignee, including an unassigned bucket when applicable

### AC-C04 — Monthly Activity line chart
**Given** create/update activity data (or approximation from timestamps) is available  
**When** the line chart renders  
**Then** monthly points are plotted with readable axes/labels or an empty state

### AC-C05 — Analytics page composition
**Given** the user navigates to Analytics  
**When** the page loads  
**Then** the four chart types are available in a dedicated layout, reusing summary API data, with loading/empty/error states

---

## 8. Smart Insights

### AC-I01 — Mock insights render
**Given** `/api/dashboard/insights` returns insight cards derived from current data  
**When** the Dashboard Insights panel loads  
**Then** mock recommendations are displayed (e.g., at-risk count, workload imbalance) without calling an external AI provider

### AC-I02 — Insights failure handling
**Given** the insights endpoint fails  
**When** the Insights panel attempts to load  
**Then** a section-level error/empty fallback is shown and the rest of the Dashboard remains usable

---

## 9. Search

### AC-S01 — Project name search
**Given** projects named “Alpha Portal” and “Beta API” exist  
**When** the user searches for “portal” (case-insensitive)  
**Then** only matching projects are listed and the request uses query param `q`

### AC-S02 — Debounced search
**Given** the user is typing in the search box  
**When** keystrokes occur rapidly  
**Then** list requests are debounced (≈300–500ms) rather than fired on every keypress

### AC-S03 — Clear search
**Given** an active search query is applied  
**When** the user clears search  
**Then** the full result set returns subject to remaining filters, and the “no results” state is dismissed if data exists

### AC-S04 — Search no-results state
**Given** no projects match `q`  
**When** results return empty  
**Then** a distinct “No results” empty state is shown (different from “No projects yet”)

### AC-S05 — Task search on Kanban
**Given** tasks with different titles exist on the board  
**When** the user searches by task title  
**Then** only matching task cards remain visible (or the API-filtered set is shown)

### AC-S06 — Backend search persistence-independent
**Given** `GET /api/projects?q=...` is called  
**When** matching rows exist in SQLite  
**Then** the API returns case-insensitive partial matches on name (and description if enabled) without mutating data

---

## 10. Filtering & Sorting

### AC-F01 — Filter by status
**Given** projects in multiple statuses exist  
**When** the user filters by a single status  
**Then** only projects with that status are shown and the API receives `status`

### AC-F02 — Filter by priority
**Given** projects with mixed priorities exist  
**When** the user filters by priority  
**Then** only matching-priority projects are shown

### AC-F03 — Filter by owner
**Given** projects owned by different owners exist  
**When** the user selects an owner filter  
**Then** only that owner’s projects are shown

### AC-F04 — Combined filters (AND)
**Given** status, priority, and owner filters are all set  
**When** the list refreshes  
**Then** results satisfy all active filters simultaneously

### AC-F05 — Reset filters
**Given** multiple filters and a search query are active  
**When** the user clicks Reset filters  
**Then** filter controls clear and the list reloads without those constraints (search may clear or remain per UI design—document behavior; recommended: reset filters only, with separate clear for search if shown)

### AC-F06 — Sort projects
**Given** a multi-project list  
**When** the user sorts by name, createdAt, updatedAt, priority, or progress (asc/desc)  
**Then** order matches the selected `sortBy` / `sortOrder` from the API

### AC-F07 — Kanban filters
**Given** the Kanban board is open  
**When** the user filters by priority and/or assignee  
**Then** only matching tasks remain visible in columns

### AC-F08 — Include archived toggle
**Given** archived projects exist  
**When** `includeArchived=true` is enabled  
**Then** archived projects appear in the list; when false/default, they do not

---

## 11. Shared UI Behavior

### AC-U01 — Success toasts
**Given** a create/update/archive/restore mutation succeeds  
**When** the API returns success  
**Then** a success toast is shown

### AC-U02 — Error toasts / inline errors
**Given** a mutation fails (network or API error)  
**When** the failure is handled by the UI  
**Then** an error toast and/or inline form errors are shown; the UI does not fail silently

### AC-U03 — Confirmation dialogs
**Given** the user initiates a destructive action (archive)  
**When** the action is triggered  
**Then** a confirmation dialog appears before the API call

### AC-U04 — App shell navigation
**Given** the app is loaded  
**When** the user uses side navigation  
**Then** they can reach Dashboard, Projects, Kanban, and Analytics

---

## 12. Validation (cross-cutting)

### AC-V01 — Mirrored client/server rules
**Given** project and task Zod schemas exist on client and server  
**When** the same invalid payload is submitted through UI and API  
**Then** both reject it; server remains source of truth

### AC-V02 — Enum enforcement
**Given** a request uses an unknown status or priority  
**When** validators run  
**Then** the request is rejected with field-level details and nothing is written to the database

### AC-V03 — Progress bounds
**Given** a project create/update payload  
**When** `progress` is not an integer from 0–100  
**Then** validation fails on client and server

### AC-V04 — Date ordering
**Given** both `startDate` and `endDate` are provided  
**When** `endDate` is before `startDate`  
**Then** validation fails and no persistence occurs

---

## 13. Backend behavior & error handling

### AC-B01 — Standard success envelope
**Given** a successful resource or collection request  
**When** the API responds  
**Then** the body uses the standard `data` (and `meta` for collections) shape from `spec.md`

### AC-B02 — Standard error envelope
**Given** a validation, not-found, conflict, or internal error  
**When** the error middleware handles it  
**Then** the response uses `{ error: { message, code, details? } }` and does not leak stack traces to the client

### AC-B03 — Layered architecture
**Given** an HTTP request hits a route  
**When** it is processed  
**Then** controllers remain thin, services own business rules, and Prisma access occurs in the data/service layer—not ad hoc in controllers

### AC-B04 — Health check
**Given** the backend is running  
**When** `GET /api/health` is called  
**Then** a successful health response is returned

### AC-B05 — Centralized logging
**Given** an unexpected server error occurs  
**When** error middleware runs  
**Then** the error is logged server-side and the client receives `500 INTERNAL_ERROR`

---

## 14. Database persistence

### AC-DB01 — Project persistence round-trip
**Given** a project is created via API  
**When** the database is queried (Prisma/SQLite)  
**Then** all submitted scalar fields are stored correctly and survive server restart

### AC-DB02 — Task–project relationship
**Given** a task is created for a project  
**When** the task is loaded  
**Then** `projectId` foreign key references the correct project and list-by-project returns it

### AC-DB03 — Soft archive not hard delete
**Given** a project or task is archived  
**When** the database is inspected  
**Then** the row still exists with `isArchived = true` (not physically deleted)

### AC-DB04 — Seed data
**Given** a fresh environment after migrate + seed  
**When** the app starts  
**Then** demo projects and tasks exist so lists, Kanban, and charts are non-empty

### AC-DB05 — SQLite portability
**Given** only Node tooling and the repo are available  
**When** an evaluator runs migrate/seed  
**Then** persistence works without an external database server

---

## 15. Responsive design

### AC-R01 — Desktop layout
**Given** viewport width ≥ 1200px  
**When** the user views Dashboard and Projects  
**Then** side nav can persist, dashboard can use multi-column layout, and projects can use table layout

### AC-R02 — Tablet layout
**Given** viewport width is 768–1199px  
**When** the user navigates the app  
**Then** nav is collapsible/drawer-based and content reflows without critical overflow

### AC-R03 — Mobile layout
**Given** viewport width < 768px  
**When** the user views Dashboard, Projects, Kanban, Analytics, and Settings  
**Then** nav uses a temporary drawer, metric cards/charts stack, project list uses cards if needed, and forms are single-column

### AC-R04 — Mobile Kanban usability
**Given** a mobile viewport  
**When** the user uses Kanban  
**Then** columns scroll horizontally, drag is touch-friendly, and the non-drag status control remains available

### AC-R05 — No trapped actions
**Given** any supported breakpoint  
**When** the user needs to create/edit/archive or change task status  
**Then** those primary actions remain reachable

### AC-R06 — Chart overflow
**Given** a narrow viewport  
**When** charts render  
**Then** the page does not require unusable horizontal scrolling of the whole app shell (charts reflow or scroll locally)

---

## 16. Testing requirements

### AC-TEST01 — Validator unit tests
**Given** project and task Zod validators  
**When** unit tests run  
**Then** valid fixtures pass and invalid fixtures (required fields, enums, progress, dates) fail with expected paths

### AC-TEST02 — Project API integration tests
**Given** a test database  
**When** integration tests run for project CRUD, archive, restore, search, filters, and sort  
**Then** all scenarios pass and assert DB side effects where relevant

### AC-TEST03 — Task / Kanban API integration tests
**Given** a test database with a project  
**When** task CRUD and status update tests run  
**Then** persistence and rejection rules (missing/archived project) pass

### AC-TEST04 — Dashboard API tests
**Given** known seed fixtures  
**When** summary/insights tests run  
**Then** aggregates and insight payloads are non-empty and structurally valid

### AC-TEST05 — Frontend form validation tests
**Given** project/task form components or schema tests  
**When** invalid input is submitted in tests  
**Then** expected field errors are asserted

### AC-TEST06 — Kanban failure-path test
**Given** a mocked failing status update API  
**When** a move is attempted in tests  
**Then** UI rollback/error handling expectations are asserted

### AC-TEST07 — CI-friendly scripts
**Given** the repository scripts  
**When** a reviewer runs documented test commands  
**Then** backend and frontend tests run against an ephemeral/test DB configuration without destroying a developer’s personal SQLite file

### AC-TEST08 — Final acceptance pass
**Given** MVP features are implemented  
**When** QA walks this document’s MVP criteria  
**Then** all non-stretch criteria are checked off or explicitly waived in writing

---

## 17. Documentation & deployment acceptance

### AC-DOC01 — Setup documentation
**Given** a clean machine with prerequisites  
**When** a reviewer follows the README  
**Then** they can install, migrate, seed, and run frontend + backend successfully

### AC-DOC02 — API documentation
**Given** project, task, and dashboard endpoints  
**When** a reviewer reads API docs  
**Then** request/response examples exist for primary operations and error shapes

### AC-DOC03 — No secrets in repo
**Given** the committed repository contents  
**When** scanned for credentials  
**Then** no API keys, passwords, or private secrets are present; `.env.example` has placeholders only

### AC-DOC04 — Production build smoke
**Given** production build scripts  
**When** builds run and the app is started in local production-like mode  
**Then** list projects, create/update a task, move a Kanban card, and open Dashboard all succeed

---

## 18. Stretch — Authentication (optional)

### AC-AUTH01 — Register / login
**Given** Auth stretch is implemented  
**When** a user registers and logs in with valid credentials  
**Then** a JWT (or documented session mechanism) is issued and `/api/auth/me` returns the user without password hash

### AC-AUTH02 — Protected routes
**Given** Auth stretch is enabled  
**When** an unauthenticated client calls protected project/task/dashboard routes  
**Then** the API rejects with `401` and no unauthorized mutation persists

### AC-AUTH03 — Frontend auth gate
**Given** Auth stretch is enabled  
**When** the token is missing/expired  
**Then** the UI routes the user to login and authenticated Axios calls attach the token per documented approach

---

## Traceability (summary)

| Area | Criterion IDs |
|------|----------------|
| Projects | AC-P01–AC-P14 |
| Tasks | AC-T01–AC-T05 |
| Kanban | AC-K01–AC-K06 |
| Dashboard | AC-D01–AC-D04 |
| Charts / Analytics | AC-C01–AC-C05 |
| Smart Insights | AC-I01–AC-I02 |
| Search | AC-S01–AC-S06 |
| Filtering / Sorting | AC-F01–AC-F08 |
| Shared UI | AC-U01–AC-U04 |
| Validation | AC-V01–AC-V04 |
| Backend / errors | AC-B01–AC-B05 |
| Database | AC-DB01–AC-DB05 |
| Responsive | AC-R01–AC-R06 |
| Testing | AC-TEST01–AC-TEST08 |
| Docs / deploy | AC-DOC01–AC-DOC04 |
| Auth (stretch) | AC-AUTH01–AC-AUTH03 |
