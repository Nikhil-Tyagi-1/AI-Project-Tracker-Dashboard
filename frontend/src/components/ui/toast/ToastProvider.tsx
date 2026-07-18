"use client";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import { useAppDispatch, useAppSelector } from "@/store";
import { dismissToast } from "@/store/slices/uiSlice";

const DEFAULT_DURATION_MS = 4_500;
const ERROR_DURATION_MS = 6_000;

type ToastProviderProps = {
  children: React.ReactNode;
};

/**
 * Global toast host. Renders the oldest queued toast via MUI Snackbar + Alert.
 * Mount once under ReduxProvider (see AppProviders).
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const dispatch = useAppDispatch();
  const activeToast = useAppSelector((state) => state.ui.toasts[0] ?? null);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway" || !activeToast) {
      return;
    }
    dispatch(dismissToast(activeToast.id));
  };

  const autoHideDuration =
    activeToast?.duration ??
    (activeToast?.severity === "error" ? ERROR_DURATION_MS : DEFAULT_DURATION_MS);

  return (
    <>
      {children}
      <Snackbar
        open={Boolean(activeToast)}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ bottom: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 } }}
      >
        {activeToast ? (
          <Alert
            onClose={() => dispatch(dismissToast(activeToast.id))}
            severity={activeToast.severity}
            variant="filled"
            elevation={3}
            role={activeToast.severity === "error" ? "alert" : "status"}
            sx={{ width: "100%", alignItems: "center" }}
          >
            {activeToast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
