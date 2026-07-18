/**
 * Seed script — AI Project Tracker Pro
 *
 * Produces realistic demo data for all dashboard surfaces:
 *   - 5 users (1 admin, 4 members)
 *   - 5 projects (one per ProjectStatus so status cards are populated)
 *   - 27 tasks spread across all projects and Kanban columns
 *
 * Run: npx prisma db seed
 * Idempotent: deletes all rows first (reverse-dependency order) then re-inserts.
 */

import { PrismaClient, Priority, ProjectStatus, TaskStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a Date that is `days` days offset from today. */
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns a Date that is `months` calendar months in the past. */
function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// User definitions
// ---------------------------------------------------------------------------

const USERS = [
  {
    email: "alex.morgan@acme.dev",
    name: "Alex Morgan",
    role: UserRole.ADMIN,
  },
  {
    email: "jordan.lee@acme.dev",
    name: "Jordan Lee",
    role: UserRole.MEMBER,
  },
  {
    email: "sam.rivera@acme.dev",
    name: "Sam Rivera",
    role: UserRole.MEMBER,
  },
  {
    email: "taylor.kim@acme.dev",
    name: "Taylor Kim",
    role: UserRole.MEMBER,
  },
  {
    email: "casey.chen@acme.dev",
    name: "Casey Chen",
    role: UserRole.MEMBER,
  },
];

// ---------------------------------------------------------------------------
// Project definitions  (keyed by a local alias for task references)
// ---------------------------------------------------------------------------

type ProjectSeed = {
  alias: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  riskNotes?: string;
  startDate: Date;
  endDate: Date;
  ownerEmail: string;
  createdAt: Date;
};

const PROJECTS: ProjectSeed[] = [
  {
    alias: "portal",
    name: "Customer Portal Redesign",
    description:
      "Full redesign of the authenticated customer portal — new design system, improved onboarding, and WCAG 2.1 AA compliance.",
    status: ProjectStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    progress: 45,
    startDate: monthsAgo(3),
    endDate: daysFromNow(45),
    ownerEmail: "alex.morgan@acme.dev",
    createdAt: monthsAgo(3),
  },
  {
    alias: "mobile",
    name: "Mobile App MVP",
    description:
      "Cross-platform mobile application for iOS and Android — core product feature parity with the web app.",
    status: ProjectStatus.AT_RISK,
    priority: Priority.CRITICAL,
    progress: 30,
    riskNotes:
      "Offline sync complexity is significantly higher than estimated. Push notification vendor integration is blocked on security review. Risk: delivery slippage of 3–4 weeks.",
    startDate: monthsAgo(4),
    endDate: daysFromNow(20),
    ownerEmail: "jordan.lee@acme.dev",
    createdAt: monthsAgo(4),
  },
  {
    alias: "analytics",
    name: "Data Analytics Platform",
    description:
      "Internal data warehouse and self-serve analytics dashboard for product and growth teams.",
    status: ProjectStatus.PLANNED,
    priority: Priority.MEDIUM,
    progress: 0,
    startDate: daysFromNow(14),
    endDate: daysFromNow(120),
    ownerEmail: "sam.rivera@acme.dev",
    createdAt: monthsAgo(1),
  },
  {
    alias: "gateway",
    name: "API Gateway Migration",
    description:
      "Migrate all backend services from direct exposure to a centralized API gateway with rate limiting and observability.",
    status: ProjectStatus.COMPLETED,
    priority: Priority.HIGH,
    progress: 100,
    startDate: monthsAgo(5),
    endDate: monthsAgo(1),
    ownerEmail: "taylor.kim@acme.dev",
    createdAt: monthsAgo(5),
  },
  {
    alias: "devtools",
    name: "Internal Developer Tooling",
    description:
      "Unified CLI and web UI for local development environment setup, secret management, and deployment approvals.",
    status: ProjectStatus.ON_HOLD,
    priority: Priority.LOW,
    progress: 15,
    riskNotes:
      "Paused pending approval of Q3 infrastructure budget. Resumption expected next quarter.",
    startDate: monthsAgo(2),
    endDate: daysFromNow(90),
    ownerEmail: "casey.chen@acme.dev",
    createdAt: monthsAgo(2),
  },
];

// ---------------------------------------------------------------------------
// Task definitions
// ---------------------------------------------------------------------------

type TaskSeed = {
  projectAlias: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeEmail?: string;
  dueDate?: Date;
  sortOrder: number;
  createdAt: Date;
};

const TASKS: TaskSeed[] = [
  // ── Customer Portal Redesign (IN_PROGRESS) ──────────────────────────────
  {
    projectAlias: "portal",
    title: "Design system component audit",
    description:
      "Catalogue every existing UI component, flag gaps against the new design system tokens, and document migration notes.",
    status: TaskStatus.DONE,
    priority: Priority.HIGH,
    assigneeEmail: "sam.rivera@acme.dev",
    dueDate: monthsAgo(2),
    sortOrder: 0,
    createdAt: monthsAgo(3),
  },
  {
    projectAlias: "portal",
    title: "Authentication flow redesign",
    description:
      "Redesign login, registration, and password-reset screens with updated brand guidelines and improved error messaging.",
    status: TaskStatus.IN_REVIEW,
    priority: Priority.HIGH,
    assigneeEmail: "jordan.lee@acme.dev",
    dueDate: daysFromNow(5),
    sortOrder: 0,
    createdAt: monthsAgo(2),
  },
  {
    projectAlias: "portal",
    title: "Dashboard layout implementation",
    description: "Implement the new responsive dashboard layout in React using MUI grid system.",
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    assigneeEmail: "taylor.kim@acme.dev",
    dueDate: daysFromNow(10),
    sortOrder: 0,
    createdAt: monthsAgo(2),
  },
  {
    projectAlias: "portal",
    title: "User onboarding wizard",
    description:
      "Build a 4-step onboarding flow for new users: profile setup, preferences, tour, and first action prompt.",
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.MEDIUM,
    assigneeEmail: "jordan.lee@acme.dev",
    dueDate: daysFromNow(18),
    sortOrder: 1,
    createdAt: monthsAgo(1),
  },
  {
    projectAlias: "portal",
    title: "Accessibility compliance review",
    description: "Audit all primary flows against WCAG 2.1 AA. Produce a remediation checklist.",
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    assigneeEmail: "casey.chen@acme.dev",
    dueDate: daysFromNow(30),
    sortOrder: 0,
    createdAt: monthsAgo(1),
  },
  {
    projectAlias: "portal",
    title: "Frontend performance optimization",
    description:
      "Reduce initial bundle size by 30%, implement code splitting, and add lazy loading for non-critical panels.",
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    assigneeEmail: "taylor.kim@acme.dev",
    dueDate: daysFromNow(40),
    sortOrder: 1,
    createdAt: monthsAgo(1),
  },

  // ── Mobile App MVP (AT_RISK) ─────────────────────────────────────────────
  {
    projectAlias: "mobile",
    title: "Configure CI/CD pipeline",
    description:
      "Set up GitHub Actions workflows for lint, test, and Fastlane distribution to TestFlight and Play Console.",
    status: TaskStatus.DONE,
    priority: Priority.CRITICAL,
    assigneeEmail: "jordan.lee@acme.dev",
    dueDate: monthsAgo(3),
    sortOrder: 0,
    createdAt: monthsAgo(4),
  },
  {
    projectAlias: "mobile",
    title: "Core navigation structure",
    description:
      "Implement bottom tab navigator and stack navigators for all primary screens using React Navigation.",
    status: TaskStatus.DONE,
    priority: Priority.HIGH,
    assigneeEmail: "taylor.kim@acme.dev",
    dueDate: monthsAgo(2),
    sortOrder: 1,
    createdAt: monthsAgo(4),
  },
  {
    projectAlias: "mobile",
    title: "Push notification service integration",
    description:
      "Integrate FCM and APNs via Expo Notifications. Requires security team approval of data handling DPA.",
    status: TaskStatus.IN_REVIEW,
    priority: Priority.CRITICAL,
    assigneeEmail: "jordan.lee@acme.dev",
    dueDate: daysFromNow(3),
    sortOrder: 0,
    createdAt: monthsAgo(3),
  },
  {
    projectAlias: "mobile",
    title: "Offline data sync",
    description:
      "Implement conflict-resolution strategy for offline-first data using WatermelonDB. Highest technical risk item.",
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.CRITICAL,
    assigneeEmail: "taylor.kim@acme.dev",
    dueDate: daysFromNow(7),
    sortOrder: 0,
    createdAt: monthsAgo(2),
  },
  {
    projectAlias: "mobile",
    title: "App store submission",
    description:
      "Prepare screenshots, metadata, privacy policy URL, and submit to App Store Connect and Google Play.",
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    assigneeEmail: "casey.chen@acme.dev",
    dueDate: daysFromNow(25),
    sortOrder: 0,
    createdAt: monthsAgo(1),
  },
  {
    projectAlias: "mobile",
    title: "Beta testing coordination",
    description:
      "Recruit 20 internal beta testers, distribute via TestFlight, and consolidate feedback in a structured report.",
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    assigneeEmail: "alex.morgan@acme.dev",
    dueDate: daysFromNow(15),
    sortOrder: 1,
    createdAt: monthsAgo(1),
  },

  // ── Data Analytics Platform (PLANNED) ───────────────────────────────────
  {
    projectAlias: "analytics",
    title: "Stakeholder requirements workshop",
    description:
      "Facilitate a requirements discovery session with product, growth, and finance stakeholders.",
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    assigneeEmail: "alex.morgan@acme.dev",
    dueDate: daysFromNow(16),
    sortOrder: 0,
    createdAt: monthsAgo(1),
  },
  {
    projectAlias: "analytics",
    title: "Data schema and taxonomy design",
    description: "Define canonical event taxonomy, entity relationships, and naming conventions.",
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    assigneeEmail: "sam.rivera@acme.dev",
    dueDate: daysFromNow(30),
    sortOrder: 1,
    createdAt: monthsAgo(1),
  },
  {
    projectAlias: "analytics",
    title: "ETL pipeline architecture",
    description: "Design ingestion, transformation, and loading strategy from source systems.",
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    assigneeEmail: "jordan.lee@acme.dev",
    dueDate: daysFromNow(45),
    sortOrder: 2,
    createdAt: monthsAgo(1),
  },
  {
    projectAlias: "analytics",
    title: "Dashboard wireframes",
    description:
      "Produce low-fidelity wireframes for the four primary analytics views and get sign-off.",
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    assigneeEmail: "sam.rivera@acme.dev",
    dueDate: daysFromNow(35),
    sortOrder: 3,
    createdAt: monthsAgo(1),
  },
  {
    projectAlias: "analytics",
    title: "Vendor and tooling evaluation",
    description:
      "Evaluate dbt, Metabase, Apache Superset, and Redash; produce a decision doc with cost estimates.",
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    assigneeEmail: "casey.chen@acme.dev",
    dueDate: daysFromNow(20),
    sortOrder: 4,
    createdAt: monthsAgo(1),
  },

  // ── API Gateway Migration (COMPLETED) ────────────────────────────────────
  {
    projectAlias: "gateway",
    title: "Inventory of existing API endpoints",
    description: "Document all 47 internal endpoints, their owners, auth requirements, and SLAs.",
    status: TaskStatus.DONE,
    priority: Priority.HIGH,
    assigneeEmail: "taylor.kim@acme.dev",
    dueDate: monthsAgo(4),
    sortOrder: 0,
    createdAt: monthsAgo(5),
  },
  {
    projectAlias: "gateway",
    title: "Kong gateway environment setup",
    description:
      "Provision Kong in staging and production with Deck declarative config and Helm chart.",
    status: TaskStatus.DONE,
    priority: Priority.HIGH,
    assigneeEmail: "jordan.lee@acme.dev",
    dueDate: monthsAgo(3),
    sortOrder: 1,
    createdAt: monthsAgo(5),
  },
  {
    projectAlias: "gateway",
    title: "Migrate authentication routes",
    description:
      "Re-route /auth/* paths through Kong with JWT plugin and validate token forwarding behavior.",
    status: TaskStatus.DONE,
    priority: Priority.CRITICAL,
    assigneeEmail: "alex.morgan@acme.dev",
    dueDate: monthsAgo(2),
    sortOrder: 2,
    createdAt: monthsAgo(4),
  },
  {
    projectAlias: "gateway",
    title: "Load and stress testing",
    description:
      "Run k6 load tests to validate gateway does not degrade p99 latency beyond 10ms overhead.",
    status: TaskStatus.DONE,
    priority: Priority.HIGH,
    assigneeEmail: "casey.chen@acme.dev",
    dueDate: monthsAgo(2),
    sortOrder: 3,
    createdAt: monthsAgo(3),
  },
  {
    projectAlias: "gateway",
    title: "API documentation update",
    description:
      "Update OpenAPI specs to reflect new gateway base URLs, rate-limit headers, and error shapes.",
    status: TaskStatus.DONE,
    priority: Priority.MEDIUM,
    assigneeEmail: "sam.rivera@acme.dev",
    dueDate: monthsAgo(1),
    sortOrder: 4,
    createdAt: monthsAgo(3),
  },
  {
    projectAlias: "gateway",
    title: "Production cutover and monitoring",
    description:
      "Execute blue-green cutover, update DNS, and verify Datadog dashboards show healthy traffic post-migration.",
    status: TaskStatus.DONE,
    priority: Priority.CRITICAL,
    assigneeEmail: "taylor.kim@acme.dev",
    dueDate: monthsAgo(1),
    sortOrder: 5,
    createdAt: monthsAgo(2),
  },

  // ── Internal Developer Tooling (ON_HOLD) ─────────────────────────────────
  {
    projectAlias: "devtools",
    title: "Requirements specification document",
    description:
      "Capture developer pain points from 10 team interviews and define MVP scope for the internal tooling suite.",
    status: TaskStatus.DONE,
    priority: Priority.LOW,
    assigneeEmail: "alex.morgan@acme.dev",
    dueDate: monthsAgo(1),
    sortOrder: 0,
    createdAt: monthsAgo(2),
  },
  {
    projectAlias: "devtools",
    title: "Tech stack evaluation",
    description:
      "Compare Backstage, Port, and custom Node CLI approaches. Produce a recommendation with build vs. buy analysis.",
    status: TaskStatus.IN_REVIEW,
    priority: Priority.MEDIUM,
    assigneeEmail: "jordan.lee@acme.dev",
    dueDate: daysFromNow(60),
    sortOrder: 0,
    createdAt: monthsAgo(2),
  },
  {
    projectAlias: "devtools",
    title: "Prototype: secret management UI",
    description:
      "Build a thin proof-of-concept for the secret rotation UI to validate developer experience assumptions.",
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.MEDIUM,
    assigneeEmail: "taylor.kim@acme.dev",
    dueDate: daysFromNow(75),
    sortOrder: 0,
    createdAt: monthsAgo(1),
  },
  {
    projectAlias: "devtools",
    title: "Budget approval presentation",
    description:
      "Prepare a 10-minute slide deck for the Q3 infra budget review showing ROI estimates and rollout plan.",
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    assigneeEmail: "casey.chen@acme.dev",
    dueDate: daysFromNow(90),
    sortOrder: 0,
    createdAt: monthsAgo(1),
  },
];

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("Starting seed...");

  // Wipe in reverse-dependency order to satisfy foreign key constraints.
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──────────────────────────────────────────────────────────────
  const createdUsers = await Promise.all(
    USERS.map((u) =>
      prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          role: u.role,
        },
      })
    )
  );

  const userByEmail = Object.fromEntries(createdUsers.map((u) => [u.email, u]));
  console.log(`Created ${createdUsers.length} users`);

  // ── Projects ────────────────────────────────────────────────────────────
  const projectByAlias: Record<string, { id: string }> = {};

  for (const p of PROJECTS) {
    const project = await prisma.project.create({
      data: {
        name: p.name,
        description: p.description,
        status: p.status,
        priority: p.priority,
        progress: p.progress,
        riskNotes: p.riskNotes,
        startDate: p.startDate,
        endDate: p.endDate,
        isArchived: false,
        ownerId: userByEmail[p.ownerEmail].id,
        createdAt: p.createdAt,
      },
    });
    projectByAlias[p.alias] = project;
  }

  console.log(`Created ${PROJECTS.length} projects`);

  // ── Tasks ────────────────────────────────────────────────────────────────
  await prisma.task.createMany({
    data: TASKS.map((t) => ({
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      sortOrder: t.sortOrder,
      isArchived: false,
      projectId: projectByAlias[t.projectAlias].id,
      assigneeId: t.assigneeEmail ? userByEmail[t.assigneeEmail]?.id : undefined,
      createdAt: t.createdAt,
    })),
  });

  console.log(`Created ${TASKS.length} tasks`);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
