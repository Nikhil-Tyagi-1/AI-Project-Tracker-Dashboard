# Projects feature

> **App routes:** `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit`  
> **API:** [`docs/api/projects.md`](../api/projects.md)  
> **Related:** [`frontend conventions`](../frontend/conventions.md), [`Kanban & Tasks`](./kanban.md), [`Dashboard & Analytics`](./dashboard.md)

The Projects feature is the portfolio CRUD surface for AI Project Tracker Pro. Users can search and filter the list, open details, create or edit projects through a shared form, and archive or restore records.

---

## Main flows

| Flow | Entry | Outcome |
|------|-------|---------|
| List | Side nav → **Projects** | Paginated table (desktop) or cards (mobile) |
| Create | **New project** on list / empty state | Form → `POST /api/projects` → detail |
| Detail | Row/card click | Metadata, task summary, actions |
| Edit | Detail → **Edit project** | Same form → `PATCH /api/projects/:id` → detail |
| Archive | Detail → **Archive** (confirm) | Soft-delete; removed from default list |
| Restore | Detail (archived) → **Restore project** | Active again; returns to default list |

State lives in the Redux `projects` slice (`list` / `detail` / `mutation` status + filters). HTTP goes through `services/api/projects.ts` on the shared Axios client.

---

## Search

- Control: **Search** field on the Projects list toolbar.
- Debounced **300ms** before updating Redux `filters.q` and refetching.
- Maps to API query param `q` (case-insensitive substring on name/description).
- **Clear (×)** resets the input and query immediately.
- Empty results with an active query show **No results** (distinct from **No projects yet**).

---

## Filters

| Control | Redux / API | Values |
|---------|-------------|--------|
| Status | `filters.status` → `status` | Project status enum, or all |
| Priority | `filters.priority` → `priority` | Priority enum, or all |
| Owner | `filters.owner` → `owner` | Owner display-name substring (debounced) |

**Reset filters** clears search, status, priority, owner, sort, and pagination back to defaults (`createdAt` / `desc`, page 1, page size 20). Archived projects stay excluded unless a later control sets `includeArchived` (API supports it; default list does not show archived).

Changing a filter resets to page 1 and refetches `GET /api/projects`.

---

## Sorting

Toolbar **Sort by** + Asc/Desc toggle. Desktop table headers also toggle sort for:

- Name (`name`)
- Progress (`progress`)
- Created date (`createdAt`)
- Updated date (`updatedAt`)

Clicking the active column flips `sortOrder`. Selecting a new column sorts ascending. Params map to `sortBy` and `sortOrder` on the list API.

---

## Create / Edit workflow

Both pages reuse `ProjectForm` (React Hook Form + Zod + MUI).

### Create (`/projects/new`)

1. Load owner options from existing projects (`GET /api/projects?pageSize=100`).
2. Defaults: status `PLANNED`, priority `MEDIUM`, progress `0`.
3. Client validation (aligned with backend rules) before submit.
4. Dispatch `createProject` → success toast → navigate to detail.
5. API/conflict errors surface as error toasts (e.g. duplicate name).

### Edit (`/projects/:id/edit`)

1. Load project via `fetchProjectById`.
2. Prefill form; status select is limited to **allowed transitions** (same matrix as the API).
3. Save enabled only when the form is dirty.
4. Dispatch `updateProject` → success toast → detail.
5. Archived projects cannot be updated until restored (API rejects; UI hides Edit when archived).

### Client validation highlights

| Field | Rules |
|-------|--------|
| Name | Required; trim; 3–100 chars |
| Owner | Required `ownerId` |
| Progress | Integer 0–100; must be **100** when status is `COMPLETED` |
| Dates | Optional `yyyy-MM-dd`; if both set, end ≥ start |
| Description / risk notes | Optional; max 2000 chars |

Tests: `frontend/src/features/projects/projectFormSchema.test.ts` and `ProjectForm.test.tsx`.

---

## Archive / Restore workflow

### Archive

1. On detail, **Archive** opens shared `ConfirmDialog` (destructive).
2. Cancel leaves the project unchanged.
3. Confirm dispatches `archiveProject` (`PATCH /api/projects/:id/archive`).
4. Success toast; detail shows **Archived** chip and warning; Edit is hidden.
5. Default list and dashboard aggregates exclude the project.

### Restore

1. On an archived detail page, **Restore project** dispatches `restoreProject`.
2. Success toast; project is active again (Edit / Archive available).
3. Restore can fail with `CONFLICT` if another non-archived project reused the name while this one was archived — shown as an error toast.

---

## Detail page extras

- **Task summary** loads `GET /api/tasks?projectId=…` and shows totals by Kanban status (or empty/error states).
- **Open Kanban board** links to `/kanban?projectId=:id` — see [`kanban.md`](./kanban.md).

---

## UX states

| Surface | Loading | Empty | Error |
|---------|---------|-------|-------|
| List | Table/card skeleton | No projects yet / No results | `ErrorState` + retry |
| Detail | Content skeleton | — | `ErrorState` + back to list |
| Task summary | Skeleton | No tasks yet | Inline `ErrorState` + retry |
| Forms | Skeleton while owners/project load; button spinner while saving | — | Field errors + toasts |

Toasts use the global `ToastProvider` / `useToast` helpers.

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

## How to test locally

```bash
# API + seed data recommended for owners and list content
npm run dev:backend
npm run dev:frontend

# Form validation tests
npm run test --workspace=frontend
```
