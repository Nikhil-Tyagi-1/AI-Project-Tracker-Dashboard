# Feature documentation index

Guides for AI Project Tracker Pro UI modules. Each doc follows the same outline: purpose, user flow, backend endpoints, components, Redux, validation, error handling, future improvements, and cross-links to the workflow specs.

> **Authentication** is outside the MVP unless Stretch Auth is implemented. Feature APIs are open for local evaluation.

| Feature | Doc | Route(s) |
|---------|-----|----------|
| Projects | [projects.md](./projects.md) | `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit` |
| Kanban & Tasks | [kanban.md](./kanban.md) | `/kanban` |
| Dashboard | [dashboard.md](./dashboard.md) | `/dashboard`, `/` |
| Analytics | [analytics.md](./analytics.md) | `/analytics` |
| Settings | [settings.md](./settings.md) | `/settings` (placeholder) |

## Workflow specs

| Document | Path |
|----------|------|
| Project context | [`tool-specific/cursor-workflow/project-context.md`](../../tool-specific/cursor-workflow/project-context.md) |
| Specification | [`tool-specific/cursor-workflow/spec.md`](../../tool-specific/cursor-workflow/spec.md) |
| Acceptance criteria | [`tool-specific/cursor-workflow/acceptance-criteria.md`](../../tool-specific/cursor-workflow/acceptance-criteria.md) |
| Tasks | [`tool-specific/cursor-workflow/tasks.md`](../../tool-specific/cursor-workflow/tasks.md) |
