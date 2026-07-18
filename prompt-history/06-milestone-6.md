# 06-milestone-6

4 prompt(s) in this group.

## Prompt 48

_Source transcript:_ `b9d5d6fe-b399-4d49-a707-544608c7faea`

```text
We are starting Milestone 6 – Projects UI.

Read and follow:
- project-context.md
- spec.md
- acceptance-criteria.md
- existing frontend architecture
- existing backend Project API

Implement the Projects data layer.

Requirements:

- Create a Projects API service using the shared Axios client.
- Implement:
  - getProjects
  - getProjectById
  - createProject
  - updateProject
  - archiveProject
  - restoreProject
- Create a Redux Toolkit slice for Projects.
- Manage:
  - project list
  - selected project
  - loading states
  - error states
  - search/filter/sort state
- Use async thunks.
- Follow the existing project architecture.

Do not build UI components yet.
```

## Prompt 49

_Source transcript:_ `b9d5d6fe-b399-4d49-a707-544608c7faea`

```text
Implement the Projects List page.

Requirements:

- Responsive table on desktop.
- Responsive card layout on mobile.
- Debounced search input.
- Clear search button.
- Filters:
  - Status
  - Priority
  - Owner
- Reset filters action.
- Sorting:
  - Name
  - Progress
  - Created date
  - Updated date
- Pagination support if returned by the API.
- Loading skeleton.
- Empty state.
- Error state.
- Navigate to Project Details on row/card click.

Reuse shared UI components wherever possible.
```

## Prompt 50

_Source transcript:_ `b9d5d6fe-b399-4d49-a707-544608c7faea`

```text
Implement reusable Project Form components.

Requirements:

- React Hook Form
- Zod validation
- Reuse the same form for:
  - Create Project
  - Edit Project
- Validate using the backend rules.
- Show field-level validation errors.
- Use Material UI form components.
- Support:
  - Name
  - Description
  - Owner
  - Status
  - Priority
  - Progress
  - Dates
  - Risk Notes
- Submit through Redux actions.
- Show loading indicators while saving.
- Display success and error toast notifications.

Do not implement the details page.
```

## Prompt 52

_Source transcript:_ `b9d5d6fe-b399-4d49-a707-544608c7faea`

```text
Complete the Projects feature.

Requirements:

- Add component/integration tests for:
  - Project form validation
  - Required fields
  - Invalid progress
  - Date validation
- Document:
  - Projects feature
  - Search
  - Filters
  - Sorting
  - Create/Edit workflow
  - Archive/Restore workflow

Follow the existing documentation style.
```

