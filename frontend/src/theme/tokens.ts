/**
 * Design tokens for AI Project Tracker Pro.
 * Features should consume theme values (or these tokens) instead of hardcoding styles.
 *
 * Covers: primary/secondary colors, typography, spacing, border radius, elevation.
 */

export const colorTokens = {
  primary: {
    main: "#0F4C81",
    light: "#3B7CAD",
    dark: "#0A355A",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#1F7A6C",
    light: "#4C9E91",
    dark: "#14564C",
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#F5F7FA",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#0F172A",
    secondary: "#475569",
  },
  divider: "#E2E8F0",
  success: { main: "#15803D" },
  warning: { main: "#C2410C" },
  error: { main: "#B91C1C" },
  info: { main: "#0369A1" },
  /** Semantic colors for project/task status chips and badges. */
  status: {
    planned: "#64748B",
    inProgress: "#0369A1",
    onHold: "#A16207",
    atRisk: "#C2410C",
    completed: "#15803D",
    todo: "#64748B",
    inReview: "#7C3AED",
    done: "#15803D",
  },
  /** Semantic colors for priority chips and badges. */
  priority: {
    low: "#64748B",
    medium: "#0369A1",
    high: "#C2410C",
    critical: "#B91C1C",
  },
} as const;

export const typographyTokens = {
  fontFamily: [
    "var(--font-ibm-plex-sans)",
    "IBM Plex Sans",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ].join(","),
  h1: { fontWeight: 700, letterSpacing: "-0.02em" },
  h2: { fontWeight: 700, letterSpacing: "-0.02em" },
  h3: { fontWeight: 650, letterSpacing: "-0.01em" },
  h4: { fontWeight: 650 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { textTransform: "none" as const, fontWeight: 600 },
} as const;

/** Base spacing unit in px — MUI `theme.spacing(n)` = n × spacingUnit. */
export const spacingUnit = 8;

/** Default border radius applied via `theme.shape.borderRadius`. */
export const borderRadius = 10;

/**
 * Elevation / shadow scale (25 entries required by MUI).
 * Prefer theme.shadows[1–4] for cards and dialogs in feature UI.
 */
export const elevationShadows = [
  "none",
  "0 1px 2px rgba(15, 23, 42, 0.06)",
  "0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)",
  "0 4px 6px rgba(15, 23, 42, 0.08)",
  "0 8px 16px rgba(15, 23, 42, 0.08)",
  "0 12px 24px rgba(15, 23, 42, 0.1)",
  "0 16px 32px rgba(15, 23, 42, 0.1)",
  "0 20px 40px rgba(15, 23, 42, 0.12)",
  "0 24px 48px rgba(15, 23, 42, 0.12)",
  "0 28px 56px rgba(15, 23, 42, 0.14)",
  "0 32px 64px rgba(15, 23, 42, 0.14)",
  "0 36px 72px rgba(15, 23, 42, 0.16)",
  "0 40px 80px rgba(15, 23, 42, 0.16)",
  "0 44px 88px rgba(15, 23, 42, 0.18)",
  "0 48px 96px rgba(15, 23, 42, 0.18)",
  "0 52px 104px rgba(15, 23, 42, 0.2)",
  "0 56px 112px rgba(15, 23, 42, 0.2)",
  "0 60px 120px rgba(15, 23, 42, 0.22)",
  "0 64px 128px rgba(15, 23, 42, 0.22)",
  "0 68px 136px rgba(15, 23, 42, 0.24)",
  "0 72px 144px rgba(15, 23, 42, 0.24)",
  "0 76px 152px rgba(15, 23, 42, 0.26)",
  "0 80px 160px rgba(15, 23, 42, 0.26)",
  "0 84px 168px rgba(15, 23, 42, 0.28)",
  "0 88px 176px rgba(15, 23, 42, 0.28)",
] as const;

/**
 * Breakpoints aligned with acceptance criteria (AC-R01–R03):
 * mobile < 768, tablet 768–1199, desktop ≥ 1200.
 */
export const breakpointValues = {
  xs: 0,
  sm: 600,
  md: 768,
  lg: 1200,
  xl: 1536,
} as const;
