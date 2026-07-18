# Projects API

> **Base path:** `/api/projects`  
> **All responses** use the standard envelope — `{ data }` for single resources, `{ data, meta }` for collections, `{ error }` for errors.

---

## Response envelope shapes

### Success — single resource
```json
{
  "data": { ...project }
}
```

### Success — collection
```json
{
  "data": [ ...projects ],
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

## Project object

| Field         | Type            | Nullable | Notes                                               |
|---------------|-----------------|----------|-----------------------------------------------------|
| `id`          | `string`        | No       | CUID                                                |
| `name`        | `string`        | No       | 3–100 characters, unique among non-archived         |
| `description` | `string`        | Yes      | Max 2000 characters                                 |
| `status`      | `ProjectStatus` | No       | See enum below                                      |
| `priority`    | `Priority`      | No       | See enum below                                      |
| `progress`    | `number`        | No       | Integer 0–100 (%)                                   |
| `ownerId`     | `string`        | No       | FK → `User.id`                                      |
| `owner`       | `object`        | No       | `{ id, name, email }` — always included             |
| `startDate`   | `string`        | Yes      | ISO 8601 date                                       |
| `endDate`     | `string`        | Yes      | ISO 8601 date; must be ≥ `startDate` when both set  |
| `riskNotes`   | `string`        | Yes      | Max 2000 characters                                 |
| `isArchived`  | `boolean`       | No       | `true` = soft-deleted; excluded from default lists  |
| `createdAt`   | `string`        | No       | ISO 8601 datetime                                   |
| `updatedAt`   | `string`        | No       | ISO 8601 datetime                                   |

### `ProjectStatus` enum
`PLANNED` · `IN_PROGRESS` · `ON_HOLD` · `AT_RISK` · `COMPLETED`

### `Priority` enum
`LOW` · `MEDIUM` · `HIGH` · `CRITICAL`

---

## Status transition rules

Allowed moves (any omitted pair is forbidden):

| From         | Allowed `to` values                              |
|--------------|--------------------------------------------------|
| `PLANNED`    | `IN_PROGRESS`, `ON_HOLD`, `AT_RISK`, `COMPLETED` |
| `IN_PROGRESS`| `PLANNED`, `ON_HOLD`, `AT_RISK`, `COMPLETED`     |
| `ON_HOLD`    | `PLANNED`, `IN_PROGRESS`, `AT_RISK`, `COMPLETED` |
| `AT_RISK`    | `PLANNED`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED` |
| `COMPLETED`  | `PLANNED`, `IN_PROGRESS`                         |

Setting `status: "COMPLETED"` requires `progress: 100` in the resulting state.

---

## Endpoints

### `GET /api/projects` — List projects

Returns a paginated, filtered, sorted list of non-archived projects (archived rows are excluded by default).

#### Query parameters

| Parameter        | Type      | Default     | Description                                                    |
|------------------|-----------|-------------|----------------------------------------------------------------|
| `q`              | `string`  | —           | Case-insensitive substring match on `name` or `description`    |
| `status`         | `string`  | —           | Filter by `ProjectStatus` value                                |
| `priority`       | `string`  | —           | Filter by `Priority` value                                     |
| `owner`          | `string`  | —           | Filter by owner display name (substring)                       |
| `sortBy`         | `string`  | `createdAt` | One of `name`, `createdAt`, `updatedAt`, `priority`, `progress`|
| `sortOrder`      | `string`  | `desc`      | `asc` or `desc`                                                |
| `page`           | `number`  | `1`         | 1-based page number                                            |
| `pageSize`       | `number`  | `20`        | Items per page; max `100`                                      |
| `includeArchived`| `boolean` | `false`     | When `true`, archived projects appear in results               |

#### Example request
```
GET /api/projects?status=IN_PROGRESS&sortBy=priority&sortOrder=desc&page=1&pageSize=5
```

#### Example response — `200 OK`
```json
{
  "data": [
    {
      "id": "clx1a2b3c0000abc123def456",
      "name": "Platform Rewrite",
      "description": "Migrate monolith to microservices",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "progress": 45,
      "ownerId": "clx0owner001",
      "owner": { "id": "clx0owner001", "name": "Alice Smith", "email": "alice@example.com" },
      "startDate": "2026-01-15T00:00:00.000Z",
      "endDate": "2026-09-30T00:00:00.000Z",
      "riskNotes": null,
      "isArchived": false,
      "createdAt": "2026-01-10T09:00:00.000Z",
      "updatedAt": "2026-07-01T14:22:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "pageSize": 5
  }
}
```

---

### `POST /api/projects` — Create project

#### Request body

| Field         | Required | Type            | Constraints                          |
|---------------|----------|-----------------|--------------------------------------|
| `name`        | Yes      | `string`        | 3–100 chars; unique among non-archived|
| `ownerId`     | Yes      | `string`        | Must reference an existing `User.id` |
| `description` | No       | `string`        | Max 2000 chars                       |
| `status`      | No       | `ProjectStatus` | Defaults to `PLANNED`                |
| `priority`    | No       | `Priority`      | Defaults to `MEDIUM`                 |
| `progress`    | No       | `number`        | Integer 0–100; defaults to `0`       |
| `startDate`   | No       | `string`        | ISO 8601 date                        |
| `endDate`     | No       | `string`        | ISO 8601 date; must be ≥ `startDate` |
| `riskNotes`   | No       | `string`        | Max 2000 chars                       |

#### Example request
```json
{
  "name": "Mobile App v2",
  "ownerId": "clx0owner001",
  "description": "Redesign iOS and Android apps",
  "priority": "HIGH",
  "startDate": "2026-08-01",
  "endDate": "2026-12-31"
}
```

#### Example response — `201 Created`
```json
{
  "data": {
    "id": "clx2newproject0000",
    "name": "Mobile App v2",
    "description": "Redesign iOS and Android apps",
    "status": "PLANNED",
    "priority": "HIGH",
    "progress": 0,
    "ownerId": "clx0owner001",
    "owner": { "id": "clx0owner001", "name": "Alice Smith", "email": "alice@example.com" },
    "startDate": "2026-08-01T00:00:00.000Z",
    "endDate": "2026-12-31T00:00:00.000Z",
    "riskNotes": null,
    "isArchived": false,
    "createdAt": "2026-07-18T08:00:00.000Z",
    "updatedAt": "2026-07-18T08:00:00.000Z"
  }
}
```

#### Error — duplicate name — `409 Conflict`
```json
{
  "error": {
    "message": "A non-archived project named \"Mobile App v2\" already exists",
    "code": "CONFLICT"
  }
}
```

#### Error — validation failure — `400 Bad Request`
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "name", "message": "Name must be at least 3 characters" },
      { "path": "endDate", "message": "endDate must be on or after startDate" }
    ]
  }
}
```

---

### `GET /api/projects/:id` — Get project by ID

Returns the project regardless of archived status (so callers can display the archived state and offer a restore action).

#### Path parameters

| Parameter | Description    |
|-----------|----------------|
| `id`      | Project CUID   |

#### Example response — `200 OK`
```json
{
  "data": {
    "id": "clx1a2b3c0000abc123def456",
    "name": "Platform Rewrite",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "progress": 45,
    "isArchived": false,
    ...
  }
}
```

#### Error — not found — `404 Not Found`
```json
{
  "error": {
    "message": "Project \"clx-unknown-id\" not found",
    "code": "NOT_FOUND"
  }
}
```

---

### `PATCH /api/projects/:id` — Update project

Applies a partial update. Only the supplied fields are modified; omitted fields are left unchanged. `null` explicitly clears a nullable field.

Archived projects **cannot** be updated — restore the project first (`PATCH /api/projects/:id/restore`).

#### Request body (all fields optional)

| Field         | Type            | Constraints                                    |
|---------------|-----------------|------------------------------------------------|
| `name`        | `string`        | 3–100 chars; unique among non-archived          |
| `description` | `string\|null`  | Max 2000 chars; `null` clears the field         |
| `status`      | `ProjectStatus` | Must follow allowed transition rules            |
| `priority`    | `Priority`      |                                                |
| `progress`    | `number`        | Integer 0–100                                  |
| `ownerId`     | `string`        | Must reference an existing `User.id`            |
| `startDate`   | `string\|null`  | ISO 8601 date                                  |
| `endDate`     | `string\|null`  | ISO 8601 date; `null` clears; must be ≥ `startDate` |
| `riskNotes`   | `string\|null`  | Max 2000 chars; `null` clears the field         |

#### Example request — advance status and update progress
```json
{
  "status": "COMPLETED",
  "progress": 100
}
```

#### Example response — `200 OK`
```json
{
  "data": {
    "id": "clx1a2b3c0000abc123def456",
    "name": "Platform Rewrite",
    "status": "COMPLETED",
    "progress": 100,
    "isArchived": false,
    ...
  }
}
```

#### Error — invalid status transition — `400 Bad Request`
```json
{
  "error": {
    "message": "Status transition from COMPLETED to AT_RISK is not permitted",
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "status", "message": "Cannot move from COMPLETED to AT_RISK" }
    ]
  }
}
```

#### Error — update rejected on archived project — `400 Bad Request`
```json
{
  "error": {
    "message": "Archived projects cannot be updated. Restore the project first.",
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "id", "message": "Project is archived" }
    ]
  }
}
```

---

### `PATCH /api/projects/:id/archive` — Archive project

Soft-deletes a project by setting `isArchived = true`. Idempotent — returns the project unchanged if it is already archived.

#### Example response — `200 OK`
```json
{
  "data": {
    "id": "clx1a2b3c0000abc123def456",
    "name": "Platform Rewrite",
    "isArchived": true,
    ...
  }
}
```

---

### `PATCH /api/projects/:id/restore` — Restore project

Clears `isArchived`, making the project active again. Idempotent — returns unchanged if already active.

Name uniqueness is re-checked before restoring: another project may have been created with the same name while this one was archived.

#### Example response — `200 OK`
```json
{
  "data": {
    "id": "clx1a2b3c0000abc123def456",
    "name": "Platform Rewrite",
    "isArchived": false,
    ...
  }
}
```

#### Error — name conflict on restore — `409 Conflict`
```json
{
  "error": {
    "message": "A non-archived project named \"Platform Rewrite\" already exists",
    "code": "CONFLICT"
  }
}
```

---

## Error reference

| HTTP Status | `code`             | When                                               |
|-------------|--------------------|----------------------------------------------------|
| `400`       | `VALIDATION_ERROR` | Request body or query params fail Zod validation; invalid status transition; update on archived project; COMPLETED without progress 100 |
| `404`       | `NOT_FOUND`        | Project `id` does not exist                        |
| `409`       | `CONFLICT`         | Duplicate project name among non-archived projects |
| `500`       | `INTERNAL_ERROR`   | Unexpected server-side failure                     |
