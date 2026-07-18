# Settings feature (placeholder)

> **App route:** `/settings`  
> **API:** none in MVP  
> **Related features:** [`Projects`](./projects.md) · [`Kanban`](./kanban.md) · [`Dashboard`](./dashboard.md) · [`Analytics`](./analytics.md)  
> **Frontend conventions:** [`docs/frontend/conventions.md`](../frontend/conventions.md)

Settings is a **navigation placeholder** only. The route exists so the app shell includes a stable destination for future workspace preferences; **no settings are required for the current MVP**.

> **Authentication:** JWT / session auth is **outside the MVP** unless Stretch Auth is implemented. There is no account/settings security surface in this milestone.

---

## Purpose

Reserve a Settings entry in the side navigation and App Router for post-MVP configuration (theme, defaults, notifications, organization preferences) without inventing scope beyond [`spec.md`](../../tool-specific/cursor-workflow/spec.md) and [`tasks.md`](../../tool-specific/cursor-workflow/tasks.md).

Wireframes in the specification list Settings as a primary screen; implementation content is deferred.

---

## User flow

| Flow | Entry | Outcome |
|------|-------|---------|
| Open Settings | Side nav → **Settings** | Placeholder page with title and description |
| Leave Settings | Any other nav item | Standard client navigation |

There are no forms, toggles, or persisted preferences.

---

## Backend endpoints used

**None.** Settings does not call the Projects, Tasks, or Dashboard APIs.

---

## Main frontend components

| Component | Role |
|-----------|------|
| `frontend/src/app/(app)/settings/page.tsx` | Route entry; metadata `title: "Settings"` |
| `PagePlaceholder` (`components/layout`) | Title + description chrome |

Copy shown today:

- **Title:** Settings  
- **Description:** Workspace preferences and configuration options will be added here. No settings are required for the current MVP.

---

## Redux slices

**None.** Settings does not register or read a dedicated slice. Global `ui` (toasts) is unused on this page.

---

## Validation

**Not applicable** — no inputs.

---

## Error handling

**Not applicable** — static placeholder; no network calls. A missing route would fall through to the app `not-found` page like any other unknown path.

---

## Future improvements

- Theme / density preferences  
- Default project filters and Kanban project context  
- Notification preferences (when notifications exist)  
- Organization / profile settings once Stretch Auth (or later identity) exists  
- Feature flags for experimental modules  

Until then, keep this page as a lightweight placeholder so navigation IA stays stable.

---

## Key source paths

```text
frontend/src/app/(app)/settings/page.tsx
frontend/src/components/layout/PagePlaceholder.tsx   # shared placeholder chrome
frontend/src/constants/navigation.ts                # Side nav includes Settings
```

---

## Cross-references

| Document | Relevance |
|----------|-----------|
| [`project-context.md`](../../tool-specific/cursor-workflow/project-context.md) | Shared UX / non-goals; Settings not a core MVP module |
| [`spec.md`](../../tool-specific/cursor-workflow/spec.md) | Wireframes list Settings; out-of-scope MVP items §2 |
| [`acceptance-criteria.md`](../../tool-specific/cursor-workflow/acceptance-criteria.md) | AC-U04 (nav reaches Settings); AC-R03 (mobile Settings reachable) |
| [`tasks.md`](../../tool-specific/cursor-workflow/tasks.md) | Milestone 5 nav link; Milestone 10 Settings doc (placeholder) |

---

## How to test locally

```bash
npm run dev:frontend
# Open http://localhost:3000/settings
```

No dedicated automated tests are required for the static placeholder beyond navigation smoke coverage already implied by the app shell.
