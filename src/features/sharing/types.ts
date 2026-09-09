import type { Citation, Source } from "@/features/conversation/types";

/*
 * Public shared-thread response from:
 *
 * GET /shared/{token}
 *
 * This deliberately does NOT contain:
 * - owner_id
 * - space_id
 * - file_ids
 * - model
 * - focus_mode
 * - follow_ups
 *
 * The backend intentionally keeps the public response privacy-safe.
 */

export interface SharedThreadTurn {
  query_text: string;
  answer_text: string;
  sources: Source[];
  citations: Citation[];
  created_at: string;
}

export interface SharedThread {
  title: string;
  turns: SharedThreadTurn[];
}
