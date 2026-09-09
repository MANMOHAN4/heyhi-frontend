import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/apiError";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    const nonRetryableStatuses = [400, 401, 403, 404, 409, 413, 415, 422, 429];

    if (nonRetryableStatuses.includes(error.status)) {
      return false;
    }
  }

  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
