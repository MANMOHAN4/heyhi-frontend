import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/*
 * localStorage key for the persisted auth slice. Namespaced like the rest of
 * the app's browser storage (cf. GUEST_THREAD_STORAGE_KEY in lib/constants).
 */
const AUTH_STORAGE_KEY = "heyhi:auth";

export type AuthUser = {
  id: string;
  email: string;
  display_name: string | null;
  email_verified: boolean;
  created_at: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms when the access token expires, derived from expires_in. */
  accessTokenExpiresAt: number;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;
  user: AuthUser | null;

  /*
   * undefined = admin status has not been checked yet.
   * true = an admin endpoint was successfully reached.
   * false = admin endpoint returned 404 / access was denied.
   */
  isAdmin: boolean | undefined;

  /*
   * expiresIn is in SECONDS, matching the backend's AuthTokensResponse
   * (access_token TTL 900s / 15min, refresh_token TTL 30 days - see
   * BACKEND_API_REFERENCE.md §4). Stored as an absolute epoch-ms deadline
   * so the proactive-refresh check doesn't need to know when login happened.
   */
  login: (
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ) => void;

  /*
   * Compatibility alias used by existing components that only have an
   * access token to store (e.g. mid-flow before the full token pair is
   * known). Prefer login() wherever both tokens are available.
   */
  storeLogin: (accessToken: string) => void;

  /*
   * Called after a successful POST /auth/refresh, which returns a fully
   * rotated pair (new access AND new refresh - the old refresh token is not
   * reusable). Does not touch `user` or `isAdmin`, unlike login()/logout(),
   * since refreshing mid-session shouldn't reset identity we already know.
   */
  setTokens: (
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ) => void;

  setUser: (user: AuthUser | null) => void;
  setIsAdmin: (isAdmin: boolean | undefined) => void;

  logout: () => void;
};

function expiresAtFromNow(expiresInSeconds: number): number {
  return Date.now() + expiresInSeconds * 1000;
}

/*
 * Tokens persist to localStorage so a page reload keeps the user signed in -
 * ProtectedRoute gates purely on accessToken, so without persistence every
 * refresh bounced the user to /login. The persisted access token may already
 * be expired on rehydrate; apiClient's proactive/reactive refresh handles that
 * from the persisted refreshToken + accessTokenExpiresAt. logout() resets the
 * store and persist mirrors that cleared state straight back to localStorage.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      const saveTokens = ({
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
      }: AuthTokens) => {
        set({
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
        });
      };

      return {
        accessToken: null,
        refreshToken: null,
        accessTokenExpiresAt: null,
        user: null,
        isAdmin: undefined,

        login: (accessToken, refreshToken, expiresIn) => {
          saveTokens({
            accessToken,
            refreshToken,
            accessTokenExpiresAt: expiresAtFromNow(expiresIn),
          });
          set({ user: null, isAdmin: undefined });
        },

        storeLogin: (accessToken) => {
          set({ accessToken, user: null, isAdmin: undefined });
        },

        setTokens: (accessToken, refreshToken, expiresIn) => {
          saveTokens({
            accessToken,
            refreshToken,
            accessTokenExpiresAt: expiresAtFromNow(expiresIn),
          });
        },

        setUser: (user) => {
          set({ user });
        },

        setIsAdmin: (isAdmin) => {
          set({ isAdmin });
        },

        logout: () => {
          set({
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresAt: null,
            user: null,
            isAdmin: undefined,
          });
        },
      };
    },
    {
      name: AUTH_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      /*
       * partialize controls EXACTLY which fields are written to localStorage.
       * Whatever is returned here rehydrates on reload (merged over the initial
       * state above); anything omitted falls back to its initial value.
       *
       * We persist the token trio - so ProtectedRoute stays satisfied and
       * apiClient can refresh an expired access token on reload - plus `user`,
       * because nothing re-fetches /users/me on boot, so omitting it would leave
       * a "logged in but null user" state. We deliberately DO NOT persist
       * isAdmin: persist identity, re-derive authority. It's a privilege flag
       * the backend enforces on every endpoint via JWT regardless, so we let it
       * reset to `undefined` (unchecked) and be re-proven against the server.
       */
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        user: state.user,
      }),
    },
  ),
);
