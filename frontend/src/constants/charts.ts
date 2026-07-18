import { colorTokens } from "@/theme/tokens";

/**
 * Chart color tokens derived from the design system for Recharts usage.
 * Prefer these over hardcoding hex values inside feature charts.
 */
export const chartPalette = {
  primary: colorTokens.primary.main,
  secondary: colorTokens.secondary.main,
  success: colorTokens.success.main,
  warning: colorTokens.warning.main,
  error: colorTokens.error.main,
  info: colorTokens.info.main,
  muted: "#94A3B8",
  /** Recharts Tooltip cursor / active band (replaces default grey). */
  hover: "rgba(59, 124, 173, 0.18)",
  series: [
    colorTokens.primary.main,
    colorTokens.secondary.main,
    colorTokens.warning.main,
    colorTokens.info.main,
    "#7C3AED",
    "#CA8A04",
  ],
} as const;
