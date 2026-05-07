import { AuthSession } from "./auth-session";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export interface ApiError {
  status: number;
  detail: string;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = AuthSession.getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error: ApiError = {
      status: response.status,
      detail: errorBody.detail ?? "Terjadi kesalahan.",
    };
    throw error;
  }

  return response.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {};

  const token = AuthSession.getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error: ApiError = {
      status: response.status,
      detail: errorBody.detail ?? "Terjadi kesalahan.",
    };
    throw error;
  }

  return response.json();
}
