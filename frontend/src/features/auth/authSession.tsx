import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ApiClient, createApiClient } from "../../lib/apiClient";
import { loginPathWithRedirect, roleHomePath, safeRedirectForRole } from "./redirects";
import { UserAccount } from "./types";

const SESSION_TOKEN_KEY = "ipb-srh-session-token";

type AuthStatus = "loading" | "unauthenticated" | "authenticated";

type AuthContextValue = {
  apiClient: ApiClient;
  currentUser: UserAccount | null;
  establishSession: (token: string, redirectTarget?: string | null) => Promise<void>;
  logout: () => void;
  status: AuthStatus;
  token: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  client?: ApiClient;
  storage?: Storage;
};

export function AuthProvider({ children, client, storage = window.sessionStorage }: AuthProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setTokenState] = useState<string | null>(() => storage.getItem(SESSION_TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (storage.getItem(SESSION_TOKEN_KEY) ? "loading" : "unauthenticated"));
  const tokenRef = useRef(token);
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const clearSession = useCallback(() => {
    tokenRef.current = null;
    setTokenState(null);
    setCurrentUser(null);
    setStatus("unauthenticated");
    storage.removeItem(SESSION_TOKEN_KEY);
  }, [storage]);

  const expireSession = useCallback(() => {
    const currentPath = `${locationRef.current.pathname}${locationRef.current.search}`;
    clearSession();
    navigate(`/login?expired=1&redirect=${encodeURIComponent(currentPath)}`, { replace: true });
  }, [clearSession, navigate]);

  const apiClient = useMemo(
    () =>
      client ??
      createApiClient({
        getToken: () => tokenRef.current,
        onUnauthorized: expireSession,
      }),
    [client, expireSession],
  );

  const setToken = useCallback(
    (nextToken: string) => {
      tokenRef.current = nextToken;
      setTokenState(nextToken);
      storage.setItem(SESSION_TOKEN_KEY, nextToken);
    },
    [storage],
  );

  const loadCurrentUser = useCallback(async () => {
    return apiClient.request<UserAccount>("/auth/me");
  }, [apiClient]);

  useEffect(() => {
    if (!tokenRef.current) {
      return;
    }

    let isActive = true;
    setStatus("loading");

    loadCurrentUser()
      .then((user) => {
        if (!isActive) {
          return;
        }
        setCurrentUser(user);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!isActive) {
          return;
        }
        clearSession();
        navigate("/login", { replace: true });
      });

    return () => {
      isActive = false;
    };
  }, [clearSession, loadCurrentUser, navigate]);

  const establishSession = useCallback(
    async (nextToken: string, redirectTarget = new URLSearchParams(location.search).get("redirect")) => {
      setToken(nextToken);
      setStatus("loading");
      try {
        const user = await loadCurrentUser();
        const destination = safeRedirectForRole(redirectTarget, user.role) ?? roleHomePath(user.role);
        navigate(destination, { replace: true });
        setCurrentUser(user);
        setStatus("authenticated");
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [clearSession, loadCurrentUser, location.search, navigate, setToken],
  );

  const logout = useCallback(() => {
    clearSession();
    navigate("/login", { replace: true });
  }, [clearSession, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      apiClient,
      currentUser,
      establishSession,
      logout,
      status,
      token,
    }),
    [apiClient, currentUser, establishSession, logout, status, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export function RequirePublic() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === "loading") {
    return <AuthLoading />;
  }

  if (auth.currentUser) {
    const redirectTarget = new URLSearchParams(location.search).get("redirect");
    return <Navigate replace to={safeRedirectForRole(redirectTarget, auth.currentUser.role) ?? roleHomePath(auth.currentUser.role)} />;
  }

  return <Outlet />;
}

export function RequireStudent() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === "loading") {
    return <AuthLoading />;
  }

  if (!auth.currentUser) {
    return <Navigate replace to={loginPathWithRedirect(`${location.pathname}${location.search}`)} />;
  }

  if (auth.currentUser.role !== "student") {
    return <Navigate replace to={roleHomePath(auth.currentUser.role)} />;
  }

  return <Outlet />;
}

function AuthLoading() {
  return (
    <div className="flex min-h-48 items-center justify-center text-body-md text-on-surface-variant" role="status">
      Memvalidasi sesi...
    </div>
  );
}
