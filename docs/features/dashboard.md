# Dashboard feature

> **App routes:** `/dashboard` (`/` redirects here)  
> **API:** [`docs/api/dashboard.md`](../api/dashboard.md)  
> **Related features:** [`Analytics`](./analytics.md) · [`Projects`](./projects.md) · [`Kanban`](./kanban.md) · [`Settings`](./settings.md)  
> **Frontend conventions:** [`docs/frontend/conventions.md`](../frontend/conventions.md)

The Dashboard is the portfolio health home for AI Project Tracker Pro. It combines summary metric cards, reusable chart widgets, mock Smart Insights, and a recent-activity feed. Chart-ready aggregates come from `GET /api/dashboard/summary`; Insights use a separate mock endpoint so failures stay section-local.

> **Authentication:** JWT / session auth is **outside the MVP** unless Stretch Auth is implemented. Dashboard APIs and UI are open for local evaluation.

---

## Purpose

Give managers and stakeholders an at-a-glance view of portfolio health—counts by status, task progress, workload, activity trends, and deterministic “Smart Insights”—without leaving the app ([`project-context.md`](../../tool-specific/cursor-workflow/project-context.md) §4.3 / §4.6, [`spec.md`](../../tool-specific/cursor-workflow/spec.md) §3.3).

---

## User flow

| Flow | Entry | Outcome |
|------|-------|---------|
| Open Dashboard | Side nav → **Dashboard**, or `/` | Metrics, charts, insights, recent activity |
| Retry summary | Metrics/charts `ErrorState` → **Try again** | Re-dispatches `fetchDashboardSummary` |
| Retry insights | Insights `ErrorState` → **Try again** | Re-dispatches `fetchDashboardInsights` only |
| Retry activity | Activity `ErrorState` → **Try again** | Re-dispatches `fetchDashboardActivity` |
| Empty portfolio CTA | Empty state → **Create project** | Navigates to `/projects/new` |
| Follow activity link | Recent activity item | Project detail or Kanban for that project |
| Deeper charts | Side nav → **Analytics** | See [`analytics.md`](./analytics.md) |

### Architecture

```text
DashboardView
├── MetricsGrid            ← data.metrics from /dashboard/summary
├── ChartsGrid (compact)   ← data.charts from /dashboard/summary
├── SmartInsightsPanel     ← /dashboard/insights (independent)
└── RecentActivitySection  ← derived from GET /projects + GET /tasks
```

On mount, three **independent** thunks run so Insights/activity failures do not clear metrics/charts.

---

## Backend endpoints used

| Method | Path | Used for |
|--------|------|----------|
| `GET` | `/api/dashboard/summary` | Metric cards + chart series |
| `GET` | `/api/dashboard/insights` | Mock Smart Insights cards |
| `GET` | `/api/projects` | Recent activity derivation |
| `GET` | `/api/tasks` | Recent activity derivation |

Payload contracts: [`docs/api/dashboard.md`](../api/dashboard.md). Insights are **deterministic heuristics** over current DB data—no external LLM (spec FR-D04).

---

## Main frontend components

| Component | Role |
|-----------|------|
| `DashboardView` | Page composition and thunk dispatch |
| `MetricCard` / `MetricsGrid` | Eight summary metric cards |
| `ChartsGrid` (`compact`) | 2×2 chart layout |
| `ChartPanel` | Title, empty chrome, overflow containment |
| `ProjectProgressChart` | Horizontal progress bars |
| `TaskStatusChart` | Donut by task status |
| `TeamWorkloadChart` | Bar by assignee |
| `MonthlyActivityChart` | Dual line (created / updated) |
| `SmartInsightsPanel` / `InsightCard` | Mock recommendations |
| `RecentActivitySection` | Derived activity feed |
| Skeletons | Metrics, charts, insights, activity |
| Shared UI | `EmptyState`, `ErrorState`, `Skeleton` |

Helpers: `metricDefinitions.ts`, `chartUtils.ts`, `deriveRecentActivity.ts`, `insightPresentation.ts`.  
Client: `frontend/src/services/api/dashboard.ts`.

---

## Redux slices

**Slice:** `dashboard` — `frontend/src/store/slices/dashboardSlice.ts`

| Concern | Thunk | Status fields |
|---------|-------|---------------|
| Summary | `fetchDashboardSummary` | metrics + charts loading/error/data |
| Insights | `fetchDashboardInsights` | insights loading/error/data |
| Activity | `fetchDashboardActivity` | activity loading/error/items |

Failures are isolated per concern: Insights/activity errors do not wipe summary state (AC-I02).

---

## Validation

Dashboard reads are aggregate endpoints; there is **no create/update form** on this page.

| Layer | Notes |
|-------|--------|
| Client | Types in `frontend/src/types/dashboard.ts` mirror API shapes |
| Server | Controllers/services validate query/path as applicable; aggregates exclude archived projects/tasks |

Chart widgets treat empty series as empty UI (not validation errors). See chart empty rules in [`docs/api/dashboard.md`](../api/dashboard.md) and `chartUtils.ts`.

---

## Error handling

| Section | Loading | Empty | Error |
|---------|---------|-------|-------|
| Metrics + charts | Skeletons | Zero cards + per-chart empty; **No projects yet** when `totalProjects === 0` | Page `ErrorState` + retry (summary) |
| Smart Insights | Skeleton | **No insights right now** (success empty) | Section `ErrorState` + retry; rest of page usable |
| Recent activity | Skeleton | **No recent activity** | Section `ErrorState` + retry |

Toasts are not required for read-only load failures; visible `ErrorState` + retry satisfies AC-D03 / AC-I02.

Acceptance coverage: [`acceptance-criteria.md`](../../tool-specific/cursor-workflow/acceptance-criteria.md) AC-D01–AC-D04, AC-C01–AC-C04, AC-I01–AC-I02.

---

## Future improvements

- First-class activity-log API instead of derived project/task timestamps
- Live AI insights via a provider (currently mock only)
- Saved dashboard views and date-range filters
- Optional JWT-gated analytics endpoints (Stretch Auth)

---

## Key source paths

```text
frontend/src/features/dashboard/
  DashboardView.tsx
  metricDefinitions.ts
  chartUtils.ts
  deriveRecentActivity.ts
  insightPresentation.ts
  components/
    MetricCard.tsx
    MetricsGrid.tsx
    InsightCard.tsx
    SmartInsightsPanel.tsx
    RecentActivitySection.tsx
    charts/
      ChartPanel.tsx
      ChartsGrid.tsx
      ProjectProgressChart.tsx
      TaskStatusChart.tsx
      TeamWorkloadChart.tsx
      MonthlyActivityChart.tsx
frontend/src/services/api/dashboard.ts
frontend/src/store/slices/dashboardSlice.ts
frontend/src/app/(app)/dashboard/page.tsx
```

---

## Cross-references

| Document | Relevance |
|----------|-----------|
| [`project-context.md`](../../tool-specific/cursor-workflow/project-context.md) | Dashboard, AI Insights, charts |
| [`spec.md`](../../tool-specific/cursor-workflow/spec.md) | FR-D*, charts §11, API §7.4 |
| [`acceptance-criteria.md`](../../tool-specific/cursor-workflow/acceptance-criteria.md) | AC-D*, AC-C*, AC-I* |
| [`tasks.md`](../../tool-specific/cursor-workflow/tasks.md) | Milestone 4 (API), Milestone 8 (UI) |
| [`analytics.md`](./analytics.md) | Expanded chart-only page |

---

## How to test locally

```bash
npm run dev:backend
npm run dev:frontend

cd frontend && npm test -- src/features/dashboard
```
