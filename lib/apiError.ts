/**
 * lib/apiError.ts
 *
 * Every backend error response has the consistent shape:
 *   { code: "SOME_UPPERCASE_CODE", message: string, request_id: string }
 * (see 01-backend-reference.md "Error Response Format" and
 *  02-api-reference.md "Error Code Reference")
 *
 * This is the single, shared place that shape is parsed and thrown from.
 * Every feature api.ts file should let ApiError propagate and catch it
 * at the call site (component / mutation onError) rather than re-parsing
 * response bodies itself.
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "EMAIL_ALREADY_REGISTERED"
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "THREAD_NOT_FOUND"
  | "SPACE_NOT_FOUND"
  | "SHARE_LINK_NOT_FOUND"
  | "FILE_NOT_FOUND"
  | "USER_NOT_FOUND"
  | "INVALID_VERIFICATION_TOKEN"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FILE_TYPE"
  | "PRO_SEARCH_QUOTA_EXCEEDED"
  | (string & {}); // widen: "any code not in this table should still be handled generically"

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  request_id: string;
}

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  requestId: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.requestId = body.request_id;
  }

  /**
   * 404 is deliberately used throughout for BOTH "resource doesn't exist"
   * and "you're not authorized to see it" (see 01-backend-reference.md).
   * Callers rendering copy for a 404 should generally prefer a neutral
   * "you don't have access to this" message over "not found, maybe deleted",
   * unless the specific screen has strong reason to believe it's a true 404.
   */
  get isNotFoundOrForbidden() {
    return this.status === 404;
  }
}

/**
 * Parses a failed fetch Response into an ApiError. Assumes the body is
 * JSON in the standard {code, message, request_id} shape; falls back to
 * a generic error if the body doesn't parse (defensive - should not
 * normally happen against this backend).
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (
      body &&
      typeof body.code === "string" &&
      typeof body.message === "string"
    ) {
      return new ApiError(response.status, body);
    }
  } catch {
    // fall through to generic
  }
  return new ApiError(response.status, {
    code: "UNKNOWN_ERROR",
    message: `Request failed with status ${response.status}`,
    request_id: "",
  });
}
