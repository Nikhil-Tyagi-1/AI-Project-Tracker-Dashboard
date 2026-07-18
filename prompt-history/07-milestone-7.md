# 07-milestone-7

7 prompt(s) in this group.

## Prompt 34

_Source transcript:_ `c350ef2d-3575-4adf-a41b-37d1fbecb768`

```text
Implement TaskService.

Requirements:

Methods:
- listTasks
- getTaskById
- createTask
- updateTask
- archiveTask
- restoreTask

Business rules:

- Reject tasks created for missing projects.
- Reject tasks created for archived projects.
- Exclude archived tasks by default.
- Allow filtering by:
  - project
  - status
  - priority
  - assignee
- Support search by title.
- Support sorting.
- Support Kanban updates:
  - status
  - sortOrder
- Keep business logic inside the service.
- Throw existing custom application errors.
- Reuse existing response and error patterns.

Do not generate controllers.
```

## Prompt 51

_Source transcript:_ `b9d5d6fe-b399-4d49-a707-544608c7faea`

```text
Implement the Project Details page.

Requirements:

Display:

- Project metadata
- Status
- Priority
- Owner
- Progress
- Start and End dates
- Risk Notes
- Task summary
- Link to Kanban board

Actions:

- Edit Project
- Archive Project
- Restore Project

Use:

- Confirmation dialog before archive.
- Toast notifications.
- Shared loading, empty, and error states.
```

## Prompt 55

_Source transcript:_ `fc1ce066-3716-4702-8f2e-bef0e3475230`

```text
We are starting Milestone 7 – Kanban & Tasks UI.

Read and follow:
- project-context.md
- spec.md
- acceptance-criteria.md
- existing frontend architecture
- existing backend Task API

Implement the Tasks data layer.

Requirements:

- Create a Tasks API service using the shared Axios client.
- Implement:
  - getTasks
  - getTaskById
  - createTask
  - updateTask
  - archiveTask
  - restoreTask
- Create a Redux Toolkit slice for Tasks.
- Manage:
  - task list
  - loading states
  - error states
  - current project context
  - search/filter state
- Use async thunks.
- Follow the same architecture as the Projects feature.

Do not build any UI components yet.
```

## Prompt 56

_Source transcript:_ `fc1ce066-3716-4702-8f2e-bef0e3475230`

```text
Implement the Kanban page.

Requirements:

- Four columns:
  - TODO
  - IN_PROGRESS
  - IN_REVIEW
  - DONE
- Project selector to scope the board.
- Render task cards displaying:
  - title
  - priority
  - assignee
  - due date
- Responsive layout.
- Horizontal scrolling on small screens.
- Reuse shared layout and UI components.
- Loading, empty, and error states.

Do not implement drag-and-drop persistence yet.
```

## Prompt 57

_Source transcript:_ `fc1ce066-3716-4702-8f2e-bef0e3475230`

```text
Implement Kanban interactions.

Requirements:

- Add drag-and-drop between columns.
- Use optimistic UI updates.
- Immediately move the card in the UI.
- Persist status changes through the backend API.
- Update sortOrder where applicable.
- If the API request fails:
  - rollback the task to its previous column
  - restore previous state
  - display an error toast
- Provide a non-drag status selector/menu for accessibility.
- Keep the implementation modular and reusable.
```

## Prompt 58

_Source transcript:_ `fc1ce066-3716-4702-8f2e-bef0e3475230`

```text
Implement task management for the Kanban feature.

Requirements:

- Create reusable Task Form using:
  - React Hook Form
  - Zod validation
- Support:
  - Create Task
  - Edit Task
- Archive and Restore tasks.
- Task search by title.
- Filters:
  - Priority
  - Assignee
- Display loading indicators.
- Show success and error toast notifications.
- Reuse shared dialog and form components wherever possible.
```

## Prompt 59

_Source transcript:_ `fc1ce066-3716-4702-8f2e-bef0e3475230`

```text
Complete the Kanban feature.

Requirements:

- Add tests covering:
  - optimistic update
  - rollback on API failure
  - task form validation
  - status update flow
- Document:
  - Kanban workflow
  - Drag-and-drop behavior
  - Optimistic updates
  - Failure recovery
  - Task creation and editing

Match the existing documentation style.
```

