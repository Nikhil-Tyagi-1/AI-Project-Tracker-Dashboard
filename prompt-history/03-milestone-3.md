# 03-milestone-3

5 prompt(s) in this group.

## Prompt 33

_Source transcript:_ `f7d26593-ece7-470d-b85e-749bb021f26f`

```text
We are starting Milestone 3 – Tasks API.

Read and follow:
- project-context.md
- spec.md
- acceptance-criteria.md
- existing Prisma schema
- existing Project validation patterns

Implement only the Task validation layer.

Requirements:
- Use Zod
- Create:
  - createTaskSchema
  - updateTaskSchema
  - taskListQuerySchema
- Validate:
  - title (3–100 chars)
  - description (optional)
  - projectId
  - assigneeId (optional)
  - status
  - priority
  - dueDate (optional)
  - sortOrder
- Support query validation for:
  - projectId
  - status
  - priority
  - assigneeId
  - includeArchived
  - search
  - sortBy
  - sortOrder
- Infer and export TypeScript types
- Match the structure used for Project validators

Do not generate services or controllers.
```

## Prompt 35

_Source transcript:_ `e1269633-f843-45d4-8d38-9f74b2b7ace7`

```text
Implement TaskController.

Requirements:

- Keep controllers thin.
- Use TaskService only.
- Use existing async error wrapper.
- Use existing response helpers.
- Follow the same architecture as ProjectController.
- No business logic inside controllers.

Do not generate routes.
```

## Prompt 36

_Source transcript:_ `fd880e57-c690-4f9b-9f8b-582d811ba9d7`

```text
Generate Markdown documentation for the Task API.

For each endpoint include:

- Purpose
- Method
- URL
- Path parameters
- Query parameters
- Request body
- Success response
- Error response
- Validation rules
- Example requests
- Example responses

Match the documentation style used for the Projects API.
```

## Prompt 37

_Source transcript:_ `768e5f24-1c51-42bb-8eaa-a66e0b3222d0`

```text
Implement Task routes.

Endpoints:

GET /api/tasks
GET /api/tasks/:id
POST /api/tasks
PATCH /api/tasks/:id
PATCH /api/tasks/:id/archive
PATCH /api/tasks/:id/restore

Requirements:

- Express Router
- Validation middleware
- Existing async wrapper
- Clean organization
- Same conventions used by Project routes

Do not generate Swagger.
```

## Prompt 39

_Source transcript:_ `768e5f24-1c51-42bb-8eaa-a66e0b3222d0`

```text
Generate integration tests for the Task API.

Cover:

- Create task
- Get task
- List tasks
- Update task
- Archive task
- Restore task
- Reject archived project
- Reject missing project
- Update status
- Update sortOrder
- Validation failures
- 404 responses

Reuse the existing integration test setup.
```

