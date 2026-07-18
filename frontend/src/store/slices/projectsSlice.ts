import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import * as projectsApi from "@/services/api/projects";
import type { Priority, ProjectStatus } from "@/constants/enums";
import type {
  CreateProjectInput,
  Project,
  ProjectListMeta,
  ProjectListParams,
  ProjectSortBy,
  SortOrder,
  UpdateProjectInput,
} from "@/types/project";
import { getApiErrorMessage } from "@/utils/apiError";

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

/**
 * List UI filter/sort/pagination state.
 * Empty strings mean "no filter" and are omitted from API query params.
 */
export type ProjectsFilterState = {
  q: string;
  status: ProjectStatus | "";
  priority: Priority | "";
  owner: string;
  sortBy: ProjectSortBy;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
  includeArchived: boolean;
};

export type ProjectsState = {
  items: Project[];
  selectedProject: Project | null;
  meta: ProjectListMeta | null;
  filters: ProjectsFilterState;
  listStatus: RequestStatus;
  detailStatus: RequestStatus;
  mutationStatus: RequestStatus;
  listError: string | null;
  detailError: string | null;
  mutationError: string | null;
};

export const DEFAULT_PROJECTS_FILTERS: ProjectsFilterState = {
  q: "",
  status: "",
  priority: "",
  owner: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: 20,
  includeArchived: false,
};

const initialState: ProjectsState = {
  items: [],
  selectedProject: null,
  meta: null,
  filters: DEFAULT_PROJECTS_FILTERS,
  listStatus: "idle",
  detailStatus: "idle",
  mutationStatus: "idle",
  listError: null,
  detailError: null,
  mutationError: null,
};

/** Map Redux filter state to API list query params. */
export function filtersToListParams(
  filters: ProjectsFilterState,
): ProjectListParams {
  return {
    ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.owner.trim() ? { owner: filters.owner.trim() } : {}),
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    pageSize: filters.pageSize,
    includeArchived: filters.includeArchived,
  };
}

function upsertProject(items: Project[], project: Project): Project[] {
  const index = items.findIndex((item) => item.id === project.id);
  if (index === -1) {
    return [project, ...items];
  }
  const next = [...items];
  next[index] = project;
  return next;
}

function removeProject(items: Project[], id: string): Project[] {
  return items.filter((item) => item.id !== id);
}

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (params: ProjectListParams | undefined, { rejectWithValue }) => {
    try {
      return await projectsApi.getProjects(params);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load projects"),
      );
    }
  },
);

export const fetchProjectById = createAsyncThunk(
  "projects/fetchProjectById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await projectsApi.getProjectById(id);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load project"),
      );
    }
  },
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (input: CreateProjectInput, { rejectWithValue }) => {
    try {
      return await projectsApi.createProject(input);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to create project"),
      );
    }
  },
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async (
    { id, input }: { id: string; input: UpdateProjectInput },
    { rejectWithValue },
  ) => {
    try {
      return await projectsApi.updateProject(id, input);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update project"),
      );
    }
  },
);

export const archiveProject = createAsyncThunk(
  "projects/archiveProject",
  async (id: string, { rejectWithValue }) => {
    try {
      return await projectsApi.archiveProject(id);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to archive project"),
      );
    }
  },
);

export const restoreProject = createAsyncThunk(
  "projects/restoreProject",
  async (id: string, { rejectWithValue }) => {
    try {
      return await projectsApi.restoreProject(id);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to restore project"),
      );
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.filters.q = action.payload;
      state.filters.page = 1;
    },
    setStatusFilter(state, action: PayloadAction<ProjectStatus | "">) {
      state.filters.status = action.payload;
      state.filters.page = 1;
    },
    setPriorityFilter(state, action: PayloadAction<Priority | "">) {
      state.filters.priority = action.payload;
      state.filters.page = 1;
    },
    setOwnerFilter(state, action: PayloadAction<string>) {
      state.filters.owner = action.payload;
      state.filters.page = 1;
    },
    setSort(
      state,
      action: PayloadAction<{ sortBy: ProjectSortBy; sortOrder: SortOrder }>,
    ) {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
      state.filters.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.filters.pageSize = action.payload;
      state.filters.page = 1;
    },
    setIncludeArchived(state, action: PayloadAction<boolean>) {
      state.filters.includeArchived = action.payload;
      state.filters.page = 1;
    },
    setFilters(state, action: PayloadAction<Partial<ProjectsFilterState>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      if (
        action.payload.page === undefined &&
        (action.payload.q !== undefined ||
          action.payload.status !== undefined ||
          action.payload.priority !== undefined ||
          action.payload.owner !== undefined ||
          action.payload.sortBy !== undefined ||
          action.payload.sortOrder !== undefined ||
          action.payload.pageSize !== undefined ||
          action.payload.includeArchived !== undefined)
      ) {
        state.filters.page = 1;
      }
    },
    resetFilters(state) {
      state.filters = { ...DEFAULT_PROJECTS_FILTERS };
    },
    setSelectedProject(state, action: PayloadAction<Project | null>) {
      state.selectedProject = action.payload;
    },
    clearSelectedProject(state) {
      state.selectedProject = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
    clearListError(state) {
      state.listError = null;
    },
    clearDetailError(state) {
      state.detailError = null;
    },
    clearMutationError(state) {
      state.mutationError = null;
    },
    clearProjectsErrors(state) {
      state.listError = null;
      state.detailError = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchProjects.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to load projects";
      })

      // detail
      .addCase(fetchProjectById.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.selectedProject = null;
        state.detailError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to load project";
      })

      // create
      .addCase(createProject.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.items = upsertProject(state.items, action.payload);
        state.selectedProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to create project";
      })

      // update
      .addCase(updateProject.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.items = upsertProject(state.items, action.payload);
        if (state.selectedProject?.id === action.payload.id) {
          state.selectedProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to update project";
      })

      // archive
      .addCase(archiveProject.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(archiveProject.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const project = action.payload;

        if (state.filters.includeArchived) {
          state.items = upsertProject(state.items, project);
        } else {
          state.items = removeProject(state.items, project.id);
        }

        if (state.selectedProject?.id === project.id) {
          state.selectedProject = project;
        }
      })
      .addCase(archiveProject.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to archive project";
      })

      // restore
      .addCase(restoreProject.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(restoreProject.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const project = action.payload;
        state.items = upsertProject(state.items, project);

        if (state.selectedProject?.id === project.id) {
          state.selectedProject = project;
        }
      })
      .addCase(restoreProject.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to restore project";
      });
  },
});

export const {
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
  setOwnerFilter,
  setSort,
  setPage,
  setPageSize,
  setIncludeArchived,
  setFilters,
  resetFilters,
  setSelectedProject,
  clearSelectedProject,
  clearListError,
  clearDetailError,
  clearMutationError,
  clearProjectsErrors,
} = projectsSlice.actions;

export const projectsReducer = projectsSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectProjectsState = (state: { projects: ProjectsState }) =>
  state.projects;
export const selectProjects = (state: { projects: ProjectsState }) =>
  state.projects.items;
export const selectSelectedProject = (state: { projects: ProjectsState }) =>
  state.projects.selectedProject;
export const selectProjectsMeta = (state: { projects: ProjectsState }) =>
  state.projects.meta;
export const selectProjectsFilters = (state: { projects: ProjectsState }) =>
  state.projects.filters;
export const selectProjectsListStatus = (state: { projects: ProjectsState }) =>
  state.projects.listStatus;
export const selectProjectsDetailStatus = (state: {
  projects: ProjectsState;
}) => state.projects.detailStatus;
export const selectProjectsMutationStatus = (state: {
  projects: ProjectsState;
}) => state.projects.mutationStatus;
export const selectProjectsListError = (state: { projects: ProjectsState }) =>
  state.projects.listError;
export const selectProjectsDetailError = (state: { projects: ProjectsState }) =>
  state.projects.detailError;
export const selectProjectsMutationError = (state: {
  projects: ProjectsState;
}) => state.projects.mutationError;
export const selectProjectsListLoading = (state: { projects: ProjectsState }) =>
  state.projects.listStatus === "loading";
export const selectProjectsDetailLoading = (state: {
  projects: ProjectsState;
}) => state.projects.detailStatus === "loading";
export const selectProjectsMutationLoading = (state: {
  projects: ProjectsState;
}) => state.projects.mutationStatus === "loading";
