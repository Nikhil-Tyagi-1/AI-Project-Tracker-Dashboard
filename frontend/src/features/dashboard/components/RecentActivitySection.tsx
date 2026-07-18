"use client";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import type { RequestStatus } from "@/store/slices/projectsSlice";
import type { ActivityItem } from "@/types/dashboard";
import { formatDisplayDate } from "@/utils/formatDate";

export type RecentActivitySectionProps = {
  items: ActivityItem[];
  status: RequestStatus;
  error: string | null;
  onRetry: () => void;
};

function activityActionLabel(item: ActivityItem): string {
  const entity = item.entityType === "project" ? "Project" : "Task";
  return item.action === "created" ? `${entity} created` : `${entity} updated`;
}

function ActivitySkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading recent activity"
    >
      <Stack spacing={1.5} aria-hidden sx={{ px: 1 }}>
        {Array.from({ length: 5 }, (_, index) => (
          <Stack key={index} direction="row" spacing={1.5} sx={{ px: 1 }}>
            <Skeleton variant="circular" width={28} height={28} />
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="55%" height={20} />
              <Skeleton variant="text" width="35%" height={16} />
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

/**
 * Recent activity list derived from project/task create and update timestamps.
 */
export function RecentActivitySection({
  items,
  status,
  error,
  onRetry,
}: RecentActivitySectionProps) {
  const showSkeleton = status === "loading" || status === "idle";
  const showError = status === "failed";
  const showEmpty = status === "succeeded" && items.length === 0;
  const showList = status === "succeeded" && items.length > 0;

  return (
    <Box
      component="section"
      aria-labelledby="recent-activity-heading"
      sx={{
        height: "100%",
        minWidth: 0,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        boxShadow: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack spacing={0.5} sx={{ px: 2, pt: 2, pb: 1.5, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <HistoryOutlinedIcon
            aria-hidden
            sx={{ color: "secondary.main", fontSize: 22 }}
          />
          <Typography
            id="recent-activity-heading"
            component="h2"
            variant="h6"
            sx={{ fontWeight: 650 }}
          >
            Recent Activity
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Latest project and task changes across your portfolio.
        </Typography>
      </Stack>

      <Box sx={{ px: 1, pb: 1, flex: 1, minWidth: 0, overflow: "auto" }}>
        {showSkeleton ? <ActivitySkeleton /> : null}

        {showError ? (
          <ErrorState
            title="Could not load activity"
            message={
              error ?? "Something went wrong while loading recent activity."
            }
            onRetry={onRetry}
            maxWidth={360}
          />
        ) : null}

        {showEmpty ? (
          <EmptyState
            title="No recent activity"
            description="Create or update projects and tasks to see activity here."
            maxWidth={360}
          />
        ) : null}

        {showList ? (
          <List disablePadding aria-label="Recent activity items">
            {items.map((item) => {
              const Icon =
                item.entityType === "project"
                  ? FolderOutlinedIcon
                  : AssignmentOutlinedIcon;
              const secondary = [
                activityActionLabel(item),
                item.subtitle,
                formatDisplayDate(item.occurredAt, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }),
              ]
                .filter(Boolean)
                .join(" · ");

              const content = (
                <>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={secondary}
                    slotProps={{
                      primary: {
                        variant: "body2",
                        noWrap: true,
                        sx: { fontWeight: 600 },
                      },
                      secondary: {
                        variant: "caption",
                        noWrap: true,
                      },
                    }}
                  />
                </>
              );

              if (item.href) {
                return (
                  <ListItemButton
                    key={item.id}
                    component={Link}
                    href={item.href}
                    sx={{ borderRadius: 1, alignItems: "flex-start" }}
                  >
                    {content}
                  </ListItemButton>
                );
              }

              return (
                <ListItemButton
                  key={item.id}
                  disabled
                  sx={{ borderRadius: 1, alignItems: "flex-start" }}
                >
                  {content}
                </ListItemButton>
              );
            })}
          </List>
        ) : null}
      </Box>
    </Box>
  );
}
