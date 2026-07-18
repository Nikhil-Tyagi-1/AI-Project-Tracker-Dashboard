import type { ApiErrorCode, ErrorDetail } from "./response";

// ---------------------------------------------------------------------------
// AppError — base class for all domain errors
// ---------------------------------------------------------------------------

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details?: ErrorDetail[];

  constructor(
    message: string,
    statusCode: number,
    code: ApiErrorCode,
    details?: ErrorDetail[],
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Restore prototype chain (required when extending built-ins with TS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Concrete error classes (§8.5)
// ---------------------------------------------------------------------------

/** 400 — request body or query params failed validation. */
export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: ErrorDetail[]) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

/** 404 — requested resource does not exist. */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

/** 409 — state conflict, e.g. duplicate name. */
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409, "CONFLICT");
  }
}

/** 500 — unexpected server-side failure. */
export class InternalServerError extends AppError {
  constructor(message = "An unexpected error occurred") {
    super(message, 500, "INTERNAL_ERROR");
  }
}
