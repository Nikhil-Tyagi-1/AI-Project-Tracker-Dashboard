import { createTheme, type Shadows } from "@mui/material/styles";

import {
  borderRadius,
  breakpointValues,
  colorTokens,
  elevationShadows,
  spacingUnit,
  typographyTokens,
} from "@/theme/tokens";

/**
 * Application MUI theme composed from design tokens.
 * Keep visual decisions in tokens.ts so features consume theme values instead of hardcoding styles.
 */
export const theme = createTheme({
  cssVariables: true,
  breakpoints: {
    values: { ...breakpointValues },
  },
  palette: {
    mode: "light",
    primary: { ...colorTokens.primary },
    secondary: { ...colorTokens.secondary },
    background: { ...colorTokens.background },
    divider: colorTokens.divider,
    text: { ...colorTokens.text },
    success: { ...colorTokens.success },
    warning: { ...colorTokens.warning },
    error: { ...colorTokens.error },
    info: { ...colorTokens.info },
  },
  typography: {
    fontFamily: typographyTokens.fontFamily,
    h1: { ...typographyTokens.h1 },
    h2: { ...typographyTokens.h2 },
    h3: { ...typographyTokens.h3 },
    h4: { ...typographyTokens.h4 },
    h5: { ...typographyTokens.h5 },
    h6: { ...typographyTokens.h6 },
    button: { ...typographyTokens.button },
  },
  shape: {
    borderRadius,
  },
  spacing: spacingUnit,
  shadows: elevationShadows as unknown as Shadows,
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100vh",
        },
      },
    },
  },
});

export type AppTheme = typeof theme;

export {
  borderRadius,
  breakpointValues,
  colorTokens,
  elevationShadows,
  spacingUnit,
  typographyTokens,
} from "@/theme/tokens";
