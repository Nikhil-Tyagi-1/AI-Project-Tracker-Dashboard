# Dashboard & Analytics

> **App routes:** `/dashboard`, `/analytics` (`/` redirects to `/dashboard`)  
> **API:** [`docs/api/dashboard.md`](../api/dashboard.md)  
> **Related:** [`frontend conventions`](../frontend/conventions.md), [`Projects`](./projects.md), [`Kanban & Tasks`](./kanban.md)

The Dashboard and Analytics features are the portfolio health surfaces for AI Project Tracker Pro. Dashboard combines summary metric cards, reusable chart widgets, Smart Insights, and a recent-activity feed. Analytics reuses the same chart widgets in an expanded layout for deeper reading. Both pages read chart-ready aggregates from `GET /api/dashboard/summary`; Insights use a separate mock endpoint so failures stay section-local.

---

## Main flows

| Flow | Entry | Outcome |
|------|-------|---------|
| Open Dashboard | Side nav → **Dashboard**, or `/` | Metrics, charts, insights, recent activity |
| Open Analytics | Side nav → **Analytics** | Four portfolio charts (expanded layout) |
| Retry summary | `ErrorState` → **Try again** | Re-dispatches `fetchDashboardSummary` |
| Retry insights | Insights `ErrorState` → **Try again** | Re-dispatches `fetchDashboardInsights` only |
| Empty portfolio CTA | Empty state → **Create project** | Navigates to `/projects/new` |

State lives in the Redux `dashboard` slice (`summary` / `insights` / `activity` status). HTTP goes through `services/api/dashboard.ts` (plus projects/tasks clients for the derived activity feed) on the shared Axios client.

---

## Dashboard architecture

```text
DashboardView
├── MetricsGrid            ← data.metrics from /dashboard/summary
├── ChartsGrid (compact)   ← data.charts from /dashboard/summary
├── SmartInsightsPanel     ← /dashboard/insights (independent)
└── RecentActivitySection  ← derived from GET /projects + GET /tasks
```

### Data loading

On mount, `DashboardView` dispatches **three independent** thunks:

| Thunk | Source | Feeds |
|-------|--------|-------|
| `fetchDashboardSummary` | `GET /api/dashboard/summary` | Metric cards + charts |
| `fetchDashboardInsights` | `GET /api/dashboard/insights` | Smart Insights cards |
| `fetchDashboardActivity` | `GET /api/projects` + `GET /api/tasks` (sorted by `updatedAt`) | Recent activity list |

Insights and activity failures do **not** clear metrics/charts. Summary failure shows a page-level `ErrorState` for the metrics/charts block, while insights/activity sections can still succeed or fail on their own.

### Layout

1. Page title + short description  
2. Eight metric cards (MUI Grid: 1 / 2 / 4 columns)  
3. Chart grid (`compact` — 2×2 from `md` up)  
4. Smart Insights (≈7 cols) + Recent Activity (≈5 cols) from `lg` up; stacked on smaller screens  

Overflow guards: page and grid items use `minWidth: 0`, `maxWidth: 100%`, and `overflowX: hidden`. Charts use Recharts `ResponsiveContainer` inside fixed-height panels.

---

## Analytics architecture

```text
AnalyticsView
└── ChartsGrid (expanded)  ← same /dashboard/summary charts payload
```

Analytics is a **chart-focused** composition of the same widgets. It only dispatches `fetchDashboardSummary` (no insights or activity on this route).

| Detail | Behavior |
|--------|----------|
| Layout variant | `ChartsGrid` `variant="expanded"` — wider progress/activity rows on large screens |
| Chart height | `320px` plot area (Dashboard uses the default `280px`) |
| Empty portfolio | Page-level **No analytics yet** plus per-chart empty panels |
| Error | Page-level `ErrorState` + retry for summary failure |

---

## Metric cards

Eight cards map 1:1 to `data.metrics` from the summary API:

| Card | Field |
|------|-------|
| Total Projects | `totalProjects` |
| Active Projects | `activeProjects` (`IN_PROGRESS`) |
| Completed Projects | `completedProjects` |
| At Risk Projects | `atRiskProjects` |
| Total Tasks | `totalTasks` |
| Completed Tasks | `completedTasks` |
| Pending Tasks | `pendingTasks` |
| Completion Percentage | `completionPercentage` (shown with `%`) |

Definitions live in `metricDefinitions.ts` so labels/formatting stay shared between UI and tests. Presentation is `MetricCard` + `MetricsGrid`.

Archived projects/tasks are excluded server-side (see API docs).

---

## Chart data contracts

Frontend types mirror the backend payload in [`docs/api/dashboard.md`](../api/dashboard.md). Charts expect **chart-ready** series — no extra aggregation in the UI.

### Shared point shapes

| Type | Shape | Used by |
|------|-------|---------|
| `ChartDataPoint` | `{ label: string, value: number }` | Project Progress, Task Status, Team Workload |
| `MonthlyActivityPoint` | `{ label: string, created: number, updated: number }` | Monthly Activity |

### Series

| Chart widget | `data.charts.*` | Visualization | Empty when |
|--------------|-----------------|---------------|------------|
| `ProjectProgressChart` | `projectProgress` | Horizontal bar (0–100%) | Array empty or all zeros |
| `TaskStatusChart` | `taskStatusDistribution` | Donut | All four status values are `0` |
| `TeamWorkloadChart` | `teamWorkload` | Vertical bar | Array empty or all zeros |
| `MonthlyActivityChart` | `monthlyActivity` | Dual line (created / updated) | All months have `created = 0` and `updated = 0` |

**Stability notes (API):**

- Task status always returns four labeled points (`To Do`, `In Progress`, `In Review`, `Done`).  
- Monthly activity always returns the last six `YYYY-MM` months (UTC), including zeros.  
- Chart keys are always present (never `null`) so empty UI is driven by values, not missing fields.

Colors come from `chartPalette` / status tokens (`constants/charts.ts`, `theme/tokens.ts`) — not hardcoded hex in widgets.

Helpers: `isValueSeriesEmpty`, `isMonthlyActivityEmpty`, `truncateChartLabel`, `formatMonthLabel` in `chartUtils.ts`.

---

## Smart Insights mock behavior

Insights are **deterministic heuristics** over current DB aggregates. The backend does **not** call an external LLM (spec FR-D04).

### Request

`GET /api/dashboard/insights` → `{ insights: DashboardInsight[], generatedAt: string }`

### Insight card fields

| Field | Meaning |
|-------|---------|
| `id` | Stable id (e.g. `insight-at-risk`) |
| `severity` | `info` \| `warning` \| `critical` |
| `title` | Short headline |
| `message` | Recommendation copy |
| `category` | `risk` \| `workload` \| `progress` \| `deadline` \| `portfolio` |

### Heuristics (summary)

| `id` | Fires when (approx.) |
|------|----------------------|
| `insight-at-risk` | `atRiskProjects > 0` |
| `insight-low-completion` | Task completion &lt; 40% |
| `insight-strong-completion` | Task completion ≥ 75% |
| `insight-workload-imbalance` | Top assignee load ≥ 2× team average (≥ 3 tasks) |
| `insight-unassigned` | ≥ 3 unassigned tasks |
| `insight-low-progress` | Active/at-risk projects with progress in (0, 25) |
| `insight-overdue` | Non-`DONE` tasks with past `dueDate` |
| `insight-empty-portfolio` | `totalProjects === 0` |
| `insight-no-tasks` | Exactly one project and zero tasks |

An empty `insights` array is a **success empty state** (“No insights right now”), not an error. Full details: [`docs/api/dashboard.md`](../api/dashboard.md#insight-heuristics-mock).

### UI failure isolation (AC-I02)

If Insights fail, `SmartInsightsPanel` shows a section-level `ErrorState` with retry. Metrics, charts, and recent activity remain interactive.

---

## Recent activity

There is no dedicated activity-log API in MVP. `fetchDashboardActivity` loads recent projects and tasks, then `deriveRecentActivity` builds feed items:

- Project/task **created** at `createdAt`  
- Project/task **updated** at `updatedAt` when it differs from `createdAt`  
- Sorted newest-first, capped (default 10)  
- Links to project detail or Kanban for the task’s project  

Empty feed → shared `EmptyState` (“No recent activity”).

---

## Widget reuse strategy

| Widget | Dashboard | Analytics | Notes |
|--------|-----------|-----------|-------|
| `MetricCard` / `MetricsGrid` | Yes | No | Metrics stay on Dashboard only |
| `ProjectProgressChart` | Yes | Yes | Same component, data props only |
| `TaskStatusChart` | Yes | Yes | Donut |
| `TeamWorkloadChart` | Yes | Yes | Bar |
| `MonthlyActivityChart` | Yes | Yes | Dual line |
| `ChartsGrid` | `compact` | `expanded` | Single grid composer |
| `ChartPanel` | Yes | Yes | Title, empty chrome, overflow containment |
| `SmartInsightsPanel` / `InsightCard` | Yes | No | Insights are Dashboard-only |
| `RecentActivitySection` | Yes | No | Dashboard-only |
| Skeletons | Yes | Charts skeleton | Shared `Skeleton` primitive |

**Reuse rules:**

1. Chart components accept **data props only** (no page-level fetching).  
2. Pages own fetch + Redux selection and pass `charts` / `metrics` down.  
3. Layout differences go through `ChartsGrid` `variant` / `chartHeight`, not forked chart files.  
4. Empty/error/loading use shared `@/components/ui` primitives (`Skeleton`, `EmptyState`, `ErrorState`) at page or section level.

---

## UX states

| Surface | Loading | Empty | Error |
|---------|---------|-------|-------|
| Dashboard metrics + charts | Metrics + charts skeletons | Zero cards + per-chart empty; **No projects yet** when `totalProjects === 0` | Page `ErrorState` + retry (summary) |
| Smart Insights | Insights skeleton | **No insights right now** | Section `ErrorState` + retry (rest of page usable) |
| Recent activity | Activity skeleton | **No recent activity** | Section `ErrorState` + retry |
| Analytics charts | Charts skeleton | Per-chart empty + **No analytics yet** | Page `ErrorState` + retry |

---

## Key source paths

```text
frontend/src/features/dashboard/
  DashboardView.tsx
  AnalyticsView.tsx
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
      DashboardChartsSkeleton.tsx
frontend/src/services/api/dashboard.ts
frontend/src/store/slices/dashboardSlice.ts
frontend/src/types/dashboard.ts
frontend/src/app/(app)/dashboard/page.tsx
frontend/src/app/(app)/analytics/page.tsx
```

---

## How to test locally

```bash
# API + seed data recommended so summary/insights are non-empty
npm run dev:backend
npm run dev:frontend

# Dashboard / Analytics unit + component tests
cd frontend && npm test -- src/features/dashboard
```

Covered automated cases include:

- Dashboard and Analytics page render with mocked summary data  
- Metric cards reflecting mocked API values  
- Chart widgets rendering mocked datasets (and per-chart empty states)  
- Smart Insights rendering mocked recommendations  
- Loading skeletons, empty states, and error/retry (including insights failure isolation)
