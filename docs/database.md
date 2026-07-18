# Database — Entities, Migration & Seed

> **Stack:** Prisma ORM · SQLite · `prisma/schema.prisma`  
> **Location:** `backend/prisma/`

---

## Entities

### User

Represents a person who can own projects or be assigned to tasks.  
Auth fields (`passwordHash`) are present in the schema but unused in the MVP — authentication is a stretch goal.

| Column         | Type       | Constraints / Default       | Notes                                   |
|----------------|------------|-----------------------------|-----------------------------------------|
| `id`           | `String`   | PK, CUID                    |                                         |
| `email`        | `String`   | Unique                      |                                         |
| `name`         | `String`   | Required                    |                                         |
| `passwordHash` | `String?`  | Optional                    | Stretch auth — never returned by API    |
| `role`         | `UserRole` | Default `MEMBER`            | `MEMBER` \| `ADMIN`                     |
| `createdAt`    | `DateTime` | Default `now()`             |                                         |
| `updatedAt`    | `DateTime` | Auto-updated                |                                         |

**Relations:** one User → many `ownedProjects`; one User → many `assignedTasks`

---

### Project

The core planning entity. Soft-deleted via `isArchived` rather than physical deletion.

| Column        | Type            | Constraints / Default | Notes                                            |
|---------------|-----------------|-----------------------|--------------------------------------------------|
| `id`          | `String`        | PK, CUID              |                                                  |
| `name`        | `String`        | Required              |                                                  |
| `description` | `String?`       | Optional              |                                                  |
| `status`      | `ProjectStatus` | Default `PLANNED`     | See enum below                                   |
| `priority`    | `Priority`      | Default `MEDIUM`      | See enum below                                   |
| `progress`    | `Int`           | Default `0`           | 0–100 (%)                                        |
| `riskNotes`   | `String?`       | Optional              | Free-text risk commentary                        |
| `startDate`   | `DateTime?`     | Optional              |                                                  |
| `endDate`     | `DateTime?`     | Optional              |                                                  |
| `isArchived`  | `Boolean`       | Default `false`       | Soft-delete; excluded from default list queries  |
| `createdAt`   | `DateTime`      | Default `now()`       |                                                  |
| `updatedAt`   | `DateTime`      | Auto-updated          |                                                  |
| `ownerId`     | `String`        | FK → `User.id`        | `RESTRICT` on delete                             |

**Relations:** many Project → one `owner` (User); one Project → many `tasks`

**Indexes:** `isArchived`, `status`, `priority`, `ownerId`, `createdAt`, `updatedAt`, `progress`, `name`, and composites `(isArchived, status)`, `(isArchived, priority)`, `(isArchived, ownerId)`.

---

### Task

A Kanban card belonging to a Project. Column placement is determined by `status`; within-column ordering by `sortOrder`.

| Column        | Type         | Constraints / Default | Notes                                           |
|---------------|--------------|-----------------------|-------------------------------------------------|
| `id`          | `String`     | PK, CUID              |                                                 |
| `title`       | `String`     | Required              |                                                 |
| `description` | `String?`    | Optional              |                                                 |
| `status`      | `TaskStatus` | Default `TODO`        | Maps to a Kanban column; see enum below         |
| `priority`    | `Priority`   | Default `MEDIUM`      | See enum below                                  |
| `dueDate`     | `DateTime?`  | Optional              |                                                 |
| `sortOrder`   | `Int`        | Default `0`           | Within-column ordering for Kanban persistence   |
| `isArchived`  | `Boolean`    | Default `false`       | Soft-delete; excluded from default list queries |
| `createdAt`   | `DateTime`   | Default `now()`       |                                                 |
| `updatedAt`   | `DateTime`   | Auto-updated          |                                                 |
| `projectId`   | `String`     | FK → `Project.id`     | `RESTRICT` on delete                            |
| `assigneeId`  | `String?`    | FK → `User.id`        | `SET NULL` on delete                            |

**Relations:** many Task → one `project`; many Task → one optional `assignee` (User)

**Indexes:** `projectId`, `status`, `priority`, `assigneeId`, `isArchived`, `title`, and composites `(projectId, status)`, `(projectId, status, sortOrder)`, `(projectId, isArchived)`.

---

## Enums

### `ProjectStatus`

| Value         | Meaning                              |
|---------------|--------------------------------------|
| `PLANNED`     | Defined but not yet started          |
| `IN_PROGRESS` | Actively being worked on             |
| `ON_HOLD`     | Paused; awaiting external dependency |
| `AT_RISK`     | Behind schedule or blocked           |
| `COMPLETED`   | All work done                        |

### `TaskStatus` (Kanban columns)

| Value         | Column        |
|---------------|---------------|
| `TODO`        | To Do         |
| `IN_PROGRESS` | In Progress   |
| `IN_REVIEW`   | In Review     |
| `DONE`        | Done          |

### `Priority`

`LOW` · `MEDIUM` · `HIGH` · `CRITICAL` (ascending severity)

### `UserRole`

`MEMBER` · `ADMIN` (stretch auth — not enforced in MVP)

---

## Entity Relationship

```
User ──< Project   (one owner per project; owner is required)
User ──< Task      (one assignee per task; assignee is optional)
Project ──< Task   (tasks belong to exactly one project)
```

Foreign-key behaviour:
- Deleting a **User** who owns a Project or has assigned Tasks is **blocked** (`RESTRICT`).
- Deleting a **Project** that has Tasks is **blocked** (`RESTRICT`).
- Deleting a **User** who is an assignee on a Task **nullifies** that task's `assigneeId` (`SET NULL`).

> Prefer archiving (`isArchived = true`) over deletion to preserve history.

---

## Migration Workflow

All schema changes are managed through Prisma Migrate. Commands are run from inside the `backend/` directory.

### Initial setup (first time)

```bash
cd backend
cp .env.example .env          # set DATABASE_URL=file:./prisma/dev.db
npm install
npm run prisma:migrate        # creates the SQLite file and runs all migrations
```

### Creating a new migration after editing `schema.prisma`

```bash
cd backend
npm run prisma:migrate        # prompts for a migration name, generates SQL, applies it
```

Under the hood this runs `prisma migrate dev`, which:
1. Compares the current schema with the last applied migration.
2. Generates a new SQL file under `prisma/migrations/<timestamp>_<name>/migration.sql`.
3. Applies it to the local SQLite database.
4. Regenerates the Prisma Client (`@prisma/client`).

### Applying migrations in CI / production

```bash
cd backend
npx prisma migrate deploy    # applies pending migrations; does NOT prompt; safe for CI
```

### Inspecting the database

```bash
cd backend
npm run prisma:studio        # opens Prisma Studio in the browser at localhost:5555
```

### Regenerating the Prisma Client (without a migration)

```bash
cd backend
npm run prisma:generate      # also runs automatically via postinstall
```

---

## Seed Process

The seed script lives at `backend/prisma/seed.ts` and is registered in `backend/package.json` under the `"prisma"."seed"` key so Prisma can invoke it automatically.

### What the seed creates

| Entity    | Count | Details                                                                     |
|-----------|-------|-----------------------------------------------------------------------------|
| `User`    | 5     | 1 ADMIN (`alex.morgan`), 4 MEMBERs                                          |
| `Project` | 5     | One per `ProjectStatus` so all dashboard status cards are populated         |
| `Task`    | 27    | Spread across all projects and all four Kanban columns                      |

The script is **idempotent**: it deletes all existing rows in reverse-dependency order (`Task → Project → User`) before re-inserting, so it is safe to re-run at any time.

### Running the seed

```bash
cd backend
npx prisma db seed            # runs tsx prisma/seed.ts
```

Or via the workspace root script (if wired):

```bash
npm run seed --workspace=backend
```

### Re-seeding from scratch

```bash
cd backend
npx prisma migrate reset      # drops DB, re-runs all migrations, then auto-seeds
```

> `migrate reset` is destructive — use only in development.

### Seed users reference

| Name          | Email                       | Role   |
|---------------|-----------------------------|--------|
| Alex Morgan   | alex.morgan@acme.dev        | ADMIN  |
| Jordan Lee    | jordan.lee@acme.dev         | MEMBER |
| Sam Rivera    | sam.rivera@acme.dev         | MEMBER |
| Taylor Kim    | taylor.kim@acme.dev         | MEMBER |
| Casey Chen    | casey.chen@acme.dev         | MEMBER |

### Seed projects reference

| Alias      | Name                          | Status        | Priority |
|------------|-------------------------------|---------------|----------|
| `portal`   | Customer Portal Redesign      | `IN_PROGRESS` | HIGH     |
| `mobile`   | Mobile App MVP                | `AT_RISK`     | CRITICAL |
| `analytics`| Data Analytics Platform       | `PLANNED`     | MEDIUM   |
| `gateway`  | API Gateway Migration         | `COMPLETED`   | HIGH     |
| `devtools` | Internal Developer Tooling    | `ON_HOLD`     | LOW      |
