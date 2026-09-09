/**
 * features/auth/useAuthStore.ts
 *
 * Zustand store for auth/session state. Deliberately NOT persisted to
 * localStorage (see 01-backend-reference.md "Token storage recommendation"):
 * the token lives in memory only, to reduce XSS token-theft exposure. This
 * means a full page reload loses the session - acceptable given there is no
 * /auth/refresh endpoint to silently re-establish it anyway.
 *
 * isAdmin is nullable: null = not yet checked. It is populated by
 * useAdminCheck() after a successful login by probing an admin-only
 * endpoint, since no user-facing API exposes an `is_admin` field directly.
 */
import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  display_name: string | null;
  email_verified: boolean;
  created_at: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAdmin: boolean | null;
  login: (accessToken: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAdmin: null,

  login: (accessToken, user) => set({ accessToken, user, isAdmin: null }), // isAdmin re-checked fresh on each new login

  setUser: (user) => set({ user }),

  setIsAdmin: (isAdmin) => set({ isAdmin }),

  logout: () => set({ accessToken: null, user: null, isAdmin: null }),
}));

/**
 * Non-hook accessor for use inside lib/apiClient.ts, which is a plain
 * module (not a React component) but still needs the current token and
 * needs to trigger logout on a 401. Zustand stores expose getState/setState
 * outside of React for exactly this reason.
 */
export const authStore = {
  getToken: () => useAuthStore.getState().accessToken,
  logout: () => useAuthStore.getState().logout(),
};
