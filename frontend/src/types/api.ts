/**
 * Shared API contract types matching spec.md §7.1 response shapes.
 * Feature modules refine `T` with domain models as APIs land.
 */
export type ApiSuccessResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorDetail = {
  path?: string;
  message: string;
};

export type ApiErrorBody = {
  message: string;
  code: string;
  details?: ApiErrorDetail[];
};

export type ApiErrorResponse = {
  error: ApiErrorBody;
};
