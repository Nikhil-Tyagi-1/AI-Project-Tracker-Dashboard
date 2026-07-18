# 09-milestone-9

3 prompt(s) in this group.

## Prompt 64

_Source transcript:_ `839ac7f6-beea-40a9-970f-9f258dc573f3`

```text
We are starting Milestone 9 – Testing Hardening.

Read and follow:
- project-context.md
- spec.md
- acceptance-criteria.md
- existing backend tests

Expand backend integration tests.

Requirements:

Projects:
- Search by name
- Combined filters (status + priority + owner)
- Sorting (name, progress, createdAt, updatedAt)

Business rules:
- Reject invalid project status transitions
- Reject updates to archived projects

Dashboard:
- Verify summary aggregates using seeded data
- Verify chart datasets
- Verify insights endpoint

Reuse the existing integration test setup.
Do not modify application logic unless tests reveal genuine bugs.
```

## Prompt 65

_Source transcript:_ `839ac7f6-beea-40a9-970f-9f258dc573f3`

```text
Expand frontend tests.

Requirements:

Projects:
- Search input
- Debounced search
- Filter by status
- Filter by priority
- Filter by owner
- Reset filters

Kanban:
- Status dropdown (non-drag alternative)
- Verify task status updates correctly
- Verify optimistic state updates

Reuse existing testing utilities.

Do not change feature implementation unless required to make components testable.
```

## Prompt 67

_Source transcript:_ `839ac7f6-beea-40a9-970f-9f258dc573f3`

```text
Document the project's testing strategy.

Include:

- Running backend tests
- Running frontend tests
- Running all tests
- Test database setup
- Seed data
- Integration vs unit tests
- Expected test commands
- Troubleshooting common failures

Match the style used by the existing documentation.
```

