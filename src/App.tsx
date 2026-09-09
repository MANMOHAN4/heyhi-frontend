/**
 * src/App.tsx
 * Top-level: wires the router, mounts the global Toaster, and registers
 * the session-expired handler (lib/apiClient.ts's onSessionExpired hook)
 * so a 401 UNAUTHORIZED anywhere redirects to /login with the "session
 * expired" message, per 04-nonfunctional-and-deployment.md "Auth State
 * Management".
 *
 * NOTE: swap <Toaster/> below for shadcn's real `sonner` re-export
 * (`npx shadcn@latest add sonner`) once installed - same import shape.
 */
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { router } from "../routes/router";
import { registerSessionExpiredHandler } from "./lib/apiClient";

export function App() {
  useEffect(() => {
    registerSessionExpiredHandler(() => {
      // A full navigation (not react-router's navigate()) is used here
      // deliberately: apiClient.ts is a plain module outside the router
      // tree, so this listens for the redirect target via a query param
      // read by LoginPage, and a hard navigation is the simplest reliable
      // way to trigger it from non-component code.
      window.location.href = "/login?sessionExpired=1";
    });
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </>
  );
}
