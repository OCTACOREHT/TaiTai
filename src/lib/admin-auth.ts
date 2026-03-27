import { CmsUser } from "@/types/cms";

const ADMIN_TOKEN_KEY = "fctoro-admin-token";
const ADMIN_SESSION_KEY = "fctoro-admin-session";
const ADMIN_SESSION_REMEMBERED_KEY = "fctoro-admin-session-persistent";

interface StoredAdminSession {
  token: string;
  user: CmsUser;
}

export function getAdminToken() {
  return getAdminSession()?.token || null;
}

export function setAdminToken(token: string) {
  const session = getAdminSession();
  if (!session) {
    return;
  }

  setAdminSession({ ...session, token }, true);
}

export function clearAdminToken() {
  clearAdminSession();
}

export function getAdminSession(): StoredAdminSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw =
    window.sessionStorage.getItem(ADMIN_SESSION_KEY) ||
    window.localStorage.getItem(ADMIN_SESSION_REMEMBERED_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAdminSession;
  } catch {
    return null;
  }
}

export function setAdminSession(session: StoredAdminSession, remember: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.localStorage.removeItem(ADMIN_SESSION_REMEMBERED_KEY);
  window.localStorage.setItem(ADMIN_TOKEN_KEY, session.token);

  const serialized = JSON.stringify(session);

  if (remember) {
    window.localStorage.setItem(ADMIN_SESSION_REMEMBERED_KEY, serialized);
    return;
  }

  window.sessionStorage.setItem(ADMIN_SESSION_KEY, serialized);
}

export function clearAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.localStorage.removeItem(ADMIN_SESSION_REMEMBERED_KEY);
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}
