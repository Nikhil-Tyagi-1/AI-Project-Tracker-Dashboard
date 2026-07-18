import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import * as dashboardApi from "@/services/api/dashboard";
import type { RequestStatus } from "@/store/slices/projectsSlice";
import type {
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
  summaryStatus: RequestStatus;
  insightsStatus: RequestStatus;
  summaryError: string | null;
  insightsError: string | null;
};

const initialState: DashboardState = {
  metrics: null,
  charts: null,
  insights: null,
  summaryStatus: "idle",
  insightsStatus: "idle",
  summaryError: null,
  insightsError: null,
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
    clearDashboardErrors(state) {
      state.summaryError = null;
      state.insightsError = null;
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
      });
  },
});

export const {
  clearSummaryError,
  clearInsightsError,
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
