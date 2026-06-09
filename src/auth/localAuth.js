const SESSION_KEY = "wh_session";

const listeners = new Set();

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function notify(user) {
  listeners.forEach((cb) => cb(user));
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  notify(user);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("userEmail");
  notify(null);
}

/** Drop-in shape for pages that used Firebase `auth` */
export const auth = {
  onAuthStateChanged(callback) {
    callback(readSession());
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  signOut() {
    clearSession();
    return Promise.resolve();
  },
};

export async function registerUser(email, password) {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Registration failed.");
  }
  return data;
}

export async function loginUser(email, password) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Login failed.");
  }
  setSession(data.user);
  return data.user;
}
