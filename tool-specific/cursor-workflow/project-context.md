# AI Project Tracker Pro — Project Context

## 1. Business Problem

Engineering and product organizations struggle to maintain a single, reliable view of project health across initiatives. Status is often scattered across spreadsheets, chat threads, slide decks, and disconnected tools. Leadership cannot quickly answer:

- Which projects are on track, at risk, or blocked?
- Where are ownership, timelines, and priorities unclear?
- What risks and dependencies threaten delivery?
- How has progress changed over time?

Without a centralized system, teams waste time reconciling status, decisions lack shared context, and early warning signals are missed until delivery is already compromised.

**AI Project Tracker Pro** addresses this by providing a production-quality SaaS dashboard for creating, managing, and monitoring projects—with clear status visibility, structured ownership, and operational workflows suitable for enterprise use.

---

## 2. Project Goals

### Primary goals

1. **Centralize project tracking** — One system of record for project metadata, status, ownership, and key operational fields.
2. **Improve delivery visibility** — Enable managers and stakeholders to assess portfolio health at a glance.
3. **Standardize workflows** — Enforce consistent create/update/status transitions with validated inputs.
4. **Deliver a production-ready foundation** — Secure APIs, maintainable architecture, predictable UI states, and documentation suitable for handoff and further scale.

### Secondary goals

- Support responsive, accessible UI for desktop-first enterprise use with mobile usability.
- Keep the codebase testable, modular, and easy to extend (e.g., future AI-assisted insights, reporting, or integrations).
- Establish clear API contracts and feature documentation for engineering and QA.

### Non-goals (current phase)

- Full multi-region SaaS infrastructure and billing/subscription management.
- Real-time collaboration (presence, live cursors, concurrent editing).
- Deep third-party ALM integrations (Jira, Azure DevOps, GitHub Projects) beyond optional future extensions.
- Advanced AI automation as a hard dependency of MVP (AI may be positioned as a planned enhancement once core tracking is solid).

---

## 3. Target Users

| Persona | Needs |
|--------|--------|
| **Project Manager / Delivery Lead** | Create and update projects, maintain status, track risks and milestones, prepare status views for stakeholders. |
| **Engineering / Product Lead** | Monitor owned projects, update progress, flag blockers, keep ownership accurate. |
| **Program / Portfolio Manager** | View aggregate health across projects, filter by status/priority/owner, identify at-risk work. |
| **Executive Stakeholder (read-oriented)** | Consume high-level dashboard summaries without managing detailed records. |
| **Platform / Full-stack Engineer** | Extend APIs and UI modules with clear architecture, conventions, and documentation. |

**Assumed operating context:** Authenticated internal or SaaS users managing a shared project portfolio within an organization (single-tenant MVP; multi-tenant readiness considered in design where practical).

---

## 4. Core Modules

### 4.1 Authentication (Stretch Goal)

- Authentication is intentionally excluded from the MVP because the assessment focuses on frontend engineering, backend APIs, database persistence, validation, testing, and AI-assisted development workflow.
- If time permits, JWT authentication with protected routes may be implemented as a Stretch feature.

### 4.2 Project management

- Create, read, update, and soft-delete (or archive) projects.
- Core fields such as name, description, status, priority, owner, dates, and progress indicators.
- Validation of required fields and allowed status transitions.

### 4.3 Dashboard & portfolio views

- Summary metrics (e.g., counts by status, at-risk items).
- Filterable/sortable project list.
- Loading, empty, and error states for all primary views.

### 4.4 Status & operational tracking

- Standardized project statuses (e.g., planned, in progress, on hold, at risk, completed).
- Visibility into blockers, notes, or risk fields as defined in the product specification.

### 4.5 Shared platform concerns

- Centralized API error handling and consistent response shapes.
- Form validation (client and server) with Zod.
- Toast/notification feedback for user actions.
- Feature-level documentation and API request/response examples.

### 4.6 AI Insights Dashboard (Frontend-focused)

- The dashboard will include analytics cards, project progress charts, team productivity summaries, recent activities, and AI-inspired recommendations using mock analytics.

### 4.7 Kanban Board

- Drag and drop task management
- Status columns
- Instant UI updates
- Backend synchronization

### 4.8 User Experience

- Skeleton loaders
- Empty states
- Error states
- Confirmation dialogs
- Toast notifications
- Responsive layout
- Accessible keyboard navigation

### 4.9 Charts
- Project Progress Chart
- Task Status Pie Chart
- Team Workload Bar Chart
- Monthly Activity Line Chart

---

## 5. Technical Stack

### Frontend

| Technology | Role |
|------------|------|
| Next.js 16 (App Router) |
| React | UI composition |
| TypeScript | Type-safe application code |
| Material UI | Design system and accessible components |
| Redux Toolkit | Global client state |
| React Hook Form | Form state and UX |
| Zod | Schema validation (aligned with backend) |
| Axios | HTTP client for REST APIs |

### Backend

| Technology | Role |
|------------|------|
| Express | REST API server |
| Prisma | ORM and schema management |
| SQLite | it requires no external setup, supports persistence, works seamlessly with Prisma, and simplifies evaluation on any machine |
| Zod | Request validation |
| TypeScript | Type-safe server code |

### Quality & delivery expectations

- TypeScript-only application code.
- Testable services and reusable UI components.
- Configuration over hardcoded environment-specific values.
- Documented APIs with request and response examples.

---

## 6. Architecture

### High-level shape

```
┌─────────────────────────────┐
│  Next.js Frontend (UI)      │
│  features / store / services│
└──────────────┬──────────────┘
               │ REST (Axios)
┌──────────────▼──────────────┐
│  Express API                │
│  routes → controllers →     │
│  services → Prisma          │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│  SQLite (via Prisma)        │
└─────────────────────────────┘
```

### Design principles

- **Feature-based frontend** — Group UI, hooks, and feature services by domain (e.g., projects, auth, dashboard).
- **Layered backend** — Keep HTTP concerns in routes/controllers; business rules in services; persistence via Prisma.
- **Clean boundaries** — Shared types and validators where practical; avoid leaking ORM models directly into UI.
- **SOLID / DRY** — Prefer small reusable modules; no duplicated validation or API client logic.
- **Operational UI completeness** — Every primary flow must handle loading, empty, success, and error states.

### API style

- RESTful resource endpoints.
- Zod validation at the boundary.
- Centralized error middleware with consistent error payloads.
- Authentication required for protected resources.

---

## 7. Folder Structure

### Frontend

```text
/src
  /app             # App Router pages, layouts, route groups, and global configuration
  /components      # Shared, reusable UI primitives and layout
  /features        # Domain modules (auth, projects, dashboard, …)
  /hooks           # Shared React hooks
  /services        # API clients and external integrations
  /store           # Redux Toolkit store, slices, selectors
  /types           # Shared TypeScript types
  /constants       # Application-wide constants, enums, configuration values, and route names
  /utils           # Pure helpers and formatters
```

### Backend

```text
/src
  /controllers     # HTTP request/response handling
  /routes          # Route definitions and composition
  /services        # Business logic
  /prisma          # Schema, client, migrations/seeds as applicable
  /middleware      # Auth, error handling, logging, etc.
  /validators      # Zod schemas for request validation
```

Deviations from this structure should be intentional, documented, and consistent across the repository.

---

## 8. Coding Standards

1. **TypeScript only** for application source.
2. **Functional React components** with hooks; no class components unless required by a library constraint.
3. **Reusable components** — Prefer shared primitives over one-off markup duplication.
4. **SOLID and clean architecture** — Thin controllers; services own business rules; UI remains presentation-focused.
5. **No duplicated logic** — Share validators, constants, and API mapping utilities.
6. **Never hardcode** environment URLs, secrets, or magic business constants; use configuration and named constants.
7. **Validation everywhere it matters** — Client forms (React Hook Form + Zod) and server requests (Zod).
8. **Accessible MUI usage** — Semantic structure, keyboard support, and visible focus states.
9. **Predictable UX states** — Loading, empty, error, and success feedback (including toasts where appropriate).
10. **Documentation** — Each feature and API should include clear usage notes and request/response examples.
11. **Security defaults** — No hardcoded credentials; no auth/validation bypasses; no permissive insecure defaults.
12. **Minimal dependencies** — Add libraries only when necessary and justified.

Implementation work must follow the product specification and acceptance criteria. Do not invent scope beyond those documents without explicit approval.

---

## 9. Expected Deliverables

### Application

- Working frontend dashboard application on the agreed stack.
- Working Express REST API backed by Prisma + SQLite.
- Core modules implemented per specification (auth, projects, dashboard/portfolio views, shared platform concerns).
- Responsive, accessible Material UI experience with professional polish (including appropriate motion where it aids clarity).

### Engineering artifacts

- Feature-based frontend and layered backend matching the folder structure above.
- Documented API contracts (request/response examples).
- Feature documentation sufficient for onboarding another engineer.
- Testable code structure; automated tests for critical logic where specified in tasks/acceptance criteria.

### Operational readiness (MVP bar)

- Centralized backend error handling.
- Consistent validation and user-facing error messaging.
- Clear setup instructions (environment variables, database migrate/seed, how to run frontend and backend).
- No secrets committed to the repository.

### Success definition

The deliverable is considered successful when an authenticated user can manage projects through the UI and API, view portfolio health on the dashboard, and the codebase is structured, documented, and maintainable enough for enterprise review and iterative enhancement.

---

## 10. Related documents

| Document | Purpose |
|----------|---------|
| `spec.md` | Detailed functional and API specification |
| `acceptance-criteria.md` | Testable definition of done |
| `tasks.md` | Implementation sequence and work breakdown |
| `cursor-rules-or-instructions.md` | Agent/engineering execution rules |

Always read this project context and the specification before generating or modifying code.
