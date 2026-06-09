import express from "express";

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

/** In-memory user cache — cleared when the server restarts */
const users = new Map();

app.use(express.json());

app.post("/api/register", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  if (users.has(email)) {
    return res.status(409).json({ error: "This email is already registered." });
  }

  users.set(email, { email, password, createdAt: Date.now() });
  return res.status(201).json({ message: "Account created. You can log in now." });
});

app.post("/api/login", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  return res.json({ user: { email: user.email } });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, users: users.size });
});

app.listen(PORT, () => {
  console.log(`Auth server running at http://localhost:${PORT}`);
});
