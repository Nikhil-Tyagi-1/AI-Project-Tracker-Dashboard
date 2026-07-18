"use client";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { useCallback, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { SideNav } from "@/components/layout/SideNav";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { DRAWER_WIDTH } from "@/components/layout/layoutConstants";
import { useAppDispatch, useAppSelector } from "@/store";
import { setNavigationOpen, toggleNavigation } from "@/store/slices/uiSlice";

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * Reusable application shell: top app bar, responsive side nav, main content area.
 * Feature pages render as `children` inside the content region — no page body here.
 */
export function AppShell({ children }: AppShellProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const dispatch = useAppDispatch();
  const isNavigationOpen = useAppSelector((state) => state.ui.isNavigationOpen);

  useEffect(() => {
    // Close the temporary drawer when crossing into the permanent desktop layout.
    if (isDesktop && isNavigationOpen) {
      dispatch(setNavigationOpen(false));
    }
  }, [dispatch, isDesktop, isNavigationOpen]);

  const handleMenuClick = useCallback(() => {
    dispatch(toggleNavigation());
  }, [dispatch]);

  const handleMobileClose = useCallback(() => {
    dispatch(setNavigationOpen(false));
  }, [dispatch]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <TopAppBar onMenuClick={handleMenuClick} />
      <SideNav mobileOpen={isNavigationOpen} onMobileClose={handleMobileClose} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Box
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
