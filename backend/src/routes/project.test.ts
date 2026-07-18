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

  it("filters by owner display name", async () => {
    await seedProject({ name: "Owner Filter Project" });
    const res = await request(app).get(
      "/api/projects?owner=Project Test Owner",
    );
    expect(res.status).toBe(200);
    const projects = res.body.data as Array<{
      name: string;
      owner: { name: string };
    }>;
    expect(projects.some((p) => p.name === "Owner Filter Project")).toBe(true);
    projects.forEach((p) =>
      expect(p.owner.name).toMatch(/Project Test Owner/i),
    );
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

  // ---- Search by name (q) — AC-S01 / AC-S06 / AC-TEST02 -------------------

  describe("search by name (q)", () => {
    beforeEach(async () => {
      await seedProject({
        name: "M9 Search Alpha Portal",
        description: "Unrelated description text",
      });
      await seedProject({
        name: "M9 Search Beta API",
        description: "Includes Portal keyword in description",
      });
      await seedProject({ name: "M9 Search Gamma Mobile" });
    });

    it("returns case-insensitive partial matches on name", async () => {
      const res = await request(app).get("/api/projects?q=portal");
      expect(res.status).toBe(200);

      const names = (res.body.data as Array<{ name: string }>).map((p) => p.name);
      expect(names).toContain("M9 Search Alpha Portal");
      // Description match is also allowed by the API contract.
      expect(names).toContain("M9 Search Beta API");
      expect(names).not.toContain("M9 Search Gamma Mobile");
    });

    it("matches regardless of query casing", async () => {
      const res = await request(app).get("/api/projects?q=ALPHA PORTAL");
      expect(res.status).toBe(200);
      const names = (res.body.data as Array<{ name: string }>).map((p) => p.name);
      expect(names).toContain("M9 Search Alpha Portal");
    });

    it("returns an empty data array when nothing matches", async () => {
      const res = await request(app).get(
        "/api/projects?q=zzz-no-such-project-m9-search",
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });

    it("does not mutate projects when searching", async () => {
      const before = await prisma.project.findMany({
        where: { ownerId: testOwnerId },
        select: { id: true, name: true, updatedAt: true },
        orderBy: { name: "asc" },
      });

      await request(app).get("/api/projects?q=portal");

      const after = await prisma.project.findMany({
        where: { ownerId: testOwnerId },
        select: { id: true, name: true, updatedAt: true },
        orderBy: { name: "asc" },
      });
      expect(after).toEqual(before);
    });
  });

  // ---- Combined filters (AND) — AC-F04 / AC-TEST02 ------------------------

  describe("combined filters (status + priority + owner)", () => {
    let otherOwnerId: string;

    beforeAll(async () => {
      const other = await prisma.user.create({
        data: {
          email: `project-other-owner-${Date.now()}@test.invalid`,
          name: "M9 Other Filter Owner",
        },
      });
      otherOwnerId = other.id;
    });

    afterAll(async () => {
      await prisma.project.deleteMany({ where: { ownerId: otherOwnerId } });
      await prisma.user.delete({ where: { id: otherOwnerId } });
    });

    beforeEach(async () => {
      await seedProject({
        name: "M9 Combined Match",
        status: "IN_PROGRESS",
        priority: "HIGH",
      });
      await seedProject({
        name: "M9 Combined Wrong Priority",
        status: "IN_PROGRESS",
        priority: "LOW",
      });
      await seedProject({
        name: "M9 Combined Wrong Status",
        status: "ON_HOLD",
        priority: "HIGH",
      });

      // Same status+priority as the match, but a different owner — must be excluded.
      await createProject({
        name: "M9 Combined Other Owner",
        ownerId: otherOwnerId,
        status: "IN_PROGRESS",
        priority: "HIGH",
      });
    });

    afterEach(async () => {
      await prisma.project.deleteMany({ where: { ownerId: otherOwnerId } });
    });

    it("returns only projects that satisfy all three filters simultaneously", async () => {
      const res = await request(app).get(
        "/api/projects?status=IN_PROGRESS&priority=HIGH&owner=Project Test Owner",
      );
      expect(res.status).toBe(200);

      const projects = res.body.data as Array<{
        name: string;
        status: string;
        priority: string;
        owner: { name: string };
      }>;

      expect(projects.length).toBeGreaterThan(0);
      projects.forEach((p) => {
        expect(p.status).toBe("IN_PROGRESS");
        expect(p.priority).toBe("HIGH");
        expect(p.owner.name).toMatch(/Project Test Owner/i);
      });

      const names = projects.map((p) => p.name);
      expect(names).toContain("M9 Combined Match");
      expect(names).not.toContain("M9 Combined Wrong Priority");
      expect(names).not.toContain("M9 Combined Wrong Status");
      expect(names).not.toContain("M9 Combined Other Owner");
    });
  });

  // ---- Sorting — AC-F06 / AC-TEST02 ---------------------------------------

  describe("sorting", () => {
    /** Relative order of fixture names within a (possibly larger) result set. */
    function fixtureOrder(
      projects: Array<{ name: string }>,
      prefix: string,
    ): string[] {
      return projects
        .filter((p) => p.name.startsWith(prefix))
        .map((p) => p.name);
    }

    beforeEach(async () => {
      await seedProject({ name: "M9 Sort Charlie", progress: 30 });
      await seedProject({ name: "M9 Sort Alpha", progress: 90 });
      await seedProject({ name: "M9 Sort Bravo", progress: 10 });
    });

    it("sorts by name ascending", async () => {
      const res = await request(app).get(
        "/api/projects?owner=Project Test Owner&sortBy=name&sortOrder=asc&pageSize=100",
      );
      expect(res.status).toBe(200);
      expect(fixtureOrder(res.body.data, "M9 Sort")).toEqual([
        "M9 Sort Alpha",
        "M9 Sort Bravo",
        "M9 Sort Charlie",
      ]);
    });

    it("sorts by name descending", async () => {
      const res = await request(app).get(
        "/api/projects?owner=Project Test Owner&sortBy=name&sortOrder=desc&pageSize=100",
      );
      expect(res.status).toBe(200);
      expect(fixtureOrder(res.body.data, "M9 Sort")).toEqual([
        "M9 Sort Charlie",
        "M9 Sort Bravo",
        "M9 Sort Alpha",
      ]);
    });

    it("sorts by progress ascending", async () => {
      const res = await request(app).get(
        "/api/projects?owner=Project Test Owner&sortBy=progress&sortOrder=asc&pageSize=100",
      );
      expect(res.status).toBe(200);
      expect(fixtureOrder(res.body.data, "M9 Sort")).toEqual([
        "M9 Sort Bravo",
        "M9 Sort Charlie",
        "M9 Sort Alpha",
      ]);
    });

    it("sorts by progress descending", async () => {
      const res = await request(app).get(
        "/api/projects?owner=Project Test Owner&sortBy=progress&sortOrder=desc&pageSize=100",
      );
      expect(res.status).toBe(200);
      expect(fixtureOrder(res.body.data, "M9 Sort")).toEqual([
        "M9 Sort Alpha",
        "M9 Sort Charlie",
        "M9 Sort Bravo",
      ]);
    });

    it("sorts by createdAt ascending (oldest first among fixtures)", async () => {
      // Sequential creates guarantee distinct createdAt ordering for fixtures.
      await prisma.project.deleteMany({ where: { ownerId: testOwnerId } });
      const first = await seedProject({ name: "M9 Created First" });
      const second = await seedProject({ name: "M9 Created Second" });
      const third = await seedProject({ name: "M9 Created Third" });

      const res = await request(app).get(
        "/api/projects?owner=Project Test Owner&sortBy=createdAt&sortOrder=asc&pageSize=100",
      );
      expect(res.status).toBe(200);

      const ids = (res.body.data as Array<{ id: string; name: string }>)
        .filter((p) => p.name.startsWith("M9 Created"))
        .map((p) => p.id);
      expect(ids).toEqual([first.id, second.id, third.id]);
    });

    it("sorts by updatedAt descending (most recently updated first)", async () => {
      await prisma.project.deleteMany({ where: { ownerId: testOwnerId } });
      const older = await seedProject({ name: "M9 Updated Older" });
      const newer = await seedProject({ name: "M9 Updated Newer" });

      // Bump updatedAt on the first project so it sorts ahead when desc.
      await request(app)
        .patch(`/api/projects/${older.id}`)
        .send({ description: "Touched for updatedAt sort" });

      const res = await request(app).get(
        "/api/projects?owner=Project Test Owner&sortBy=updatedAt&sortOrder=desc&pageSize=100",
      );
      expect(res.status).toBe(200);

      const ids = (res.body.data as Array<{ id: string; name: string }>)
        .filter((p) => p.name.startsWith("M9 Updated"))
        .map((p) => p.id);
      expect(ids[0]).toBe(older.id);
      expect(ids).toContain(newer.id);
    });

    it("returns 400 for an invalid sortBy value", async () => {
      const res = await request(app).get("/api/projects?sortBy=title");
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
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
      // Scope by owner so parallel suites sharing the DB cannot race the total.
      const listUrl = "/api/projects?owner=Project Test Owner";
      const beforeRes = await request(app).get(listUrl);
      const totalBefore = beforeRes.body.meta.total as number;

      await request(app).patch(`/api/projects/${project.id}/archive`);

      const afterRes = await request(app).get(listUrl);
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

  // ---- Status transition rules — AC-P10 / AC-TEST02 -----------------------

  describe("status transition rules", () => {
    async function setStatus(
      status: string,
      progress?: number,
    ): Promise<void> {
      const body: Record<string, unknown> = { status };
      if (progress !== undefined) body.progress = progress;
      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send(body);
      expect(res.status).toBe(200);
    }

    it("rejects COMPLETED → AT_RISK", async () => {
      await setStatus("COMPLETED", 100);

      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send({ status: "AT_RISK" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.message).toMatch(/not permitted/i);
    });

    it("rejects COMPLETED → ON_HOLD", async () => {
      await setStatus("COMPLETED", 100);

      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send({ status: "ON_HOLD" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("allows COMPLETED → PLANNED (reopen)", async () => {
      await setStatus("COMPLETED", 100);

      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send({ status: "PLANNED" });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("PLANNED");
    });

    it("allows COMPLETED → IN_PROGRESS (reopen)", async () => {
      await setStatus("COMPLETED", 100);

      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send({ status: "IN_PROGRESS" });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("IN_PROGRESS");
    });

    it("allows IN_PROGRESS → AT_RISK", async () => {
      await setStatus("IN_PROGRESS");

      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send({ status: "AT_RISK" });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("AT_RISK");
    });

    it("leaves the database status unchanged when a transition is rejected", async () => {
      await setStatus("COMPLETED", 100);

      const before = await prisma.project.findUniqueOrThrow({
        where: { id: projectId },
        select: { status: true, progress: true, updatedAt: true },
      });

      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send({ status: "AT_RISK" });
      expect(res.status).toBe(400);

      const after = await prisma.project.findUniqueOrThrow({
        where: { id: projectId },
        select: { status: true, progress: true, updatedAt: true },
      });
      expect(after.status).toBe("COMPLETED");
      expect(after.progress).toBe(100);
      expect(after.updatedAt.getTime()).toBe(before.updatedAt.getTime());
    });
  });

  it("returns 400 when setting COMPLETED without progress = 100", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({ status: "COMPLETED", progress: 50 });
    expect(res.status).toBe(400);
  });

  // ---- Archived update rejection — AC-P14 / AC-TEST02 ---------------------

  describe("archived project update rejection", () => {
    beforeEach(async () => {
      await request(app).patch(`/api/projects/${projectId}/archive`);
    });

    it("returns 400 when updating an archived project", async () => {
      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send({ name: "Attempt to rename archived" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.message).toMatch(/archived/i);
    });

    it("does not change archived project fields in the database", async () => {
      const before = await prisma.project.findUniqueOrThrow({
        where: { id: projectId },
      });

      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .send({
          name: "Should Not Persist",
          priority: "CRITICAL",
          progress: 77,
          status: "IN_PROGRESS",
        });
      expect(res.status).toBe(400);

      const after = await prisma.project.findUniqueOrThrow({
        where: { id: projectId },
      });
      expect(after.name).toBe(before.name);
      expect(after.priority).toBe(before.priority);
      expect(after.progress).toBe(before.progress);
      expect(after.status).toBe(before.status);
      expect(after.isArchived).toBe(true);
      expect(after.updatedAt.getTime()).toBe(before.updatedAt.getTime());
    });
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
