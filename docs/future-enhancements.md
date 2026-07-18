# Future enhancements

Product and platform directions beyond the current MVP. Aligned with [`spec.md`](../tool-specific/cursor-workflow/spec.md) §16 and [`project-context.md`](../tool-specific/cursor-workflow/project-context.md) non-goals. Current constraints: [`known-limitations.md`](./known-limitations.md).

> **Authentication** is outside the MVP today. It is listed first as the primary Stretch / post-MVP capability ([`tasks.md`](../tool-specific/cursor-workflow/tasks.md) Milestone 12).

---

## Authentication

**Goal:** Secure the API and UI with register/login and protected routes.

| Item | Direction |
|------|-----------|
| Model | Use existing `User.passwordHash` (never returned by API) |
| API | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Tokens | JWT (or httpOnly session cookie — document the choice) |
| Backend | Auth middleware on project/task/dashboard mutations (and reads if required) |
| Frontend | Login/Register pages; Axios attach token; 401 → login |
| Tests | Unauthenticated rejection; authenticated CRUD happy path |

Until this ships, local evaluation APIs remain open by design.

---

## Notifications

**Goal:** Proactive alerts so owners do not miss risk or deadlines.

Suggested capabilities:

- Due-date reminders for tasks approaching or past due
- At-risk project alerts (status `AT_RISK` or insight heuristics)
- In-app notification center + optional email digests
- Preference controls on the Settings page (today a placeholder)

Depends on identity (Authentication) for routing notifications to the right user.

---

## File attachments

**Goal:** Attach files and (optionally) comments to projects and tasks.

Suggested capabilities:

- Upload/download with size/type validation
- Object storage (S3-compatible) rather than SQLite blobs
- Virus scanning / content-type checks in production
- Comment threads with author + timestamps (ties to Activity audit log)

Out of MVP per [`spec.md`](../tool-specific/cursor-workflow/spec.md) §16 item 9.

---

## Real AI insights

**Goal:** Replace deterministic mock Smart Insights with live model-assisted analysis.

Suggested capabilities:

- Portfolio summaries and risk narratives via a provider API
- Natural-language Q&A over project/task data
- Clear labeling of AI-generated content; opt-out / rate limits
- Secrets only via environment / secret manager — never committed

MVP Insights remain heuristic-only (`GET /api/dashboard/insights`) with no external LLM calls. See [`docs/features/dashboard.md`](./features/dashboard.md) and [`docs/api/dashboard.md`](./api/dashboard.md).

---

## Multi-user collaboration

**Goal:** Safe concurrent editing of the same portfolio and Kanban board.

Suggested capabilities:

- WebSocket (or SSE) updates for board/list invalidation
- Presence indicators (optional); conflict handling beyond last-write-wins
- Multi-tenancy: organizations, membership, data isolation
- Row-level or tenant-scoped authorization after Authentication

MVP is single-evaluator / open-API oriented; concurrent writers on SQLite are not a design target.

---

## Activity audit log

**Goal:** First-class history of who changed what, when.

Suggested capabilities:

- `Activity` (or equivalent) entity written from services on create/update/archive/restore/status change
- Filters by project, actor, action type, date range
- Project detail timeline and richer Dashboard “Recent activity”
- Export for compliance / status reporting

Today’s feed is **derived** from `createdAt` / `updatedAt` on projects and tasks ([`docs/features/dashboard.md`](./features/dashboard.md)).

---

## Additional backlog (from specification)

| Enhancement | Notes |
|-------------|--------|
| Integrations | Jira, GitHub, Slack status sync |
| Advanced reporting | CSV/PDF export, saved views, custom date ranges |
| Hardened production ops | Postgres, CI migrations, rate limiting, metrics, SSO |
| Settings preferences | Theme, defaults, notification prefs ([`docs/features/settings.md`](./features/settings.md)) |
| Auto progress | Optional: derive project `progress` from tasks |
| Shared validation package | Single Zod source for FE + BE |

---

## Suggested sequencing

1. **Authentication** (security foundation)  
2. **Activity audit log** (better dashboard + compliance)  
3. **Notifications** (depends on identity)  
4. **Multi-user collaboration** / real-time board  
5. **File attachments** + comments  
6. **Real AI insights** (once data model and auth are solid)  
7. Integrations, reporting, and production hardening  

---

## Cross-references

- [`reflection.md`](../reflection.md) — decisions and lessons  
- [`pull-request-description.md`](../pull-request-description.md) — PR checklist  
- [`known-limitations.md`](./known-limitations.md) — what MVP does not do  
- [`tasks.md`](../tool-specific/cursor-workflow/tasks.md) — Milestone 11–12  
