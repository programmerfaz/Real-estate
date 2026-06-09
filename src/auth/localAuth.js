const SESSION_KEY = "wh_session";
const LOCAL_USERS_KEY = "wh_registered_users";

const listeners = new Set();

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
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

function localRegister(email, password) {
  const key = email.trim().toLowerCase();
  if (!key || !password) {
    throw new Error("Email and password are required.");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const users = readLocalUsers();
  if (users[key]) {
    throw new Error("This email is already registered.");
  }
  users[key] = { email: key, password };
  writeLocalUsers(users);
  return { message: "Account created. You can log in now." };
}

function localLogin(email, password) {
  const key = email.trim().toLowerCase();
  const users = readLocalUsers();
  const user = users[key];
  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }
  return { email: user.email };
}

export async function registerUser(email, password) {
  try {
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
  } catch (err) {
    if (err instanceof TypeError) {
      return localRegister(email, password);
    }
    throw err;
  }
}

export async function loginUser(email, password) {
  try {
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
  } catch (err) {
    if (err instanceof TypeError) {
      const user = localLogin(email, password);
      setSession(user);
      return user;
    }
    throw err;
  }
}
