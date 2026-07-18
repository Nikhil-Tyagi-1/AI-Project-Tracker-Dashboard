import { createSlice, type PayloadAction, nanoid } from "@reduxjs/toolkit";

export type ToastSeverity = "success" | "error" | "info" | "warning";

export type ToastMessage = {
  id: string;
  message: string;
  severity: ToastSeverity;
  /** Auto-hide duration in ms. Defaults in the toast host. */
  duration?: number;
};

export type EnqueueToastPayload = {
  message: string;
  severity?: ToastSeverity;
  duration?: number;
};

/**
 * Global UI state (navigation drawer + toast queue).
 * Presentational hosts live under src/components/ui.
 */
type UiState = {
  isNavigationOpen: boolean;
  toasts: ToastMessage[];
};

const initialState: UiState = {
  // Temporary drawer starts closed; permanent desktop drawer does not use this flag.
  isNavigationOpen: false,
  toasts: [],
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
    enqueueToast: {
      reducer(state, action: PayloadAction<ToastMessage>) {
        state.toasts.push(action.payload);
      },
      prepare(payload: EnqueueToastPayload) {
        return {
          payload: {
            id: nanoid(),
            message: payload.message,
            severity: payload.severity ?? "info",
            duration: payload.duration,
          } satisfies ToastMessage,
        };
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const {
  setNavigationOpen,
  toggleNavigation,
  enqueueToast,
  dismissToast,
  clearToasts,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
