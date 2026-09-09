import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { configureApiAuth } from "./lib/api";
import { queryClient } from "./lib/queryClient";
import { useAuthStore } from "./features/auth/useAuthStore";

import "./index.css";
import "./App.css";

configureApiAuth(() => {
  return useAuthStore.getState().accessToken;
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
