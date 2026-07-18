"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import { theme } from "@/theme";

type AppThemeProviderProps = {
  children: React.ReactNode;
};

/**
 * MUI ThemeProvider + CssBaseline for the application shell.
 * Wraps the tree so all feature UI inherits design tokens and baseline resets.
 */
export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
