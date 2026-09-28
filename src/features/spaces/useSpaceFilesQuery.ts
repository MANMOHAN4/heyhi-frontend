import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getSpaceFiles } from "@/features/spaces/api";
import { useAuthStore } from "@/features/auth/useAuthStore";

export function spaceFilesQueryKey(spaceId?: string) {
  return ["spaces", spaceId, "files"] as const;
}

/*
 * GET /spaces/{id}/files (BACKEND_API_REFERENCE.md §8.5): List<SpaceFileResponse>,
 * no paging, read access (VIEWER+). This is the real, persisted source of
 * truth for a Space's shared documents - previously the UI could only show
 * files added during the current browser session because this endpoint
 * didn't exist yet.
 *
 * Polls every 4s while any file is still UPLOADING/PROCESSING, same idea as
 * a normal upload-status poll, so a file that just finished processing
 * flips to READY without the person needing to refresh the page.
 */
export function useSpaceFilesQuery(spaceId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const timeoutRef = useRef<number | null>(null);

  const query = useQuery({
    queryKey: spaceFilesQueryKey(spaceId),
    queryFn: () => getSpaceFiles(spaceId!),
    enabled: Boolean(accessToken && spaceId),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
  });

  const hasTransientFile = query.data?.some(
    (file) => file.status === "UPLOADING" || file.status === "PROCESSING",
  );

  useEffect(() => {
    if (!hasTransientFile || !spaceId) {
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: spaceFilesQueryKey(spaceId),
      });
    }, 4000);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [hasTransientFile, queryClient, spaceId]);

  return query;
}
