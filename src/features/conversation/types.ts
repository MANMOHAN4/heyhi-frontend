export type FocusMode =
  | "WEB"
  | "ACADEMIC"
  | "MATH"
  | "WRITING"
  | "VIDEO"
  | "SOCIAL";

export type Source = {
  id: string;
  url: string;
  title: string;
  domain: string;
  snippet: string;
};

export type Citation = {
  marker_index: number;
  source_id: string;
};

export type Turn = {
  query_text: string;
  answer_text: string;
  sources: Source[];
  citations: Citation[];
  follow_ups: string[];
  created_at: string;
};

export type ThreadSummary = {
  id: string;
  title: string;
  updated_at: string;
};

export type Thread = {
  id: string;
  title: string;
  focus_mode: FocusMode;
  turns: Turn[];
  updated_at: string;
};

export type CreateThreadRequest = {
  query: string;
  focus_mode?: FocusMode;
  file_ids?: string[];
  space_id?: string;
  model?: string;
};

export type ProSearchRequest = {
  query: string;
  focus_mode: FocusMode;
};

export type ShareThreadResponse = {
  token: string;
  url: string;
};

export type StreamingTurnState = {
  queryText: string;
  answerText: string;
  sources: Source[];
  citations: Citation[];
  followUps: string[];
  steps: string[];
  isProSearch: boolean;
  isDone: boolean;
};

export type StreamHandlers = {
  onToken: (token: string) => void;
  onSources: (sources: Source[]) => void;
  onCitations: (citations: Citation[]) => void;
  onFollowUps: (followUps: string[]) => void;
  onStep: (step: string) => void;
  onDone: () => void;
};
