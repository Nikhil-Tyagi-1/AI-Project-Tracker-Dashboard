# Tasks API

> **Base path:** `/api/tasks`  
> **All responses** use the standard envelope — `{ data }` for single resources, `{ data, meta }` for collections, `{ error }` for errors.

---

## Response envelope shapes

### Success — single resource
```json
{
  "data": { ...task }
}
```

### Success — collection
```json
{
  "data": [ ...tasks ],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 20
  }
}
```

### Error
```json
{
  "error": {
    "message": "Human-readable summary",
    "code": "VALIDATION_ERROR | NOT_FOUND | CONFLICT | INTERNAL_ERROR",
    "details": [
      { "path": "fieldName", "message": "What is wrong" }
    ]
  }
}
```

---

## Task object

| Field         | Type          | Nullable | Notes                                                          |
|---------------|---------------|----------|----------------------------------------------------------------|
| `id`          | `string`      | No       | CUID                                                           |
| `title`       | `string`      | No       | 3–100 characters                                               |
| `description` | `string`      | Yes      | Max 2000 characters                                            |
| `status`      | `TaskStatus`  | No       | Kanban column; see enum below                                  |
| `priority`    | `Priority`    | No       | See enum below                                                 |
| `dueDate`     | `string`      | Yes      | ISO 8601 date                                                  |
| `sortOrder`   | `number`      | No       | Integer ≥ 0; within-column order for Kanban persistence        |
| `projectId`   | `string`      | No       | FK → `Project.id`; immutable after create                      |
| `project`     | `object`      | No       | `{ id, name, isArchived }` — always included                   |
| `assigneeId`  | `string`      | Yes      | FK → `User.id`                                                 |
| `assignee`    | `object`      | Yes      | `{ id, name, email }` when assigned; `null` when unassigned    |
| `isArchived`  | `boolean`     | No       | `true` = soft-deleted; excluded from default lists             |
| `createdAt`   | `string`      | No       | ISO 8601 datetime                                              |
| `updatedAt`   | `string`      | No       | ISO 8601 datetime                                              |

### `TaskStatus` enum (Kanban columns)
`TODO` · `IN_PROGRESS` · `IN_REVIEW` · `DONE`

### `Priority` enum
`LOW` · `MEDIUM` · `HIGH` · `CRITICAL`

Status may be set to any `TaskStatus` value on create or update — there are no transition restrictions (unlike projects).

---

## Endpoints

### `GET /api/tasks` — List tasks

**Purpose:** Returns a paginated, filtered, sorted list of non-archived tasks (archived rows are excluded by default). Scope with `projectId` for single-project Kanban boards.

**Method:** `GET`  
**URL:** `/api/tasks`

#### Path parameters

None.

#### Query parameters

| Parameter         | Type      | Default     | Description                                                                 |
|-------------------|-----------|-------------|-----------------------------------------------------------------------------|
| `projectId`       | `string`  | —           | Scope results to a single project                                           |
| `status`          | `string`  | —           | Filter by `TaskStatus` value (Kanban column)                                |
| `priority`        | `string`  | —           | Filter by `Priority` value                                                  |
| `assigneeId`      | `string`  | —           | Filter by assignee user id                                                  |
| `search`          | `string`  | —           | Case-insensitive substring match on `title`                                 |
| `sortBy`          | `string`  | `sortOrder` | One of `title`, `createdAt`, `updatedAt`, `priority`, `dueDate`, `sortOrder`, `status` |
| `sortOrder`       | `string`  | `asc`       | `asc` or `desc`                                                             |
| `page`            | `number`  | `1`         | 1-based page number                                                         |
| `pageSize`        | `number`  | `20`        | Items per page; max `100`                                                   |
| `includeArchived` | `boolean` | `false`     | When `true`, archived tasks appear in results                               |

#### Request body

None.

#### Validation rules

- `status` / `priority` must be valid enum values when provided
- `page` must be a positive integer
- `pageSize` must be an integer from 1–100
- `sortBy` / `sortOrder` must be one of the allowed values
- `includeArchived` accepts `true` / `false` (boolean or string)
- `projectId` and `assigneeId` must be non-empty strings when provided

#### Example request
```
GET /api/tasks?projectId=clx1project001&status=IN_PROGRESS&sortBy=sortOrder&sortOrder=asc&page=1&pageSize=20
```

#### Success response — `200 OK`
```json
{
  "data": [
    {
      "id": "clx3task0000abc123def456",
      "title": "Wire up Kanban drag handlers",
      "description": "Persist status and sortOrder on drop",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2026-08-15T00:00:00.000Z",
      "sortOrder": 1,
      "projectId": "clx1project001",
      "project": {
        "id": "clx1project001",
        "name": "Platform Rewrite",
        "isArchived": false
      },
      "assigneeId": "clx0owner001",
      "assignee": {
        "id": "clx0owner001",
        "name": "Alice Smith",
        "email": "alice@example.com"
      },
      "isArchived": false,
      "createdAt": "2026-07-10T09:00:00.000Z",
      "updatedAt": "2026-07-18T14:22:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

#### Error response — invalid query — `400 Bad Request`
```json
{
  "error": {
    "message": "Invalid query parameters",
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "status", "message": "Invalid option: expected one of \"TODO\"|\"IN_PROGRESS\"|\"IN_REVIEW\"|\"DONE\"" },
      { "path": "pageSize", "message": "pageSize cannot exceed 100" }
    ]
  }
}
```

---

### `POST /api/tasks` — Create task

**Purpose:** Creates a new task under an existing, non-archived project.

**Method:** `POST`  
**URL:** `/api/tasks`

#### Path parameters

None.

#### Query parameters

None.

#### Request body

| Field         | Required | Type         | Constraints                                              |
|---------------|----------|--------------|----------------------------------------------------------|
| `title`       | Yes      | `string`     | 3–100 chars after trim                                   |
| `projectId`   | Yes      | `string`     | Must reference an existing non-archived `Project.id`     |
| `description` | No       | `string`     | Max 2000 chars                                           |
| `assigneeId`  | No       | `string`     | Non-empty; must reference an existing `User.id` when set |
| `status`      | No       | `TaskStatus` | Defaults to `TODO`                                       |
| `priority`    | No       | `Priority`   | Defaults to `MEDIUM`                                     |
| `dueDate`     | No       | `string`     | ISO 8601 date                                            |
| `sortOrder`   | No       | `number`     | Integer ≥ 0; defaults to `0`                             |

#### Validation rules

- `title` required; trim; 3–100 characters
- `projectId` required; non-empty; project must exist and must not be archived
- `description` optional; max 2000 characters
- `status` / `priority` must be valid enum values when provided
- `dueDate` must be a valid ISO date string when provided
- `sortOrder` must be an integer ≥ 0
- `assigneeId` must be a non-empty string when provided

#### Example request
```json
{
  "title": "Design task card component",
  "projectId": "clx1project001",
  "description": "Reusable card for Kanban columns",
  "priority": "HIGH",
  "status": "TODO",
  "assigneeId": "clx0owner001",
  "dueDate": "2026-08-01",
  "sortOrder": 0
}
```

#### Success response — `201 Created`
```json
{
  "data": {
    "id": "clx3newtask0000",
    "title": "Design task card component",
    "description": "Reusable card for Kanban columns",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-08-01T00:00:00.000Z",
    "sortOrder": 0,
    "projectId": "clx1project001",
    "project": {
      "id": "clx1project001",
      "name": "Platform Rewrite",
      "isArchived": false
    },
    "assigneeId": "clx0owner001",
    "assignee": {
      "id": "clx0owner001",
      "name": "Alice Smith",
      "email": "alice@example.com"
    },
    "isArchived": false,
    "createdAt": "2026-07-18T08:00:00.000Z",
    "updatedAt": "2026-07-18T08:00:00.000Z"
  }
}
```

#### Error response — validation failure — `400 Bad Request`
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "title", "message": "Title must be at least 3 characters" },
      { "path": "sortOrder", "message": "sortOrder must be at least 0" }
    ]
  }
}
```

#### Error response — project not found — `404 Not Found`
```json
{
  "error": {
    "message": "Project \"does-not-exist-id\" not found",
    "code": "NOT_FOUND"
  }
}
```

#### Error response — archived project — `400 Bad Request`
```json
{
  "error": {
    "message": "Cannot create a task on an archived project. Restore the project first.",
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "projectId", "message": "Project is archived" }
    ]
  }
}
```

---

### `GET /api/tasks/:id` — Get task by ID

**Purpose:** Returns a single task by id, regardless of archived status (so callers can display the archived state and offer a restore action).

**Method:** `GET`  
**URL:** `/api/tasks/:id`

#### Path parameters

| Parameter | Description |
|-----------|-------------|
| `id`      | Task CUID   |

#### Query parameters

None.

#### Request body

None.

#### Validation rules

- `id` must identify an existing task

#### Example request
```
GET /api/tasks/clx3task0000abc123def456
```

#### Success response — `200 OK`
```json
{
  "data": {
    "id": "clx3task0000abc123def456",
    "title": "Wire up Kanban drag handlers",
    "description": "Persist status and sortOrder on drop",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2026-08-15T00:00:00.000Z",
    "sortOrder": 1,
    "projectId": "clx1project001",
    "project": {
      "id": "clx1project001",
      "name": "Platform Rewrite",
      "isArchived": false
    },
    "assigneeId": "clx0owner001",
    "assignee": {
      "id": "clx0owner001",
      "name": "Alice Smith",
      "email": "alice@example.com"
    },
    "isArchived": false,
    "createdAt": "2026-07-10T09:00:00.000Z",
    "updatedAt": "2026-07-18T14:22:00.000Z"
  }
}
```

#### Error response — not found — `404 Not Found`
```json
{
  "error": {
    "message": "Task \"clx-unknown-id\" not found",
    "code": "NOT_FOUND"
  }
}
```

---

### `PATCH /api/tasks/:id` — Update task

**Purpose:** Applies a partial update. Only the supplied fields are modified; omitted fields are left unchanged. `null` explicitly clears a nullable field. `projectId` cannot be changed — tasks cannot be moved across projects.

Archived tasks **cannot** be updated — restore the task first (`PATCH /api/tasks/:id/restore`).

**Method:** `PATCH`  
**URL:** `/api/tasks/:id`

#### Path parameters

| Parameter | Description |
|-----------|-------------|
| `id`      | Task CUID   |

#### Query parameters

None.

#### Request body (all fields optional)

| Field         | Type           | Constraints                                          |
|---------------|----------------|------------------------------------------------------|
| `title`       | `string`       | 3–100 chars after trim                               |
| `description` | `string\|null` | Max 2000 chars; `null` clears the field              |
| `assigneeId`  | `string\|null` | Non-empty when set; `null` unassigns                 |
| `status`      | `TaskStatus`   | Any valid enum value (no transition matrix)          |
| `priority`    | `Priority`     |                                                      |
| `dueDate`     | `string\|null` | ISO 8601 date; `null` clears                         |
| `sortOrder`   | `number`       | Integer ≥ 0; used with `status` for Kanban persistence |

#### Validation rules

- Task must exist and must not be archived
- `title` (when provided): trim; 3–100 characters
- `description` (when provided): max 2000 characters; `null` clears
- `status` / `priority` must be valid enum values when provided
- `dueDate` must be a valid ISO date string or `null`
- `sortOrder` must be an integer ≥ 0
- `assigneeId` must be a non-empty string or `null`
- `projectId` is rejected if sent (not part of the update schema)

#### Example request — move card on Kanban
```json
{
  "status": "IN_REVIEW",
  "sortOrder": 2
}
```

#### Success response — `200 OK`
```json
{
  "data": {
    "id": "clx3task0000abc123def456",
    "title": "Wire up Kanban drag handlers",
    "status": "IN_REVIEW",
    "sortOrder": 2,
    "isArchived": false,
    "project": {
      "id": "clx1project001",
      "name": "Platform Rewrite",
      "isArchived": false
    },
    "assignee": {
      "id": "clx0owner001",
      "name": "Alice Smith",
      "email": "alice@example.com"
    },
    ...
  }
}
```

#### Error response — validation failure — `400 Bad Request`
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "title", "message": "Title must be at least 3 characters" },
      { "path": "sortOrder", "message": "sortOrder must be at least 0" }
    ]
  }
}
```

#### Error response — update rejected on archived task — `400 Bad Request`
```json
{
  "error": {
    "message": "Archived tasks cannot be updated. Restore the task first.",
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "id", "message": "Task is archived" }
    ]
  }
}
```

#### Error response — not found — `404 Not Found`
```json
{
  "error": {
    "message": "Task \"clx-unknown-id\" not found",
    "code": "NOT_FOUND"
  }
}
```

---

### `PATCH /api/tasks/:id/archive` — Archive task

**Purpose:** Soft-deletes a task by setting `isArchived = true`. Idempotent — returns the task unchanged if it is already archived.

**Method:** `PATCH`  
**URL:** `/api/tasks/:id/archive`

#### Path parameters

| Parameter | Description |
|-----------|-------------|
| `id`      | Task CUID   |

#### Query parameters

None.

#### Request body

None.

#### Validation rules

- `id` must identify an existing task

#### Example request
```
PATCH /api/tasks/clx3task0000abc123def456/archive
```

#### Success response — `200 OK`
```json
{
  "data": {
    "id": "clx3task0000abc123def456",
    "title": "Wire up Kanban drag handlers",
    "isArchived": true,
    ...
  }
}
```

#### Error response — not found — `404 Not Found`
```json
{
  "error": {
    "message": "Task \"clx-unknown-id\" not found",
    "code": "NOT_FOUND"
  }
}
```

---

### `PATCH /api/tasks/:id/restore` — Restore task

**Purpose:** Clears `isArchived`, making the task active again. Idempotent — returns unchanged if already active. Restored tasks reappear in the default list.

**Method:** `PATCH`  
**URL:** `/api/tasks/:id/restore`

#### Path parameters

| Parameter | Description |
|-----------|-------------|
| `id`      | Task CUID   |

#### Query parameters

None.

#### Request body

None.

#### Validation rules

- `id` must identify an existing task

#### Example request
```
PATCH /api/tasks/clx3task0000abc123def456/restore
```

#### Success response — `200 OK`
```json
{
  "data": {
    "id": "clx3task0000abc123def456",
    "title": "Wire up Kanban drag handlers",
    "isArchived": false,
    ...
  }
}
```

#### Error response — not found — `404 Not Found`
```json
{
  "error": {
    "message": "Task \"clx-unknown-id\" not found",
    "code": "NOT_FOUND"
  }
}
```

---

## Error reference

| HTTP Status | `code`             | When                                                                 |
|-------------|--------------------|----------------------------------------------------------------------|
| `400`       | `VALIDATION_ERROR` | Request body or query params fail Zod validation; create on archived project; update on archived task |
| `404`       | `NOT_FOUND`        | Task `id` or create-target `projectId` does not exist                |
| `500`       | `INTERNAL_ERROR`   | Unexpected server-side failure                                       |
