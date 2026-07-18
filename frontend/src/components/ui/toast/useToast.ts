"use client";

import { useCallback } from "react";

import { useAppDispatch } from "@/store";
import {
  clearToasts,
  dismissToast,
  enqueueToast,
  type EnqueueToastPayload,
  type ToastSeverity,
} from "@/store/slices/uiSlice";

type ShowToastOptions = {
  duration?: number;
};

/**
 * Imperative toast helpers for feature modules.
 * Requires ToastProvider to be mounted in the app providers tree.
 */
export function useToast() {
  const dispatch = useAppDispatch();

  const show = useCallback(
    (message: string, severity: ToastSeverity, options?: ShowToastOptions) => {
      const payload: EnqueueToastPayload = {
        message,
        severity,
        duration: options?.duration,
      };
      dispatch(enqueueToast(payload));
    },
    [dispatch],
  );

  const showSuccess = useCallback(
    (message: string, options?: ShowToastOptions) => {
      show(message, "success", options);
    },
    [show],
  );

  const showError = useCallback(
    (message: string, options?: ShowToastOptions) => {
      show(message, "error", options);
    },
    [show],
  );

  const showInfo = useCallback(
    (message: string, options?: ShowToastOptions) => {
      show(message, "info", options);
    },
    [show],
  );

  const showWarning = useCallback(
    (message: string, options?: ShowToastOptions) => {
      show(message, "warning", options);
    },
    [show],
  );

  const dismiss = useCallback(
    (id: string) => {
      dispatch(dismissToast(id));
    },
    [dispatch],
  );

  const clear = useCallback(() => {
    dispatch(clearToasts());
  }, [dispatch]);

  return {
    show,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismiss,
    clear,
  };
}
