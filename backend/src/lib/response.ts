import type { Response } from "express";

// ---------------------------------------------------------------------------
// Pagination meta (§7.1 — Success collection shape)
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// Response envelopes
// ---------------------------------------------------------------------------

export interface SuccessResourceEnvelope<T> {
  data: T;
}

export interface SuccessCollectionEnvelope<T> {
  data: T[];
  meta: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Error types (§8.5)
// ---------------------------------------------------------------------------

/** Canonical error codes defined in spec §8.5. */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

/** Per-field validation detail item. */
export interface ErrorDetail {
  path: string;
  message: string;
}

export interface ErrorEnvelope {
  error: {
    message: string;
    code: ApiErrorCode;
    details?: ErrorDetail[];
  };
}

// ---------------------------------------------------------------------------
// successResponse — overloaded for single-resource and collection shapes
// ---------------------------------------------------------------------------

/**
 * Send a single-resource success response.
 *
 * Shape: `{ data: T }`
 */
export function successResponse<T>(
  res: Response,
  data: T,
  statusCode?: number,
): void;

/**
 * Send a paginated collection success response.
 *
 * Shape: `{ data: T[], meta: { total, page, pageSize } }`
 */
export function successResponse<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  statusCode?: number,
): void;

export function successResponse<T>(
  res: Response,
  data: T | T[],
  metaOrStatus?: PaginationMeta | number,
  statusCode?: number,
): void {
  if (typeof metaOrStatus === "object" && metaOrStatus !== null) {
    const body: SuccessCollectionEnvelope<T> = {
      data: data as T[],
      meta: metaOrStatus,
    };
    res.status(statusCode ?? 200).json(body);
  } else {
    const code = typeof metaOrStatus === "number" ? metaOrStatus : (statusCode ?? 200);
    const body: SuccessResourceEnvelope<T> = { data: data as T };
    res.status(code).json(body);
  }
}

// ---------------------------------------------------------------------------
// errorResponse
// ---------------------------------------------------------------------------

/**
 * Send a standardised error response.
 *
 * Shape: `{ error: { message, code, details? } }`
 *
 * @param res        - Express Response object
 * @param statusCode - HTTP status code (e.g. 400, 404, 409, 500)
 * @param message    - Human-readable error summary
 * @param code       - Machine-readable error code (§8.5)
 * @param details    - Optional per-field validation details
 */
export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  code: ApiErrorCode,
  details?: ErrorDetail[],
): void {
  const body: ErrorEnvelope = {
    error: {
      message,
      code,
      ...(details && details.length > 0 ? { details } : {}),
    },
  };
  res.status(statusCode).json(body);
}
