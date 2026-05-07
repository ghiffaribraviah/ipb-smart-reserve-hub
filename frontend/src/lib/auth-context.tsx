import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AuthSession } from "./auth-session";
import { apiGet, apiPost } from "./api-client";
import type { TokenResponse, User } from "./types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = AuthSession.getToken();
    if (token) {
      apiGet<User>("/auth/me")
        .then(setUser)
        .catch(() => {
          AuthSession.clear();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { access_token } = await apiPost<TokenResponse>("/auth/login", {
      email,
      password,
    });
    AuthSession.store(access_token);
    const me = await apiGet<User>("/auth/me");
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    AuthSession.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
