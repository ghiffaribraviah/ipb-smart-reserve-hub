import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import { StudentReservationTimePage } from "./StudentReservationCreatePages";

const calendarResponse = [
  {
    ends_at: "2026-06-24T05:00:00Z",
    starts_at: "2026-06-24T02:00:00Z",
    status: "reserved",
  },
];

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
      status,
    }),
  );
}

function renderTimePage(initialEntry = "/student/facilities/facility-uuid-1/reserve/time") {
  return renderWithProviders(
    <Routes>
      <Route element={<StudentReservationTimePage />} path="/student/facilities/:facilityId/reserve/time" />
    </Routes>,
    { initialEntries: [initialEntry] },
  );
}

function mockTimeSelectionFetch({
  calendar = calendarResponse,
  validation = { available: true, errors: [] },
  validationStatus = 200,
}: {
  calendar?: unknown;
  validation?: unknown;
  validationStatus?: number;
} = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url = String(input);

    if (url.startsWith("http://localhost:8000/facilities/facility-uuid-1/calendar?")) {
      return jsonResponse(calendar);
    }

    if (url === "http://localhost:8000/facilities/facility-uuid-1/reservation-time-selection") {
      return jsonResponse(validation, validationStatus);
    }

    return jsonResponse({ detail: `Unhandled ${url}` }, 404);
  });
}

describe("StudentReservationTimePage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("validates selected time and enables continue when backend says available", async () => {
    const user = userEvent.setup();
    const fetchMock = mockTimeSelectionFetch();

    renderTimePage();

    expect(await screen.findByText("09:00 - 12:00")).toBeVisible();
    expect(screen.queryByText("BEM KM IPB")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lanjutkan" })).toHaveAttribute("aria-disabled", "true");

    await user.click(screen.getByRole("button", { name: "Cek Ketersediaan" }));

    expect(await screen.findByText("Waktu tersedia. Anda dapat melanjutkan reservasi.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Lanjutkan" })).toHaveAttribute(
      "href",
      "/student/facilities/facility-uuid-1/reserve/details?starts_at=2026-06-24T09%3A00%3A00%2B07%3A00&ends_at=2026-06-24T13%3A00%3A00%2B07%3A00",
    );
    expect(screen.getByRole("link", { name: "Lanjutkan" })).not.toHaveAttribute("aria-disabled", "true");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/facilities/facility-uuid-1/reservation-time-selection",
        expect.objectContaining({
          body: JSON.stringify({
            ends_at: "2026-06-24T13:00:00+07:00",
            starts_at: "2026-06-24T09:00:00+07:00",
          }),
          method: "POST",
        }),
      );
    });
  });

  it("uses explicit 24-hour HH:mm time controls", async () => {
    mockTimeSelectionFetch();

    renderTimePage();

    expect(await screen.findByLabelText("Waktu Mulai")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Waktu Mulai")).toHaveAttribute("placeholder", "09:00");
    expect(screen.getByLabelText("Waktu Mulai")).toHaveAttribute("pattern", "([01][0-9]|2[0-3]):[0-5][0-9]");
    expect(screen.getByLabelText("Waktu Selesai")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Waktu Selesai")).toHaveAttribute("placeholder", "13:00");
    expect(screen.getByLabelText("Waktu Selesai")).toHaveAttribute("pattern", "([01][0-9]|2[0-3]):[0-5][0-9]");
  });

  it("selects a calendar day and validates that selected Jakarta date", async () => {
    const user = userEvent.setup();
    const fetchMock = mockTimeSelectionFetch();

    renderTimePage();

    await user.click(await screen.findByRole("button", { name: "Pilih 25 Juni 2026" }));
    expect(screen.getByText("Jadwal pada 25 Juni 2026")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Cek Ketersediaan" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/facilities/facility-uuid-1/reservation-time-selection",
        expect.objectContaining({
          body: JSON.stringify({
            ends_at: "2026-06-25T13:00:00+07:00",
            starts_at: "2026-06-25T09:00:00+07:00",
          }),
          method: "POST",
        }),
      );
    });
  });

  it("uses the date selected from facility detail calendar", async () => {
    const user = userEvent.setup();
    const fetchMock = mockTimeSelectionFetch();

    renderTimePage("/student/facilities/facility-uuid-1/reserve/time?date=2026-06-15");

    expect(await screen.findByText("Jadwal pada 15 Juni 2026")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cek Ketersediaan" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/facilities/facility-uuid-1/reservation-time-selection",
        expect.objectContaining({
          body: JSON.stringify({
            ends_at: "2026-06-15T13:00:00+07:00",
            starts_at: "2026-06-15T09:00:00+07:00",
          }),
          method: "POST",
        }),
      );
    });
  });


  it("disables continue and renders backend reasons when unavailable", async () => {
    const user = userEvent.setup();
    mockTimeSelectionFetch({
      validation: {
        available: false,
        errors: [{ message: "Waktu bertabrakan dengan reservasi lain.", reason: "reserved_time" }],
      },
    });

    renderTimePage();
    await user.click(await screen.findByRole("button", { name: "Cek Ketersediaan" }));

    expect(await screen.findByText("Waktu bertabrakan dengan reservasi lain.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Lanjutkan" })).toHaveAttribute("aria-disabled", "true");
  });

  it("keeps selected time visible while validation is loading", async () => {
    const user = userEvent.setup();
    let resolveValidation: (response: Response) => void = () => undefined;

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/facilities/facility-uuid-1/calendar?")) {
        return jsonResponse(calendarResponse);
      }

      if (url === "http://localhost:8000/facilities/facility-uuid-1/reservation-time-selection") {
        return new Promise((resolve) => {
          resolveValidation = resolve;
        });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderTimePage();
    await user.click(await screen.findByRole("button", { name: "Cek Ketersediaan" }));

    expect(screen.getByLabelText("Waktu Mulai")).toHaveValue("09:00");
    expect(screen.getByLabelText("Waktu Selesai")).toHaveValue("13:00");
    expect(screen.getByRole("button", { name: "Memeriksa..." })).toBeDisabled();

    resolveValidation(
      new Response(JSON.stringify({ available: true, errors: [] }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    expect(await screen.findByText("Waktu tersedia. Anda dapat melanjutkan reservasi.")).toBeVisible();
  });

  it("shows recoverable feedback for backend validation errors", async () => {
    const user = userEvent.setup();
    mockTimeSelectionFetch({
      validation: { detail: "Layanan validasi belum tersedia." },
      validationStatus: 500,
    });

    renderTimePage();
    await user.click(await screen.findByRole("button", { name: "Cek Ketersediaan" }));

    expect(await screen.findByText("Layanan validasi belum tersedia.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Lanjutkan" })).toHaveAttribute("aria-disabled", "true");
  });
});
