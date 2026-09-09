/**
 * lib/queryClient.ts
 * Single TanStack Query client instance, shared app-wide via QueryClientProvider in main.tsx.
 */
import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../../lib/apiError";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Never retry auth/authorization/validation failures - only retry
        // genuine transient/network-ish failures, up to twice.
        if (error instanceof ApiError) {
          if (
            [400, 401, 403, 404, 409, 413, 415, 422, 429].includes(error.status)
          ) {
            return false;
          }
        }
        return failureCount < 2;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
