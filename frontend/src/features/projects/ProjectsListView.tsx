"use client";

import AddIcon from "@mui/icons-material/Add";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EmptyState, ErrorState } from "@/components/ui";
import { appRoutes } from "@/constants/routes";
import { motionPresets } from "@/constants/motion";
import { ProjectsCardList } from "@/features/projects/components/ProjectsCardList";
import { ProjectsListSkeleton } from "@/features/projects/components/ProjectsListSkeleton";
import { ProjectsPagination } from "@/features/projects/components/ProjectsPagination";
import { ProjectsTable } from "@/features/projects/components/ProjectsTable";
import { ProjectsToolbar } from "@/features/projects/components/ProjectsToolbar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  DEFAULT_PROJECTS_FILTERS,
  fetchProjects,
  filtersToListParams,
  resetFilters,
  selectProjects,
  selectProjectsFilters,
  selectProjectsListError,
  selectProjectsListStatus,
  selectProjectsMeta,
  setOwnerFilter,
  setPage,
  setPageSize,
  setPriorityFilter,
  setSearchQuery,
  setSort,
  setStatusFilter,
  type ProjectsFilterState,
} from "@/store/slices/projectsSlice";
import type { ProjectSortBy, SortOrder } from "@/types/project";

function hasActiveListFilters(
  filters: ProjectsFilterState,
  searchInput: string,
  ownerInput: string,
): boolean {
  return (
    searchInput.trim() !== "" ||
    ownerInput.trim() !== "" ||
    filters.status !== DEFAULT_PROJECTS_FILTERS.status ||
    filters.priority !== DEFAULT_PROJECTS_FILTERS.priority ||
    filters.sortBy !== DEFAULT_PROJECTS_FILTERS.sortBy ||
    filters.sortOrder !== DEFAULT_PROJECTS_FILTERS.sortOrder ||
    filters.page !== DEFAULT_PROJECTS_FILTERS.page ||
    filters.pageSize !== DEFAULT_PROJECTS_FILTERS.pageSize ||
    filters.includeArchived !== DEFAULT_PROJECTS_FILTERS.includeArchived
  );
}

/**
 * Projects list feature view — search, filter, sort, paginate, and open details.
 */
export function ProjectsListView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme();
  const isTableLayout = useMediaQuery(theme.breakpoints.up("md"));

  const projects = useAppSelector(selectProjects);
  const filters = useAppSelector(selectProjectsFilters);
  const meta = useAppSelector(selectProjectsMeta);
  const listStatus = useAppSelector(selectProjectsListStatus);
  const listError = useAppSelector(selectProjectsListError);

  const [searchInput, setSearchInput] = useState(filters.q);
  const [ownerInput, setOwnerInput] = useState(filters.owner);

  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const debouncedOwner = useDebouncedValue(ownerInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      dispatch(setSearchQuery(debouncedSearch));
    }
  }, [debouncedSearch, dispatch, filters.q]);

  useEffect(() => {
    if (debouncedOwner !== filters.owner) {
      dispatch(setOwnerFilter(debouncedOwner));
    }
  }, [debouncedOwner, dispatch, filters.owner]);

  useEffect(() => {
    void dispatch(fetchProjects(filtersToListParams(filters)));
  }, [dispatch, filters]);

  const canReset = hasActiveListFilters(filters, searchInput, ownerInput);
  const hasQueryOrFilters =
    Boolean(filters.q.trim()) ||
    Boolean(filters.owner.trim()) ||
    Boolean(filters.status) ||
    Boolean(filters.priority);

  const handleClearSearch = () => {
    setSearchInput("");
    dispatch(setSearchQuery(""));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setOwnerInput("");
    dispatch(resetFilters());
  };

  const handleSortByChange = (sortBy: ProjectSortBy) => {
    dispatch(setSort({ sortBy, sortOrder: filters.sortOrder }));
  };

  const handleSortOrderChange = (sortOrder: SortOrder) => {
    dispatch(setSort({ sortBy: filters.sortBy, sortOrder }));
  };

  const handleTableSortChange = (sortBy: ProjectSortBy) => {
    if (filters.sortBy === sortBy) {
      dispatch(
        setSort({
          sortBy,
          sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
        }),
      );
      return;
    }

    dispatch(setSort({ sortBy, sortOrder: "asc" }));
  };

  const handleProjectClick = (projectId: string) => {
    router.push(appRoutes.projectDetail(projectId));
  };

  const handleRetry = () => {
    void dispatch(fetchProjects(filtersToListParams(filters)));
  };

  const showInitialSkeleton = listStatus === "loading" && projects.length === 0;
  const showError = listStatus === "failed" && projects.length === 0;
  const showEmpty = listStatus === "succeeded" && projects.length === 0;
  const showList = projects.length > 0;

  return (
    <Box component="section" aria-labelledby="projects-page-title">
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "stretch", sm: "flex-start" },
            justifyContent: "space-between",
          }}
        >
          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography
              id="projects-page-title"
              component="h1"
              variant="h4"
              sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Search, filter, and open projects in your portfolio.
            </Typography>
          </Stack>

          <Button
            component={Link}
            href={appRoutes.projectCreate}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ alignSelf: { xs: "stretch", sm: "center" }, flexShrink: 0 }}
          >
            New project
          </Button>
        </Stack>

        <ProjectsToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onClearSearch={handleClearSearch}
          status={filters.status}
          onStatusChange={(value) => dispatch(setStatusFilter(value))}
          priority={filters.priority}
          onPriorityChange={(value) => dispatch(setPriorityFilter(value))}
          owner={ownerInput}
          onOwnerChange={setOwnerInput}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortByChange={handleSortByChange}
          onSortOrderChange={handleSortOrderChange}
          canReset={canReset}
          onResetFilters={handleResetFilters}
        />

        {showInitialSkeleton ? <ProjectsListSkeleton /> : null}

        {showError ? (
          <ErrorState
            title="Could not load projects"
            message={listError ?? "Something went wrong while loading projects."}
            onRetry={handleRetry}
          />
        ) : null}

        {showEmpty ? (
          hasQueryOrFilters ? (
            <EmptyState
              icon={SearchOffOutlinedIcon}
              title="No results"
              description="No projects match your current search or filters. Try adjusting or resetting them."
              actionLabel="Reset filters"
              onAction={handleResetFilters}
            />
          ) : (
            <EmptyState
              title="No projects yet"
              description="Create your first project to start tracking delivery status, ownership, and progress."
              actionLabel="New project"
              onAction={() => router.push(appRoutes.projectCreate)}
            />
          )
        ) : null}

        {showList ? (
          <motion.div {...motionPresets.fadeUp}>
            <Stack spacing={2}>
              {listStatus === "loading" ? (
                <Typography variant="caption" color="text.secondary">
                  Updating results…
                </Typography>
              ) : null}

              {isTableLayout ? (
                <ProjectsTable
                  projects={projects}
                  sortBy={filters.sortBy}
                  sortOrder={filters.sortOrder}
                  onSortChange={handleTableSortChange}
                  onProjectClick={handleProjectClick}
                />
              ) : (
                <ProjectsCardList
                  projects={projects}
                  onProjectClick={handleProjectClick}
                />
              )}

              <ProjectsPagination
                page={filters.page}
                pageSize={filters.pageSize}
                total={meta?.total ?? 0}
                onPageChange={(page) => dispatch(setPage(page))}
                onPageSizeChange={(pageSize) => dispatch(setPageSize(pageSize))}
              />
            </Stack>
          </motion.div>
        ) : null}
      </Stack>
    </Box>
  );
}
