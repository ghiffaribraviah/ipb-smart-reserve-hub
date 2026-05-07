import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { http, HttpResponse, delay } from "msw";
import { App } from "../App";
import { MemoryRouter } from "react-router-dom";
import { server } from "./server";

function renderApp(initialRoute = "/register") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Registration", () => {
  it("registers a student and redirects to login with a success message", async () => {
    const user = userEvent.setup();
    renderApp("/register");

    await user.type(screen.getByLabelText(/email/i), "newstudent@apps.ipb.ac.id");
    await user.type(screen.getByLabelText(/password/i), "securepass123");
    await user.type(screen.getByLabelText(/nama lengkap/i), "Budi Santoso");
    await user.type(screen.getByLabelText(/nim/i), "G6401201001");
    await user.type(screen.getByLabelText(/telepon/i), "081234567890");
    await user.click(screen.getByRole("button", { name: /daftar/i }));

    expect(
      await screen.findByRole("heading", { name: /masuk/i }, { timeout: 3000 }),
    ).toBeInTheDocument();

    expect(screen.getByText(/registrasi berhasil/i)).toBeInTheDocument();
  });

  it("shows the backend error message when registration fails", async () => {
    const user = userEvent.setup();
    renderApp("/register");

    await user.type(screen.getByLabelText(/email/i), "bad@gmail.com");
    await user.type(screen.getByLabelText(/password/i), "securepass123");
    await user.type(screen.getByLabelText(/nama lengkap/i), "Budi Santoso");
    await user.type(screen.getByLabelText(/nim/i), "G6401201001");
    await user.type(screen.getByLabelText(/telepon/i), "081234567890");
    await user.click(screen.getByRole("button", { name: /daftar/i }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Email harus menggunakan domain institusi yang diizinkan.");
  });

  it("shows a loading state while submitting", async () => {
    server.use(
      http.post("http://localhost:8000/auth/register", async () => {
        await delay("infinite");
        return HttpResponse.json({});
      }),
    );

    const user = userEvent.setup();
    renderApp("/register");

    await user.type(screen.getByLabelText(/email/i), "newstudent@apps.ipb.ac.id");
    await user.type(screen.getByLabelText(/password/i), "securepass123");
    await user.type(screen.getByLabelText(/nama lengkap/i), "Budi Santoso");
    await user.type(screen.getByLabelText(/nim/i), "G6401201001");
    await user.type(screen.getByLabelText(/telepon/i), "081234567890");
    await user.click(screen.getByRole("button", { name: /daftar/i }));

    const button = screen.getByRole("button", { name: /memproses/i });
    expect(button).toBeDisabled();
  });

  it("provides a link to the login page", async () => {
    const user = userEvent.setup();
    renderApp("/register");

    await user.click(screen.getByRole("link", { name: /masuk/i }));

    expect(
      await screen.findByRole("heading", { name: /^masuk$/i }),
    ).toBeInTheDocument();
  });

  it("does not store a token after successful registration", async () => {
    const user = userEvent.setup();
    renderApp("/register");

    await user.type(screen.getByLabelText(/email/i), "newstudent@apps.ipb.ac.id");
    await user.type(screen.getByLabelText(/password/i), "securepass123");
    await user.type(screen.getByLabelText(/nama lengkap/i), "Budi Santoso");
    await user.type(screen.getByLabelText(/nim/i), "G6401201001");
    await user.type(screen.getByLabelText(/telepon/i), "081234567890");
    await user.click(screen.getByRole("button", { name: /daftar/i }));

    await screen.findByRole("heading", { name: /masuk/i }, { timeout: 3000 });

    expect(localStorage.getItem("access_token")).toBeNull();
  });
});
