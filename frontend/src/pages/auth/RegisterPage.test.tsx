import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider, SESSION_TOKEN_KEY } from "../../auth/session";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <AuthProvider>
        <Routes>
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<LoginPage />} path="/login" />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

async function fillValidForm(user = userEvent.setup()) {
  await user.type(screen.getByLabelText("Nama Lengkap"), "Nadia Paramita");
  await user.type(screen.getByLabelText("NIM"), "G64190011");
  await user.type(screen.getByLabelText("Email Kampus"), "nadia@apps.ipb.ac.id");
  await user.type(screen.getByLabelText("Nomor Telepon"), "081234567890");
  await user.type(screen.getByLabelText("Kata Sandi"), "password123");
  await user.type(screen.getByLabelText("Konfirmasi Kata Sandi"), "password123");
  return user;
}

describe("RegisterPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("submits the backend registration payload and redirects to login without creating a session", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "1", role: "student" }), {
        headers: { "Content-Type": "application/json" },
        status: 201,
      }),
    );

    renderRegister();
    const user = await fillValidForm();
    await user.click(screen.getByRole("button", { name: /Buat Akun/ }));

    expect(await screen.findByText("Akun berhasil dibuat. Silakan masuk menggunakan email kampus Anda.")).toBeVisible();
    expect(sessionStorage.getItem(SESSION_TOKEN_KEY)).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/auth/register",
      expect.objectContaining({
        body: JSON.stringify({
          email: "nadia@apps.ipb.ac.id",
          full_name: "Nadia Paramita",
          nim: "G64190011",
          password: "password123",
          phone: "081234567890",
        }),
        method: "POST",
      }),
    );
  });

  it("groups registration fields into identity and password sections with corrected copy", () => {
    renderRegister();

    expect(screen.getByRole("group", { name: "Data Identitas" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Buat Kata Sandi" })).toBeVisible();
    expect(screen.getByLabelText("Konfirmasi Kata Sandi")).toBeVisible();
    expect(screen.queryByLabelText("Surat Sandi")).not.toBeInTheDocument();
    expect(screen.getByText("Sudah punya akun?")).toBeVisible();
  });

  it("catches invalid campus email domains before submit", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    renderRegister();
    const user = await fillValidForm();
    await user.clear(screen.getByLabelText("Email Kampus"));
    await user.type(screen.getByLabelText("Email Kampus"), "nadia@example.com");
    await user.click(screen.getByRole("button", { name: /Buat Akun/ }));

    expect(await screen.findByText("Gunakan email aktif dengan domain @apps.ipb.ac.id.")).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows backend duplicate-email errors near the form", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: "Email sudah terdaftar." }), {
        headers: { "Content-Type": "application/json" },
        status: 409,
      }),
    );

    renderRegister();
    const user = await fillValidForm();
    await user.click(screen.getByRole("button", { name: /Buat Akun/ }));

    expect(await screen.findByText("Email sudah terdaftar.")).toBeVisible();
  });

  it("catches password mismatch before submit", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    renderRegister();
    const user = await fillValidForm();
    await user.clear(screen.getByLabelText("Konfirmasi Kata Sandi"));
    await user.type(screen.getByLabelText("Konfirmasi Kata Sandi"), "different123");
    await user.click(screen.getByRole("button", { name: /Buat Akun/ }));

    expect(await screen.findByText("Konfirmasi kata sandi tidak sama.")).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("disables submit while registration is pending", async () => {
    let resolveResponse: (response: Response) => void = () => undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    );

    renderRegister();
    const user = await fillValidForm();
    await user.click(screen.getByRole("button", { name: /Buat Akun/ }));

    expect(screen.getByRole("button", { name: /Memproses/ })).toBeDisabled();
    resolveResponse(new Response(JSON.stringify({ id: "1" }), { status: 201 }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Masuk" })).toBeVisible());
  });
});
