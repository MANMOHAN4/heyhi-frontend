import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { registerSessionExpiredHandler } from "./lib/apiClient";
import { queryClient } from "./lib/queryClient";
import { router } from "./routes/router";

import "./index.css";
import "./App.css";

/*
 * apiClient's apiFetch (and the SSE fetchSse helper, via
 * handleUnauthorizedResponse) call this whenever a request comes back 401.
 * The auth store is already cleared by that point - this just needs to move
 * the user to a route that explains why and lets them log back in.
 *
 * router.navigate is safe to call outside of a React render: RouterProvider
 * subscribes to the same router instance, so this triggers a real navigation
 * even though it's invoked from a plain async function, not a component.
 */
registerSessionExpiredHandler(() => {
  const { pathname, search } = window.location;

  if (pathname === "/login" || pathname === "/signup") {
    return;
  }

  void router.navigate(
    `/login?sessionExpired=1&redirect=${encodeURIComponent(pathname + search)}`,
  );
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Could not find the root element with id 'root'.");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
