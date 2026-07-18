# 04-milestone-4

1 prompt(s) in this group.

## Prompt 40

_Source transcript:_ `55595677-5de2-4a03-98f0-61dade4bf816`

```text
We are starting Milestone 4 – Dashboard & Analytics API.

Read and follow:
- project-context.md
- spec.md
- acceptance-criteria.md
- existing Prisma schema
- existing Project and Task services

Implement DashboardService only.

Responsibilities:
- getSummary()
- getInsights()

Requirements:

Summary should return:
- Total projects
- Active projects
- Completed projects
- At-risk projects
- Total tasks
- Completed tasks
- Pending tasks
- Completion percentage

Return chart-ready data for:
1. Project Progress (bar chart)
2. Task Status Distribution (pie chart)
3. Team Workload (bar chart)
4. Monthly Activity (line chart)

Insights should return mock recommendations derived from current database data only (no AI APIs).

Use Prisma aggregation where appropriate.
Keep business logic inside the service.
Do not implement controllers or routes yet.
```

