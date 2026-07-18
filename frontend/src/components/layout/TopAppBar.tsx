"use client";

import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { DRAWER_WIDTH } from "@/components/layout/layoutConstants";

type TopAppBarProps = {
  onMenuClick: () => void;
};

/**
 * Persistent top app bar.
 * Menu control is CSS-hidden on desktop (lg+) when the permanent drawer is visible.
 */
export function TopAppBar({ onMenuClick }: TopAppBarProps) {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "text.primary",
        zIndex: (t) => t.zIndex.drawer + 1,
        width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { lg: `${DRAWER_WIDTH}px` },
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          sx={{ display: { lg: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="h1"
          sx={{
            flexGrow: 1,
            fontWeight: 650,
            fontSize: { xs: "1rem", sm: "1.15rem" },
            letterSpacing: "-0.01em",
            display: { xs: "block", lg: "none" },
          }}
        >
          AI Project Tracker Pro
        </Typography>

        <Typography
          variant="h6"
          component="h1"
          sx={{
            flexGrow: 1,
            fontWeight: 650,
            fontSize: "1.15rem",
            letterSpacing: "-0.01em",
            display: { xs: "none", lg: "block" },
          }}
        >
          Workspace
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
