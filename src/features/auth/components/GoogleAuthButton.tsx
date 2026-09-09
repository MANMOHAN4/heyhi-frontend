/**
 * features/auth/components/GoogleAuthButton.tsx
 * Shared between /signup and /login. Performs a full browser navigation,
 * never a fetch/AJAX call (see 01-backend-reference.md "Google OAuth").
 */
import { navigateToGoogleAuth } from "../api";

export function GoogleAuthButton() {
  return (
    <button
      type="button"
      onClick={navigateToGoogleAuth}
      className="w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
    >
      Sign in with Google
    </button>
  );
}
