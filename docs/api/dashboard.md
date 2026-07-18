# Dashboard API

> **Base path:** `/api/dashboard`  
> **All responses** use the standard envelope — `{ data }` for success payloads, `{ error }` for errors.  
> **Frontend feature guide:** [`docs/features/dashboard.md`](../features/dashboard.md) (architecture, chart contracts, Insights mock UI, widget reuse).

These endpoints compute portfolio analytics server-side from `Project` and `Task` tables. Chart payloads are chart-ready (`label` + `value` series) so the frontend can render widgets without additional transformation.

**Scope rules (all aggregates):**

- Archived projects (`isArchived = true`) are excluded.
- Archived tasks and tasks that belong to archived projects are excluded.
- Smart Insights are **mock / deterministic** recommendations derived from current database data only — no external AI or LLM calls.

---

## Response envelope shapes

### Success — single resource
```json
{
  "data": { ... }
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

## Summary payload objects

### Metrics (`data.metrics`)

| Field                   | Type     | Description                                                                 |
|-------------------------|----------|-----------------------------------------------------------------------------|
| `totalProjects`         | `number` | Count of non-archived projects                                              |
| `activeProjects`        | `number` | Non-archived projects with status `IN_PROGRESS`                             |
| `completedProjects`     | `number` | Non-archived projects with status `COMPLETED`                               |
| `atRiskProjects`        | `number` | Non-archived projects with status `AT_RISK`                                 |
| `totalTasks`            | `number` | Count of non-archived tasks on non-archived projects                        |
| `completedTasks`        | `number` | Tasks with status `DONE`                                                    |
| `pendingTasks`          | `number` | Tasks not yet `DONE` (`TODO` + `IN_PROGRESS` + `IN_REVIEW`)                 |
| `completionPercentage`  | `number` | `round((completedTasks / totalTasks) * 100)`; `0` when there are no tasks   |

### Chart datasets (`data.charts`)

Chart series use a shared `{ label, value }` point shape except monthly activity, which exposes two numeric series.

#### `projectProgress` — Project Progress (bar chart)

| Field   | Type     | Description                                      |
|---------|----------|--------------------------------------------------|
| `label` | `string` | Project name                                     |
| `value` | `number` | Project `progress` (0–100)                       |

Ordered by progress descending, then name ascending. Empty array when there are no active projects.

#### `taskStatusDistribution` — Task Status Distribution (pie / donut)

| Field   | Type     | Description                                      |
|---------|----------|--------------------------------------------------|
| `label` | `string` | Human-readable status label                      |
| `value` | `number` | Task count for that status                       |

Always returns **four** points (stable legend), even when a status count is `0`:

| `label`       | Maps to `TaskStatus` |
|---------------|----------------------|
| `To Do`       | `TODO`               |
| `In Progress` | `IN_PROGRESS`        |
| `In Review`   | `IN_REVIEW`          |
| `Done`        | `DONE`               |

#### `teamWorkload` — Team Workload (bar chart)

| Field   | Type     | Description                                                         |
|---------|----------|---------------------------------------------------------------------|
| `label` | `string` | Assignee display name, or `"Unassigned"` when `assigneeId` is null  |
| `value` | `number` | Task count for that assignee                                        |

Sorted by highest load first; `"Unassigned"` is placed last when present.

#### `monthlyActivity` — Monthly Activity (line chart)

| Field     | Type     | Description                                                                 |
|-----------|----------|-----------------------------------------------------------------------------|
| `label`   | `string` | Calendar month as `YYYY-MM` (UTC)                                           |
| `created` | `number` | Projects + tasks whose `createdAt` falls in that month                      |
| `updated` | `number` | Projects + tasks whose `updatedAt` falls in that month and differs from `createdAt` |

Always returns the **last 6 calendar months** (oldest → newest), including months with zero activity, so the line chart axis stays stable.

---

## Insight object

Returned inside `data.insights` from `GET /api/dashboard/insights`.

| Field        | Type     | Description                                                                 |
|--------------|----------|-----------------------------------------------------------------------------|
| `id`         | `string` | Stable insight identifier (e.g. `insight-at-risk`)                          |
| `severity`   | `string` | One of `info` · `warning` · `critical`                                      |
| `title`      | `string` | Short headline for the insights card                                        |
| `message`    | `string` | Recommendation text derived from current aggregates                         |
| `category`   | `string` | One of `risk` · `workload` · `progress` · `deadline` · `portfolio`          |

| Companion field | Type     | Description                                      |
|-----------------|----------|--------------------------------------------------|
| `generatedAt`   | `string` | ISO 8601 timestamp when the payload was built    |

### Insight heuristics (mock)

Insights are emitted only when the corresponding condition holds. An empty portfolio may return a single informational nudge; an otherwise healthy portfolio may return an empty `insights` array.

| `id`                         | Trigger (approximate)                                      |
|------------------------------|------------------------------------------------------------|
| `insight-at-risk`            | `atRiskProjects > 0`                                       |
| `insight-low-completion`     | Task completion percentage &lt; 40                         |
| `insight-strong-completion`  | Task completion percentage ≥ 75                            |
| `insight-workload-imbalance` | Top assignee load ≥ 2× team average (and ≥ 3 tasks)        |
| `insight-unassigned`         | ≥ 3 unassigned tasks                                       |
| `insight-low-progress`       | Projects with progress in (0, 25) while active/at-risk exist |
| `insight-overdue`            | Non-`DONE` tasks with `dueDate` in the past                |
| `insight-empty-portfolio`    | `totalProjects === 0`                                      |
| `insight-no-tasks`           | Exactly one project and zero tasks                         |

---

## Endpoints

### `GET /api/dashboard/summary` — Portfolio summary

**Purpose:** Returns metric-card aggregates and chart-ready series for the Dashboard and Analytics pages (project progress, task status pie, team workload, monthly activity).

**Method:** `GET`  
**URL:** `/api/dashboard/summary`

#### Path parameters

None.

#### Query parameters

None.

#### Request body

None.

#### Validation rules

None — this endpoint accepts no input.

#### Example request
```
GET /api/dashboard/summary
```

#### Success response — `200 OK`
```json
{
  "data": {
    "metrics": {
      "totalProjects": 5,
      "activeProjects": 1,
      "completedProjects": 1,
      "atRiskProjects": 1,
      "totalTasks": 27,
      "completedTasks": 10,
      "pendingTasks": 17,
      "completionPercentage": 37
    },
    "charts": {
      "projectProgress": [
        { "label": "API Gateway Migration", "value": 100 },
        { "label": "Customer Portal Redesign", "value": 45 },
        { "label": "Mobile App MVP", "value": 30 },
        { "label": "Internal Developer Tooling", "value": 15 },
        { "label": "Data Analytics Platform", "value": 0 }
      ],
      "taskStatusDistribution": [
        { "label": "To Do", "value": 10 },
        { "label": "In Progress", "value": 4 },
        { "label": "In Review", "value": 3 },
        { "label": "Done", "value": 10 }
      ],
      "teamWorkload": [
        { "label": "Jordan Lee", "value": 7 },
        { "label": "Taylor Kim", "value": 7 },
        { "label": "Casey Chen", "value": 5 },
        { "label": "Alex Morgan", "value": 4 },
        { "label": "Sam Rivera", "value": 4 }
      ],
      "monthlyActivity": [
        { "label": "2026-02", "created": 3, "updated": 0 },
        { "label": "2026-03", "created": 4, "updated": 0 },
        { "label": "2026-04", "created": 5, "updated": 0 },
        { "label": "2026-05", "created": 7, "updated": 0 },
        { "label": "2026-06", "created": 13, "updated": 0 },
        { "label": "2026-07", "created": 0, "updated": 32 }
      ]
    }
  }
}
```

#### Empty portfolio response — `200 OK`
```json
{
  "data": {
    "metrics": {
      "totalProjects": 0,
      "activeProjects": 0,
      "completedProjects": 0,
      "atRiskProjects": 0,
      "totalTasks": 0,
      "completedTasks": 0,
      "pendingTasks": 0,
      "completionPercentage": 0
    },
    "charts": {
      "projectProgress": [],
      "taskStatusDistribution": [
        { "label": "To Do", "value": 0 },
        { "label": "In Progress", "value": 0 },
        { "label": "In Review", "value": 0 },
        { "label": "Done", "value": 0 }
      ],
      "teamWorkload": [],
      "monthlyActivity": [
        { "label": "2026-02", "created": 0, "updated": 0 },
        { "label": "2026-03", "created": 0, "updated": 0 },
        { "label": "2026-04", "created": 0, "updated": 0 },
        { "label": "2026-05", "created": 0, "updated": 0 },
        { "label": "2026-06", "created": 0, "updated": 0 },
        { "label": "2026-07", "created": 0, "updated": 0 }
      ]
    }
  }
}
```

Chart arrays remain present (never `null`) so the UI can show empty states without special-casing missing keys.

#### Error response — unexpected failure — `500 Internal Server Error`
```json
{
  "error": {
    "message": "An unexpected error occurred",
    "code": "INTERNAL_ERROR"
  }
}
```

---

### `GET /api/dashboard/insights` — Smart Insights

**Purpose:** Returns mock Smart Insights cards derived from the current portfolio (at-risk concentration, completion health, workload imbalance, overdue tasks, and related nudges). Does **not** call an external AI provider.

**Method:** `GET`  
**URL:** `/api/dashboard/insights`

#### Path parameters

None.

#### Query parameters

None.

#### Request body

None.

#### Validation rules

None — this endpoint accepts no input.

#### Example request
```
GET /api/dashboard/insights
```

#### Success response — `200 OK`
```json
{
  "data": {
    "insights": [
      {
        "id": "insight-at-risk",
        "severity": "warning",
        "title": "1 project at risk",
        "message": "One project is marked AT_RISK. Review risk notes and reassign capacity if needed.",
        "category": "risk"
      },
      {
        "id": "insight-low-completion",
        "severity": "warning",
        "title": "Task completion is behind",
        "message": "Only 37% of tasks are done (10 of 27). Focus on clearing IN_REVIEW and IN_PROGRESS work.",
        "category": "progress"
      },
      {
        "id": "insight-low-progress",
        "severity": "warning",
        "title": "Projects with low progress",
        "message": "1 project still under 25% progress (Internal Developer Tooling). Check blockers and milestones.",
        "category": "progress"
      }
    ],
    "generatedAt": "2026-07-18T08:30:00.000Z"
  }
}
```

#### Empty insights response — `200 OK`
```json
{
  "data": {
    "insights": [],
    "generatedAt": "2026-07-18T08:30:00.000Z"
  }
}
```

Returned when no heuristic fires (for example a healthy, non-empty portfolio with balanced workload and no overdue work). The frontend should treat an empty array as an empty-state, not an error.

#### Error response — unexpected failure — `500 Internal Server Error`
```json
{
  "error": {
    "message": "An unexpected error occurred",
    "code": "INTERNAL_ERROR"
  }
}
```

---

## Error reference

| HTTP Status | `code`           | When                                         |
|-------------|------------------|----------------------------------------------|
| `500`       | `INTERNAL_ERROR` | Unexpected server-side failure               |

These endpoints take no path, query, or body input, so client validation errors (`VALIDATION_ERROR` / `NOT_FOUND` / `CONFLICT`) are not expected under normal use.
