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

/*
 * Deduplicates concurrent refresh attempts: if three requests all 401 at
 * once, they should trigger exactly one POST /auth/refresh and all await
 * its result, not one refresh call each (which would race, and since the
 * backend rotates the refresh token on every use - BACKEND_API_REFERENCE.md
 * §4 - a second concurrent call would already be using a stale, spent
 * refresh token and fail).
 */
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const { refreshToken } = useAuthStore.getState();

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const body = (await response.json()) as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };

      useAuthStore
        .getState()
        .setTokens(body.access_token, body.refresh_token, body.expires_in);

      return body.access_token;
    } catch {
      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function expireSession(): void {
  useAuthStore.getState().logout();
  sessionExpiredHandler?.();
}

/*
 * Proactive refresh: called before a request goes out, so a request doesn't
 * have to fail with a 401 first when we already know the access token is
 * about to expire. Cross-cutting UI concerns in BACKEND_API_REFERENCE.md
 * recommends refreshing ~1 min before the 15-min expiry.
 */
const PROACTIVE_REFRESH_WINDOW_MS = 60_000;

async function ensureFreshAccessToken(): Promise<string | null> {
  const { accessToken, accessTokenExpiresAt, refreshToken } =
    useAuthStore.getState();

  if (!accessToken || !refreshToken) {
    return accessToken;
  }

  const isNearExpiry =
    accessTokenExpiresAt !== null &&
    accessTokenExpiresAt - Date.now() < PROACTIVE_REFRESH_WINDOW_MS;

  if (!isNearExpiry) {
    return accessToken;
  }

  const refreshed = await refreshAccessToken();

  return refreshed ?? accessToken;
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

async function performFetch(
  path: string,
  options: ApiFetchOptions,
  accessTokenOverride?: string | null,
): Promise<Response> {
  const { body, headers: customHeaders, skipAuth = false, ...requestOptions } =
    options;

  const isFormData = body instanceof FormData;

  const defaultHeaders: HeadersInit = {};

  if (!isFormData && body !== undefined) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const accessToken =
      accessTokenOverride ?? useAuthStore.getState().accessToken;

    if (accessToken) {
      defaultHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: mergeHeaders(defaultHeaders, customHeaders),
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth = false } = options;

  if (!skipAuth) {
    await ensureFreshAccessToken();
  }

  let response = await performFetch(path, options);

  /*
   * Reactive refresh: covers the case the proactive check missed (clock
   * skew, a token that expired mid-request, or a token invalidated
   * server-side for another reason). Retry exactly once with a rotated
   * token; a second 401 after that means the session is genuinely over.
   */
  if (response.status === 401 && !skipAuth) {
    const refreshedAccessToken = await refreshAccessToken();

    if (refreshedAccessToken) {
      response = await performFetch(path, options, refreshedAccessToken);
    }
  }

  if (!response.ok) {
    const apiError = await parseApiError(response);

    if (apiError.isUnauthorized && !skipAuth) {
      expireSession();
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
 *
 * getAccessToken proactively refreshes first when the token is near expiry,
 * same as apiFetch - a long SSE stream is exactly the kind of request that
 * shouldn't start with a token that's about to expire mid-stream.
 */
export async function getAccessToken(): Promise<string | null> {
  return ensureFreshAccessToken();
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/*
 * Call this for any raw fetch() (i.e. not going through apiFetch) that can
 * hit a 401 - the SSE streaming endpoints in particular. Attempts the same
 * refresh-once recovery apiFetch does; the caller is responsible for
 * retrying its own request if this returns a token (see conversation/api.ts
 * fetchSse), and this only forces a full logout if refresh itself fails.
 */
export async function handleUnauthorizedResponse(
  response: Response,
): Promise<string | null> {
  if (response.status !== 401) {
    return null;
  }

  const refreshedAccessToken = await refreshAccessToken();

  if (refreshedAccessToken) {
    return refreshedAccessToken;
  }

  expireSession();
  return null;
}
