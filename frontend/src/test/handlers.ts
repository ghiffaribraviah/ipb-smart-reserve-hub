import { http, HttpResponse } from "msw";

const API_BASE = "http://localhost:8000";

export const handlers = [
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
    };

    if (
      body.email === "student@apps.ipb.ac.id" &&
      body.password === "password123"
    ) {
      return HttpResponse.json({
        access_token: "fake-token-123",
        token_type: "bearer",
      });
    }

    return HttpResponse.json(
      { detail: "Email atau password salah." },
      { status: 401 },
    );
  }),

  http.get(`${API_BASE}/auth/me`, ({ request }) => {
    const auth = request.headers.get("Authorization");
    if (auth === "Bearer fake-token-123") {
      return HttpResponse.json({
        id: "user-1",
        email: "student@apps.ipb.ac.id",
        full_name: "Test Student",
        role: "student",
        is_active: true,
      });
    }

    return HttpResponse.json(
      { detail: "Autentikasi diperlukan." },
      { status: 401 },
    );
  }),
];
