import { create } from "zustand";

export type AuthUser = {
  id: string;
  email: string;
  display_name: string | null;
  email_verified: boolean;
  created_at: string;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;

  /*
   * undefined = admin status has not been checked yet.
   * true = an admin endpoint was successfully reached.
   * false = admin endpoint returned 404 / access was denied.
   */
  isAdmin: boolean | undefined;

  login: (accessToken: string) => void;

  /*
   * Compatibility alias used by existing components.
   */
  storeLogin: (accessToken: string) => void;

  setUser: (user: AuthUser | null) => void;
  setIsAdmin: (isAdmin: boolean | undefined) => void;

  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => {
  const saveAccessToken = (accessToken: string) => {
    set({
      accessToken,
      user: null,
      isAdmin: undefined,
    });
  };

  return {
    accessToken: null,
    user: null,
    isAdmin: undefined,

    login: saveAccessToken,
    storeLogin: saveAccessToken,

    setUser: (user) => {
      set({ user });
    },

    setIsAdmin: (isAdmin) => {
      set({ isAdmin });
    },

    logout: () => {
      set({
        accessToken: null,
        user: null,
        isAdmin: undefined,
      });
    },
  };
});
