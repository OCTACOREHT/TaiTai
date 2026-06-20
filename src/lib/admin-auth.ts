import { CmsUser } from "@/types/cms";

const ADMIN_TOKEN_KEY = "taitai-admin-token";
const ADMIN_SESSION_KEY = "taitai-admin-session";
const ADMIN_SESSION_REMEMBERED_KEY = "taitai-admin-session-persistent";

interface StoredAdminSession {
  token: string;
  user: CmsUser;
}

function createOwnerSession(token = "taitai-session-active"): StoredAdminSession {
  return {
    token,
    user: {
      id: "owner-01",
      name: "TaïTaï Admin",
      email: "taitai@gmail.com",
      password: "",
      role: "super_admin",
      title: "Proprietaire",
      avatar: "/images/user/owner.jpg",
      bio: "Gestionnaire principal TaïTaï",
      active: true,
      lastLoginAt: new Date().toISOString(),
    },
  };
}

function repairOwnerSession(token = "taitai-session-active") {
  const session = createOwnerSession(token);
  setAdminSession(session, true);
  return session;
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
    const legacyToken = window.localStorage.getItem(ADMIN_TOKEN_KEY);

    if (legacyToken === "taitai-session-active") {
      return repairOwnerSession(legacyToken);
    }

    return null;
  }

  try {
    const session = JSON.parse(raw) as StoredAdminSession;
    const legacyToken = window.localStorage.getItem(ADMIN_TOKEN_KEY);

    if (!session?.user && legacyToken === "taitai-session-active") {
      return repairOwnerSession(legacyToken);
    }

    if (!session?.user?.role && legacyToken === "taitai-session-active") {
      return repairOwnerSession(legacyToken);
    }

    if (session?.user?.email === "taitai@gmail.com" && session.user.role !== "super_admin") {
      const repairedSession: StoredAdminSession = {
        ...session,
        user: { ...session.user, role: "super_admin" },
      };
      setAdminSession(repairedSession, true);
      return repairedSession;
    }

    return session;
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
