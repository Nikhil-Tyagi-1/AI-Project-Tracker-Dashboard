"use client";

import Drawer from "@mui/material/Drawer";

import { SideNavContent } from "@/components/layout/SideNavContent";
import { DRAWER_WIDTH } from "@/components/layout/layoutConstants";

type SideNavProps = {
  /** Open state for the temporary (tablet/mobile) drawer. */
  mobileOpen: boolean;
  onMobileClose: () => void;
};

const paperSx = {
  width: DRAWER_WIDTH,
  boxSizing: "border-box" as const,
  borderRight: 1,
  borderColor: "divider",
  bgcolor: "background.paper",
};

/**
 * Responsive side navigation using MUI's dual-drawer pattern:
 * - Desktop (lg+): permanent drawer (CSS-visible)
 * - Tablet/mobile: temporary drawer overlay
 */
export function SideNav({ mobileOpen, onMobileClose }: SideNavProps) {
  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": paperSx,
        }}
      >
        <SideNavContent onNavigate={onMobileClose} />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", lg: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": paperSx,
        }}
      >
        <SideNavContent />
      </Drawer>
    </>
  );
}
