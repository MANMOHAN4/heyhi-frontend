/*
 * Matches heyhi-common's shared Page<T> record exactly
 * (BACKEND_API_REFERENCE.md §3c):
 *   public record Page<T>(List<T> items, String nextCursor) {}
 * Wire: { "items": [...], "next_cursor": "<string>" | null }
 *
 * This is cursor/keyset pagination, never page-number: pass the returned
 * next_cursor back as the `after` query param to fetch the next page.
 * There is no total count and no page number anywhere in this API - build
 * infinite-scroll / "Load more", not "Page 3 of 12".
 */
export interface Page<T> {
  items: T[];
  next_cursor: string | null;
}
