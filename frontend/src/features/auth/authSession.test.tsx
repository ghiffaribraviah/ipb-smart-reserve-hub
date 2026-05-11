import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../lib/apiClient";
import { AuthProvider, RequirePublic, RequireStudent, useAuth } from "./authSession";
import { UserAccount } from "./types";

const studentUser: UserAccount = {
  academic_profile: null,
  email: "student@apps.ipb.ac.id",
  full_name: "Student User",
  id: "student-1",
  is_active: true,
  nim: "G64000000",
  phone: "08123456789",
  role: "student",
};

const staffUser: UserAccount = {
  ...studentUser,
  email: "staff@ipb.ac.id",
  id: "staff-1",
  role: "staff",
};

function makeClient(overrides: Partial<ApiClient> = {}): ApiClient {
  return {
    download: vi.fn(),
    request: vi.fn(),
    upload: vi.fn(),
    ...overrides,
  } as ApiClient;
}

function LocationText() {
  const location = useLocation();
  return <span>{location.pathname + location.search}</span>;
}

function LoginHarness() {
  const auth = useAuth();
  const location = useLocation();
  const redirectTarget = new URLSearchParams(location.search).get("redirect");
  return (
    <>
      <span data-testid="location">{location.pathname + location.search}</span>
      <button onClick={() => void auth.establishSession("new-token", redirectTarget)} type="button">
        Masuk
      </button>
    </>
  );
}

function LogoutHarness() {
  const auth = useAuth();
  const location = useLocation();
  return (
    <>
      <span data-testid="student-location">{location.pathname + location.search}</span>
      <button onClick={() => auth.logout()} type="button">
        Keluar
      </button>
    </>
  );
}

function renderWithAuth({
  client = makeClient(),
  initialPath = "/student",
}: {
  client?: ApiClient;
  initialPath?: string;
}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider client={client}>
        <Routes>
          <Route element={<RequirePublic />}>
            <Route element={<LoginHarness />} path="/login" />
          </Route>
          <Route element={<RequireStudent />}>
            <Route element={<p>Reservasi</p>} path="/student/reservations/:id" />
            <Route element={<LogoutHarness />} path="/student" />
          </Route>
          <Route element={<p>Staff Shell</p>} path="/staff" />
          <Route element={<p>Admin Shell</p>} path="/admin" />
          <Route element={<LocationText />} path="*" />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("auth session", () => {
  afterEach(() => {
    sessionStorage.clear();
    globalThis.localStorage?.clear();
  });

  it("restores and validates a sessionStorage token without using localStorage", async () => {
    sessionStorage.setItem("ipb-srh-session-token", "stored-token");
    const client = makeClient({
      request: vi.fn().mockResolvedValue(studentUser),
    });

    renderWithAuth({ client, initialPath: "/student" });

    expect(screen.getByRole("status")).toHaveTextContent("Memvalidasi sesi...");
    expect(await screen.findByRole("button", { name: "Keluar" })).toBeVisible();
    expect(client.request).toHaveBeenCalledWith("/auth/me");
    expect(globalThis.localStorage?.getItem("ipb-srh-session-token")).toBeUndefined();
  });

  it("stores a login token in sessionStorage and redirects to a safe student target", async () => {
    const user = userEvent.setup();
    const client = makeClient({
      request: vi.fn().mockResolvedValue(studentUser),
    });

    renderWithAuth({ client, initialPath: `/login?redirect=${encodeURIComponent("/student/reservations/42")}` });

    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByText("Reservasi")).toBeVisible();
    expect(sessionStorage.getItem("ipb-srh-session-token")).toBe("new-token");
    expect(globalThis.localStorage?.getItem("ipb-srh-session-token")).toBeUndefined();
  });

  it("rejects unsafe login redirects and falls back to the role shell", async () => {
    const user = userEvent.setup();
    const client = makeClient({
      request: vi.fn().mockResolvedValue(studentUser),
    });

    renderWithAuth({ client, initialPath: "/login?redirect=https://evil.example/student" });

    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByRole("button", { name: "Keluar" })).toBeVisible();
  });

  it("redirects authenticated users away from public routes by role", async () => {
    sessionStorage.setItem("ipb-srh-session-token", "stored-token");
    const client = makeClient({
      request: vi.fn().mockResolvedValue(staffUser),
    });

    renderWithAuth({ client, initialPath: "/login" });

    expect(await screen.findByText("Staff Shell")).toBeVisible();
  });

  it("redirects unauthenticated student routes to login with a safe internal redirect", async () => {
    renderWithAuth({ initialPath: "/student/reservations/42?tab=payment" });

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/login?redirect=%2Fstudent%2Freservations%2F42%3Ftab%3Dpayment"),
    );
  });

  it("redirects staff and admin users away from student routes", async () => {
    sessionStorage.setItem("ipb-srh-session-token", "stored-token");
    const client = makeClient({
      request: vi.fn().mockResolvedValue(staffUser),
    });

    renderWithAuth({ client, initialPath: "/student" });

    expect(await screen.findByText("Staff Shell")).toBeVisible();
  });

  it("clears the session when startup validation fails or the user logs out", async () => {
    sessionStorage.setItem("ipb-srh-session-token", "stored-token");
    const user = userEvent.setup();
    const client = makeClient({
      request: vi.fn().mockResolvedValueOnce(studentUser),
    });

    renderWithAuth({ client, initialPath: "/student" });

    await user.click(await screen.findByRole("button", { name: "Keluar" }));

    expect(sessionStorage.getItem("ipb-srh-session-token")).toBeNull();
    expect(await screen.findByRole("button", { name: "Masuk" })).toBeVisible();
  });
});
