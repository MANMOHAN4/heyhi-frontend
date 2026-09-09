/**
 * features/conversation/types.ts
 * Field shapes exactly as documented in 01-backend-reference.md
 * "Database Schema / Entity Models" (Thread, Turn, Source, Citation) and
 * 02-api-reference.md (request/response bodies, SSE event payloads).
 */
import type { FocusMode, ModelId } from "../../../lib/constants";

export interface ThreadSummary {
  id: string;
  title: string;
  updated_at: string; // ISO 8601
}

export interface Thread {
  id: string;
  title: string;
  focus_mode: FocusMode;
  turns: Turn[];
  updated_at: string;
}

export interface Turn {
  query_text: string;
  answer_text: string;
  sources: Source[];
  citations: Citation[];
  follow_ups: string[]; // 0-4 AI-generated suggestions
  created_at: string;
}

export interface Source {
  id: string; // e.g. "src_1" - matches citation marker numbers
  url: string; // real https:// URL, or "file://{document_id}#chunk-{n}"
  title: string;
  domain: string;
  snippet: string;
}

export interface Citation {
  marker_index: number; // the [n] number as it appears in answer_text
  source_id: string; // matches a Source.id
}

export interface CreateThreadRequest {
  query: string; // required, max 2000 chars
  focus_mode?: FocusMode; // defaults to WEB if omitted
  file_ids?: string[];
  space_id?: string;
  model?: ModelId | string;
}

export interface ContinueThreadRequest {
  query: string; // max 2000 chars - focus_mode/file_ids/space_id/model NOT accepted here
}

export interface ProSearchRequest {
  query: string;
  focus_mode?: FocusMode;
}

export interface RenameThreadRequest {
  title: string;
}

export interface ShareThreadResponse {
  token: string;
  url: string;
}

export interface SharedThreadTurn {
  query_text: string;
  answer_text: string;
  sources: Source[];
  citations: Citation[];
  created_at: string;
}

export interface SharedThreadResponse {
  title: string;
  turns: SharedThreadTurn[];
}

/**
 * Local, client-side representation of a turn while it is actively
 * streaming. `streamId` is a frontend-only, client-generated unique token
 * (NOT from the backend) identifying this specific run of runStream() -
 * its sole purpose is to make "has this completed stream already been
 * committed to persistedTurns" idempotent/checkable in ThreadPage, since
 * `isDone` alone is a boolean that stays true and cannot distinguish
 * "already committed" from "just completed, not yet committed" across
 * repeated effect firings (e.g. React StrictMode's dev double-invoke).
 */
export interface StreamingTurnState {
  streamId: string;
  queryText: string;
  answerText: string; // accumulated from `token` events
  sources: Source[] | null; // null until `sources` event arrives
  citations: Citation[] | null;
  followUps: string[] | null;
  steps: string[]; // Pro Search `step` event descriptions, in order
  isDone: boolean;
  isProSearch: boolean;
}

export interface StreamHandlers {
  onToken: (text: string) => void;
  onSources: (sources: Source[]) => void;
  onCitations: (citations: Citation[]) => void;
  onFollowUps: (followUps: string[]) => void;
  onStep: (description: string) => void;
  onDone: () => void;
}
