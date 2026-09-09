import { apiFetch } from "@/lib/api";

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  email: string;
  password: string;
};

export type SignupResponse = {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type CurrentUser = {
  id: string;
  email: string;
  display_name: string | null;
  email_verified: boolean;
  created_at: string;
};

export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}

export function signup(request: SignupRequest): Promise<SignupResponse> {
  return apiFetch<SignupResponse>("/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/users/me");
}

export function verifyEmail(token: string): Promise<void> {
  return apiFetch<void>(
    `/auth/verify-email?token=${encodeURIComponent(token)}`,
  );
}

/*
 * GET /auth/google is a real HTTP redirect to Google's consent screen.
 * It must never be called through fetch()/apiFetch() — the browser itself
 * has to navigate there.
 */
export function navigateToGoogleAuth(): void {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

  window.location.href = `${apiBaseUrl}/auth/google`;
}
