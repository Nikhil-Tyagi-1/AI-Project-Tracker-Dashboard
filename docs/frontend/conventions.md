# Frontend conventions

Guide for the Next.js App Router frontend (`frontend/`). Covers folder structure, theme usage, and shared UI conventions for Milestone 5 onward.

Related docs: [`project-context.md`](../../tool-specific/cursor-workflow/project-context.md), [`spec.md`](../../tool-specific/cursor-workflow/spec.md).

---

## Folder structure

```text
frontend/src
  /app                 # Next.js App Router (routes, layouts, providers)
    /(app)             # Workspace route group wrapped by AppShell
    layout.tsx         # Root HTML shell + fonts + AppProviders
    not-found.tsx      # Global 404 (includes AppShell)
    providers.tsx      # Theme, Redux, Toast providers
  /components
    /layout            # App shell: AppBar, SideNav, PagePlaceholder, 404 views
    /ui                # Shared primitives: Skeleton, EmptyState, ErrorState, ConfirmDialog, toast
  /features            # Domain modules (projects, tasks, dashboard) — added in later milestones
  /hooks               # Shared React hooks
  /services
    /api               # Axios client, API route constants
  /store
    /slices            # Redux Toolkit slices (ui today; feature slices later)
  /theme               # Design tokens + MUI theme + AppThemeProvider
  /constants           # Routes, enums, navigation, env, motion, charts
  /types               # Shared TypeScript contracts
  /utils               # Pure helpers
  /lib                 # Cross-cutting libs (e.g. Zod helpers)
```

### Placement rules

| Put it here | When |
|-------------|------|
| `components/ui` | Reusable across features; no domain knowledge |
| `components/layout` | Shell chrome and page framing only |
| `features/<domain>` | Feature UI, hooks, and feature-local services |
| `services/api` | HTTP clients and path constants shared by features |
| `constants` | Enums, routes, env — no React nodes |
| `store/slices` | Cross-route client state |

Do not put business feature components under `components/ui` or `components/layout`.

---

## Routing & navigation

Primary nav items live in `constants/navigation.ts` and link to:

| Label | Path |
|-------|------|
| Dashboard | `/dashboard` |
| Projects | `/projects` |
| Kanban | `/kanban` |
| Analytics | `/analytics` |
| Settings | `/settings` |

- `/` redirects to `/dashboard`.
- Active highlighting uses `isNavItemActive()` (supports nested paths such as `/projects/:id`).
- Desktop (`lg+`, ≥1200px): permanent side drawer.
- Tablet/mobile: temporary drawer opened from the top app bar.

Path helpers: `constants/routes.ts` (`appRoutes`). Prefer these over string literals.

---

## Theme usage

### Source of truth

1. **Tokens** — `src/theme/tokens.ts`  
   Primary/secondary colors, typography, spacing unit (`8`), border radius, elevation shadows, breakpoints, status/priority semantic colors.
2. **Theme** — `src/theme/index.ts`  
   `createTheme(...)` composed from tokens. Exported as `theme`.
3. **Provider** — `src/theme/AppThemeProvider.tsx`  
   Wraps the tree with MUI `ThemeProvider` + `CssBaseline` (mounted from `app/providers.tsx`).

### How to style

Prefer theme values over hardcoded hex/spacing:

```tsx
// Good
sx={{ color: "primary.main", p: 2, borderRadius: 1, boxShadow: 2 }}

// Avoid
sx={{ color: "#0F4C81", padding: "16px" }}
```

| Need | Use |
|------|-----|
| Colors | `theme.palette` / `sx` palette keys (`primary.main`, `text.secondary`, …) |
| Spacing | `theme.spacing(n)` or `sx` spacing scale (`p: 2` → 16px) |
| Radius | `theme.shape.borderRadius` or `sx={{ borderRadius: 1 }}` |
| Elevation | `theme.shadows[n]` or `sx={{ boxShadow: 2 }}` |
| Breakpoints | `theme.breakpoints.up("lg")` — `md` = 768, `lg` = 1200 |
| Status/priority hex outside MUI | `colorTokens` from `@/theme` or `@/theme/tokens` |
| Chart series colors | `chartPalette` from `@/constants` (derived from tokens) |

Change brand colors in `tokens.ts` only; avoid one-off palette overrides in features.

Font: IBM Plex Sans via `next/font` (`--font-ibm-plex-sans`) wired in the root layout and theme typography.

---

## Shared component conventions

Import from barrels:

```ts
import { AppShell, PagePlaceholder } from "@/components/layout";
import {
  Skeleton,
  ContentSkeleton,
  EmptyState,
  ErrorState,
  ConfirmDialog,
  useToast,
} from "@/components/ui";
```

### When to use which

| Component | Use for |
|-----------|---------|
| `Skeleton` / `ContentSkeleton` | Loading placeholders while data fetches |
| `EmptyState` | Successful load with no items (e.g. no projects yet) |
| `ErrorState` | Failed load / section error with optional retry |
| `ConfirmDialog` | Destructive or irreversible confirms (archive, etc.) |
| `useToast` + `ToastProvider` | Success/error feedback after mutations |
| `PagePlaceholder` | Shell routes that are not implemented yet (not empty data) |

### Accessibility expectations

- `EmptyState` → `role="status"`, polite live region, heading for title.
- `ErrorState` → `role="alert"`, assertive live region.
- `ConfirmDialog` → labelled/described dialog; Escape cancels when not loading; destructive confirms use `color="error"`.
- Toasts → errors use `role="alert"`; others use `role="status"`.
- Skeletons → `aria-busy` / `aria-live="polite"` on composed loaders.

### Toast usage

`ToastProvider` is already mounted in `AppProviders`. Feature code should only call:

```ts
const { showSuccess, showError } = useToast();
showSuccess("Project archived");
showError("Could not update task status");
```

Do not mount additional Snackbar hosts per feature.

### Confirm dialog usage

Keep dialogs controlled by the parent (`open`, `onConfirm`, `onCancel`). Use `destructive` for archive/delete and `loading` while the mutation is in flight.

---

## Redux & API scaffolding

- Store factory: `store/makeStore` via `store/index.ts`.
- UI slice: navigation drawer open state + toast queue (`store/slices/uiSlice.ts`).
- Projects slice: list/detail/mutations, filters, and async thunks (`store/slices/projectsSlice.ts`).
- Tasks slice: list/detail/mutations, Kanban filters, and async thunks (`store/slices/tasksSlice.ts`).
- Dashboard slice: summary, insights, and derived activity (`store/slices/dashboardSlice.ts`).
- Typed hooks: `useAppDispatch`, `useAppSelector`, `useAppStore`.
- HTTP: `apiClient` from `@/services/api` — base URL from `NEXT_PUBLIC_API_BASE_URL` (see `frontend/.env.example`).
- Projects API: `getProjects`, `getProjectById`, `createProject`, `updateProject`, `archiveProject`, `restoreProject` from `@/services/api`.
- Dashboard API: `getDashboardSummary`, `getDashboardInsights` from `@/services/api`.

See [`docs/features/dashboard.md`](../features/dashboard.md) for Dashboard/Analytics architecture and chart contracts.

---

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Axios `baseURL` (default fallback: `http://localhost:4000/api`) |

Never commit secrets. Only `NEXT_PUBLIC_*` values are available in the browser.

---

## Feature documentation & tests

- Feature usage docs live under `docs/features/` (e.g. [Projects](../features/projects.md), [Kanban](../features/kanban.md), [Dashboard & Analytics](../features/dashboard.md)).
- Frontend unit/component tests use Vitest + Testing Library: `npm run test --workspace=frontend`.
