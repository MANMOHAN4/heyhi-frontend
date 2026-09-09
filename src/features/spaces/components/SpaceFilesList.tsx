/**
 * features/spaces/components/SpaceFilesList.tsx
 *
 * REAL, FLAGGED BACKEND GAP: there is no endpoint to list a Space's shared
 * files (only POST /spaces/{id}/files to ADD one - see 02-api-reference.md
 * "Knowledge - Files & Spaces" and the consolidated gap list in
 * 04-nonfunctional-and-deployment.md). This component can only render files
 * added during the CURRENT browser session (tracked client-side in local
 * state, passed down from SpaceDetailPage) - it cannot show files that were
 * shared into this Space previously in another session. This limitation is
 * surfaced visibly in the UI copy below, not hidden, so it's not mistaken
 * for a completed feature. Flag to backend: a GET /spaces/{id}/files
 * endpoint would fix this properly.
 */
import { FileText } from "lucide-react";
import { EmptyState } from "../../../src/components/shared/EmptyState";
import type { UploadedDocument } from "../../files/types";

interface SpaceFilesListProps {
  filesAddedThisSession: UploadedDocument[];
}

export function SpaceFilesList({ filesAddedThisSession }: SpaceFilesListProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Files added this session are shown below. There is currently no API to
        list a Space's previously-shared files across sessions (a known backend
        gap) - files added earlier still work for grounding threads, they're
        just not listable here yet.
      </p>

      {filesAddedThisSession.length === 0 ? (
        <EmptyState message="No files added this session" />
      ) : (
        <ul className="space-y-1">
          {filesAddedThisSession.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              {file.filename}
              <span className="ml-auto text-xs text-muted-foreground">
                {file.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
