export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8080";

export const APP_NAME = "heyHi";

export const PASSWORD_MIN_LENGTH = 10;
export const QUERY_MAX_LENGTH = 2000;
export const SPACE_INSTRUCTIONS_MAX_LENGTH = 4000;

export const FILE_MAX_SIZE_BYTES = 25 * 1024 * 1024;

export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export const SUPPORTED_FILE_EXTENSIONS = [".pdf", ".docx", ".txt"] as const;

export const FOCUS_MODES = [
  "WEB",
  "ACADEMIC",
  "MATH",
  "WRITING",
  "VIDEO",
  "SOCIAL",
] as const;

export type FocusMode = (typeof FOCUS_MODES)[number];

export const FOCUS_MODE_DETAILS: Record<
  FocusMode,
  {
    label: string;
    shortLabel: string;
    description: string;
  }
> = {
  WEB: {
    label: "Web",
    shortLabel: "Web",
    description: "Search the live web for current, cited answers.",
  },
  ACADEMIC: {
    label: "Academic",
    shortLabel: "Academic",
    description: "Search scholarly papers and technical sources.",
  },
  MATH: {
    label: "Math",
    shortLabel: "Math",
    description: "Solve calculations and explain mathematical concepts.",
  },
  WRITING: {
    label: "Writing",
    shortLabel: "Writing",
    description: "Write, revise, brainstorm, and create without web sources.",
  },
  VIDEO: {
    label: "Video",
    shortLabel: "Video",
    description: "Search for video-focused results and explanations.",
  },
  SOCIAL: {
    label: "Social",
    shortLabel: "Social",
    description: "Search social platforms and public discussions.",
  },
};

/*
 * Known temporary frontend model catalog.
 * The backend currently does not expose GET /models, so replace this
 * with a server-provided catalog once that endpoint exists.
 */
export const MODEL_IDS = [
  "auto",
  "groq-llama-3.3-70b",
  "gemini-flash-latest",
] as const;

export type ModelId = (typeof MODEL_IDS)[number];

export const MODEL_LABELS: Record<ModelId, string> = {
  auto: "Auto",
  "groq-llama-3.3-70b": "Llama 3.3 70B",
  "gemini-flash-latest": "Gemini Flash",
};

export const SPACE_ROLES = ["OWNER", "EDITOR", "VIEWER"] as const;

export type SpaceRole = (typeof SPACE_ROLES)[number];

export const ROLE_RANK: Record<SpaceRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  OWNER: 2,
};

export const SUBSCRIPTION_PLANS = ["FREE", "PRO", "ENTERPRISE"] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIPTION_STATUSES = [
  "ACTIVE",
  "CANCELED",
  "PAST_DUE",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const GUEST_THREAD_STORAGE_KEY = "heyhi:guest-thread-id";
export const THEME_STORAGE_KEY = "heyhi:theme";

export const DEFAULT_PRO_SEARCH_DAILY_LIMIT = 10;

export const QUERY_KEYS = {
  profile: ["profile", "me"] as const,
  subscription: ["billing", "subscription"] as const,
  invoices: ["billing", "invoices"] as const,
  threads: ["threads"] as const,
  spaces: ["spaces"] as const,
  adminUsers: ["admin", "users"] as const,
  adminAuditLog: ["admin", "audit-log"] as const,
  adminModeration: ["admin", "moderation-queue"] as const,
  adminHealth: ["admin", "health"] as const,
} as const;
