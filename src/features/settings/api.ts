import { apiFetch } from "@/lib/apiClient";
import type { UpdateProfileRequest, User } from "@/features/auth/types";

/*
 * Backend contract:
 *
 * GET /users/me
 * - Auth required
 * - Returns the current user's public profile.
 *
 * PATCH /users/me
 * - Auth required
 * - Body: { display_name: string }
 * - Returns the updated profile.
 *
 * DELETE /users/me
 * - Auth required
 * - Returns 202 Accepted.
 * - Treat the account as deleted immediately on the frontend:
 *   clear in-memory authentication state and redirect to /login.
 */

export function getMyProfile(): Promise<User> {
  return apiFetch<User>("/users/me", {
    method: "GET",
  });
}

export function updateMyProfile(payload: UpdateProfileRequest): Promise<User> {
  return apiFetch<User>("/users/me", {
    method: "PATCH",
    body: payload,
  });
}

export function deleteMyAccount(): Promise<void> {
  return apiFetch<void>("/users/me", {
    method: "DELETE",
  });
}
