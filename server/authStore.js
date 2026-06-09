/** Shared in-memory user cache (dev server process) */
export const users = new Map();

export function registerUser(email, password) {
  const key = email.trim().toLowerCase();
  if (!key || !password) {
    return { ok: false, status: 400, error: "Email and password are required." };
  }
  if (password.length < 6) {
    return { ok: false, status: 400, error: "Password must be at least 6 characters." };
  }
  if (users.has(key)) {
    return { ok: false, status: 409, error: "This email is already registered." };
  }
  users.set(key, { email: key, password, createdAt: Date.now() });
  return { ok: true, status: 201, body: { message: "Account created. You can log in now." } };
}

export function loginUser(email, password) {
  const key = email.trim().toLowerCase();
  const user = users.get(key);
  if (!user || user.password !== password) {
    return { ok: false, status: 401, error: "Invalid email or password." };
  }
  return { ok: true, status: 200, body: { user: { email: user.email } } };
}
