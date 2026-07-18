# Kanban & Tasks feature

> **App route:** `/kanban` (optional `?projectId=`)  
> **API:** [`docs/api/tasks.md`](../api/tasks.md)  
> **Related features:** [`Projects`](./projects.md) · [`Dashboard`](./dashboard.md) · [`Analytics`](./analytics.md) · [`Settings`](./settings.md)  
> **Frontend conventions:** [`docs/frontend/conventions.md`](../frontend/conventions.md)

The Kanban feature is the task board for AI Project Tracker Pro. Users select a project, view tasks in four status columns, create and edit tasks, search/filter the board, and move cards by drag-and-drop or an accessible status menu. Status changes use optimistic UI with API persistence and failure rollback.

> **Authentication:** JWT / session auth is **outside the MVP** unless Stretch Auth is implemented. Task APIs and the board are open for local evaluation.

---

## Purpose

Provide a project-scoped board for day-to-day task execution—assignment, priority, due dates, and status—while keeping the UI responsive and the database in sync ([`project-context.md`](../../tool-specific/cursor-workflow/project-context.md) §4.7, [`spec.md`](../../tool-specific/cursor-workflow/spec.md) §3.2).

---

## User flow

| Flow | Entry | Outcome |
|------|-------|---------|
| Open board | Side nav → **Kanban**, or Project detail → **Open Kanban board** | Project-scoped columns |
| Scope project | Toolbar **Project** select | `?projectId=` synced; board refetched |
| Create task | **New task** | Dialog form → `POST /api/tasks` → board refresh |
| Edit task | Card ⋮ → **Edit task** | Same form → `PATCH /api/tasks/:id` → refresh |
| Move status (drag) | Drag handle → drop on column/card | Optimistic move → `PATCH` status + `sortOrder` |
| Move status (menu) | Card ⋮ → status item | Same persistence/rollback path as drag |
| Search / filter | Toolbar | Title search, priority, assignee, show archived |
| Archive | Card ⋮ → **Archive task** (confirm) | Soft-archive; hidden unless **Show archived** |
| Restore | Card ⋮ → **Restore task** | Active again on the board |

### Board layout

Columns left-to-right (fixed order):

1. **To Do** (`TODO`)
2. **In Progress** (`IN_PROGRESS`)
3. **In Review** (`IN_REVIEW`)
4. **Done** (`DONE`)

On small screens the column row scrolls horizontally. Archived cards are not draggable until restored.

---

## Backend endpoints used

| Method | Path | Used for |
|--------|------|----------|
| `GET` | `/api/projects` | Project selector options |
| `GET` | `/api/tasks` | Board load (`projectId`, filters, `sortBy=sortOrder`) |
| `GET` | `/api/tasks/:id` | Detail when needed |
| `POST` | `/api/tasks` | Create task |
| `PATCH` | `/api/tasks/:id` | Update fields; Kanban status + `sortOrder` |
| `PATCH` | `/api/tasks/:id/archive` | Soft-archive |
| `PATCH` | `/api/tasks/:id/restore` | Restore |

Full examples: [`docs/api/tasks.md`](../api/tasks.md).

---

## Main frontend components

| Component / module | Role |
|--------------------|------|
| `KanbanBoardView` | Page: project scope, fetch, dialogs, empty/error |
| `KanbanToolbar` | Project select, search, filters, new task |
| `KanbanBoard` | `@dnd-kit` context, columns, drag end |
| `KanbanColumn` | Droppable column + task list |
| `TaskCard` | Card UI, menu, drag handle, status alternative |
| `TaskForm` / `TaskFormDialog` | Create/edit (RHF + Zod) |
| `KanbanBoardSkeleton` | Loading skeleton |
| `useKanbanTaskMove` | Optimistic move orchestration |
| `persistTaskMove` / `moveTask` / `groupTasksByStatus` | Pure move/group helpers |
| Shared UI | `ConfirmDialog`, `EmptyState`, `ErrorState`, toasts |

Client: `frontend/src/services/api/tasks.ts`.

---

## Redux slices

**Slice:** `tasks` — `frontend/src/store/slices/tasksSlice.ts`

| Concern | Contents |
|---------|----------|
| `list` | Board tasks, loading/error, filters (project, search, priority, assignee, archived) |
| `detail` | Single task when loaded |
| `mutation` | Create/update/archive/restore status |

**Thunks:** `fetchTasks`, `fetchTaskById`, `createTask`, `updateTask`, `archiveTask`, `restoreTask`.

**Local board sync:** `replaceTasks`, `upsertTaskLocal` (optimistic moves). Project options for the selector come from the `projects` slice / list API as needed.

---

## Validation

| Layer | Location |
|-------|----------|
| Client | `taskFormSchema.ts` (React Hook Form + Zod) |
| Server | `backend/src/validators/task.ts` + service project-link rules |

### Client highlights

| Field | Rules |
|-------|--------|
| Title | Required; trim; 3–100 chars |
| Description | Optional; max 2000 chars |
| Status | Required; `TODO` \| `IN_PROGRESS` \| `IN_REVIEW` \| `DONE` |
| Priority | Required; `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL` |
| Assignee | Optional; empty = unassigned (`null` on update) |
| Due date | Optional `yyyy-MM-dd` |
| `projectId` | Set from board context on create (not edited in the form) |

Server rejects tasks on missing or archived projects. Tests: `taskFormSchema.test.ts`, `TaskForm.test.tsx`.

---

## Error handling

### Optimistic move failure (AC-K04)

1. UI applies the move immediately (`replaceTasks`).
2. `PATCH /api/tasks/:id` runs with `{ status, sortOrder }`.
3. On failure/timeout: restore `previousTasks`, show **error toast**, database unchanged.
4. Status menu uses the **same** `persistTaskMove` path as drag-and-drop.

### Other mutations

| Situation | Behavior |
|-----------|----------|
| Create/edit validation | Field errors; no API call |
| API errors | Error toast; board refetch where applicable |
| Archive | `ConfirmDialog` first |
| Board load failure | `ErrorState` + retry |
| No project selected | Empty guidance (not an error) |

| Surface | Loading | Empty | Error |
|---------|---------|-------|-------|
| Projects for selector | Select disabled / “Loading…” | — | `ErrorState` + retry |
| Board | Column skeleton | Select a project / No tasks / No matching tasks | `ErrorState` + retry |
| Create/Edit dialog | Button spinner | — | Field errors + toasts |

Acceptance coverage: [`acceptance-criteria.md`](../../tool-specific/cursor-workflow/acceptance-criteria.md) AC-T01–AC-T05, AC-K01–AC-K06.

---

## Future improvements

- Multi-project / portfolio board scope
- WebSocket real-time sync for concurrent editors
- Within-column bulk reorder API
- Task comments and attachments
- Optional JWT-protected mutations (Stretch Auth)

---

## Key source paths

```text
frontend/src/features/tasks/
  KanbanBoardView.tsx
  components/KanbanBoard.tsx
  components/KanbanColumn.tsx
  components/KanbanToolbar.tsx
  components/TaskCard.tsx
  components/TaskForm.tsx
  components/TaskFormDialog.tsx
  hooks/useKanbanTaskMove.ts
  moveTask.ts
  persistTaskMove.ts
  groupTasksByStatus.ts
  taskFormSchema.ts
frontend/src/services/api/tasks.ts
frontend/src/store/slices/tasksSlice.ts
```

---

## Cross-references

| Document | Relevance |
|----------|-----------|
| [`project-context.md`](../../tool-specific/cursor-workflow/project-context.md) | Kanban module, UX states |
| [`spec.md`](../../tool-specific/cursor-workflow/spec.md) | FR-T*, FR-K*, task status enum §8.3 |
| [`acceptance-criteria.md`](../../tool-specific/cursor-workflow/acceptance-criteria.md) | AC-T*, AC-K* |
| [`tasks.md`](../../tool-specific/cursor-workflow/tasks.md) | Milestone 3 (API), Milestone 7 (UI) |

---

## How to test locally

```bash
npm run dev:backend
npm run dev:frontend

cd frontend && npm test -- src/features/tasks
```

Covered automated cases include optimistic apply ordering, API failure rollback, form validation, and menu/drag status flows.
