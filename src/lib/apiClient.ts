import { API_BASE_URL } from "@/lib/constants";
import { parseApiError } from "@/lib/apiError";
import { useAuthStore } from "@/features/auth/useAuthStore";

type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function registerSessionExpiredHandler(
  handler: SessionExpiredHandler,
): void {
  sessionExpiredHandler = handler;
}

export interface ApiFetchOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  headers?: HeadersInit;
  skipAuth?: boolean;
}

function mergeHeaders(
  defaultHeaders: HeadersInit,
  customHeaders?: HeadersInit,
): Headers {
  const headers = new Headers(defaultHeaders);

  if (!customHeaders) {
    return headers;
  }

  const additionalHeaders = new Headers(customHeaders);

  additionalHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  return headers;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const {
    body,
    headers: customHeaders,
    skipAuth = false,
    ...requestOptions
  } = options;

  const isFormData = body instanceof FormData;

  const defaultHeaders: HeadersInit = {};

  if (!isFormData && body !== undefined) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      defaultHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: mergeHeaders(defaultHeaders, customHeaders),
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    const apiError = await parseApiError(response);

    if (apiError.isUnauthorized && !skipAuth) {
      useAuthStore.getState().logout();
      sessionExpiredHandler?.();
    }

    throw apiError;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  /*
   * 202 Accepted is used by two different endpoints with different bodies:
   * - POST /files returns 202 WITH a JSON body ({id, filename, status}).
   * - DELETE /users/me returns 202 with no meaningful body.
   * Don't special-case 202 as "always empty" - fall through to the same
   * content-type sniffing used for every other status code instead.
   */
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/*
 * For call sites that need to build a raw fetch() manually (file upload
 * with progress, the SSE streaming endpoints) rather than going through
 * apiFetch(). These read from the same single source of truth as apiFetch
 * itself, so token/base-URL handling never diverges between the two paths.
 */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/*
 * Call this for any raw fetch() (i.e. not going through apiFetch) that can
 * hit a 401 - the SSE streaming endpoints in particular. Centralizes the
 * same logout + session-expired notification apiFetch performs, so a token
 * expiring mid-conversation behaves identically to one expiring on a normal
 * request.
 */
export function handleUnauthorizedResponse(response: Response): void {
  if (response.status === 401) {
    useAuthStore.getState().logout();
    sessionExpiredHandler?.();
  }
}
