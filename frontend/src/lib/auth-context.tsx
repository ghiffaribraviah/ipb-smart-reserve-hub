import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AuthSession } from "./auth-session";
import { apiGet, apiPost } from "./api-client";
import type { TokenResponse, User } from "./types";
import { AuthContext } from "./use-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(AuthSession.getToken()));
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
