/**
 * lib/constants.ts
 * Central home for backend-imposed limits and enums, so magic numbers/strings
 * don't get scattered/duplicated across features.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE_URL) {
  // Fail loudly in dev rather than silently hitting a relative path.
  // eslint-disable-next-line no-console
  console.error(
    "VITE_API_BASE_URL is not set. Copy .env.example to .env and set it.",
  );
}

export const FOCUS_MODES = [
  "WEB",
  "ACADEMIC",
  "MATH",
  "WRITING",
  "VIDEO",
  "SOCIAL",
] as const;

export type FocusMode = (typeof FOCUS_MODES)[number];

export const FOCUS_MODE_LABELS: Record<FocusMode, string> = {
  WEB: "Web",
  ACADEMIC: "Academic",
  MATH: "Math",
  WRITING: "Writing",
  VIDEO: "Video",
  SOCIAL: "Social",
};

export const FOCUS_MODE_DESCRIPTIONS: Record<FocusMode, string> = {
  WEB: "General live web search.",
  ACADEMIC: "Scholarly papers from arXiv only.",
  MATH: "Computed arithmetic + conceptual math, no web retrieval.",
  WRITING: "Creative writing, no sources cited.",
  VIDEO: "Web search scoped to video platforms.",
  SOCIAL: "Web search scoped to social platforms.",
};

/**
 * KNOWN, TEMPORARY: there is no GET /models endpoint confirmed in the API
 * (see 02-api-reference.md "Models"). These IDs are hardcoded from backend
 * configuration knowledge only. Replace with a live fetch if/when a models
 * endpoint is added - flagged as a real backend gap.
 */
export const MODEL_IDS = [
  "auto",
  "groq-llama-3.3-70b",
  "gemini-flash-latest",
] as const;
export type ModelId = (typeof MODEL_IDS)[number];

export const QUERY_MAX_LENGTH = 2000;
export const SPACE_INSTRUCTIONS_MAX_LENGTH = 4000;
export const FILE_MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export const PASSWORD_MIN_LENGTH = 10;

export type SpaceRole = "OWNER" | "EDITOR" | "VIEWER";
export type SubscriptionPlan = "FREE" | "PRO" | "ENTERPRISE";
export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "PAST_DUE";
