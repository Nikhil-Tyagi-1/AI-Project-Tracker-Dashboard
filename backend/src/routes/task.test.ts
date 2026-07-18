import request from "supertest";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import { createApp } from "../app";
import { prisma } from "../prisma/client";

const app = createApp();

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

/** ID of the dedicated user created for this test run. */
let testOwnerId: string;

/** Active project created for the current test (set in beforeEach where needed). */
let testProjectId: string;

/** Minimal valid POST body — always references the in-test project. */
const minimalPayload = () => ({
  title: "Integration Test Task",
  projectId: testProjectId,
});

// ---------------------------------------------------------------------------
// Suite lifecycle — create/destroy the test owner, wipe projects+tasks between tests
// ---------------------------------------------------------------------------

beforeAll(async () => {
  const user = await prisma.user.create({
    data: {
      // Unique suffix prevents collisions with seed data or parallel runs.
      email: `task-test-${Date.now()}@test.invalid`,
      name: "Task Test Owner",
    },
  });
  testOwnerId = user.id;
});

afterAll(async () => {
  // Tasks must be removed before projects (onDelete: Restrict).
  await prisma.task.deleteMany({
    where: { project: { ownerId: testOwnerId } },
  });
  await prisma.project.deleteMany({ where: { ownerId: testOwnerId } });
  await prisma.user.delete({ where: { id: testOwnerId } });
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.task.deleteMany({
    where: { project: { ownerId: testOwnerId } },
  });
  await prisma.project.deleteMany({ where: { ownerId: testOwnerId } });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a project owned by the test user via the Projects API. */
async function seedProject(overrides: object = {}) {
  const res = await request(app)
    .post("/api/projects")
    .send({
      name: "Task Test Project",
      ownerId: testOwnerId,
      ...overrides,
    });
  expect(res.status).toBe(201);
  return res.body.data as Record<string, unknown>;
}

/** POST /api/tasks and return the response. */
async function createTask(body: object) {
  return request(app).post("/api/tasks").send(body);
}

/** Create a task and assert success; returns the task data object. */
async function seedTask(overrides: object = {}) {
  const res = await createTask({ ...minimalPayload(), ...overrides });
  expect(res.status).toBe(201);
  return res.body.data as Record<string, unknown>;
}

/** Ensure an active project exists for tests that need one. */
async function ensureProject() {
  const project = await seedProject({
    name: `Task Host ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });
  testProjectId = project.id as string;
  return project;
}

// ---------------------------------------------------------------------------
// POST /api/tasks — create
// ---------------------------------------------------------------------------

describe("POST /api/tasks", () => {
  beforeEach(async () => {
    await ensureProject();
  });

  describe("successful creation", () => {
    it("returns HTTP 201", async () => {
      const res = await createTask(minimalPayload());
      expect(res.status).toBe(201);
    });

    it("returns the { data } envelope", async () => {
      const res = await createTask(minimalPayload());
      expect(res.body).toHaveProperty("data");
      expect(typeof res.body.data).toBe("object");
    });

    it("includes the task id", async () => {
      const res = await createTask(minimalPayload());
      expect(typeof res.body.data.id).toBe("string");
      expect(res.body.data.id.length).toBeGreaterThan(0);
    });

    it("returns the submitted title", async () => {
      const res = await createTask(minimalPayload());
      expect(res.body.data.title).toBe("Integration Test Task");
    });

    it("defaults status to TODO", async () => {
      const res = await createTask(minimalPayload());
      expect(res.body.data.status).toBe("TODO");
    });

    it("defaults priority to MEDIUM", async () => {
      const res = await createTask(minimalPayload());
      expect(res.body.data.priority).toBe("MEDIUM");
    });

    it("defaults sortOrder to 0", async () => {
      const res = await createTask(minimalPayload());
      expect(res.body.data.sortOrder).toBe(0);
    });

    it("defaults isArchived to false", async () => {
      const res = await createTask(minimalPayload());
      expect(res.body.data.isArchived).toBe(false);
    });

    it("includes nested project with id and name", async () => {
      const res = await createTask(minimalPayload());
      const { project } = res.body.data as { project: Record<string, unknown> };
      expect(project).toMatchObject({
        id: testProjectId,
        isArchived: false,
      });
      expect(typeof project.name).toBe("string");
    });

    it("persists optional fields when provided", async () => {
      const body = {
        ...minimalPayload(),
        title: "Full Payload Task",
        description: "A complete payload",
        status: "IN_PROGRESS",
        priority: "HIGH",
        sortOrder: 3,
        dueDate: "2025-12-31",
        assigneeId: testOwnerId,
      };
      const res = await createTask(body);
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        title: "Full Payload Task",
        description: "A complete payload",
        status: "IN_PROGRESS",
        priority: "HIGH",
        sortOrder: 3,
        assigneeId: testOwnerId,
      });
    });
  });

  // ---- Invalid payloads ---------------------------------------------------

  describe("validation failures", () => {
    it("returns 400 when title is missing", async () => {
      const res = await createTask({ projectId: testProjectId });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when projectId is missing", async () => {
      const res = await createTask({ title: "No Project" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when title is shorter than 3 characters", async () => {
      const res = await createTask({ ...minimalPayload(), title: "ab" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when title exceeds 100 characters", async () => {
      const res = await createTask({
        ...minimalPayload(),
        title: "x".repeat(101),
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid status enum value", async () => {
      const res = await createTask({ ...minimalPayload(), status: "UNKNOWN" });
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid priority enum value", async () => {
      const res = await createTask({ ...minimalPayload(), priority: "URGENT" });
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid dueDate", async () => {
      const res = await createTask({
        ...minimalPayload(),
        dueDate: "not-a-date",
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 when sortOrder is negative", async () => {
      const res = await createTask({ ...minimalPayload(), sortOrder: -1 });
      expect(res.status).toBe(400);
    });

    it("returns 400 when body is empty", async () => {
      const res = await createTask({});
      expect(res.status).toBe(400);
    });

    it("includes a details array in the 400 response", async () => {
      const res = await createTask({ projectId: testProjectId });
      expect(Array.isArray(res.body.error.details)).toBe(true);
      expect(res.body.error.details.length).toBeGreaterThan(0);
    });
  });

  // ---- Project link rules -------------------------------------------------

  describe("project link rules", () => {
    it("returns 404 when projectId does not exist", async () => {
      const res = await createTask({
        title: "Orphan Task",
        projectId: "does-not-exist-id",
      });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("returns 400 when the project is archived", async () => {
      await request(app).patch(`/api/projects/${testProjectId}/archive`);
      const res = await createTask(minimalPayload());
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });
});

// ---------------------------------------------------------------------------
// GET /api/tasks — list
// ---------------------------------------------------------------------------

describe("GET /api/tasks", () => {
  beforeEach(async () => {
    await ensureProject();
    await seedTask({ title: "List Task Alpha" });
    await seedTask({ title: "List Task Beta" });
  });

  it("returns HTTP 200", async () => {
    const res = await request(app).get(`/api/tasks?projectId=${testProjectId}`);
    expect(res.status).toBe(200);
  });

  it("returns the { data, meta } envelope", async () => {
    const res = await request(app).get(`/api/tasks?projectId=${testProjectId}`);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toMatchObject({
      total: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
    });
  });

  it("meta.page defaults to 1", async () => {
    const res = await request(app).get(`/api/tasks?projectId=${testProjectId}`);
    expect(res.body.meta.page).toBe(1);
  });

  it("meta.pageSize defaults to 20", async () => {
    const res = await request(app).get(`/api/tasks?projectId=${testProjectId}`);
    expect(res.body.meta.pageSize).toBe(20);
  });

  it("returns the two seeded tasks for the project", async () => {
    const res = await request(app).get(`/api/tasks?projectId=${testProjectId}`);
    const titles = (res.body.data as Array<{ title: string }>).map((t) => t.title);
    expect(titles).toContain("List Task Alpha");
    expect(titles).toContain("List Task Beta");
    expect(res.body.meta.total).toBe(2);
  });

  it("filters by status", async () => {
    await seedTask({ title: "Status Filter Task", status: "IN_REVIEW" });
    const res = await request(app).get(
      `/api/tasks?projectId=${testProjectId}&status=IN_REVIEW`,
    );
    expect(res.status).toBe(200);
    const tasks = res.body.data as Array<{ title: string; status: string }>;
    expect(tasks.length).toBeGreaterThan(0);
    tasks.forEach((t) => expect(t.status).toBe("IN_REVIEW"));
  });

  it("filters by priority", async () => {
    await seedTask({ title: "Priority Filter Task", priority: "CRITICAL" });
    const res = await request(app).get(
      `/api/tasks?projectId=${testProjectId}&priority=CRITICAL`,
    );
    expect(res.status).toBe(200);
    const tasks = res.body.data as Array<{ priority: string }>;
    tasks.forEach((t) => expect(t.priority).toBe("CRITICAL"));
  });

  it("returns 400 for an invalid status filter", async () => {
    const res = await request(app).get("/api/tasks?status=UNKNOWN");
    expect(res.status).toBe(400);
  });

  it("respects pageSize", async () => {
    const res = await request(app).get(
      `/api/tasks?projectId=${testProjectId}&pageSize=1`,
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
    expect(res.body.meta.pageSize).toBe(1);
  });

  // ---- Archived excluded by default ---------------------------------------

  describe("archived tasks excluded by default", () => {
    it("does not include archived tasks in the default list", async () => {
      const task = await seedTask({ title: "Soon-Archived Task" });
      await request(app).patch(`/api/tasks/${task.id}/archive`);

      const res = await request(app).get(`/api/tasks?projectId=${testProjectId}`);
      expect(res.status).toBe(200);
      const titles = (res.body.data as Array<{ title: string }>).map((t) => t.title);
      expect(titles).not.toContain("Soon-Archived Task");
    });

    it("includes archived tasks when includeArchived=true", async () => {
      const task = await seedTask({ title: "Archived Visible Task" });
      await request(app).patch(`/api/tasks/${task.id}/archive`);

      const res = await request(app).get(
        `/api/tasks?projectId=${testProjectId}&includeArchived=true`,
      );
      expect(res.status).toBe(200);
      const titles = (res.body.data as Array<{ title: string }>).map((t) => t.title);
      expect(titles).toContain("Archived Visible Task");
    });

    it("meta.total only counts active tasks by default", async () => {
      const task = await seedTask({ title: "Count Test Archived" });
      const beforeRes = await request(app).get(
        `/api/tasks?projectId=${testProjectId}`,
      );
      const totalBefore = beforeRes.body.meta.total as number;

      await request(app).patch(`/api/tasks/${task.id}/archive`);

      const afterRes = await request(app).get(
        `/api/tasks?projectId=${testProjectId}`,
      );
      expect(afterRes.body.meta.total).toBe(totalBefore - 1);
    });
  });
});

// ---------------------------------------------------------------------------
// GET /api/tasks/:id — detail
// ---------------------------------------------------------------------------

describe("GET /api/tasks/:id", () => {
  let taskId: string;

  beforeEach(async () => {
    await ensureProject();
    const task = await seedTask({ title: "Detail Task" });
    taskId = task.id as string;
  });

  it("returns HTTP 200 for an existing task", async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`);
    expect(res.status).toBe(200);
  });

  it("returns the task in the { data } envelope", async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`);
    expect(res.body.data).toMatchObject({
      id: taskId,
      title: "Detail Task",
    });
  });

  it("includes the nested project object", async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`);
    const { project } = res.body.data as { project: Record<string, unknown> };
    expect(project).toMatchObject({ id: testProjectId });
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/tasks/does-not-exist-id");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns an archived task by id (archived not hidden on detail)", async () => {
    await request(app).patch(`/api/tasks/${taskId}/archive`);
    const res = await request(app).get(`/api/tasks/${taskId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isArchived).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/tasks/:id — update
// ---------------------------------------------------------------------------

describe("PATCH /api/tasks/:id", () => {
  let taskId: string;

  beforeEach(async () => {
    await ensureProject();
    const task = await seedTask({ title: "Updatable Task", status: "TODO" });
    taskId = task.id as string;
  });

  it("returns HTTP 200 on a valid update", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ title: "Renamed Task" });
    expect(res.status).toBe(200);
  });

  it("returns the updated task in the { data } envelope", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ title: "Updated Title" });
    expect(res.body.data.title).toBe("Updated Title");
    expect(res.body.data.id).toBe(taskId);
  });

  it("applies a partial update — other fields are unchanged", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ priority: "CRITICAL" });
    expect(res.status).toBe(200);
    expect(res.body.data.priority).toBe("CRITICAL");
    expect(res.body.data.title).toBe("Updatable Task");
  });

  it("updates status for Kanban persistence", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ status: "IN_PROGRESS" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("IN_PROGRESS");
  });

  it("updates sortOrder for Kanban column ordering", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ sortOrder: 5 });
    expect(res.status).toBe(200);
    expect(res.body.data.sortOrder).toBe(5);
  });

  it("updates status and sortOrder together", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ status: "DONE", sortOrder: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("DONE");
    expect(res.body.data.sortOrder).toBe(2);
  });

  it("returns 400 when updating an archived task", async () => {
    await request(app).patch(`/api/tasks/${taskId}/archive`);
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ title: "Attempt to rename archived" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for an invalid title (too short)", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ title: "ab" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid status enum value", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ status: "DELETED" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a negative sortOrder", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ sortOrder: -1 });
    expect(res.status).toBe(400);
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app)
      .patch("/api/tasks/does-not-exist-id")
      .send({ title: "Ghost Update" });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/tasks/:id/archive — archive
// ---------------------------------------------------------------------------

describe("PATCH /api/tasks/:id/archive", () => {
  let taskId: string;

  beforeEach(async () => {
    await ensureProject();
    const task = await seedTask({ title: "Archive Candidate" });
    taskId = task.id as string;
  });

  it("returns HTTP 200", async () => {
    const res = await request(app).patch(`/api/tasks/${taskId}/archive`);
    expect(res.status).toBe(200);
  });

  it("sets isArchived to true", async () => {
    const res = await request(app).patch(`/api/tasks/${taskId}/archive`);
    expect(res.body.data.isArchived).toBe(true);
  });

  it("is idempotent — archiving an already-archived task returns 200", async () => {
    await request(app).patch(`/api/tasks/${taskId}/archive`);
    const res = await request(app).patch(`/api/tasks/${taskId}/archive`);
    expect(res.status).toBe(200);
    expect(res.body.data.isArchived).toBe(true);
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).patch("/api/tasks/does-not-exist-id/archive");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/tasks/:id/restore — restore
// ---------------------------------------------------------------------------

describe("PATCH /api/tasks/:id/restore", () => {
  let taskId: string;

  beforeEach(async () => {
    await ensureProject();
    const task = await seedTask({ title: "Restore Candidate" });
    taskId = task.id as string;
    // Archive it so restore has something to do.
    await request(app).patch(`/api/tasks/${taskId}/archive`);
  });

  it("returns HTTP 200", async () => {
    const res = await request(app).patch(`/api/tasks/${taskId}/restore`);
    expect(res.status).toBe(200);
  });

  it("sets isArchived to false", async () => {
    const res = await request(app).patch(`/api/tasks/${taskId}/restore`);
    expect(res.body.data.isArchived).toBe(false);
  });

  it("task reappears in the default list after restore", async () => {
    await request(app).patch(`/api/tasks/${taskId}/restore`);
    const res = await request(app).get(`/api/tasks?projectId=${testProjectId}`);
    const titles = (res.body.data as Array<{ title: string }>).map((t) => t.title);
    expect(titles).toContain("Restore Candidate");
  });

  it("is idempotent — restoring an active task returns 200", async () => {
    await request(app).patch(`/api/tasks/${taskId}/restore`);
    const res = await request(app).patch(`/api/tasks/${taskId}/restore`);
    expect(res.status).toBe(200);
    expect(res.body.data.isArchived).toBe(false);
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).patch("/api/tasks/does-not-exist-id/restore");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
