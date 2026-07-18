# 02-milestone-2

9 prompt(s) in this group.

## Prompt 3

_Source transcript:_ `f73a15d3-b6cc-4386-b62d-b6da39e8667d`

```text
Create a detailed software specification document for AI Project Tracker Pro.

Include:

Functional requirements

Non-functional requirements

Modules

Database entities

API overview

Frontend pages

Backend architecture

Validation rules

Search

Filtering

Charts

Responsive behavior

Acceptance criteria

Future enhancements

Do not generate implementation code.
```

## Prompt 10

_Source transcript:_ `17460c34-fd2a-4623-8026-ba0c914c8221`

```text
Complete the backend setup.

Install and configure:

- Express
- TypeScript
- Prisma
- SQLite
- Zod
- Morgan
- CORS

Generate only the project setup.

No API implementation yet.
```

## Prompt 25

_Source transcript:_ `7137671d-cd4a-4166-b911-9d086f7c7ade`

```text
We are implementing Milestone 2 – Projects API.

Read and follow:
- project-context.md
- spec.md
- acceptance-criteria.md
- existing Prisma schema

Implement only the validation layer.

Requirements:
- Use Zod
- Create:
  - createProjectSchema
  - updateProjectSchema
  - projectListQuerySchema
- Validate:
  - name (3–100 chars)
  - description (optional)
  - ownerId
  - status
  - priority
  - progress (0–100)
  - startDate
  - endDate
  - riskNotes
- Ensure endDate cannot be before startDate
- Infer TypeScript types from schemas
- Export reusable validators

Do not implement controllers, services, or routes.
```

## Prompt 26

_Source transcript:_ `7137671d-cd4a-4166-b911-9d086f7c7ade`

```text
Implement ProjectService only.

Responsibilities:

- listProjects
- getProjectById
- createProject
- updateProject
- archiveProject
- restoreProject

Requirements:

- Use Prisma
- Keep all business logic inside the service
- Exclude archived projects by default
- Support:
  - search
  - filtering
  - sorting
- Enforce unique project names among non-archived projects
- Enforce status transition rules
- Throw custom application errors
- Keep methods small and reusable

Do not generate controllers or routes.
```

## Prompt 28

_Source transcript:_ `07d6cfc8-93e6-495a-8092-c527761c6977`

```text
Implement Project routes.

Endpoints:

GET /projects
GET /projects/:id
POST /projects
PATCH /projects/:id
PATCH /projects/:id/archive
PATCH /projects/:id/restore

Requirements:

- Express Router
- Validation middleware
- Async error wrapper
- Clean route organization

Do not generate Swagger.
```

## Prompt 30

_Source transcript:_ `e35f04f0-a4b2-4943-91f1-537ea8790749`

```text
Generate integration tests for Projects API.

Test:

- create
- list
- detail
- update
- archive
- restore
- duplicate project names
- invalid payloads
- 404
- archived projects excluded by default

Use the existing test database.
```

## Prompt 31

_Source transcript:_ `cef97e30-3a49-4bd5-a7ef-8c8ae918e132`

```text
Generate Markdown documentation for the Projects API.

For every endpoint include:

- Purpose
- Method
- URL
- Request
- Response
- Validation
- Error responses
- Example payloads

Output Markdown only.
```

## Prompt 38

_Source transcript:_ `768e5f24-1c51-42bb-8eaa-a66e0b3222d0`

```text
Generate unit tests for Task validation.

Cover:

- Required title
- Invalid enums
- Invalid projectId
- Missing projectId
- Invalid dueDate
- Valid payloads
- Query validation

Reuse the testing approach used for Project validators.
```

## Prompt 54

_Source transcript:_ `9eeeaa34-08f3-4628-8b79-73ce58497991`

```text
why am I getting failed: net::ERR_CONNECTION_REFUSED
on http://localhost:4000/api/projects?sortBy=createdAt&sortOrder=desc&page=1&pageSize=20&includeArchived=false
```

