"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { useRef } from "react";
import { Provider as ReduxProvider } from "react-redux";

import { makeStore, type AppStore } from "@/store";
import { theme } from "@/theme";

type AppProvidersProps = {
  children: React.ReactNode;
};

/**
 * Client-side providers for MUI + Redux.
 * Kept separate from layout so the root layout can stay a Server Component.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ReduxProvider store={storeRef.current}>{children}</ReduxProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
