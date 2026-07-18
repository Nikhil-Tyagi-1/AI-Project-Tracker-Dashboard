import axios from "axios";

import type { ApiErrorResponse } from "@/types/api";

/**
 * Extract a user-facing message from Axios / API error envelopes.
 * Prefer the backend `{ error: { message } }` shape when present.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorResponse | undefined;
    if (body?.error?.message) {
      return body.error.message;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

/** Return field-level validation details from a failed API response, if any. */
export function getApiErrorDetails(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  const body = error.response?.data as ApiErrorResponse | undefined;
  return body?.error?.details;
}
