import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { http, HttpResponse, delay } from "msw";
import { App } from "../App";
import { MemoryRouter } from "react-router-dom";
import { server } from "./server";

function renderApp(initialRoute = "/login") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Login", () => {
  it("logs in a student and navigates to the student shell", async () => {
    const user = userEvent.setup();
    renderApp("/login");

    await user.type(screen.getByLabelText(/email/i), "student@apps.ipb.ac.id");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /masuk/i }));

    expect(
      await screen.findByRole("heading", { name: /fasilitas/i }, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it("shows an error message for invalid credentials", async () => {
    const user = userEvent.setup();
    renderApp("/login");

    await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /masuk/i }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Email atau password salah.");
  });

  it("redirects unauthenticated users from protected routes to login", async () => {
    renderApp("/student/facilities");

    expect(
      await screen.findByRole("heading", { name: /masuk/i }),
    ).toBeInTheDocument();
  });

  it("shows a loading state while submitting", async () => {
    server.use(
      http.post("http://localhost:8000/auth/login", async () => {
        await delay("infinite");
        return HttpResponse.json({});
      }),
    );

    const user = userEvent.setup();
    renderApp("/login");

    await user.type(screen.getByLabelText(/email/i), "student@apps.ipb.ac.id");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /masuk/i }));

    const button = screen.getByRole("button", { name: /memproses/i });
    expect(button).toBeDisabled();
  });
});
