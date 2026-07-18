# Projects feature

> **App routes:** `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit`  
> **API:** [`docs/api/projects.md`](../api/projects.md)  
> **Related features:** [`Kanban`](./kanban.md) · [`Dashboard`](./dashboard.md) · [`Analytics`](./analytics.md) · [`Settings`](./settings.md)  
> **Frontend conventions:** [`docs/frontend/conventions.md`](../frontend/conventions.md)

The Projects feature is the portfolio CRUD surface for AI Project Tracker Pro. Users search and filter the list, open details, create or edit projects through a shared form, and archive or restore records.

> **Authentication:** JWT / session auth is **outside the MVP** unless Stretch Auth is implemented. Project APIs and UI are open for local evaluation.

---

## Purpose

Centralize project metadata—name, description, status, priority, owner, dates, progress, and risk notes—so delivery leads can maintain a single system of record and stakeholders can assess portfolio health (see [`project-context.md`](../../tool-specific/cursor-workflow/project-context.md) §4.2 and [`spec.md`](../../tool-specific/cursor-workflow/spec.md) §3.1).

---

## User flow

| Flow | Entry | Outcome |
|------|-------|---------|
| List | Side nav → **Projects** | Paginated table (desktop) or cards (mobile) |
| Search / filter / sort | List toolbar | Debounced `q`, AND filters, `sortBy` / `sortOrder` |
| Create | **New project** on list / empty state | Form → `POST /api/projects` → detail |
| Detail | Row/card click | Metadata, task summary, actions |
| Edit | Detail → **Edit project** | Same form → `PATCH /api/projects/:id` → detail |
| Archive | Detail → **Archive** (confirm) | Soft-delete; removed from default list |
| Restore | Detail (archived) → **Restore project** | Active again; returns to default list |
| Open board | Detail → **Open Kanban board** | `/kanban?projectId=:id` |

---

## Backend endpoints used

| Method | Path | Used for |
|--------|------|----------|
| `GET` | `/api/projects` | List (search, filter, sort, pagination); owner options on create |
| `GET` | `/api/projects/:id` | Detail and edit prefill |
| `POST` | `/api/projects` | Create |
| `PATCH` | `/api/projects/:id` | Update |
| `PATCH` | `/api/projects/:id/archive` | Soft-archive |
| `PATCH` | `/api/projects/:id/restore` | Restore |
| `GET` | `/api/tasks?projectId=…` | Task summary on detail |

Full request/response examples: [`docs/api/projects.md`](../api/projects.md).

---

## Main frontend components

| Component / view | Role |
|------------------|------|
| `ProjectsListView` | List page: toolbar, table/cards, pagination, states |
| `ProjectsToolbar` | Search, filters, sort, reset |
| `ProjectsTable` / `ProjectsCardList` | Desktop table / mobile cards |
| `ProjectsPagination` | Page controls |
| `ProjectCreateView` / `ProjectEditView` | Create and edit pages |
| `ProjectForm` | Shared RHF + Zod + MUI form |
| `ProjectDetailView` | Metadata, archive/restore, link to Kanban |
| `ProjectMetadataSection` | Field presentation |
| `ProjectTaskSummarySection` | Task counts by Kanban status |
| `ProjectStatusChip` / `ProjectPriorityChip` | Status and priority chips |
| `ProjectsListSkeleton` | List loading skeleton |
| Shared UI | `ConfirmDialog`, `EmptyState`, `ErrorState`, toasts |

Client: `frontend/src/services/api/projects.ts`.

---

## Redux slices

**Slice:** `projects` — `frontend/src/store/slices/projectsSlice.ts`

| Concern | Contents |
|---------|----------|
| `list` | Items, `meta`, loading/error, filters (`q`, status, priority, owner, sort, page) |
| `detail` | Current project, loading/error |
| `mutation` | Create/update/archive/restore status |

**Thunks:** `fetchProjects`, `fetchProjectById`, `createProject`, `updateProject`, `archiveProject`, `restoreProject`.

Also uses shared `ui` slice for toasts where wired through toast helpers.

---

## Validation

Client and server rules are mirrored; **server is source of truth** ([`spec.md`](../../tool-specific/cursor-workflow/spec.md) §8).

| Layer | Location |
|-------|----------|
| Client | `projectFormSchema.ts` (React Hook Form + Zod) |
| Server | `backend/src/validators/project.ts` + service transition rules |

### Client highlights

| Field | Rules |
|-------|--------|
| Name | Required; trim; 3–100 chars |
| Owner | Required `ownerId` |
| Status / priority | Required enums |
| Progress | Integer 0–100; must be **100** when status is `COMPLETED` |
| Dates | Optional `yyyy-MM-dd`; if both set, end ≥ start |
| Description / risk notes | Optional; max 2000 chars |

Edit status options are limited to **allowed transitions** (same matrix as the API). Archived projects cannot be updated until restored.

Tests: `projectFormSchema.test.ts`, `ProjectForm.test.tsx`.

---

## Error handling

| Situation | Behavior |
|-----------|----------|
| Client validation | Field-level errors; no create/update call |
| API `VALIDATION_ERROR` / `CONFLICT` / `NOT_FOUND` | Error toast and/or form errors; list/detail `ErrorState` + retry |
| Archive | `ConfirmDialog` required; cancel leaves data unchanged |
| Restore name conflict | Error toast (`CONFLICT` if another active project reused the name) |
| Network / unexpected | Error toast or `ErrorState`; UI does not fail silently |

Loading / empty / error matrix:

| Surface | Loading | Empty | Error |
|---------|---------|-------|-------|
| List | Table/card skeleton | No projects yet / No results | `ErrorState` + retry |
| Detail | Content skeleton | — | `ErrorState` + back to list |
| Task summary | Skeleton | No tasks yet | Inline `ErrorState` + retry |
| Forms | Skeleton / button spinner | — | Field errors + toasts |

Acceptance coverage: [`acceptance-criteria.md`](../../tool-specific/cursor-workflow/acceptance-criteria.md) AC-P01–AC-P14, AC-S*, AC-F*, AC-U*, AC-V*.

---

## Future improvements

- Live `includeArchived` toggle on the list UI (API already supports the param)
- Auto-calculate progress from task completion
- First-class activity timeline on the detail page
- Optional JWT-protected mutations (Stretch Auth — [`spec.md`](../../tool-specific/cursor-workflow/spec.md) §14 / Milestone 12)

---

## Key source paths

```text
frontend/src/features/projects/
  ProjectsListView.tsx
  ProjectCreateView.tsx
  ProjectEditView.tsx
  ProjectDetailView.tsx
  components/ProjectForm.tsx
  projectFormSchema.ts
  projectFormUtils.ts
frontend/src/services/api/projects.ts
frontend/src/store/slices/projectsSlice.ts
```

---

## Cross-references

| Document | Relevance |
|----------|-----------|
| [`project-context.md`](../../tool-specific/cursor-workflow/project-context.md) | Goals, project module, folder structure |
| [`spec.md`](../../tool-specific/cursor-workflow/spec.md) | FR-P*, search/filter, validation §8, pages §12 |
| [`acceptance-criteria.md`](../../tool-specific/cursor-workflow/acceptance-criteria.md) | AC-P01–AC-P14, AC-S*, AC-F* |
| [`tasks.md`](../../tool-specific/cursor-workflow/tasks.md) | Milestone 2 (API), Milestone 6 (UI) |

---

## How to test locally

```bash
npm run dev:backend
npm run dev:frontend

# Form / list tests
npm run test --workspace=frontend
```
