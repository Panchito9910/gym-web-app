import type { ApiErrorBody } from "../../types/api";

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export class ValidationError extends ApiError {
  fieldErrors: Record<string, string>;

  constructor(fieldErrors: Record<string, string>, status = 400, body: ApiErrorBody | null = null) {
    const firstError = Object.values(fieldErrors)[0] ?? "Validation failed.";
    super(firstError, status, body);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export function normalizeError(status: number, body: unknown): ApiError {
  if (!body || typeof body !== "object") {
    return new ApiError(`Request failed (${status}).`, status);
  }

  const errBody = body as ApiErrorBody;

  if (errBody.detail && typeof errBody.detail === "string") {
    return new ApiError(errBody.detail, status, errBody);
  }

  const fieldErrors: Record<string, string> = {};
  for (const [key, value] of Object.entries(errBody)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
      fieldErrors[key] = value[0];
    } else if (typeof value === "string") {
      fieldErrors[key] = value;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return new ValidationError(fieldErrors, status, errBody);
  }

  return new ApiError(`Request failed (${status}).`, status, errBody);
}
