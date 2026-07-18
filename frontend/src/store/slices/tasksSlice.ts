import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { Priority, TaskStatus } from "@/constants/enums";
import * as tasksApi from "@/services/api/tasks";
import type { SortOrder } from "@/types/project";
import type {
  CreateTaskInput,
  Task,
  TaskListMeta,
  TaskListParams,
  TaskSortBy,
  UpdateTaskInput,
} from "@/types/task";
import { getApiErrorMessage } from "@/utils/apiError";

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

/**
 * List / Kanban filter state.
 * Empty strings mean "no filter" and are omitted from API query params.
 * `projectId` is the current board/project context (required for single-project Kanban).
 */
export type TasksFilterState = {
  projectId: string;
  search: string;
  status: TaskStatus | "";
  priority: Priority | "";
  assigneeId: string;
  sortBy: TaskSortBy;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
  includeArchived: boolean;
};

export type TasksState = {
  items: Task[];
  selectedTask: Task | null;
  meta: TaskListMeta | null;
  filters: TasksFilterState;
  listStatus: RequestStatus;
  detailStatus: RequestStatus;
  mutationStatus: RequestStatus;
  listError: string | null;
  detailError: string | null;
  mutationError: string | null;
};

export const DEFAULT_TASKS_FILTERS: TasksFilterState = {
  projectId: "",
  search: "",
  status: "",
  priority: "",
  assigneeId: "",
  sortBy: "sortOrder",
  sortOrder: "asc",
  page: 1,
  pageSize: 100,
  includeArchived: false,
};

const initialState: TasksState = {
  items: [],
  selectedTask: null,
  meta: null,
  filters: DEFAULT_TASKS_FILTERS,
  listStatus: "idle",
  detailStatus: "idle",
  mutationStatus: "idle",
  listError: null,
  detailError: null,
  mutationError: null,
};

/** Map Redux filter state to API list query params. */
export function filtersToListParams(filters: TasksFilterState): TaskListParams {
  return {
    ...(filters.projectId.trim()
      ? { projectId: filters.projectId.trim() }
      : {}),
    ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.assigneeId.trim()
      ? { assigneeId: filters.assigneeId.trim() }
      : {}),
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    pageSize: filters.pageSize,
    includeArchived: filters.includeArchived,
  };
}

function upsertTask(items: Task[], task: Task): Task[] {
  const index = items.findIndex((item) => item.id === task.id);
  if (index === -1) {
    return [task, ...items];
  }
  const next = [...items];
  next[index] = task;
  return next;
}

function removeTask(items: Task[], id: string): Task[] {
  return items.filter((item) => item.id !== id);
}

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (params: TaskListParams | undefined, { rejectWithValue }) => {
    try {
      return await tasksApi.getTasks(params);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load tasks"));
    }
  },
);

export const fetchTaskById = createAsyncThunk(
  "tasks/fetchTaskById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await tasksApi.getTaskById(id);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load task"));
    }
  },
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (input: CreateTaskInput, { rejectWithValue }) => {
    try {
      return await tasksApi.createTask(input);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to create task"),
      );
    }
  },
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (
    { id, input }: { id: string; input: UpdateTaskInput },
    { rejectWithValue },
  ) => {
    try {
      return await tasksApi.updateTask(id, input);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update task"),
      );
    }
  },
);

export const archiveTask = createAsyncThunk(
  "tasks/archiveTask",
  async (id: string, { rejectWithValue }) => {
    try {
      return await tasksApi.archiveTask(id);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to archive task"),
      );
    }
  },
);

export const restoreTask = createAsyncThunk(
  "tasks/restoreTask",
  async (id: string, { rejectWithValue }) => {
    try {
      return await tasksApi.restoreTask(id);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to restore task"),
      );
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setCurrentProjectId(state, action: PayloadAction<string>) {
      if (state.filters.projectId === action.payload) {
        return;
      }
      state.filters = {
        ...DEFAULT_TASKS_FILTERS,
        projectId: action.payload,
      };
      // Drop previous board data so columns never flash another project's tasks.
      state.items = [];
      state.meta = null;
      state.listStatus = "idle";
      state.listError = null;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setStatusFilter(state, action: PayloadAction<TaskStatus | "">) {
      state.filters.status = action.payload;
      state.filters.page = 1;
    },
    setPriorityFilter(state, action: PayloadAction<Priority | "">) {
      state.filters.priority = action.payload;
      state.filters.page = 1;
    },
    setAssigneeFilter(state, action: PayloadAction<string>) {
      state.filters.assigneeId = action.payload;
      state.filters.page = 1;
    },
    setSort(
      state,
      action: PayloadAction<{ sortBy: TaskSortBy; sortOrder: SortOrder }>,
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
    setFilters(state, action: PayloadAction<Partial<TasksFilterState>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      if (
        action.payload.page === undefined &&
        (action.payload.projectId !== undefined ||
          action.payload.search !== undefined ||
          action.payload.status !== undefined ||
          action.payload.priority !== undefined ||
          action.payload.assigneeId !== undefined ||
          action.payload.sortBy !== undefined ||
          action.payload.sortOrder !== undefined ||
          action.payload.pageSize !== undefined ||
          action.payload.includeArchived !== undefined)
      ) {
        state.filters.page = 1;
      }
    },
    resetFilters(state) {
      const projectId = state.filters.projectId;
      state.filters = {
        ...DEFAULT_TASKS_FILTERS,
        projectId,
      };
    },
    clearProjectContext(state) {
      state.filters = { ...DEFAULT_TASKS_FILTERS };
      state.items = [];
      state.meta = null;
      state.listStatus = "idle";
      state.listError = null;
    },
    setSelectedTask(state, action: PayloadAction<Task | null>) {
      state.selectedTask = action.payload;
    },
    clearSelectedTask(state) {
      state.selectedTask = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
    /** Replace the full task list (optimistic Kanban moves / rollback). */
    replaceTasks(state, action: PayloadAction<Task[]>) {
      state.items = action.payload;
    },
    /** Merge a single task into the list after a successful mutation. */
    upsertTaskLocal(state, action: PayloadAction<Task>) {
      state.items = upsertTask(state.items, action.payload);
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask = action.payload;
      }
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
    clearTasksErrors(state) {
      state.listError = null;
      state.detailError = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchTasks.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to load tasks";
      })

      // detail
      .addCase(fetchTaskById.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.selectedTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.selectedTask = null;
        state.detailError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to load task";
      })

      // create
      .addCase(createTask.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.items = upsertTask(state.items, action.payload);
        state.selectedTask = action.payload;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to create task";
      })

      // update
      .addCase(updateTask.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.items = upsertTask(state.items, action.payload);
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to update task";
      })

      // archive
      .addCase(archiveTask.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(archiveTask.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const task = action.payload;

        if (state.filters.includeArchived) {
          state.items = upsertTask(state.items, task);
        } else {
          state.items = removeTask(state.items, task.id);
        }

        if (state.selectedTask?.id === task.id) {
          state.selectedTask = task;
        }
      })
      .addCase(archiveTask.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to archive task";
      })

      // restore
      .addCase(restoreTask.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(restoreTask.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const task = action.payload;
        state.items = upsertTask(state.items, task);

        if (state.selectedTask?.id === task.id) {
          state.selectedTask = task;
        }
      })
      .addCase(restoreTask.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to restore task";
      });
  },
});

export const {
  setCurrentProjectId,
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
  setAssigneeFilter,
  setSort,
  setPage,
  setPageSize,
  setIncludeArchived,
  setFilters,
  resetFilters,
  clearProjectContext,
  setSelectedTask,
  clearSelectedTask,
  replaceTasks,
  upsertTaskLocal,
  clearListError,
  clearDetailError,
  clearMutationError,
  clearTasksErrors,
} = tasksSlice.actions;

export const tasksReducer = tasksSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectTasksState = (state: { tasks: TasksState }) => state.tasks;
export const selectTasks = (state: { tasks: TasksState }) => state.tasks.items;
export const selectSelectedTask = (state: { tasks: TasksState }) =>
  state.tasks.selectedTask;
export const selectTasksMeta = (state: { tasks: TasksState }) =>
  state.tasks.meta;
export const selectTasksFilters = (state: { tasks: TasksState }) =>
  state.tasks.filters;
export const selectCurrentProjectId = (state: { tasks: TasksState }) =>
  state.tasks.filters.projectId;
export const selectTasksListStatus = (state: { tasks: TasksState }) =>
  state.tasks.listStatus;
export const selectTasksDetailStatus = (state: { tasks: TasksState }) =>
  state.tasks.detailStatus;
export const selectTasksMutationStatus = (state: { tasks: TasksState }) =>
  state.tasks.mutationStatus;
export const selectTasksListError = (state: { tasks: TasksState }) =>
  state.tasks.listError;
export const selectTasksDetailError = (state: { tasks: TasksState }) =>
  state.tasks.detailError;
export const selectTasksMutationError = (state: { tasks: TasksState }) =>
  state.tasks.mutationError;
export const selectTasksListLoading = (state: { tasks: TasksState }) =>
  state.tasks.listStatus === "loading";
export const selectTasksDetailLoading = (state: { tasks: TasksState }) =>
  state.tasks.detailStatus === "loading";
export const selectTasksMutationLoading = (state: { tasks: TasksState }) =>
  state.tasks.mutationStatus === "loading";
