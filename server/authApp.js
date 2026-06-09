import express from "express";
import { registerUser, loginUser, users } from "./authStore.js";

/** Express app mounted on Vite dev/preview server (same port as the UI) */
export function createAuthApp() {
  const app = express();
  app.use(express.json());

  app.post("/api/register", (req, res) => {
    const result = registerUser(
      String(req.body?.email || ""),
      String(req.body?.password || "")
    );
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json(result.body);
  });

  app.post("/api/login", (req, res) => {
    const result = loginUser(
      String(req.body?.email || ""),
      String(req.body?.password || "")
    );
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json(result.body);
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, users: users.size });
  });

  return app;
}
