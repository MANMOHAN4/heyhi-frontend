/**
 * lib/apiClient.ts
 *
 * The single fetch wrapper for every non-streaming request in the app.
 * Responsibilities (per 04-nonfunctional-and-deployment.md "Auth State
 * Management - Concrete Implementation Guidance"):
 *   1. Read API_BASE_URL from env, never hardcode it anywhere else.
 *   2. Attach `Authorization: Bearer <token>` automatically when a token exists.
 *   3. Centrally handle 401 UNAUTHORIZED -> clear auth state, redirect to
 *      /login with a "session expired" message. This logic must exist in
 *      exactly ONE place - do not re-implement per feature.
 *   4. Parse the backend's consistent error shape via parseApiError.
 *
 * NOTE: this wrapper is NOT used for the three streaming endpoints
 * (POST /threads, /threads/{id}/turns, /threads/pro-search) - those need
 * the raw Response/ReadableStream and are implemented separately in
 * features/conversation/sse.ts, per 02-api-reference.md's SSE guidance
 * (EventSource cannot be used for POST). That streaming code still reads
 * API_BASE_URL and the token the same way, and still throws ApiError for
 * the pre-stream failure case (e.g. 429 quota, thread not found).
 */
import { API_BASE_URL } from "./constants";
import { ApiError, parseApiError } from "./apiError";
import { authStore } from "../src/features/auth/useAuthStore";

let onSessionExpired: (() => void) | null = null;

/**
 * Wire this up once, near app bootstrap (e.g. in App.tsx via a small effect),
 * to a function that navigates to /login and shows a toast - keeps this
 * module framework-agnostic (no direct react-router / toast import here).
 */
export function registerSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown; // plain object, auto-JSON.stringify'd; pass FormData directly to skip this
  skipAuth?: boolean; // for public endpoints (signup, login, verify-email, shared thread)
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, skipAuth, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  const isFormData = body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const token = authStore.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
    body: isFormData
      ? (body as FormData)
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  if (!response.ok) {
    const error = await parseApiError(response);

    if (error.status === 401 && error.code === "UNAUTHORIZED" && !skipAuth) {
      authStore.logout();
      onSessionExpired?.();
    }

    throw error;
  }

  // 204/202 no-content-of-note responses (e.g. DELETE /threads/{id})
  const contentLength = response.headers.get("content-length");
  if (response.status === 204 || contentLength === "0") {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export { ApiError };
