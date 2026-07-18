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

/** Minimal valid POST body — always references the in-test owner. */
const minimalPayload = () => ({
  name: "Integration Test Project",
  ownerId: testOwnerId,
});

// ---------------------------------------------------------------------------
// Suite lifecycle — create/destroy the test owner, wipe projects between tests
// ---------------------------------------------------------------------------

beforeAll(async () => {
  const user = await prisma.user.create({
    data: {
      // Unique suffix prevents collisions with seed data or parallel runs.
      email: `project-test-${Date.now()}@test.invalid`,
      name: "Project Test Owner",
    },
  });
  testOwnerId = user.id;
});

afterAll(async () => {
  await prisma.project.deleteMany({ where: { ownerId: testOwnerId } });
  await prisma.user.delete({ where: { id: testOwnerId } });
  await prisma.$disconnect();
});

afterEach(async () => {
  // Isolate each test — remove all projects owned by the test user.
  await prisma.project.deleteMany({ where: { ownerId: testOwnerId } });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** POST /api/projects and return the response. */
async function createProject(body: object) {
  return request(app).post("/api/projects").send(body);
}

/** Create a project and assert success; returns the project data object. */
async function seedProject(overrides: object = {}) {
  const res = await createProject({ ...minimalPayload(), ...overrides });
  expect(res.status).toBe(201);
  return res.body.data as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// POST /api/projects — create
// ---------------------------------------------------------------------------

describe("POST /api/projects", () => {
  describe("successful creation", () => {
    it("returns HTTP 201", async () => {
      const res = await createProject(minimalPayload());
      expect(res.status).toBe(201);
    });

    it("returns the { data } envelope", async () => {
      const res = await createProject(minimalPayload());
      expect(res.body).toHaveProperty("data");
      expect(typeof res.body.data).toBe("object");
    });

    it("includes the project id", async () => {
      const res = await createProject(minimalPayload());
      expect(typeof res.body.data.id).toBe("string");
      expect(res.body.data.id.length).toBeGreaterThan(0);
    });

    it("returns the submitted name", async () => {
      const res = await createProject(minimalPayload());
      expect(res.body.data.name).toBe("Integration Test Project");
    });

    it("defaults status to PLANNED", async () => {
      const res = await createProject(minimalPayload());
      expect(res.body.data.status).toBe("PLANNED");
    });

    it("defaults priority to MEDIUM", async () => {
      const res = await createProject(minimalPayload());
      expect(res.body.data.priority).toBe("MEDIUM");
    });

    it("defaults progress to 0", async () => {
      const res = await createProject(minimalPayload());
      expect(res.body.data.progress).toBe(0);
    });

    it("defaults isArchived to false", async () => {
      const res = await createProject(minimalPayload());
      expect(res.body.data.isArchived).toBe(false);
    });

    it("includes nested owner with id, name, email", async () => {
      const res = await createProject(minimalPayload());
      const { owner } = res.body.data as { owner: Record<string, unknown> };
      expect(owner).toMatchObject({
        id: testOwnerId,
        name: "Project Test Owner",
        email: expect.stringContaining("@test.invalid"),
      });
    });

    it("persists optional fields when provided", async () => {
      const body = {
        ...minimalPayload(),
        name: "Full Payload Project",
        description: "A complete payload",
        status: "IN_PROGRESS",
        priority: "HIGH",
        progress: 40,
        riskNotes: "Some risk",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      };
      const res = await createProject(body);
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        name: "Full Payload Project",
        description: "A complete payload",
        status: "IN_PROGRESS",
        priority: "HIGH",
        progress: 40,
        riskNotes: "Some risk",
      });
    });
  });

  // ---- Invalid payloads ---------------------------------------------------

  describe("invalid payloads", () => {
    it("returns 400 when name is missing", async () => {
      const res = await createProject({ ownerId: testOwnerId });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when ownerId is missing", async () => {
      const res = await createProject({ name: "No Owner" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when name is shorter than 3 characters", async () => {
      const res = await createProject({ ...minimalPayload(), name: "ab" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when name exceeds 100 characters", async () => {
      const res = await createProject({
        ...minimalPayload(),
        name: "x".repeat(101),
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid status enum value", async () => {
      const res = await createProject({ ...minimalPayload(), status: "UNKNOWN" });
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid priority enum value", async () => {
      const res = await createProject({ ...minimalPayload(), priority: "URGENT" });
      expect(res.status).toBe(400);
    });

    it("returns 400 when endDate precedes startDate", async () => {
      const res = await createProject({
        ...minimalPayload(),
        startDate: "2025-06-01",
        endDate: "2025-05-01",
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 when progress is negative", async () => {
      const res = await createProject({ ...minimalPayload(), progress: -1 });
      expect(res.status).toBe(400);
    });

    it("returns 400 when progress exceeds 100", async () => {
      const res = await createProject({ ...minimalPayload(), progress: 101 });
      expect(res.status).toBe(400);
    });

    it("returns 400 when progress is a float", async () => {
      const res = await createProject({ ...minimalPayload(), progress: 50.5 });
      expect(res.status).toBe(400);
    });

    it("returns 400 when body is empty", async () => {
      const res = await createProject({});
      expect(res.status).toBe(400);
    });

    it("includes a details array in the 400 response", async () => {
      const res = await createProject({ ownerId: testOwnerId });
      expect(Array.isArray(res.body.error.details)).toBe(true);
      expect(res.body.error.details.length).toBeGreaterThan(0);
    });
  });

  // ---- Duplicate names ----------------------------------------------------

  describe("duplicate project names", () => {
    it("returns 409 when an active project with the same name exists", async () => {
      await seedProject({ name: "Unique Project Name" });
      const res = await createProject({
        ...minimalPayload(),
        name: "Unique Project Name",
      });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
    });

    it("is case-insensitive when checking for duplicates", async () => {
      await seedProject({ name: "CamelCase Project" });
      const res = await createProject({
        ...minimalPayload(),
        name: "camelcase project",
      });
      expect(res.status).toBe(409);
    });

    it("allows a name that was used by an archived project", async () => {
      const project = await seedProject({ name: "Archived Name" });
      // Archive it first so the name becomes available.
      await request(app).patch(`/api/projects/${project.id}/archive`);
      const res = await createProject({
        ...minimalPayload(),
        name: "Archived Name",
      });
      expect(res.status).toBe(201);
    });
  });
});

// ---------------------------------------------------------------------------
// GET /api/projects — list
// ---------------------------------------------------------------------------

describe("GET /api/projects", () => {
  beforeEach(async () => {
    await seedProject({ name: "List Project Alpha" });
    await seedProject({ name: "List Project Beta" });
  });

  it("returns HTTP 200", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(200);
  });

  it("returns the { data, meta } envelope", async () => {
    const res = await request(app).get("/api/projects");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toMatchObject({
      total: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
    });
  });

  it("meta.page defaults to 1", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.body.meta.page).toBe(1);
  });

  it("meta.pageSize defaults to 20", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.body.meta.pageSize).toBe(20);
  });

  it("returns at least the two seeded projects", async () => {
    const res = await request(app).get("/api/projects");
    const names = (res.body.data as Array<{ name: string }>).map((p) => p.name);
    expect(names).toContain("List Project Alpha");
    expect(names).toContain("List Project Beta");
  });

  it("filters by status", async () => {
    await seedProject({ name: "Status Filter Project", status: "ON_HOLD" });
    const res = await request(app).get("/api/projects?status=ON_HOLD");
    expect(res.status).toBe(200);
    const projects = res.body.data as Array<{ name: string; status: string }>;
    const filtered = projects.filter((p) => p.name === "Status Filter Project");
    expect(filtered.length).toBeGreaterThan(0);
    projects.forEach((p) => expect(p.status).toBe("ON_HOLD"));
  });

  it("filters by priority", async () => {
    await seedProject({ name: "Priority Filter Project", priority: "CRITICAL" });
    const res = await request(app).get("/api/projects?priority=CRITICAL");
    expect(res.status).toBe(200);
    const projects = res.body.data as Array<{ priority: string }>;
    projects.forEach((p) => expect(p.priority).toBe("CRITICAL"));
  });

  it("returns 400 for an invalid status filter", async () => {
    const res = await request(app).get("/api/projects?status=UNKNOWN");
    expect(res.status).toBe(400);
  });

  it("respects pageSize", async () => {
    const res = await request(app).get("/api/projects?pageSize=1");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
    expect(res.body.meta.pageSize).toBe(1);
  });

  // ---- Archived excluded by default ---------------------------------------

  describe("archived projects excluded by default", () => {
    it("does not include archived projects in the default list", async () => {
      const project = await seedProject({ name: "Soon-Archived Project" });
      await request(app).patch(`/api/projects/${project.id}/archive`);

      const res = await request(app).get("/api/projects");
      expect(res.status).toBe(200);
      const names = (res.body.data as Array<{ name: string }>).map((p) => p.name);
      expect(names).not.toContain("Soon-Archived Project");
    });

    it("includes archived projects when includeArchived=true", async () => {
      const project = await seedProject({ name: "Archived Visible Project" });
      await request(app).patch(`/api/projects/${project.id}/archive`);

      const res = await request(app).get("/api/projects?includeArchived=true");
      expect(res.status).toBe(200);
      const names = (res.body.data as Array<{ name: string }>).map((p) => p.name);
      expect(names).toContain("Archived Visible Project");
    });

    it("meta.total only counts active projects by default", async () => {
      const project = await seedProject({ name: "Count Test Archived" });
      const beforeRes = await request(app).get("/api/projects");
      const totalBefore = beforeRes.body.meta.total as number;

      await request(app).patch(`/api/projects/${project.id}/archive`);

      const afterRes = await request(app).get("/api/projects");
      expect(afterRes.body.meta.total).toBe(totalBefore - 1);
    });
  });
});

// ---------------------------------------------------------------------------
// GET /api/projects/:id — detail
// ---------------------------------------------------------------------------

describe("GET /api/projects/:id", () => {
  let projectId: string;

  beforeEach(async () => {
    const p = await seedProject({ name: "Detail Project" });
    projectId = p.id as string;
  });

  it("returns HTTP 200 for an existing project", async () => {
    const res = await request(app).get(`/api/projects/${projectId}`);
    expect(res.status).toBe(200);
  });

  it("returns the project in the { data } envelope", async () => {
    const res = await request(app).get(`/api/projects/${projectId}`);
    expect(res.body.data).toMatchObject({
      id: projectId,
      name: "Detail Project",
    });
  });

  it("includes the nested owner object", async () => {
    const res = await request(app).get(`/api/projects/${projectId}`);
    const { owner } = res.body.data as { owner: Record<string, unknown> };
    expect(owner).toMatchObject({ id: testOwnerId });
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/projects/does-not-exist-id");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns an archived project by id (archived not hidden on detail)", async () => {
    await request(app).patch(`/api/projects/${projectId}/archive`);
    const res = await request(app).get(`/api/projects/${projectId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isArchived).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/projects/:id — update
// ---------------------------------------------------------------------------

describe("PATCH /api/projects/:id", () => {
  let projectId: string;

  beforeEach(async () => {
    const p = await seedProject({ name: "Updatable Project", status: "PLANNED" });
    projectId = p.id as string;
  });

  it("returns HTTP 200 on a valid update", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({ name: "Renamed Project" });
    expect(res.status).toBe(200);
  });

  it("returns the updated project in the { data } envelope", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({ name: "Updated Name" });
    expect(res.body.data.name).toBe("Updated Name");
    expect(res.body.data.id).toBe(projectId);
  });

  it("applies a partial update — other fields are unchanged", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({ priority: "CRITICAL" });
    expect(res.status).toBe(200);
    expect(res.body.data.priority).toBe("CRITICAL");
    expect(res.body.data.name).toBe("Updatable Project");
  });

  it("allows a valid status transition (PLANNED → IN_PROGRESS)", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({ status: "IN_PROGRESS" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("IN_PROGRESS");
  });

  it("returns 400 for an invalid status transition (COMPLETED → AT_RISK)", async () => {
    // Bring project to COMPLETED state first.
    await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({ status: "COMPLETED", progress: 100 });

    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({ status: "AT_RISK" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when setting COMPLETED without progress = 100", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({ status: "COMPLETED", progress: 50 });
    expect(res.status).toBe(400);
  });

  it("returns 400 when updating an archived project", async () => {
    await request(app).patch(`/api/projects/${projectId}/archive`);
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({ name: "Attempt to rename archived" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 409 when renaming to an existing active project name", async () => {
    await seedProject({ name: "Existing Project Name" });
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({ name: "Existing Project Name" });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("returns 400 for an invalid name (too short)", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({ name: "ab" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app)
      .patch("/api/projects/does-not-exist-id")
      .send({ name: "Ghost Update" });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/projects/:id/archive — archive
// ---------------------------------------------------------------------------

describe("PATCH /api/projects/:id/archive", () => {
  let projectId: string;

  beforeEach(async () => {
    const p = await seedProject({ name: "Archive Candidate" });
    projectId = p.id as string;
  });

  it("returns HTTP 200", async () => {
    const res = await request(app).patch(`/api/projects/${projectId}/archive`);
    expect(res.status).toBe(200);
  });

  it("sets isArchived to true", async () => {
    const res = await request(app).patch(`/api/projects/${projectId}/archive`);
    expect(res.body.data.isArchived).toBe(true);
  });

  it("is idempotent — archiving an already-archived project returns 200", async () => {
    await request(app).patch(`/api/projects/${projectId}/archive`);
    const res = await request(app).patch(`/api/projects/${projectId}/archive`);
    expect(res.status).toBe(200);
    expect(res.body.data.isArchived).toBe(true);
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).patch("/api/projects/does-not-exist-id/archive");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/projects/:id/restore — restore
// ---------------------------------------------------------------------------

describe("PATCH /api/projects/:id/restore", () => {
  let projectId: string;

  beforeEach(async () => {
    const p = await seedProject({ name: "Restore Candidate" });
    projectId = p.id as string;
    // Archive it so restore has something to do.
    await request(app).patch(`/api/projects/${projectId}/archive`);
  });

  it("returns HTTP 200", async () => {
    const res = await request(app).patch(`/api/projects/${projectId}/restore`);
    expect(res.status).toBe(200);
  });

  it("sets isArchived to false", async () => {
    const res = await request(app).patch(`/api/projects/${projectId}/restore`);
    expect(res.body.data.isArchived).toBe(false);
  });

  it("project reappears in the default list after restore", async () => {
    await request(app).patch(`/api/projects/${projectId}/restore`);
    const res = await request(app).get("/api/projects");
    const names = (res.body.data as Array<{ name: string }>).map((p) => p.name);
    expect(names).toContain("Restore Candidate");
  });

  it("is idempotent — restoring an active project returns 200", async () => {
    await request(app).patch(`/api/projects/${projectId}/restore`);
    const res = await request(app).patch(`/api/projects/${projectId}/restore`);
    expect(res.status).toBe(200);
    expect(res.body.data.isArchived).toBe(false);
  });

  it("returns 409 when restoring would duplicate an active project name", async () => {
    // Create an active project with the same name as the archived one.
    await seedProject({ name: "Restore Candidate" });
    const res = await request(app).patch(`/api/projects/${projectId}/restore`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).patch("/api/projects/does-not-exist-id/restore");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
