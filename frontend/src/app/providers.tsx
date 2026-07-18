"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { useRef } from "react";
import { Provider as ReduxProvider } from "react-redux";

import { ToastProvider } from "@/components/ui";
import { makeStore, type AppStore } from "@/store";
import { AppThemeProvider } from "@/theme/AppThemeProvider";

type AppProvidersProps = {
  children: React.ReactNode;
};

/**
 * Client-side providers for MUI theme, Redux store, and global toasts.
 * Kept separate from layout so the root layout can stay a Server Component.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <AppThemeProvider>
        <ReduxProvider store={storeRef.current}>
          <ToastProvider>{children}</ToastProvider>
        </ReduxProvider>
      </AppThemeProvider>
    </AppRouterCacheProvider>
  );
}
