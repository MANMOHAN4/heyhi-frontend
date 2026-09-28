import { apiFetch } from "@/lib/apiClient";

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
    body: request,
    /*
     * Login is the one call that must never trigger the 401 -> logout
     * pipeline: a wrong-password 401 here is an expected form-validation
     * result, not an existing session expiring.
     */
    skipAuth: true,
  });
}

export function signup(request: SignupRequest): Promise<SignupResponse> {
  return apiFetch<SignupResponse>("/auth/signup", {
    method: "POST",
    body: request,
    skipAuth: true,
  });
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/users/me");
}

export function verifyEmail(token: string): Promise<void> {
  return apiFetch<void>(
    `/auth/verify-email?token=${encodeURIComponent(token)}`,
    { skipAuth: true },
  );
}

export function resendVerificationEmail(): Promise<void> {
  return apiFetch<void>("/auth/resend-verification", {
    method: "POST",
  });
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
