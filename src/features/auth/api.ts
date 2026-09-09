/**
 * features/auth/api.ts
 * Thin wrappers around apiFetch for every /auth/** and /users/me endpoint.
 * See 02-api-reference.md "Identity & Auth" for the authoritative contract.
 */
import { apiFetch } from "../../lib/apiClient";
import { API_BASE_URL } from "../../lib/constants";
import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  User,
  UpdateProfileRequest,
} from "./types";

export function signup(payload: SignupRequest): Promise<SignupResponse> {
  return apiFetch<SignupResponse>("/auth/signup", {
    method: "POST",
    body: payload,
    skipAuth: true,
  });
}

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
    skipAuth: true,
  });
}

/**
 * GET /auth/google is a real HTTP redirect (302) to Google's consent screen.
 * Do NOT call this via fetch/AJAX - navigate the full browser window to it.
 * (see 01-backend-reference.md "Google OAuth")
 */
export function navigateToGoogleAuth(): void {
  window.location.href = `${API_BASE_URL}/auth/google`;
}

export function verifyEmail(token: string): Promise<void> {
  return apiFetch<void>(
    `/auth/verify-email?token=${encodeURIComponent(token)}`,
    {
      method: "GET",
      skipAuth: true,
    },
  );
}

export function getMe(): Promise<User> {
  return apiFetch<User>("/users/me", { method: "GET" });
}

export function updateMe(payload: UpdateProfileRequest): Promise<User> {
  return apiFetch<User>("/users/me", { method: "PATCH", body: payload });
}

export function deleteMe(): Promise<void> {
  return apiFetch<void>("/users/me", { method: "DELETE" });
}
