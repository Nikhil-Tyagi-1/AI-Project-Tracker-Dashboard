# Known limitations

Honest constraints of the **current MVP** for reviewers and engineers taking over the repo. Planned directions: [`future-enhancements.md`](./future-enhancements.md). Architecture reflection: [`../reflection.md`](../reflection.md).

> **Authentication** is **outside the MVP** unless Stretch Auth is implemented. APIs and UI are intentionally open for local evaluation.

---

## Security & access

| Limitation | Detail |
|------------|--------|
| No authN / authZ | Any client that can reach the API can read and mutate data |
| No multi-tenancy | Single shared portfolio; no organization isolation |
| CORS is origin-allowlist only | Suitable for local demo (`FRONTEND_ORIGIN`); not a full security model |
| `User.passwordHash` unused | Schema ready for Stretch Auth; no register/login/JWT in MVP |

---

## Data & persistence

| Limitation | Detail |
|------------|--------|
| SQLite | File-based DB; limited concurrent write suitability for production multi-user load |
| Soft delete only | Archive sets `isArchived`; no hard-delete or retention/purge job |
| Manual project progress | `progress` is edited on the project; not auto-calculated from tasks |
| Name uniqueness | Enforced among non-archived projects; restore can `CONFLICT` if the name was reused |
| Seed is destructive-idempotent | `prisma db seed` clears and re-inserts demo rows — do not rely on seed against precious local data without backup |

---

## Product surface

| Limitation | Detail |
|------------|--------|
| Settings placeholder | `/settings` shows static copy only; no preferences persisted |
| Smart Insights are mock | Deterministic heuristics from DB aggregates; **no** live LLM or paid AI provider |
| Recent activity is derived | Built from project/task timestamps, not a first-class audit log |
| No notifications | No due-date reminders, email, or in-app notification center |
| No file attachments | No uploads, downloads, or comment threads on projects/tasks |
| No real-time collaboration | Kanban/list updates are per-client request; no WebSocket presence or live sync |
| No ALM integrations | No Jira / Azure DevOps / GitHub Projects sync |
| No billing / multi-region | Explicit non-goals for this phase |

---

## API & UX gaps

| Limitation | Detail |
|------------|--------|
| Open list APIs | Pagination/filter help demos but do not enforce per-user visibility |
| Kanban scope | Board is single-project; no multi-project portfolio board |
| Include archived (projects UI) | API supports `includeArchived`; default Projects list UI does not expose a full archived browser |
| Validation duplication | FE and BE Zod schemas are mirrored manually — possible drift over time |
| Screenshots | README / PR screenshot section may still be placeholders until PNGs are added |

---

## Testing & operations

| Limitation | Detail |
|------------|--------|
| No browser E2E suite | Confidence from Jest/Supertest + Vitest; no Playwright/Cypress in MVP |
| Milestone 11 incomplete | Full production deploy notes, Docker/compose, and local-prod smoke may still be pending |
| Single-node assumption | No documented HA, backups, or managed DB runbook in MVP docs |

Backend tests **do** isolate to ephemeral `prisma/test.db` and avoid destroying developer `dev.db` — see [`testing.md`](./testing.md).

---

## What still works well despite limitations

- Full project/task lifecycle with validation and soft archive/restore  
- Kanban optimistic moves with failure rollback  
- Dashboard/analytics charts and mock insights from seed data  
- Portable local setup (Node + SQLite, no external DB server)  
- Documented APIs and feature guides under `docs/`  

---

## Cross-references

| Document | Relevance |
|----------|-----------|
| [`spec.md`](../tool-specific/cursor-workflow/spec.md) §2, §16, §17 | Out of scope, future work, assumptions |
| [`acceptance-criteria.md`](../tool-specific/cursor-workflow/acceptance-criteria.md) | Stretch Auth AC-AUTH* optional |
| [`tasks.md`](../tool-specific/cursor-workflow/tasks.md) | Milestones 11–12 follow-ups |
| [`future-enhancements.md`](./future-enhancements.md) | How limitations map to roadmap items |
| [`features/settings.md`](./features/settings.md) | Settings placeholder |
| [`features/dashboard.md`](./features/dashboard.md) | Mock insights behavior |
