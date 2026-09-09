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

  if (response.status === 204 || response.status === 202) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
