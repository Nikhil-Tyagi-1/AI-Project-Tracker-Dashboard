# Kanban & Tasks feature

> **App route:** `/kanban` (optional `?projectId=`)  
> **API:** [`docs/api/tasks.md`](../api/tasks.md)  
> **Related:** [`docs/features/projects.md`](./projects.md), [`frontend conventions`](../frontend/conventions.md)

The Kanban feature is the task board for AI Project Tracker Pro. Users select a project, view tasks in four status columns, create and edit tasks, search/filter the board, and move cards by drag-and-drop or an accessible status menu. Status changes use optimistic UI with API persistence and failure rollback.

---

## Main flows

| Flow | Entry | Outcome |
|------|-------|---------|
| Open board | Side nav → **Kanban**, or Project detail → **Open Kanban board** | Project-scoped columns |
| Scope project | Toolbar **Project** select | `?projectId=` synced; board refetched |
| Create task | **New task** | Dialog form → `POST /api/tasks` → board refresh |
| Edit task | Card ⋮ → **Edit task** | Same form → `PATCH /api/tasks/:id` → refresh |
| Move status (drag) | Drag handle → drop on column/card | Optimistic move → `PATCH` status + `sortOrder` |
| Move status (menu) | Card ⋮ → status item | Same persistence/rollback path as drag |
| Archive | Card ⋮ → **Archive task** (confirm) | Soft-archive; hidden unless **Show archived** |
| Restore | Card ⋮ → **Restore task** (when archived) | Active again on the board |

State lives in the Redux `tasks` slice (`list` / `detail` / `mutation` status + filters). HTTP goes through `services/api/tasks.ts` on the shared Axios client. Drag persistence is orchestrated by `useKanbanTaskMove` → `persistTaskMove`.

---

## Board layout

Columns left-to-right (fixed order, matching `TASK_STATUS_VALUES`):

1. **To Do** (`TODO`)
2. **In Progress** (`IN_PROGRESS`)
3. **In Review** (`IN_REVIEW`)
4. **Done** (`DONE`)

Each card shows **title**, **priority**, **assignee** (or Unassigned), and **due date**. On small screens the column row scrolls horizontally (touch-friendly).

---

## Kanban workflow

1. Select a project (required). Deep links use `/kanban?projectId=<id>`.
2. Board loads `GET /api/tasks` with `projectId`, default `sortBy=sortOrder`, `sortOrder=asc`, `pageSize=100`.
3. Tasks are grouped client-side into columns (`groupTasksByStatus`).
4. Create, edit, search, filter, drag, or use the status menu as needed.
5. Switching projects clears board filters (search/priority/assignee/archived) and previous cards so another project’s tasks never flash.

Empty states:

| Condition | Message |
|-----------|---------|
| No project selected | Select a project |
| Project with no tasks | No tasks on this board → **New task** |
| Filters/search match nothing | No matching tasks → **Reset filters** |

---

## Drag-and-drop behavior

Library: **`@dnd-kit`** (`core` + `sortable` + `utilities`).

| Detail | Behavior |
|--------|----------|
| Drag handle | Grip icon on the card (not the whole card) so menus stay clickable |
| Sensors | Pointer (8px activation), Touch (short delay), Keyboard |
| Drop targets | Another card (insert at that index) or empty/column body (append) |
| Overlay | Lightweight “Moving…” preview while dragging |
| Archived cards | Not draggable; restore first |

On **drag end**, `KanbanBoard` resolves the target column/index and calls `moveTaskTo(taskId, status, index)`.

Same-column reorder uses `arrayMove` semantics; cross-column moves remove from the source column and insert into the target, then reindex `sortOrder` in affected columns for stable UI order.

---

## Optimistic updates

Status moves (drag **or** menu) follow this sequence:

1. **Compute** next board with `computeTaskMove` / `computeTaskStatusChange` (includes `previousTasks` snapshot and `{ status, sortOrder }` patch).
2. **Apply optimistic** Redux `replaceTasks(nextTasks)` immediately — the card jumps columns without waiting for the network.
3. **Persist** `PATCH /api/tasks/:id` with `{ status, sortOrder }`.
4. **Sync** `upsertTaskLocal(serverTask)` on success so timestamps/fields match the API.

Optimistic apply always runs **before** the network call (`persistTaskMove` ordering). Concurrent moves for the same task id are ignored while a request is in flight.

---

## Failure recovery

If the status `PATCH` fails or times out:

1. Redux restores `previousTasks` (card returns to its prior column and order).
2. An **error toast** is shown (`useToast` / global toast host).
3. The database is unchanged (no successful write).

The accessible status menu uses the **same** `persistTaskMove` path, so rollback and toasts behave identically to drag-and-drop.

Archive/restore and create/edit do **not** use optimistic board moves; they dispatch thunks and show success/error toasts. Create/update refetch the board so active filters stay accurate.

---

## Search & filters

| Control | Redux / API | Notes |
|---------|-------------|--------|
| Search | `filters.search` → `search` | Debounced **300ms**; title substring; clear (×) |
| Priority | `filters.priority` → `priority` | Enum or all |
| Assignee | `filters.assigneeId` → `assigneeId` | From project owners + task assignees |
| Show archived | `filters.includeArchived` | When on, archived cards appear with chip + Restore |

**Reset filters** clears search, priority, assignee, and include-archived while keeping the current project.

---

## Task creation and editing

Both flows reuse `TaskForm` (React Hook Form + Zod + MUI) inside `TaskFormDialog`.

### Create

1. Requires a selected project (`projectId` is set from board context, not edited in the form).
2. Defaults: status `TODO`, priority `MEDIUM`, unassigned, no due date.
3. Client validation before submit.
4. Dispatch `createTask` → success toast → close dialog → refetch board.
5. API errors (validation, archived project, etc.) surface as error toasts.

### Edit

1. Card ⋮ → **Edit task** prefills from the task.
2. Save enabled only when the form is dirty.
3. Dispatch `updateTask` → success toast → refetch.
4. Archived tasks cannot be edited until restored (menu hides Edit when archived).

### Client validation highlights

| Field | Rules |
|-------|--------|
| Title | Required; trim; 3–100 chars |
| Description | Optional; max 2000 chars |
| Status | Required; `TODO` \| `IN_PROGRESS` \| `IN_REVIEW` \| `DONE` |
| Priority | Required; `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL` |
| Assignee | Optional; empty = unassigned (`null` on update) |
| Due date | Optional `yyyy-MM-dd` |

Tests: `taskFormSchema.test.ts`, `TaskForm.test.tsx`.

### Archive / Restore

1. **Archive** opens shared `ConfirmDialog` → `PATCH .../archive` → success toast; card leaves the default board.
2. Enable **Show archived** to see archived cards; **Restore task** → `PATCH .../restore` → success toast.

---

## UX states

| Surface | Loading | Empty | Error |
|---------|---------|-------|-------|
| Projects for selector | Select disabled / “Loading…” | — | `ErrorState` + retry |
| Board | Column skeleton; “Updating board…” on refetch | See empty table above | `ErrorState` + retry |
| Create/Edit dialog | Button spinner while saving | — | Field errors + toasts |
| Archive confirm | Confirm button “Please wait…” | — | Error toast |

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
  taskFormUtils.ts
frontend/src/services/api/tasks.ts
frontend/src/store/slices/tasksSlice.ts
```

---

## How to test locally

```bash
# API + seed data recommended so projects and tasks exist
npm run dev:backend
npm run dev:frontend

# Kanban / task unit + component tests
cd frontend && npm test -- src/features/tasks
```

Covered automated cases include optimistic apply ordering, API failure rollback, task form validation, and menu/drag status update flows (`persistTaskMove`, `useKanbanTaskMove`, `TaskForm`, `moveTask` / schema tests).
