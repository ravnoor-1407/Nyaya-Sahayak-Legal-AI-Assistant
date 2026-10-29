const TOKEN_KEY = "ns-token";
const USER_KEY = "ns-user";
const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL.replace(/\/$/, "") : "";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch (e) {
    return "";
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    /* ignore */
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(u) {
  try {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  } catch (e) {
    /* ignore */
  }
}

function headers(extra, skipAuth) {
  const h = { ...(extra || {}) };
  const t = getToken();
  if (t && !skipAuth) h.Authorization = "Bearer " + t;
  return h;
}

export async function getJSON(path) {
  const r = await fetch(API_BASE + path, { headers: headers() });
  if (!r.ok) {
    const err = new Error("HTTP " + r.status);
    err.status = r.status;
    throw err;
  }
  return r.json();
}

export async function chat(question, lang) {
  // Questions from the Home page live preview are not saved to an account.
  const preview =
    typeof window !== "undefined" && window.location.pathname === "/";
  const r = await fetch(API_BASE + "/api/chat", {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }, preview),
    body: JSON.stringify({ question, lang }),
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

export function sendFeedback(up) {
  return fetch(API_BASE + "/api/feedback", {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ up }),
  }).catch(() => {});
}

async function post(path, body) {
  const r = await fetch(API_BASE + path, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  let data = {};
  try {
    data = await r.json();
  } catch (e) {
    /* ignore */
  }
  if (!r.ok) {
    const err = new Error("HTTP " + r.status);
    err.status = r.status;
    err.code = typeof data.detail === "string" ? data.detail : "error";
    throw err;
  }
  return data;
}

export const apiRegister = (name, email, password) =>
  post("/api/auth/register", { name, email, password });
export const apiLogin = (email, password, name) =>
  post("/api/auth/login", { email, password, name });
export const apiMe = () => getJSON("/api/auth/me");
export const apiLogout = () =>
  fetch(API_BASE + "/api/auth/logout", { method: "POST", headers: headers() }).catch(() => {});

// Real-time Email Verification & Google Auth
export const apiSendEmailOtp = (email, name) =>
  post("/api/auth/email-otp/send", { email, name });
export const apiVerifyEmailOtp = (email, code, name) =>
  post("/api/auth/email-otp/verify", { email, code, name });
export const apiGoogleAuth = (credential, email, name) =>
  post("/api/auth/google", { credential, email, name });
