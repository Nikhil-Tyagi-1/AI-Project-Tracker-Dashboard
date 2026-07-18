import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { deriveRecentActivity } from "@/features/dashboard/deriveRecentActivity";
import * as dashboardApi from "@/services/api/dashboard";
import * as projectsApi from "@/services/api/projects";
import * as tasksApi from "@/services/api/tasks";
import type { RequestStatus } from "@/store/slices/projectsSlice";
import type {
  ActivityItem,
  DashboardCharts,
  DashboardInsights,
  DashboardMetrics,
  DashboardSummary,
} from "@/types/dashboard";
import { getApiErrorMessage } from "@/utils/apiError";

export type DashboardState = {
  metrics: DashboardMetrics | null;
  charts: DashboardCharts | null;
  insights: DashboardInsights | null;
  activity: ActivityItem[];
  summaryStatus: RequestStatus;
  insightsStatus: RequestStatus;
  activityStatus: RequestStatus;
  summaryError: string | null;
  insightsError: string | null;
  activityError: string | null;
};

const initialState: DashboardState = {
  metrics: null,
  charts: null,
  insights: null,
  activity: [],
  summaryStatus: "idle",
  insightsStatus: "idle",
  activityStatus: "idle",
  summaryError: null,
  insightsError: null,
  activityError: null,
};

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------

export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardApi.getDashboardSummary();
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load dashboard summary"),
      );
    }
  },
);

export const fetchDashboardInsights = createAsyncThunk(
  "dashboard/fetchInsights",
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardApi.getDashboardInsights();
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load dashboard insights"),
      );
    }
  },
);

/**
 * Recent activity is derived from recent project/task updates (no activity API).
 */
export const fetchDashboardActivity = createAsyncThunk(
  "dashboard/fetchActivity",
  async (_, { rejectWithValue }) => {
    try {
      const [projectsResult, tasksResult] = await Promise.all([
        projectsApi.getProjects({
          sortBy: "updatedAt",
          sortOrder: "desc",
          page: 1,
          pageSize: 10,
          includeArchived: false,
        }),
        tasksApi.getTasks({
          sortBy: "updatedAt",
          sortOrder: "desc",
          page: 1,
          pageSize: 20,
          includeArchived: false,
        }),
      ]);

      return deriveRecentActivity(projectsResult.data, tasksResult.data, 10);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load recent activity"),
      );
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearSummaryError(state) {
      state.summaryError = null;
    },
    clearInsightsError(state) {
      state.insightsError = null;
    },
    clearActivityError(state) {
      state.activityError = null;
    },
    clearDashboardErrors(state) {
      state.summaryError = null;
      state.insightsError = null;
      state.activityError = null;
    },
    resetDashboard() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.summaryStatus = "loading";
        state.summaryError = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        const summary: DashboardSummary = action.payload;
        state.summaryStatus = "succeeded";
        state.metrics = summary.metrics;
        state.charts = summary.charts;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.summaryStatus = "failed";
        state.summaryError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to load dashboard summary";
      })

      .addCase(fetchDashboardInsights.pending, (state) => {
        state.insightsStatus = "loading";
        state.insightsError = null;
      })
      .addCase(fetchDashboardInsights.fulfilled, (state, action) => {
        state.insightsStatus = "succeeded";
        state.insights = action.payload;
      })
      .addCase(fetchDashboardInsights.rejected, (state, action) => {
        state.insightsStatus = "failed";
        state.insightsError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to load dashboard insights";
      })

      .addCase(fetchDashboardActivity.pending, (state) => {
        state.activityStatus = "loading";
        state.activityError = null;
      })
      .addCase(fetchDashboardActivity.fulfilled, (state, action) => {
        state.activityStatus = "succeeded";
        state.activity = action.payload;
      })
      .addCase(fetchDashboardActivity.rejected, (state, action) => {
        state.activityStatus = "failed";
        state.activityError =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to load recent activity";
      });
  },
});

export const {
  clearSummaryError,
  clearInsightsError,
  clearActivityError,
  clearDashboardErrors,
  resetDashboard,
} = dashboardSlice.actions;

export const dashboardReducer = dashboardSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectDashboardState = (state: { dashboard: DashboardState }) =>
  state.dashboard;
export const selectDashboardMetrics = (state: { dashboard: DashboardState }) =>
  state.dashboard.metrics;
export const selectDashboardCharts = (state: { dashboard: DashboardState }) =>
  state.dashboard.charts;
export const selectDashboardInsights = (state: {
  dashboard: DashboardState;
}) => state.dashboard.insights;
export const selectDashboardActivity = (state: {
  dashboard: DashboardState;
}) => state.dashboard.activity;
export const selectDashboardSummaryStatus = (state: {
  dashboard: DashboardState;
}) => state.dashboard.summaryStatus;
export const selectDashboardSummaryError = (state: {
  dashboard: DashboardState;
}) => state.dashboard.summaryError;
export const selectDashboardSummaryLoading = (state: {
  dashboard: DashboardState;
}) => state.dashboard.summaryStatus === "loading";
export const selectDashboardInsightsStatus = (state: {
  dashboard: DashboardState;
}) => state.dashboard.insightsStatus;
export const selectDashboardInsightsError = (state: {
  dashboard: DashboardState;
}) => state.dashboard.insightsError;
export const selectDashboardInsightsLoading = (state: {
  dashboard: DashboardState;
}) => state.dashboard.insightsStatus === "loading";
export const selectDashboardActivityStatus = (state: {
  dashboard: DashboardState;
}) => state.dashboard.activityStatus;
export const selectDashboardActivityError = (state: {
  dashboard: DashboardState;
}) => state.dashboard.activityError;
export const selectDashboardActivityLoading = (state: {
  dashboard: DashboardState;
}) => state.dashboard.activityStatus === "loading";
