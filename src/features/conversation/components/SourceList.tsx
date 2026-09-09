/**
 * features/conversation/components/SourceList.tsx
 * Per 03-pages-and-features.md §3: horizontal scroll of source chips below
 * a completed answer. file://... sources indicate "from your uploaded
 * file" rather than a clickable external link (see Source.url shape in
 * 01-backend-reference.md).
 */
import type { Source } from "../types";
import { FileText, ExternalLink } from "lucide-react";

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto py-2" aria-label="Sources">
      {sources.map((source) => {
        const isFileSource = source.url.startsWith("file://");
        const content = (
          <div className="flex w-56 shrink-0 flex-col gap-0.5 rounded-md border bg-muted/40 p-2 text-xs">
            <div className="flex items-center gap-1 font-medium">
              {isFileSource ? <FileText className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
              <span className="truncate">{source.title}</span>
            </div>
            <span className="truncate text-muted-foreground">
              {isFileSource ? "From your uploaded file" : source.domain}
            </span>
          </div>
        );

        return isFileSource ? (
          <div key={source.id}>{content}</div>
        ) : (
          <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        );
      })}
    </div>
  );
}
