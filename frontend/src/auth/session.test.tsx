import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider, RequireRole, useAuth } from "./session";
import { LoginPage } from "../pages/auth/LoginPage";

const studentUser = {
  email: "student@apps.ipb.ac.id",
  full_name: "Student User",
  id: 1,
  is_active: true,
  role: "student",
};

function renderRoutes(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route element={<LoginPage />} path="/login" />
          <Route
            element={
              <RequireRole allow={["student"]}>
                <h1>Student Home</h1>
              </RequireRole>
            }
            path="/student"
          />
          <Route
            element={
              <RequireRole allow={["staff"]}>
                <h1>Staff Home</h1>
              </RequireRole>
            }
            path="/staff"
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function LogoutButton() {
  const auth = useAuth();
  return (
    <button onClick={() => void auth.logout()} type="button">
      Keluar
    </button>
  );
}

describe("session routing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("restores a stored bearer token with the current-user endpoint", async () => {
    sessionStorage.setItem("ipb-srh-token", "stored-token");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(studentUser), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    renderRoutes("/student");

    expect(await screen.findByRole("heading", { name: "Student Home" })).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/auth/me",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer stored-token" }),
      }),
    );
  });

  it("clears invalid restored sessions and redirects to login with a reason", async () => {
    sessionStorage.setItem("ipb-srh-token", "expired-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: "Expired" }), {
        headers: { "Content-Type": "application/json" },
        status: 401,
      }),
    );

    renderRoutes("/student");

    expect(await screen.findByText("Sesi Anda berakhir. Masuk kembali untuk melanjutkan.")).toBeVisible();
    expect(sessionStorage.getItem("ipb-srh-token")).toBeNull();
  });

  it("redirects unauthenticated protected routes with a safe internal redirect", async () => {
    renderRoutes("/student?tab=active");

    expect(await screen.findByRole("heading", { name: "Masuk" })).toBeVisible();
    await waitFor(() => {
      expect(window.location.href).not.toContain("https://evil.example");
    });
  });

  it("redirects wrong-role access to the user's role landing page", async () => {
    sessionStorage.setItem("ipb-srh-token", "stored-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(studentUser), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    renderRoutes("/staff");

    expect(await screen.findByRole("heading", { name: "Student Home" })).toBeVisible();
  });

  it("logs in, stores the session, and ignores external redirect params", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "new-token" }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(studentUser), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      );

    renderRoutes("/login?redirect=https://evil.example/phish");
    await user.type(screen.getByLabelText("Email Kampus"), "student@apps.ipb.ac.id");
    await user.type(screen.getByLabelText("Kata Sandi"), "password123");
    await user.click(screen.getByRole("button", { name: /Masuk/ }));

    expect(await screen.findByRole("heading", { name: "Student Home" })).toBeVisible();
    expect(sessionStorage.getItem("ipb-srh-token")).toBe("new-token");
  });

  it("calls the logout endpoint before clearing the local session", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("ipb-srh-token", "stored-token");
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(studentUser), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    render(
      <MemoryRouter initialEntries={["/student"]}>
        <AuthProvider>
          <Routes>
            <Route element={<LoginPage />} path="/login" />
            <Route
              element={
                <RequireRole allow={["student"]}>
                  <LogoutButton />
                </RequireRole>
              }
              path="/student"
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await screen.findByRole("button", { name: "Keluar" });
    await user.click(screen.getByRole("button", { name: "Keluar" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/auth/logout",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ Authorization: "Bearer stored-token" }),
        }),
      );
    });
    expect(sessionStorage.getItem("ipb-srh-token")).toBeNull();
  });

  it("opens the admin contact modal instead of navigating away", async () => {
    const user = userEvent.setup();

    renderRoutes("/login");
    await user.click(screen.getByRole("button", { name: "Hubungi admin" }));

    expect(await screen.findByRole("heading", { name: "Hubungi admin" })).toBeVisible();
    expect(
      screen.getByText("reach out @fasya/@bravi/@daffakautsar/@salman from @ilkomerz60 at instagram :)"),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Tutup bantuan admin" }));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Hubungi admin" })).not.toBeInTheDocument());
  });
});
