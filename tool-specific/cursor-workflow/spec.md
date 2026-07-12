# AI Project Tracker Pro — Software Specification

**Document type:** Software Requirements Specification (SRS)  
**Product:** AI Project Tracker Pro  
**Status:** Draft for implementation  
**Related documents:** `project-context.md`, `acceptance-criteria.md`, `tasks.md`, `cursor-rules-or-instructions.md`

---

## 1. Purpose

This specification defines the functional behavior, non-functional expectations, data model, APIs, UI surfaces, validation rules, and acceptance criteria for **AI Project Tracker Pro**—a production-quality SaaS dashboard for creating, managing, and monitoring projects and tasks.

Implementation must follow this document and `project-context.md`. Scope not listed here must not be invented without explicit approval.

---

## 2. Scope

### In scope (MVP)

- Project lifecycle management (create, read, update, archive/soft-delete)
- Task management with Kanban board (drag-and-drop, status columns, API sync)
- Dashboard with summary metrics, analytics cards, and charts
- Search and filtering across projects (and tasks where applicable)
- Smart Insights panel using **mock analytics / recommendations** (no live model dependency)
- REST API with Zod validation, Prisma persistence (SQLite), centralized errors
- Responsive, accessible Material UI experience with full operational UI states

### Out of scope (MVP)

- JWT / session authentication (Stretch Goal — see §14)
- Billing, subscriptions, multi-region deployment
- Real-time multi-user collaboration (presence, live cursors)
- Deep ALM integrations (Jira, Azure DevOps, GitHub Projects)
- Live AI model inference or paid AI provider integration

---

## 3. Functional Requirements

### 3.1 Project management

| ID | Requirement |
|----|-------------|
| FR-P01 | Users can create a project with required and optional fields defined in §8. |
| FR-P02 | Users can view a paginated (or scrollable) list of non-archived projects. |
| FR-P03 | Users can open a project detail view showing full metadata and related tasks summary. |
| FR-P04 | Users can update project fields subject to validation and status rules. |
| FR-P05 | Users can archive (soft-delete) a project; archived projects are excluded from default lists and dashboard aggregates unless an “include archived” control is enabled. |
| FR-P06 | Users can restore an archived project (Implemented behavior). |
| FR-P07 | Project status must be one of the allowed enumerated values; invalid transitions are rejected with a clear error. |
| FR-P08 | Progress percentage must be an integer from 0–100. |

### 3.2 Task management & Kanban

| ID | Requirement |
|----|-------------|
| FR-T01 | Users can create tasks linked to a project. |
| FR-T02 | Users can update task title, description, assignee, priority, due date, and status. |
| FR-T03 | Users can delete or archive tasks per entity rules in §7. |
| FR-T04 | Kanban board displays tasks in columns by status. |
| FR-T05 | Users can drag and drop a task between columns; UI updates immediately (optimistic or instant local update). |
| FR-T06 | Status changes from Kanban are persisted via the backend; failures roll back UI state and show an error toast. |
| FR-T07 | Kanban can be filtered to a single project or show a portfolio/board scope as defined by the page design (default: selectable project context). |

### 3.3 Dashboard & Smart Insights

| ID | Requirement |
|----|-------------|
| FR-D01 | Dashboard shows summary metric cards (e.g., total projects, in progress, at risk, completed). |
| FR-D02 | Dashboard shows recent activity (derived from recent project/task updates; may use seed/mock feed if activity log entity is deferred). |
| FR-D03 | Dashboard includes charts listed in §12. |
| FR-D04 | Smart Insights panel displays mock recommendations (e.g., “3 projects at risk,” “Team workload imbalance”) based on computed or seeded analytics—not live LLM calls. |
| FR-D05 | Empty, loading (skeleton), and error states are implemented for dashboard sections. |

### 3.4 Search

| ID | Requirement |
|----|-------------|
| FR-S01 | Users can search projects by name (case-insensitive partial match). |
| FR-S02 | Search may optionally match description (recommended). |
| FR-S03 | Search input debounces (recommended 300–500ms) to avoid excessive requests. |
| FR-S04 | Clearing search restores the unfiltered result set (subject to active filters). |
| FR-S05 | Task search by title within a project or Kanban context is supported (Implemented). |

### 3.5 Filtering & sorting

| ID | Requirement |
|----|-------------|
| FR-F01 | Users can filter projects by **status**. |
| FR-F02 | Users can filter projects by **priority**. |
| FR-F03 | Users can filter projects by **owner** (exact or selectable owner value). |
| FR-F04 | Multiple filters combine with AND semantics. |
| FR-F05 | Users can sort projects by name, created date, updated date, priority, or progress. |
| FR-F06 | Filter and sort state is reflected in the UI; resetting filters clears all active filter controls. |
| FR-F07 | Tasks can be filtered on the Kanban/list by status, priority, and assignee where those controls are present. |

### 3.6 Shared UX behaviors

| ID | Requirement |
|----|-------------|
| FR-U01 | Destructive actions (archive/delete) require a confirmation dialog. |
| FR-U02 | Successful mutations show toast notifications. |
| FR-U03 | Failed mutations show actionable error toasts or inline form errors. |
| FR-U04 | Forms use React Hook Form + Zod on the client; server re-validates with Zod. |
| FR-U05 | Keyboard-accessible navigation and focus management for primary flows. |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | Primary list and dashboard initial load should feel responsive under seed data volumes (target: meaningful content within ~2s on local/dev hardware). |
| NFR-02 | Usability | Desktop-first SaaS dashboard; usable on tablet and mobile per §13. |
| NFR-03 | Accessibility | Follow Material UI accessibility patterns; visible focus; semantic headings; operable without relying solely on drag-and-drop (provide alternative status control). |
| NFR-04 | Reliability | API returns consistent error envelopes; frontend never fails silently on network/API errors. |
| NFR-05 | Maintainability | Feature-based frontend; layered backend; TypeScript-only; no duplicated validation logic. |
| NFR-06 | Security | No hardcoded secrets; no auth bypass hooks left in code; input validated on server; Stretch auth must not weaken validation. |
| NFR-07 | Portability | SQLite + Prisma so the project runs without external DB setup. |
| NFR-08 | Observability | Backend logs errors centrally via error middleware (structured enough for debugging). |
| NFR-09 | Documentation | Each feature and API documented with request/response examples. |
| NFR-10 | Quality | Critical validation and service logic must be testable; automated tests as defined in tasks/acceptance criteria. |
| NFR-11 | Consistency | Shared enums/constants for status, priority, and routes—no magic strings in UI/API clients. |
| NFR-12 | UX polish | Skeleton loaders, empty states, error states, and restrained professional motion (not decorative noise). |

---

## 5. Modules

| Module | Responsibility |
|--------|----------------|
| **Projects** | CRUD/archive, list, detail, validation, project-level progress |
| **Tasks** | CRUD/archive, assignment, priority, due dates, status |
| **Kanban** | Column layout, drag-and-drop, optimistic UI, sync with task status API |
| **Dashboard** | Metric cards, recent activity, chart widgets, layout composition |
| **Smart Insights** | Mock recommendations and insight cards derived from portfolio/task stats |
| **Search & Filters** | Query params / client state for search, filter, sort |
| **Shared UI** | Layout shell, dialogs, toasts, skeletons, Button, Modal, Card, Drawer, Table, SearchBar, FilterPanel, ChartCard, Loader, EmptyState, Toast, ConfirmationDialog, PageHeader, empty/error components |
| **API Platform** | Express routes, controllers, services, Prisma, Zod validators, error middleware |
| **Auth (Stretch)** | Optional JWT register/login and protected routes |

---

## 6. Database Entities

Persistence via **Prisma + SQLite**. Soft-delete/archive preferred over hard delete for projects (and recommended for tasks).

### 6.1 User (optional for MVP; required for Stretch Auth)

Used when auth or assignee identity is persisted.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid/uuid) | PK |
| email | String | Unique |
| name | String | Display name |
| passwordHash | String | Stretch auth only; never returned by API |
| role | Enum | e.g. `MEMBER`, `ADMIN` (optional MVP) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

> **MVP note:** If auth is deferred, `owner` / `assignee` may be stored as plain strings on Project/Task, with a seed set of representative names. Prefer a `User` table if time allows for cleaner Kanban assignee filters.

### 6.2 Project

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid/uuid) | PK |
| name | String | Required, unique recommended |
| description | String? | Optional |
| status | Enum | See §8.1 |
| priority | Enum | See §8.2 |
| owner | String | Owner display name or userId reference |
| startDate | DateTime? | Optional |
| endDate | DateTime? | Optional; must be ≥ startDate when both set |
| progress | Int | 0–100 |
| riskNotes | String? | Blockers / risk narrative |
| isArchived | Boolean | Default false |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### 6.3 Task

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid/uuid) | PK |
| projectId | String | FK → Project |
| title | String | Required |
| description | String? | Optional |
| status | Enum | Kanban column status — see §8.3 |
| priority | Enum | See §8.2 |
| assignee | String? | Display name or userId |
| dueDate | DateTime? | Optional |
| sortOrder | Int? | Optional ordering within column |
| isArchived | Boolean | Default false |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### 6.4 Relationships

- Project **1 — N** Task
- User **1 — N** Project (optional, if owner is FK)
- User **1 — N** Task (optional, if assignee is FK)

---

## 7. API Overview

Base URL (example): `http://localhost:<port>/api`  
Content-Type: `application/json`  
Auth: Not required for MVP; Bearer JWT when Stretch Auth is enabled.

### 7.1 Standard response shapes

**Success (resource):**

```json
{
  "data": { }
}
```

**Success (collection):**

```json
{
  "data": [ ],
  "meta": {
    "total": 0,
    "page": 1,
    "pageSize": 20
  }
}
```

**Error:**

```json
{
  "error": {
    "message": "Human-readable summary",
    "code": "VALIDATION_ERROR",
    "details": [ { "path": "name", "message": "Name is required" } ]
  }
}
```

### 7.2 Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects` | List projects; supports `q`, `status`, `priority`, `owner`, `sortBy`, `sortOrder`, `page`, `pageSize`, `includeArchived` |
| GET | `/projects/:id` | Get project by id |
| POST | `/projects` | Create project |
| PATCH | `/projects/:id` | Update project |
| POST | `/projects/:id/archive` | Soft-archive project |
| POST | `/projects/:id/restore` | Restore archived project |
| GET | `/projects/stats` | Aggregate counts for dashboard cards (optional dedicated endpoint) |

**Example create body:**

```json
{
  "name": "Customer Portal Redesign",
  "description": "Refresh authenticated portal UX",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "owner": "Alex Morgan",
  "startDate": "2026-07-01",
  "endDate": "2026-09-30",
  "progress": 35,
  "riskNotes": "Design dependency on brand team"
}
```

### 7.3 Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | List tasks; supports `projectId`, `q`, `status`, `priority`, `assignee`, `includeArchived` |
| GET | `/tasks/:id` | Get task by id |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task (including status for Kanban) |
| POST | `/tasks/:id/archive` | Soft-archive task |
| POST | `/tasks/:id/restore` | Restore archived task |

**Example Kanban status update:**

```json
{
  "status": "IN_PROGRESS",
  "sortOrder": 2
}
```

### 7.4 Dashboard / analytics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/summary` | Metric cards + chart series payloads |
| GET | `/dashboard/insights` | Mock AI insight cards derived from current data |

These endpoints may compute aggregates server-side from Project/Task tables. Chart payloads should be chart-ready (labels + values) to keep the frontend thin.

### 7.5 Auth (Stretch only)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login; returns JWT |
| GET | `/auth/me` | Current user |

---

## 8. Validation Rules

Validation applies on **both** client (React Hook Form + Zod) and server (Zod). Server is source of truth.

### 8.1 Project status enum

`PLANNED` | `IN_PROGRESS` | `ON_HOLD` | `AT_RISK` | `COMPLETED`

**Transition guidance (enforce at service layer):**

- Any non-archived status may move to `ON_HOLD` or `AT_RISK` (except from `COMPLETED` only via explicit reopen to `IN_PROGRESS` or `PLANNED`).
- `COMPLETED` requires `progress = 100` (recommended rule).
- Archived projects cannot be updated until restored.

### 8.2 Priority enum

`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`

### 8.3 Task status enum (Kanban columns)

`TODO` | `IN_PROGRESS` | `IN_REVIEW` | `DONE`

Column order on the board must match this sequence left-to-right.

### 8.4 Field rules

| Entity | Field | Rules |
|--------|-------|-------|
| Project | name | Required; trim; min 3; max 120; unique among non-archived (recommended) |
| Project | description | Optional; max 2000 |
| Project | status | Required; enum |
| Project | priority | Required; enum |
| Project | owner | Required; trim; min 2; max 80 |
| Project | startDate / endDate | ISO date; if both present, endDate ≥ startDate |
| Project | progress | Integer 0–100 |
| Project | riskNotes | Optional; max 2000 |
| Task | title | Required; trim; min 3; max 160 |
| Task | description | Optional; max 2000 |
| Task | projectId | Required; must reference existing non-archived project |
| Task | status | Required; enum |
| Task | priority | Required; enum |
| Task | assignee | Optional; max 80 |
| Task | dueDate | Optional ISO date |
| Task | sortOrder | Optional integer ≥ 0 |

### 8.5 API validation behavior

- Invalid body → `400 VALIDATION_ERROR` with field `details`
- Missing resource → `404 NOT_FOUND`
- Conflict (e.g., duplicate name) → `409 CONFLICT`
- Unexpected failure → `500 INTERNAL_ERROR` (no stack traces to client)

---

## 9. Search

### Behavior

- Query parameter: `q`
- Matching: case-insensitive contains on project `name` (and `description` if enabled)
- Tasks: case-insensitive contains on `title` (and `description` if enabled)
- Empty `q` means no search constraint
- Search composes with filters (AND)

### UX

- Search field on Projects list and optionally on Kanban toolbar
- Debounced input; show clear (×) control
- Display “No results” empty state distinct from “No projects yet”

---

## 10. Filtering

### Projects list filters

| Filter | Param | Values |
|--------|-------|--------|
| Status | `status` | Project status enum (single or multi if implemented) |
| Priority | `priority` | Priority enum |
| Owner | `owner` | Exact owner string from known owners |
| Archived | `includeArchived` | `true` \| `false` (default false) |

### Sort

| Param | Values |
|-------|--------|
| `sortBy` | `name`, `createdAt`, `updatedAt`, `priority`, `progress` |
| `sortOrder` | `asc`, `desc` |

### Tasks / Kanban filters

- `projectId` (required for single-project board; optional for multi-project if supported)
- `priority`, `assignee`, `q`

### UX rules

- Active filters visible as chips or labeled controls
- “Reset filters” clears all
- Changing filters refreshes list/board without full page reload

---

## 11. Charts

Dashboard must include the following visualizations (Material UI–compatible chart library as chosen in implementation tasks; keep dependency minimal and justified).

| Chart | Type | Data meaning |
|-------|------|--------------|
| Project Progress Chart | Bar or horizontal bar | Average or distribution of project `progress` by project or by status bucket |
| Task Status Pie Chart | Pie / donut | Count of tasks per task status |
| Team Workload Bar Chart | Bar | Task counts grouped by `assignee` (unassigned bucket allowed) |
| Monthly Activity Line Chart | Line | Counts of creates/updates per month (from Activity or approximated from `createdAt`/`updatedAt`) |

### Chart requirements

- Readable legends and labels
- Empty-data state when series are empty
- Loading skeleton while summary API loads
- Responsive: charts reflow; avoid horizontal overflow on mobile (scroll or simplified layout)

---

## 12. Frontend Pages

App Router pages (illustrative routes; names may map to route groups):

| Page | Route (example) | Purpose |
|------|-----------------|---------|
| Dashboard | `/` or `/dashboard` | Metrics, charts, AI insights, recent activity |
| Projects list | `/projects` | Search, filter, sort, create CTA, table/cards |
| Project create/edit | `/projects/new`, `/projects/:id/edit` | Form with RHF + Zod |
| Project detail | `/projects/:id` | Metadata, risk notes, task summary, link to board |
| Kanban board | `/board` or `/projects/:id/board` | Drag-and-drop task columns |
| Not found | `not-found` | Friendly 404 |
| Auth (Stretch) | `/login`, `/register` | Credential forms |

### Shared chrome

- App shell: top bar + side navigation (collapsible on smaller breakpoints)
- Global toast host
- Consistent page titles and breadcrumbs on detail/edit flows

---

## Wireframes

Primary screens:

- Dashboard
- Projects
- Project Details
- Kanban
- Analytics
- Settings

---

## Design System

- Primary Color
- Secondary Color
- Typography
- Spacing
- Elevation
- Border Radius
- Icons
- Animations
- Responsive Grid

---

## 13. Backend Architecture

```
Client (Next.js)
    │  Axios REST
    ▼
routes          → map HTTP paths/methods
controllers     → parse input, call services, shape responses
validators      → Zod schemas (params, query, body)
services        → business rules, transitions, aggregates
prisma          → schema, client, migrations, seeds
middleware      → error handler, request logging, (Stretch) auth
```

### Responsibilities

- **Controllers** stay thin; no Prisma calls inside controllers.
- **Services** own archive rules, status transitions, uniqueness checks, dashboard aggregations.
- **Validators** shared conceptually with frontend schemas (duplicated packages acceptable if kept in sync; prefer mirrored Zod definitions).
- **Error middleware** normalizes all thrown errors to the standard error envelope.
- **Seeds** provide demo projects, tasks, and owners so charts and Kanban are non-empty on first run.

---

## 14. Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1200px) | Persistent side nav; multi-column dashboard; full chart grid; table layouts for projects |
| Tablet (768–1199px) | Collapsible/drawer nav; 2-column dashboard where possible; tables may scroll horizontally |
| Mobile (<768px) | Temporary drawer nav; stacked metric cards; charts stacked full-width; project list as cards; Kanban supports horizontal column scroll with touch-friendly drag |

### Additional rules

- No critical action unreachable on mobile
- Kanban must remain usable: horizontal scroll for columns; alternative status select on task card/menu for accessibility
- Touch targets adequately sized for primary actions
- Forms remain single-column on small screens

---

## 15. Acceptance Criteria

### Projects

- [ ] User can create a valid project and see it in the list without refresh errors
- [ ] Invalid project payloads show field-level errors on client and matching API validation errors
- [ ] User can edit project fields and persist changes
- [ ] User can archive a project after confirmation; it disappears from default list and default dashboard counts
- [ ] User can restore an archived project
- [ ] Search by name returns partial matches and supports empty-result state
- [ ] Filters by status, priority, and owner work independently and in combination
- [ ] Sort options change list order correctly

### Tasks & Kanban

- [ ] User can create tasks under a project
- [ ] Kanban shows four columns in the specified order
- [ ] Drag-and-drop updates column membership immediately in the UI
- [ ] Status change persists; on API failure, UI reverts and shows an error toast
- [ ] Non-drag alternative exists to change task status (menu/select)

### Dashboard & charts

- [ ] Metric cards render with correct aggregates for seed/current data
- [ ] All four chart types render with legends/labels or empty states
- [ ] Smart Insights panel shows mock recommendations derived from data (no external AI call required)
- [ ] Skeleton loaders appear while dashboard data loads; errors are visible if the API fails

### Platform & UX

- [ ] Toast notifications fire on successful and failed mutations
- [ ] Confirmation dialogs gate destructive actions
- [ ] Layout is usable from mobile through desktop per §14
- [ ] API error responses use the standard envelope
- [ ] README/setup documents how to install, migrate/seed, and run frontend + backend
- [ ] No secrets committed to the repository

### Stretch (optional)

- [ ] Register/login issues JWT; protected routes reject unauthenticated access
- [ ] Frontend stores token securely enough for demo (memory or httpOnly cookie approach documented)

---

## 16. Future Enhancements

1. **Authentication** — Authentication is intentionally excluded from MVP. The assessment focuses on frontend engineering, backend APIs, database persistence, validation, testing, and AI workflow. Authentication can be implemented later as Stretch. 
2. **Multi-tenancy** — Organizations, membership, data isolation  
3. **Live AI insights** — Summaries, risk prediction, and natural-language Q&A over portfolio data via a provider API  
4. **Activity timeline** — First-class activity log with filters and project-level history  
5. **Notifications** — Due-date reminders, at-risk alerts, email/in-app notifications  
6. **Integrations** — Jira, GitHub, Slack status sync  
7. **Advanced reporting** — CSV/PDF export, saved views, custom date ranges  
8. **Real-time board** — WebSocket updates for multi-user Kanban  
9. **Attachments & comments** — Files and discussion threads on projects/tasks  
10. **Hardened production ops** — Postgres, migrations CI, rate limiting, structured logging/metrics, SSO  

---

## 17. Assumptions & Open Decisions

| Item | Assumption |
|------|------------|
| Auth | Deferred to Stretch; MVP APIs are open locally for evaluation |
| Owner/assignee | String fields acceptable for MVP if User entity not implemented |
| Uniqueness | Project name unique among non-archived records (recommended) |
| Progress | Manually maintained on Project; not auto-calculated from tasks unless explicitly implemented as enhancement |
| Smart Insights | Deterministic/mock content only in MVP |
| Chart library | Choose a maintained React-compatible library with justified addition |

---

## 18. Document control

| Version | Notes |
|---------|-------|
| 1.0 | Initial detailed specification aligned with `project-context.md` |

When requirements conflict with informal notes, this specification and `project-context.md` take precedence for MVP delivery. Detailed testable checklists may be mirrored or expanded in `acceptance-criteria.md`.
