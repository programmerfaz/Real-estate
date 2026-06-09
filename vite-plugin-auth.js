import { createAuthApp } from "./server/authApp.js";

/** Runs auth API on the same port as Vite — no separate server process needed */
export function localAuthPlugin() {
  const authApp = createAuthApp();
  return {
    name: "local-auth-api",
    configureServer(server) {
      server.middlewares.use(authApp);
    },
    configurePreviewServer(server) {
      server.middlewares.use(authApp);
    },
  };
}
