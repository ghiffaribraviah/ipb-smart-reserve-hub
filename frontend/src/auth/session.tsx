import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiRequest, setAuthTokenProvider, setUnauthorizedHandler } from "../api/http";

export const SESSION_TOKEN_KEY = "ipb-srh-token";

export type UserRole = "student" | "staff" | "super_admin";

export type CurrentUser = {
  academic_profile?: {
    degree: string | null;
    entry_year: number | null;
    faculty: string | null;
    program_studi: string | null;
  } | null;
  email: string;
  full_name: string;
  id: number | string;
  is_active: boolean;
  nim?: string | null;
  phone?: string | null;
  role: UserRole;
};

type LoginResponse = {
  access_token: string;
};

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  login: (email: string, password: string) => Promise<CurrentUser>;
  logout: (reason?: string) => void;
  sessionEndReason: string | null;
  status: AuthStatus;
  token: string | null;
  user: CurrentUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const e2eAuthBypass =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_E2E_AUTH_BYPASS ===
  "1";

const roleLanding: Record<UserRole, string> = {
  staff: "/staff",
  student: "/student",
  super_admin: "/super-admin",
};

function isActiveUser(user: CurrentUser) {
  return user.is_active === true;
}

function safeInternalRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

function loginRedirect(location: ReturnType<typeof useLocation>, reason?: string) {
  const params = new URLSearchParams();
  const redirect = `${location.pathname}${location.search}`;

  if (safeInternalRedirect(redirect)) {
    params.set("redirect", redirect);
  }

  if (reason) {
    params.set("reason", reason);
  }

  return `/login?${params.toString()}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => sessionStorage.getItem(SESSION_TOKEN_KEY));
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [sessionEndReason, setSessionEndReason] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    sessionStorage.getItem(SESSION_TOKEN_KEY) ? "checking" : "unauthenticated",
  );

  const clearSession = useCallback((reason: string | null = null) => {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    setTokenState(null);
    setUser(null);
    setSessionEndReason(reason);
    setStatus("unauthenticated");
  }, []);

  const storeToken = useCallback((nextToken: string) => {
    sessionStorage.setItem(SESSION_TOKEN_KEY, nextToken);
    setTokenState(nextToken);
    setSessionEndReason(null);
    setAuthTokenProvider(() => nextToken);
  }, []);

  useEffect(() => {
    setAuthTokenProvider(() => token);
  }, [token]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  useEffect(() => {
    if (!token) {
      setStatus("unauthenticated");
      setUser(null);
      return;
    }

    if (user && status === "authenticated") {
      return;
    }

    let cancelled = false;
    setStatus("checking");

    apiRequest<CurrentUser>("/auth/me")
      .then((currentUser) => {
        if (cancelled) {
          return;
        }

        if (!isActiveUser(currentUser)) {
          clearSession("expired");
          return;
        }

        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) {
          clearSession("expired");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearSession, status, token, user]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiRequest<LoginResponse>("/auth/login", {
        body: { email, password },
        method: "POST",
      });

      storeToken(response.access_token);
      const currentUser = await apiRequest<CurrentUser>("/auth/me");

      if (!isActiveUser(currentUser)) {
        clearSession("expired");
        throw new Error("Akun tidak aktif.");
      }

      setUser(currentUser);
      setStatus("authenticated");
      return currentUser;
    },
    [clearSession, storeToken],
  );

  const logout = useCallback(
    (_reason?: string) => {
      clearSession();
    },
    [clearSession],
  );

  const value = useMemo(
    () => ({ login, logout, sessionEndReason, status, token, user }),
    [login, logout, sessionEndReason, status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export function getRoleLanding(role: UserRole) {
  return roleLanding[role];
}

export function getSafeRedirectTarget(value: string | null, fallback: string) {
  return safeInternalRedirect(value) ?? fallback;
}

export function RequireRole({ allow, children }: { allow: UserRole[]; children: ReactNode }) {
  const auth = useAuth();
  const location = useLocation();

  if (e2eAuthBypass && allow.length > 0) {
    return children;
  }

  if (auth.status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6 text-sm font-semibold text-[#475569]">
        Memeriksa sesi...
      </div>
    );
  }

  if (auth.status !== "authenticated" || !auth.user) {
    return <Navigate replace to={loginRedirect(location, auth.sessionEndReason ?? undefined)} />;
  }

  if (!allow.includes(auth.user.role)) {
    return <Navigate replace to={roleLanding[auth.user.role]} />;
  }

  return children;
}
