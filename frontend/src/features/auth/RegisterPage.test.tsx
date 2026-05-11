import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClient, ApiError } from "../../lib/apiClient";
import { AuthProvider, RequirePublic } from "./authSession";
import { RegisterPage } from "./RegisterPage";

function makeClient(request: ApiClient["request"]): ApiClient {
  return {
    download: vi.fn(),
    request,
    upload: vi.fn(),
  } as ApiClient;
}

function renderRegister({ client, initialPath = "/register" }: { client: ApiClient; initialPath?: string }) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider client={client}>
        <Routes>
          <Route element={<RequirePublic />}>
            <Route element={<RegisterPage />} path="/register" />
          </Route>
          <Route element={<p>Login Page</p>} path="/login" />
          <Route element={<p>Student Shell</p>} path="/student" />
          <Route element={<p>Staff Shell</p>} path="/staff" />
          <Route element={<p>Admin Shell</p>} path="/admin" />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

async function fillValidRegistration() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/Nama lengkap/), "Rani Prameswari");
  await user.type(screen.getByLabelText(/NIM/), "G64000000");
  await user.type(screen.getByLabelText(/Nomor telepon/), "08123456789");
  await user.type(screen.getByLabelText(/Email institusi mahasiswa/), "rani@apps.ipb.ac.id");
  await user.type(screen.getByLabelText(/^Kata sandi/), "secret123");
  await user.type(screen.getByLabelText(/^Konfirmasi kata sandi/), "secret123");
  await user.click(screen.getByRole("button", { name: "Daftar" }));
}

describe("register page", () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("registers a student and shows the login CTA with a safe redirect", async () => {
    const request = vi.fn(async () => ({
      academic_profile: null,
      email: "rani@apps.ipb.ac.id",
      full_name: "Rani Prameswari",
      id: "student-1",
      is_active: true,
      nim: "G64000000",
      phone: "08123456789",
      role: "student",
    }));
    renderRegister({
      client: makeClient(request as ApiClient["request"]),
      initialPath: `/register?redirect=${encodeURIComponent("/student/reservations")}`,
    });

    await fillValidRegistration();

    expect(await screen.findByRole("status")).toHaveTextContent("Akun berhasil dibuat");
    expect(screen.getByRole("link", { name: "Masuk Sekarang" })).toHaveAttribute(
      "href",
      "/login?registered=1&redirect=%2Fstudent%2Freservations",
    );
    expect(request).toHaveBeenCalledWith("/auth/register", {
      auth: false,
      body: {
        email: "rani@apps.ipb.ac.id",
        full_name: "Rani Prameswari",
        nim: "G64000000",
        password: "secret123",
        phone: "08123456789",
      },
      method: "POST",
    });
  });

  it("validates registration fields before submit", async () => {
    const user = userEvent.setup();
    const request = vi.fn();
    renderRegister({ client: makeClient(request as ApiClient["request"]) });

    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(await screen.findByText("Nama lengkap wajib diisi.")).toBeVisible();
    expect(screen.getByText("NIM wajib diisi.")).toBeVisible();
    expect(screen.getByText("Nomor telepon wajib diisi.")).toBeVisible();
    expect(screen.getByText("Email institusi mahasiswa wajib diisi.")).toBeVisible();
    expect(screen.getByText("Kata sandi wajib diisi.")).toBeVisible();
    expect(screen.getByText("Konfirmasi kata sandi wajib diisi.")).toBeVisible();
    expect(request).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/Nama lengkap/), "Rani Prameswari");
    await user.type(screen.getByLabelText(/NIM/), "G64");
    await user.type(screen.getByLabelText(/Nomor telepon/), "12345");
    await user.type(screen.getByLabelText(/Email institusi mahasiswa/), "rani@ipb.ac.id");
    await user.type(screen.getByLabelText(/^Kata sandi/), "secret");
    await user.type(screen.getByLabelText(/^Konfirmasi kata sandi/), "different");
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(await screen.findByText("Masukkan NIM dengan format yang valid.")).toBeVisible();
    expect(screen.getByText("Masukkan nomor telepon Indonesia yang valid.")).toBeVisible();
    expect(screen.getByText("Gunakan email mahasiswa apps.ipb.ac.id.")).toBeVisible();
    expect(screen.getByText("Kata sandi minimal 8 karakter.")).toBeVisible();
    expect(screen.getByText("Konfirmasi kata sandi harus sama.")).toBeVisible();
    expect(request).not.toHaveBeenCalled();
  });

  it("maps backend registration errors to the right visible messages", async () => {
    const request = vi.fn(async () => {
      throw new ApiError({
        kind: "http",
        message: "Email sudah terdaftar.",
        status: 409,
      });
    });
    renderRegister({ client: makeClient(request as ApiClient["request"]) });

    await fillValidRegistration();

    expect(await screen.findByText("Email sudah terdaftar.")).toBeVisible();
    expect(screen.getByLabelText(/Email institusi mahasiswa/)).toHaveValue("rani@apps.ipb.ac.id");
    expect(screen.getByLabelText(/^Kata sandi/)).toHaveValue("");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows network failures as form-level retry errors", async () => {
    const request = vi.fn(async () => {
      throw new ApiError({
        kind: "network",
        message: "Tidak dapat terhubung ke server. Silakan coba lagi.",
      });
    });
    renderRegister({ client: makeClient(request as ApiClient["request"]) });

    await fillValidRegistration();

    expect(await screen.findByRole("alert")).toHaveTextContent("Tidak dapat terhubung ke server. Silakan coba lagi.");
    expect(screen.getByLabelText(/Nama lengkap/)).toHaveValue("Rani Prameswari");
  });

  it("strips unsafe redirects from the login CTA", async () => {
    const request = vi.fn(async () => ({
      academic_profile: null,
      email: "rani@apps.ipb.ac.id",
      full_name: "Rani Prameswari",
      id: "student-1",
      is_active: true,
      nim: "G64000000",
      phone: "08123456789",
      role: "student",
    }));
    renderRegister({
      client: makeClient(request as ApiClient["request"]),
      initialPath: `/register?redirect=${encodeURIComponent("https://evil.example/student")}`,
    });

    await fillValidRegistration();

    expect(await screen.findByRole("link", { name: "Masuk Sekarang" })).toHaveAttribute("href", "/login?registered=1");
  });

  it("redirects authenticated users away from the public register page", async () => {
    sessionStorage.setItem("ipb-srh-session-token", "stored-token");
    const request = vi.fn(async (path: string) => {
      if (path === "/auth/me") {
        return {
          academic_profile: null,
          email: "student@apps.ipb.ac.id",
          full_name: "Student User",
          id: "student-1",
          is_active: true,
          nim: "G64000000",
          phone: "08123456789",
          role: "student",
        };
      }
      throw new Error(`Unexpected request ${path}`);
    });
    renderRegister({ client: makeClient(request as ApiClient["request"]) });

    expect(await screen.findByText("Student Shell")).toBeVisible();
  });
});
