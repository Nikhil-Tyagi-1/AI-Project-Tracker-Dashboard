import request from "supertest";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "@jest/globals";
import { createApp } from "../app";
import { prisma } from "../prisma/client";

const app = createApp();

// ---------------------------------------------------------------------------
// Test fixtures — known seed data so aggregates / charts / insights are non-empty
// (AC-TEST04). Scoped to a dedicated owner so cleanup cannot touch other rows.
// ---------------------------------------------------------------------------

let testOwnerId: string;
let testAssigneeId: string;

/** Stable names so chart assertions can spot our fixtures in a shared DB. */
const FIXTURE_PROJECT_NAMES = {
  active: "Dashboard Fixture — Active Portal",
  atRisk: "Dashboard Fixture — At Risk Mobile",
  completed: "Dashboard Fixture — Completed Gateway",
} as const;

const FIXTURE_TASK_TITLES = [
  "Dashboard Fixture Task — TODO",
  "Dashboard Fixture Task — IN_PROGRESS",
  "Dashboard Fixture Task — IN_REVIEW",
  "Dashboard Fixture Task — DONE",
  "Dashboard Fixture Task — Unassigned TODO",
] as const;

// ---------------------------------------------------------------------------
// Suite lifecycle
// ---------------------------------------------------------------------------

beforeAll(async () => {
  const suffix = Date.now();

  const [owner, assignee] = await Promise.all([
    prisma.user.create({
      data: {
        email: `dashboard-owner-${suffix}@test.invalid`,
        name: "Dashboard Test Owner",
      },
    }),
    prisma.user.create({
      data: {
        email: `dashboard-assignee-${suffix}@test.invalid`,
        name: "Dashboard Test Assignee",
      },
    }),
  ]);

  testOwnerId = owner.id;
  testAssigneeId = assignee.id;

  // Three projects covering active / at-risk / completed metric buckets.
  const [activeProject, atRiskProject, completedProject] = await Promise.all([
    prisma.project.create({
      data: {
        name: FIXTURE_PROJECT_NAMES.active,
        status: "IN_PROGRESS",
        priority: "HIGH",
        progress: 40,
        ownerId: testOwnerId,
      },
    }),
    prisma.project.create({
      data: {
        name: FIXTURE_PROJECT_NAMES.atRisk,
        status: "AT_RISK",
        priority: "CRITICAL",
        progress: 20,
        riskNotes: "Fixture risk notes for insights.",
        ownerId: testOwnerId,
      },
    }),
    prisma.project.create({
      data: {
        name: FIXTURE_PROJECT_NAMES.completed,
        status: "COMPLETED",
        priority: "MEDIUM",
        progress: 100,
        ownerId: testOwnerId,
      },
    }),
  ]);

  // Tasks across all Kanban statuses + one unassigned (workload / pie charts).
  await prisma.task.createMany({
    data: [
      {
        title: FIXTURE_TASK_TITLES[0],
        status: "TODO",
        priority: "MEDIUM",
        projectId: activeProject.id,
        assigneeId: testAssigneeId,
        sortOrder: 0,
      },
      {
        title: FIXTURE_TASK_TITLES[1],
        status: "IN_PROGRESS",
        priority: "HIGH",
        projectId: activeProject.id,
        assigneeId: testAssigneeId,
        sortOrder: 1,
      },
      {
        title: FIXTURE_TASK_TITLES[2],
        status: "IN_REVIEW",
        priority: "MEDIUM",
        projectId: atRiskProject.id,
        assigneeId: testAssigneeId,
        sortOrder: 0,
      },
      {
        title: FIXTURE_TASK_TITLES[3],
        status: "DONE",
        priority: "LOW",
        projectId: completedProject.id,
        assigneeId: testAssigneeId,
        sortOrder: 0,
      },
      {
        title: FIXTURE_TASK_TITLES[4],
        status: "TODO",
        priority: "HIGH",
        projectId: atRiskProject.id,
        assigneeId: null,
        sortOrder: 1,
      },
    ],
  });
});

afterAll(async () => {
  await prisma.task.deleteMany({
    where: { project: { ownerId: testOwnerId } },
  });
  await prisma.project.deleteMany({ where: { ownerId: testOwnerId } });
  await prisma.user.deleteMany({
    where: { id: { in: [testOwnerId, testAssigneeId] } },
  });
  await prisma.$disconnect();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getSummary() {
  return request(app).get("/api/dashboard/summary");
}

async function getInsights() {
  return request(app).get("/api/dashboard/insights");
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/summary
// ---------------------------------------------------------------------------

describe("GET /api/dashboard/summary", () => {
  it("returns HTTP 200", async () => {
    const res = await getSummary();
    expect(res.status).toBe(200);
  });

  it("returns the standard { data } envelope", async () => {
    const res = await getSummary();
    expect(res.body).toHaveProperty("data");
    expect(typeof res.body.data).toBe("object");
    expect(res.body).not.toHaveProperty("error");
  });

  it("returns metrics with all required aggregate fields", async () => {
    const res = await getSummary();
    const { metrics } = res.body.data as {
      metrics: Record<string, unknown>;
    };

    expect(metrics).toEqual(
      expect.objectContaining({
        totalProjects: expect.any(Number),
        activeProjects: expect.any(Number),
        completedProjects: expect.any(Number),
        atRiskProjects: expect.any(Number),
        totalTasks: expect.any(Number),
        completedTasks: expect.any(Number),
        pendingTasks: expect.any(Number),
        completionPercentage: expect.any(Number),
      }),
    );

    // Fixture floor — other DB rows may exist, so use >= not exact equality.
    expect(metrics.totalProjects).toBeGreaterThanOrEqual(3);
    expect(metrics.activeProjects).toBeGreaterThanOrEqual(1);
    expect(metrics.completedProjects).toBeGreaterThanOrEqual(1);
    expect(metrics.atRiskProjects).toBeGreaterThanOrEqual(1);
    expect(metrics.totalTasks).toBeGreaterThanOrEqual(5);
    expect(metrics.completedTasks).toBeGreaterThanOrEqual(1);
    expect(metrics.pendingTasks).toBeGreaterThanOrEqual(1);
    expect(metrics.completionPercentage).toBeGreaterThanOrEqual(0);
    expect(metrics.completionPercentage).toBeLessThanOrEqual(100);
  });

  it("returns chart-ready datasets that are non-empty with seeded fixtures", async () => {
    const res = await getSummary();
    const { charts } = res.body.data as {
      charts: {
        projectProgress: Array<{ label: string; value: number }>;
        taskStatusDistribution: Array<{ label: string; value: number }>;
        teamWorkload: Array<{ label: string; value: number }>;
        monthlyActivity: Array<{
          label: string;
          created: number;
          updated: number;
        }>;
      };
    };

    expect(Array.isArray(charts.projectProgress)).toBe(true);
    expect(charts.projectProgress.length).toBeGreaterThan(0);
    expect(
      charts.projectProgress.some(
        (point) => point.label === FIXTURE_PROJECT_NAMES.active,
      ),
    ).toBe(true);
    for (const point of charts.projectProgress) {
      expect(typeof point.label).toBe("string");
      expect(typeof point.value).toBe("number");
    }

    expect(Array.isArray(charts.taskStatusDistribution)).toBe(true);
    expect(charts.taskStatusDistribution).toHaveLength(4);
    const statusLabels = charts.taskStatusDistribution.map((p) => p.label);
    expect(statusLabels).toEqual(
      expect.arrayContaining(["To Do", "In Progress", "In Review", "Done"]),
    );
    expect(
      charts.taskStatusDistribution.every((point) => point.value >= 0),
    ).toBe(true);
    expect(
      charts.taskStatusDistribution.reduce((sum, point) => sum + point.value, 0),
    ).toBeGreaterThan(0);

    expect(Array.isArray(charts.teamWorkload)).toBe(true);
    expect(charts.teamWorkload.length).toBeGreaterThan(0);
    expect(
      charts.teamWorkload.some(
        (point) => point.label === "Dashboard Test Assignee" && point.value >= 1,
      ),
    ).toBe(true);

    expect(Array.isArray(charts.monthlyActivity)).toBe(true);
    expect(charts.monthlyActivity.length).toBe(6);
    for (const point of charts.monthlyActivity) {
      expect(point.label).toMatch(/^\d{4}-\d{2}$/);
      expect(typeof point.created).toBe("number");
      expect(typeof point.updated).toBe("number");
    }
    expect(
      charts.monthlyActivity.some(
        (point) => point.created > 0 || point.updated > 0,
      ),
    ).toBe(true);
  });

  it("excludes archived fixture projects from aggregates", async () => {
    const archived = await prisma.project.create({
      data: {
        name: "Dashboard Fixture — Archived Should Hide",
        status: "IN_PROGRESS",
        progress: 50,
        isArchived: true,
        ownerId: testOwnerId,
      },
    });

    try {
      const res = await getSummary();
      const labels = (
        res.body.data.charts.projectProgress as Array<{ label: string }>
      ).map((point) => point.label);

      expect(labels).not.toContain(archived.name);
    } finally {
      await prisma.project.delete({ where: { id: archived.id } });
    }
  });
});

// ---------------------------------------------------------------------------
// GET /api/dashboard/insights
// ---------------------------------------------------------------------------

describe("GET /api/dashboard/insights", () => {
  it("returns HTTP 200", async () => {
    const res = await getInsights();
    expect(res.status).toBe(200);
  });

  it("returns the standard { data } envelope", async () => {
    const res = await getInsights();
    expect(res.body).toHaveProperty("data");
    expect(typeof res.body.data).toBe("object");
    expect(res.body).not.toHaveProperty("error");
  });

  it("returns mock recommendations derived from current data", async () => {
    const res = await getInsights();
    const payload = res.body.data as {
      insights: Array<{
        id: string;
        severity: string;
        title: string;
        message: string;
        category: string;
      }>;
      generatedAt: string;
    };

    expect(Array.isArray(payload.insights)).toBe(true);
    // At-risk fixture guarantees at least one insight card.
    expect(payload.insights.length).toBeGreaterThan(0);

    for (const insight of payload.insights) {
      expect(typeof insight.id).toBe("string");
      expect(insight.id.length).toBeGreaterThan(0);
      expect(["info", "warning", "critical"]).toContain(insight.severity);
      expect(typeof insight.title).toBe("string");
      expect(insight.title.length).toBeGreaterThan(0);
      expect(typeof insight.message).toBe("string");
      expect(insight.message.length).toBeGreaterThan(0);
      expect([
        "risk",
        "workload",
        "progress",
        "deadline",
        "portfolio",
      ]).toContain(insight.category);
    }

    expect(
      payload.insights.some(
        (insight) =>
          insight.category === "risk" && /at risk/i.test(insight.title),
      ),
    ).toBe(true);

    expect(typeof payload.generatedAt).toBe("string");
    expect(new Date(payload.generatedAt).toISOString()).toBe(
      payload.generatedAt,
    );
  });
});
