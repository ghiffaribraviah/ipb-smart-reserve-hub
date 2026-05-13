import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationSurface } from "./NotificationSurface";
import { renderWithProviders } from "../test/render";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

const unreadNotification = {
  category: "reservation",
  created_at: "2026-05-01T00:00:00Z",
  id: "notification-1",
  message: "Reservasi Seminar Karier menunggu unggah surat persetujuan.",
  read_at: null,
  reservation_id: "reservation-1",
  target: {
    reservation_id: "reservation-1",
    route: "/student/reservations/{reservation_id}",
    type: "student_reservation",
  },
  title: "Reservasi diterima",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NotificationSurface", () => {
  it("loads notifications from the backend when the shell action opens", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse([unreadNotification]));

    renderWithProviders(<NotificationSurface role="student" />);
    await userEvent.click(screen.getByRole("button", { name: "Notifikasi" }));

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/notifications", expect.any(Object));
    expect(await screen.findByText("Reservasi diterima")).toBeInTheDocument();
    expect(screen.getByText("Belum dibaca")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buka Reservasi diterima" })).toHaveAttribute(
      "href",
      "/student/reservations/reservation-1",
    );
  });

  it("marks an unread notification read and refreshes the visible state", async () => {
    const readNotification = {
      ...unreadNotification,
      read_at: "2026-05-01T00:00:00Z",
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([unreadNotification]))
      .mockResolvedValueOnce(jsonResponse(readNotification))
      .mockResolvedValueOnce(jsonResponse([readNotification]));

    renderWithProviders(<NotificationSurface role="student" />);
    await userEvent.click(screen.getByRole("button", { name: "Notifikasi" }));
    await userEvent.click(await screen.findByRole("button", { name: "Tandai dibaca Reservasi diterima" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/notifications/notification-1/read",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText("Sudah dibaca")).toBeInTheDocument();
  });

  it("resolves role-safe target routes and falls back from unsupported routes", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse([
        {
          ...unreadNotification,
          id: "notification-2",
          target: {
            reservation_id: "reservation-2",
            route: "/staff/reservations/{reservation_id}",
            type: "staff_reservation",
          },
          title: "Review reservasi",
        },
        {
          ...unreadNotification,
          id: "notification-3",
          target: {
            reservation_id: "reservation-3",
            route: "/student/legacy/{reservation_id}",
            type: "legacy_route",
          },
          title: "Target lama",
        },
      ]),
    );

    renderWithProviders(<NotificationSurface role="staff" />);
    await userEvent.click(screen.getByRole("button", { name: "Notifikasi" }));

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(await screen.findByRole("link", { name: "Buka Review reservasi" })).toHaveAttribute(
      "href",
      "/staff/reservations/reservation-2",
    );
    expect(screen.getByRole("link", { name: "Buka Target lama" })).toHaveAttribute("href", "/staff");
  });

  it("shows empty, error, and retry states", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(jsonResponse([]));

    renderWithProviders(<NotificationSurface role="super_admin" />);
    await userEvent.click(screen.getByRole("button", { name: "Notifikasi" }));

    expect(await screen.findByText("Notifikasi belum bisa dimuat.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Muat ulang notifikasi" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Belum ada notifikasi.")).toBeInTheDocument();
  });
});
