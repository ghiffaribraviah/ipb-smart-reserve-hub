import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
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
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ unread_count: 1 }))
      .mockResolvedValueOnce(jsonResponse([unreadNotification]));

    renderWithProviders(<NotificationSurface role="student" />);
    expect(await screen.findByText("1", { selector: "span" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Notifikasi" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/notifications/unread-count",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/notifications", expect.any(Object));
    expect(await screen.findByText("Reservasi diterima")).toBeInTheDocument();
    expect(screen.getByText("Belum dibaca")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buka notifikasi Reservasi diterima" })).toHaveAttribute(
      "href",
      "/student/reservations/reservation-1",
    );
    expect(screen.getByRole("link", { name: "Lihat semua notifikasi" })).toHaveAttribute(
      "href",
      "/student/notifications",
    );
    expect(screen.queryByText("Buka Reservasi diterima")).not.toBeInTheDocument();
  });

  it("marks an unread notification read and refreshes the visible state", async () => {
    const readNotification = {
      ...unreadNotification,
      read_at: "2026-05-01T00:00:00Z",
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ unread_count: 1 }))
      .mockResolvedValueOnce(jsonResponse([unreadNotification]))
      .mockResolvedValueOnce(jsonResponse(readNotification))
      .mockResolvedValueOnce(jsonResponse({ unread_count: 0 }))
      .mockResolvedValueOnce(jsonResponse([readNotification]));

    renderWithProviders(<NotificationSurface role="student" />);
    expect(await screen.findByText("1", { selector: "span" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Notifikasi" }));
    await userEvent.click(await screen.findByRole("button", { name: "Tandai dibaca Reservasi diterima" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/notifications/notification-1/read",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText("Sudah dibaca")).toBeInTheDocument();
  });

  it("marks an unread notification read when the user opens it from the notification row", async () => {
    const readNotification = {
      ...unreadNotification,
      read_at: "2026-05-01T00:00:00Z",
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ unread_count: 1 }))
      .mockResolvedValueOnce(jsonResponse([unreadNotification]))
      .mockResolvedValueOnce(jsonResponse(readNotification))
      .mockResolvedValueOnce(jsonResponse({ unread_count: 0 }))
      .mockResolvedValueOnce(jsonResponse([readNotification]));

    renderWithProviders(
      <Routes>
        <Route element={<NotificationSurface role="student" />} path="/" />
        <Route element={<p>Reservation detail route</p>} path="/student/reservations/:reservationId" />
      </Routes>,
      { initialEntries: ["/"] },
    );

    await userEvent.click(screen.getByRole("button", { name: "Notifikasi" }));
    await userEvent.click(await screen.findByRole("link", { name: "Buka notifikasi Reservasi diterima" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/notifications/notification-1/read",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText("Reservation detail route")).toBeInTheDocument();
  });

  it("marks all unread notifications read from the header action", async () => {
    const unreadNotificationTwo = {
      ...unreadNotification,
      id: "notification-2",
      title: "Pembayaran disetujui",
      message: "Pembayaran Penutupan ISAC disetujui dan reservasi aktif.",
    };
    const readNotifications = [
      { ...unreadNotification, read_at: "2026-05-01T00:00:00Z" },
      { ...unreadNotificationTwo, read_at: "2026-05-01T00:00:00Z" },
    ];
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ unread_count: 2 }))
      .mockResolvedValueOnce(jsonResponse([unreadNotification, unreadNotificationTwo]))
      .mockResolvedValueOnce(jsonResponse(readNotifications))
      .mockResolvedValueOnce(jsonResponse({ unread_count: 0 }))
      .mockResolvedValueOnce(jsonResponse(readNotifications));

    renderWithProviders(<NotificationSurface role="student" />);
    expect(await screen.findByText("2", { selector: "span" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Notifikasi" }));
    await userEvent.click(screen.getByRole("button", { name: "Tandai semua" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/notifications/read-all",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText("0 belum dibaca")).toBeInTheDocument();
  });

  it("resolves role-safe target routes and falls back from unsupported routes", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ unread_count: 0 }))
      .mockResolvedValueOnce(
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

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole("link", { name: "Buka notifikasi Review reservasi" })).toHaveAttribute(
      "href",
      "/staff/reservations/reservation-2",
    );
    expect(screen.getByRole("link", { name: "Buka notifikasi Target lama" })).toHaveAttribute("href", "/staff");
  });

  it("shows empty, error, and retry states", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ unread_count: 0 }))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(jsonResponse([]));

    renderWithProviders(<NotificationSurface role="super_admin" />);
    await userEvent.click(screen.getByRole("button", { name: "Notifikasi" }));

    expect(await screen.findByText("Notifikasi belum bisa dimuat.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Muat ulang notifikasi" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(await screen.findByText("Belum ada notifikasi.")).toBeInTheDocument();
  });
});
