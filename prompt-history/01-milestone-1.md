# 01-milestone-1

10 prompt(s) in this group.

## Prompt 6

_Source transcript:_ `f73a15d3-b6cc-4386-b62d-b6da39e8667d`

```text
@tool-specific/cursor-workflow/acceptance-criteria.md Generate acceptance criteria for every feature.

Each criterion should follow Given / When / Then format.

Include UI behavior

Validation

Backend behavior

Database persistence

Error handling

Search

Filtering

Responsive design

Testing requirements.
```

## Prompt 13

_Source transcript:_ `56423cf3-31aa-4b72-a07d-1668a7f99ec4`

```text
We are starting Milestone 1 from tasks.md.

Read and follow:
- project-context.md
- spec.md
- acceptance-criteria.md

Design the Prisma schema for the MVP.

Requirements:
- SQLite
- Models:
  - Project
  - Task
  - User (optional but recommended)
- Enums:
  - ProjectStatus
  - TaskStatus
  - Priority
- Soft delete using isArchived
- createdAt and updatedAt timestamps
- Proper relationships
- Useful indexes
- Follow Prisma best practices

Generate only schema.prisma with explanations.
Do not generate migrations or API code.
```

## Prompt 14

_Source transcript:_ `56423cf3-31aa-4b72-a07d-1668a7f99ec4`

```text
Now generate the Prisma migration commands and explain each command.

Include:
- prisma generate
- prisma migrate dev
- prisma db seed

Do not generate application code.
```

## Prompt 16

_Source transcript:_ `56423cf3-31aa-4b72-a07d-1668a7f99ec4`

```text
Create a reusable Prisma client singleton.

Requirements:

- Prevent multiple PrismaClient instances during development
- Follow Prisma best practices
- TypeScript
- Explain why this pattern is required
```

## Prompt 19

_Source transcript:_ `0c1f2c88-e1f0-4f2e-afec-b5d4401edc33`

```text
Implement centralized Express error handling.

Requirements:

Handle:

- ValidationError
- NotFoundError
- ConflictError
- InternalServerError

Return standardized JSON responses.

Hide stack traces in production.
```

## Prompt 20

_Source transcript:_ `0c1f2c88-e1f0-4f2e-afec-b5d4401edc33`

```text
Implement request logging middleware.

Requirements:

- Morgan
- Log:
  - Method
  - URL
  - Status
  - Response time
```

## Prompt 21

_Source transcript:_ `0c1f2c88-e1f0-4f2e-afec-b5d4401edc33`

```text
Implement:

GET /api/health

Response:

{
  "status": "ok",
  "timestamp": "...",
  "version": "..."
}

Use existing response helpers.
```

## Prompt 22

_Source transcript:_ `0c1f2c88-e1f0-4f2e-afec-b5d4401edc33`

```text
Generate a smoke test for:

GET /api/health

Verify:

- Status 200
- Response format
- Timestamp exists
```

## Prompt 24

_Source transcript:_ `9bef754e-cded-4283-ab11-0afa8d0f1c49`

```text
Complete the remaining `[DOC]` task in `@tool-specific/cursor-workflow/tasks.md`: document the database entities, Prisma migration workflow, and seed process. After adding the documentation, mark the task as completed in the checklist.
```

## Prompt 27

_Source transcript:_ `a35f3134-8518-43c3-92ed-d0fb4e4552c1`

```text
Implement ProjectController.

Requirements:

- Thin controllers
- No business logic
- Call ProjectService only
- Use async error wrapper
- Return standardized success responses
- Use response helpers created in Milestone 1

Do not generate routes.
```

