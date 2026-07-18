# Analytics feature

> **App route:** `/analytics`  
> **API:** [`docs/api/dashboard.md`](../api/dashboard.md)  
> **Related features:** [`Dashboard`](./dashboard.md) · [`Projects`](./projects.md) · [`Kanban`](./kanban.md) · [`Settings`](./settings.md)  
> **Frontend conventions:** [`docs/frontend/conventions.md`](../frontend/conventions.md)

Analytics is the chart-focused portfolio view. It reuses the same chart widgets and `GET /api/dashboard/summary` payload as the Dashboard, in an expanded layout for deeper reading. It does **not** render metric cards, Smart Insights, or recent activity.

> **Authentication:** JWT / session auth is **outside the MVP** unless Stretch Auth is implemented. Analytics uses the same open dashboard summary API as the rest of the MVP.

---

## Purpose

Provide a dedicated surface for the four required visualizations—project progress, task status distribution, team workload, and monthly activity—without competing with Insights or activity feed chrome ([`spec.md`](../../tool-specific/cursor-workflow/spec.md) §11, [`project-context.md`](../../tool-specific/cursor-workflow/project-context.md) §4.9).

---

## User flow

| Flow | Entry | Outcome |
|------|-------|---------|
| Open Analytics | Side nav → **Analytics** | Four portfolio charts (expanded layout) |
| Retry | Page `ErrorState` → **Try again** | Re-dispatches `fetchDashboardSummary` |
| Empty portfolio | Empty CTA → **Create project** | Navigates to `/projects/new` |
| Return to overview | Side nav → **Dashboard** | Metrics + insights + activity |

### Architecture

```text
AnalyticsView
└── ChartsGrid (expanded)  ← data.charts from /dashboard/summary
```

| Detail | Behavior |
|--------|----------|
| Layout variant | `ChartsGrid` `variant="expanded"` — wider progress/activity rows on large screens |
| Chart height | `320px` plot area (Dashboard default is `280px`) |
| Data fetch | Only `fetchDashboardSummary` (no insights or activity thunks) |

---

## Backend endpoints used

| Method | Path | Used for |
|--------|------|----------|
| `GET` | `/api/dashboard/summary` | Chart-ready series under `data.charts` |

Same contract as Dashboard charts. Details: [`docs/api/dashboard.md`](../api/dashboard.md).

### Chart series

| Widget | `data.charts.*` | Type |
|--------|-----------------|------|
| `ProjectProgressChart` | `projectProgress` | Horizontal bar |
| `TaskStatusChart` | `taskStatusDistribution` | Donut |
| `TeamWorkloadChart` | `teamWorkload` | Vertical bar |
| `MonthlyActivityChart` | `monthlyActivity` | Dual line |

---

## Main frontend components

| Component | Role |
|-----------|------|
| `AnalyticsView` | Page: fetch summary, pass charts, page-level states |
| `ChartsGrid` (`expanded`) | Responsive chart grid composer |
| `ChartPanel` | Shared chrome / empty state wrapper |
| `ProjectProgressChart` | Shared with Dashboard |
| `TaskStatusChart` | Shared with Dashboard |
| `TeamWorkloadChart` | Shared with Dashboard |
| `MonthlyActivityChart` | Shared with Dashboard |
| `DashboardChartsSkeleton` | Loading skeleton |
| Shared UI | `EmptyState`, `ErrorState` |

**Reuse rule:** chart components accept **data props only**; pages own fetch + Redux selection. See widget reuse notes in [`dashboard.md`](./dashboard.md).

---

## Redux slices

**Slice:** `dashboard` — same as Dashboard (`frontend/src/store/slices/dashboardSlice.ts`).

| Used here | Not used on this route |
|-----------|-------------------------|
| `fetchDashboardSummary` / summary state | `fetchDashboardInsights`, `fetchDashboardActivity` |

Navigating from Dashboard to Analytics may already have summary data in the store; `AnalyticsView` still ensures summary is loaded/refreshed as implemented in the view.

---

## Validation

No user input forms on Analytics. Client TypeScript types (`frontend/src/types/dashboard.ts`) and empty-series helpers (`chartUtils.ts`) gate rendering. Server aggregation rules exclude archived projects/tasks.

---

## Error handling

| Surface | Loading | Empty | Error |
|---------|---------|-------|-------|
| Analytics charts | Charts skeleton | Per-chart empty + **No analytics yet** | Page `ErrorState` + retry |

Charts reflow responsively; page overflow is guarded (`minWidth: 0`, `ResponsiveContainer`) per AC-R06 / AC-C05.

Acceptance coverage: [`acceptance-criteria.md`](../../tool-specific/cursor-workflow/acceptance-criteria.md) AC-C01–AC-C05.

---

## Future improvements

- Custom date ranges and saved chart views
- CSV/PDF export of series
- Drill-down from a chart bar/slice into filtered Projects or Kanban
- Optional auth-gated reporting (Stretch Auth)

---

## Key source paths

```text
frontend/src/features/dashboard/
  AnalyticsView.tsx
  components/charts/ChartsGrid.tsx
  components/charts/*.tsx
  chartUtils.ts
frontend/src/store/slices/dashboardSlice.ts
frontend/src/app/(app)/analytics/page.tsx
```

---

## Cross-references

| Document | Relevance |
|----------|-----------|
| [`project-context.md`](../../tool-specific/cursor-workflow/project-context.md) | Charts module |
| [`spec.md`](../../tool-specific/cursor-workflow/spec.md) | Charts §11, Analytics page §12 |
| [`acceptance-criteria.md`](../../tool-specific/cursor-workflow/acceptance-criteria.md) | AC-C01–AC-C05 |
| [`tasks.md`](../../tool-specific/cursor-workflow/tasks.md) | Milestone 8 |
| [`dashboard.md`](./dashboard.md) | Shared widgets, summary API, Insights (Dashboard-only) |

---

## How to test locally

```bash
npm run dev:backend
npm run dev:frontend

cd frontend && npm test -- src/features/dashboard
```

`AnalyticsView.test.tsx` covers page render with mocked summary data and empty/error paths.
