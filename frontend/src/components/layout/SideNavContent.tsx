"use client";

import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import {
  isNavItemActive,
  mainNavItems,
  type MainNavItemId,
} from "@/constants/navigation";

type NavIcon = ComponentType<SvgIconProps>;

const navIcons: Record<MainNavItemId, NavIcon> = {
  dashboard: DashboardOutlinedIcon,
  projects: FolderOutlinedIcon,
  kanban: ViewKanbanOutlinedIcon,
  analytics: AnalyticsOutlinedIcon,
  settings: SettingsOutlinedIcon,
};

type SideNavContentProps = {
  /** Called after a nav link is selected (closes temporary drawer on mobile). */
  onNavigate?: () => void;
};

/**
 * Shared navigation list used by both permanent and temporary drawers.
 */
export function SideNavContent({ onNavigate }: SideNavContentProps) {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Toolbar
        sx={{
          px: 2.5,
          gap: 1,
          borderBottom: 1,
          borderColor: "divider",
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        <Typography
          variant="subtitle1"
          component="p"
          sx={{ fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3 }}
        >
          AI Project Tracker Pro
        </Typography>
      </Toolbar>

      <List
        component="nav"
        aria-label="Main navigation"
        sx={{ flex: 1, px: 1.5, py: 2 }}
      >
        {mainNavItems.map((item) => {
          const Icon = navIcons[item.id];
          const selected = isNavItemActive(pathname, item.href);

          return (
            <ListItemButton
              key={item.id}
              component={Link}
              href={item.href}
              selected={selected}
              onClick={onNavigate}
              aria-current={selected ? "page" : undefined}
              sx={{
                mb: 0.5,
                borderRadius: 1.5,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    variant: "body2",
                    sx: { fontWeight: selected ? 600 : 500 },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
