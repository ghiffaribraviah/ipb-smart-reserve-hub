import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { StudentNotificationsPage } from "./NotificationPages";
import { renderWithProviders } from "../../test/render";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

function buildNotification(index: number, createdAt: string, readAt: string | null = null) {
  return {
    category: "reservation",
    created_at: createdAt,
    id: `notification-${index}`,
    message: `Pesan ${index}`,
    read_at: readAt,
    reservation_id: `reservation-${index}`,
    target: {
      reservation_id: `reservation-${index}`,
      route: "/student/reservations/{reservation_id}",
      type: "student_reservation",
    },
    title: `Notifikasi ${index}`,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NotificationPages", () => {
  it("groups notifications by date and marks an unread row read when opened", async () => {
    const unreadNotification = buildNotification(1, "2026-05-25T09:30:00Z");
    const olderNotification = buildNotification(2, "2026-05-24T08:00:00Z", "2026-05-24T08:10:00Z");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ unread_count: 1 }))
      .mockResolvedValueOnce(jsonResponse([unreadNotification, olderNotification]))
      .mockResolvedValueOnce(jsonResponse({ ...unreadNotification, read_at: "2026-05-25T09:35:00Z" }))
      .mockResolvedValueOnce(jsonResponse({ unread_count: 0 }))
      .mockResolvedValueOnce(jsonResponse([{ ...unreadNotification, read_at: "2026-05-25T09:35:00Z" }, olderNotification]));

    renderWithProviders(
      <Routes>
        <Route element={<StudentNotificationsPage />} path="/student/notifications" />
        <Route element={<p>Detail reservasi</p>} path="/student/reservations/:reservationId" />
      </Routes>,
      { initialEntries: ["/student/notifications"] },
    );

    expect(await screen.findByRole("heading", { name: "Semua Notifikasi" })).toBeInTheDocument();
    expect(await screen.findByText("25 Mei 2026")).toBeInTheDocument();
    expect(await screen.findByText("24 Mei 2026")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: "Buka notifikasi Notifikasi 1" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/notifications/notification-1/read",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText("Detail reservasi")).toBeInTheDocument();
  });

  it("loads older notifications on demand and keeps the bulk read action", async () => {
    const firstPage = Array.from({ length: 20 }, (_, index) =>
      buildNotification(index + 1, `2026-05-25T${String(index).padStart(2, "0")}:00:00Z`),
    );
    const secondPage = [buildNotification(21, "2026-05-24T09:00:00Z")];
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ unread_count: 21 }))
      .mockResolvedValueOnce(jsonResponse(firstPage))
      .mockResolvedValueOnce(jsonResponse(firstPage.map((item) => ({ ...item, read_at: "2026-05-25T10:00:00Z" }))))
      .mockResolvedValueOnce(jsonResponse({ unread_count: 0 }))
      .mockResolvedValueOnce(jsonResponse(firstPage.map((item) => ({ ...item, read_at: "2026-05-25T10:00:00Z" }))))
      .mockResolvedValueOnce(jsonResponse(secondPage));

    renderWithProviders(
      <Routes>
        <Route element={<StudentNotificationsPage />} path="/student/notifications" />
      </Routes>,
      { initialEntries: ["/student/notifications"] },
    );

    expect(await screen.findByRole("button", { name: "Tandai dibaca semua" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tandai dibaca semua" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/notifications/read-all",
      expect.objectContaining({ method: "POST" }),
    );

    await userEvent.click(await screen.findByRole("button", { name: "Muat lebih banyak" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/notifications?limit=20&offset=20",
        expect.any(Object),
      ),
    );
    expect(await screen.findByText("24 Mei 2026")).toBeInTheDocument();
    expect(screen.getByText("Notifikasi 21")).toBeInTheDocument();
  });
});
