import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClient, ApiError } from "../../lib/apiClient";
import { AuthProvider, RequirePublic, RequireStudent } from "./authSession";
import { LoginPage } from "./LoginPage";
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

function makeClient(request: ApiClient["request"]): ApiClient {
  return {
    download: vi.fn(),
    request,
    upload: vi.fn(),
  } as ApiClient;
}

function renderLogin({ client, initialPath = "/login" }: { client: ApiClient; initialPath?: string }) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider client={client}>
        <Routes>
          <Route element={<RequirePublic />}>
            <Route element={<LoginPage />} path="/login" />
          </Route>
          <Route element={<RequireStudent />}>
            <Route element={<p>Reservasi Detail</p>} path="/student/reservations/:id" />
            <Route element={<p>Student Shell</p>} path="/student" />
          </Route>
          <Route element={<p>Staff Shell</p>} path="/staff" />
          <Route element={<p>Admin Shell</p>} path="/admin" />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

async function submitLogin(email: string, password = "secret123") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/Email institusi/), email);
  await user.type(screen.getByLabelText(/^Kata sandi/), password);
  await user.click(screen.getByRole("button", { name: "Masuk ke Akun" }));
}

describe("login page", () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("validates required fields, email shape, and institutional domains before submit", async () => {
    const user = userEvent.setup();
    const request = vi.fn();
    renderLogin({ client: makeClient(request as ApiClient["request"]) });

    await user.click(screen.getByRole("button", { name: "Masuk ke Akun" }));

    expect(await screen.findByText("Email institusi wajib diisi.")).toBeVisible();
    expect(screen.getByText("Kata sandi wajib diisi.")).toBeVisible();
    expect(request).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/Email institusi/), "student");
    await user.type(screen.getByLabelText(/^Kata sandi/), "secret123");
    await user.click(screen.getByRole("button", { name: "Masuk ke Akun" }));

    expect(await screen.findByText("Masukkan format email yang valid.")).toBeVisible();
    expect(request).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText(/Email institusi/));
    await user.type(screen.getByLabelText(/Email institusi/), "student@example.com");
    await user.click(screen.getByRole("button", { name: "Masuk ke Akun" }));

    expect(await screen.findByText("Gunakan email institusi IPB.")).toBeVisible();
    expect(request).not.toHaveBeenCalled();
  });

  it("stores the login token, loads the current user, and follows a safe student redirect", async () => {
    const request = vi.fn(async (path: string) => {
      if (path === "/auth/login") {
        return { access_token: "new-token", token_type: "bearer" };
      }
      if (path === "/auth/me") {
        return studentUser;
      }
      throw new Error(`Unexpected request ${path}`);
    });
    renderLogin({
      client: makeClient(request as ApiClient["request"]),
      initialPath: `/login?redirect=${encodeURIComponent("/student/reservations/42")}`,
    });

    await submitLogin("student@apps.ipb.ac.id");

    expect(await screen.findByText("Reservasi Detail")).toBeVisible();
    expect(sessionStorage.getItem("ipb-srh-session-token")).toBe("new-token");
    expect(request).toHaveBeenCalledWith("/auth/login", {
      auth: false,
      body: { email: "student@apps.ipb.ac.id", password: "secret123" },
      method: "POST",
    });
    expect(request).toHaveBeenCalledWith("/auth/me");
  });

  it("rejects unsafe redirects and falls back to the authenticated user's role shell", async () => {
    const request = vi.fn(async (path: string) => {
      if (path === "/auth/login") {
        return { access_token: "staff-token", token_type: "bearer" };
      }
      if (path === "/auth/me") {
        return staffUser;
      }
      throw new Error(`Unexpected request ${path}`);
    });
    renderLogin({
      client: makeClient(request as ApiClient["request"]),
      initialPath: "/login?redirect=https://evil.example/student",
    });

    await submitLogin("staff@ipb.ac.id");

    expect(await screen.findByText("Staff Shell")).toBeVisible();
  });

  it("maps backend authentication and inactive-account errors to the form message", async () => {
    const request = vi.fn(async () => {
      throw new ApiError({
        kind: "http",
        message: "Akun tidak aktif.",
        status: 401,
      });
    });
    renderLogin({ client: makeClient(request as ApiClient["request"]) });

    await submitLogin("student@apps.ipb.ac.id");

    expect(await screen.findByRole("alert")).toHaveTextContent("Akun tidak aktif.");
    expect(screen.getByLabelText(/Email institusi/)).toHaveValue("student@apps.ipb.ac.id");
  });

  it("shows registered and expired session messages from query params", async () => {
    const request = vi.fn();
    const registered = render(
      <MemoryRouter initialEntries={["/login?registered=1"]}>
        <AuthProvider client={makeClient(request as ApiClient["request"])}>
          <Routes>
            <Route element={<RequirePublic />}>
              <Route element={<LoginPage />} path="/login" />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Akun berhasil dibuat");
    registered.unmount();

    render(
      <MemoryRouter initialEntries={["/login?expired=1"]}>
        <AuthProvider client={makeClient(request as ApiClient["request"])}>
          <Routes>
            <Route element={<RequirePublic />}>
              <Route element={<LoginPage />} path="/login" />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Sesi Anda berakhir"));
  });

  it("preserves only safe student redirects on the register link", () => {
    const request = vi.fn();
    const safe = renderLogin({
      client: makeClient(request as ApiClient["request"]),
      initialPath: `/login?redirect=${encodeURIComponent("/student/reservations/42?tab=payment")}`,
    });

    expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute(
      "href",
      "/register?redirect=%2Fstudent%2Freservations%2F42%3Ftab%3Dpayment",
    );
    safe.unmount();

    renderLogin({
      client: makeClient(request as ApiClient["request"]),
      initialPath: `/login?redirect=${encodeURIComponent("https://evil.example/student")}`,
    });

    expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute("href", "/register");
  });
});
