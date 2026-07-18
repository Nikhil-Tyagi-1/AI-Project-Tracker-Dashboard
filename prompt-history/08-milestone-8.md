# 08-milestone-8

11 prompt(s) in this group.

## Prompt 4

_Source transcript:_ `f73a15d3-b6cc-4386-b62d-b6da39e8667d`

```text
Add a Wireframe Section, Just a simple list.

Dashboard

Projects

Project Details

Kanban

Analytics

Settings
```

## Prompt 15

_Source transcript:_ `56423cf3-31aa-4b72-a07d-1668a7f99ec4`

```text
Generate prisma/seed.ts.

Requirements:

- 5 demo projects
- 25–30 demo tasks
- 5 demo users
- Realistic statuses
- Different priorities
- Random due dates
- Use Prisma best practices

Keep seed data realistic for dashboard charts.
```

## Prompt 41

_Source transcript:_ `55595677-5de2-4a03-98f0-61dade4bf816`

```text
Implement DashboardController and routes.

Endpoints:

GET /api/dashboard/summary
GET /api/dashboard/insights

Requirements:

- Keep controllers thin.
- Use DashboardService only.
- Use existing response helpers.
- Use existing async error wrapper.
- Follow the same architecture as Project and Task modules.
- Do not duplicate business logic.
```

## Prompt 42

_Source transcript:_ `55595677-5de2-4a03-98f0-61dade4bf816`

```text
Generate integration tests for Dashboard API.

Test:

- GET /api/dashboard/summary
- GET /api/dashboard/insights

Verify:
- Summary metrics are returned.
- Chart datasets are not empty with seeded data.
- Insights endpoint returns mock recommendations.
- Response follows the standard API envelope.

Reuse the existing testing setup.
```

## Prompt 43

_Source transcript:_ `55595677-5de2-4a03-98f0-61dade4bf816`

```text
Generate Markdown documentation for Dashboard API.

Document:

GET /api/dashboard/summary
GET /api/dashboard/insights

Include:
- Purpose
- Method
- URL
- Success response
- Error response
- Example payloads
- Description of each metric and chart dataset

Match the documentation style used for Projects and Tasks APIs.
```

## Prompt 45

_Source transcript:_ `51cb4779-4404-4891-85a4-3e2eefeccfe6`

```text
Implement the application shell.

Requirements:

- Persistent top app bar
- Responsive side navigation
- Main content area
- Navigation items:
  - Dashboard
  - Projects
  - Kanban
  - Analytics
  - Settings
- Responsive drawer for tablet and mobile
- Active navigation highlighting
- Use Material UI components
- Follow Next.js App Router conventions
- Keep the shell reusable

Do not implement page content yet.
```

## Prompt 47

_Source transcript:_ `51cb4779-4404-4891-85a4-3e2eefeccfe6`

```text
Complete the frontend shell.

Requirements:

- Add placeholder pages for:
  - Dashboard
  - Projects
  - Kanban
  - Analytics
  - Settings
- Add custom 404 page
- Ensure navigation works correctly
- Document:
  - Frontend folder structure
  - Theme usage
  - Shared component conventions

Do not implement business features yet.
```

## Prompt 60

_Source transcript:_ `94939fff-3431-474d-a80b-8c8a823f4795`

```text
We are starting Milestone 8 – Dashboard, Analytics & Smart Insights.

Read and follow:
- project-context.md
- spec.md
- acceptance-criteria.md
- existing frontend architecture
- existing Dashboard API

Implement the Dashboard foundation.

Requirements:

- Create Dashboard API service using the shared Axios client.
- Create Redux Toolkit slice for Dashboard.
- Fetch /api/dashboard/summary.
- Build responsive Dashboard layout.
- Add metric cards for:
  - Total Projects
  - Active Projects
  - Completed Projects
  - At Risk Projects
  - Total Tasks
  - Completed Tasks
  - Pending Tasks
  - Completion Percentage
- Use shared Skeleton, EmptyState and ErrorState components.
- Follow Material UI responsive grid layout.
- Keep widgets reusable.

Do not implement charts or insights yet.
```

## Prompt 61

_Source transcript:_ `94939fff-3431-474d-a80b-8c8a823f4795`

```text
Implement Dashboard and Analytics charts.

Requirements:

Use the existing dashboard summary API.

Create reusable chart components for:

- Project Progress
- Task Status (Pie/Donut)
- Team Workload
- Monthly Activity

Requirements:

- Charts must be reusable on both Dashboard and Analytics pages.
- Build Analytics page using the same chart components.
- Layout should be responsive.
- Charts should resize automatically.
- Prevent horizontal page overflow.
- Display shared loading, empty and error states.

Do not implement Smart Insights.
```

## Prompt 62

_Source transcript:_ `94939fff-3431-474d-a80b-8c8a823f4795`

```text
Implement Dashboard insights.

Requirements:

- Fetch /api/dashboard/insights.
- Display Smart Insight cards.
- Display Recent Activity section.
- If no activity exists:
  - show shared EmptyState.
- If insights fail:
  - show section-level ErrorState.
- Dashboard should remain usable when Insights fail.
- Use responsive Material UI cards.
- Reuse shared UI components.
```

## Prompt 63

_Source transcript:_ `94939fff-3431-474d-a80b-8c8a823f4795`

```text
Complete the Dashboard feature.

Requirements:

Tests:

- Dashboard page renders successfully.
- Analytics page renders successfully.
- Metric cards display mocked API values.
- Charts render mocked datasets.
- Insights render mocked recommendations.
- Loading, empty and error states.

Documentation:

Document:

- Dashboard architecture.
- Analytics architecture.
- Chart data contracts.
- Smart Insights mock behavior.
- Widget reuse strategy.

Match the existing project documentation style.
```

