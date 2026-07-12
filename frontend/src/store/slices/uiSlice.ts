import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Global UI state shell (toasts, drawer, dialogs).
 * Feature UI will extend this in later milestones — no presentational components here.
 */
type UiState = {
  isNavigationOpen: boolean;
};

const initialState: UiState = {
  isNavigationOpen: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setNavigationOpen(state, action: PayloadAction<boolean>) {
      state.isNavigationOpen = action.payload;
    },
    toggleNavigation(state) {
      state.isNavigationOpen = !state.isNavigationOpen;
    },
  },
});

export const { setNavigationOpen, toggleNavigation } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
