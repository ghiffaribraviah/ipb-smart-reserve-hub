import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import { StudentFacilityDetailPage } from "./StudentFacilityDetailPage";

const facilityDetail = {
  capacity: 1200,
  category: "Auditorium",
  contact: {
    email: "facility@example.test",
    name: "TU Fasilitas",
    phone: "0251-8620000",
  },
  description: "Auditorium utama untuk kegiatan akademik besar.",
  id: "facility-uuid-1",
  images: [
    {
      alt_text: "Auditorium utama",
      is_cover: true,
      url: "https://cdn.example.test/auditorium.jpg",
    },
  ],
  location: "Kampus Timur",
  name: "Auditorium Backend",
  open_hours_summary: "Senin-Jumat 08:00-18:00",
  price: {
    amount_rupiah: 100000,
    is_free: false,
    summary: "Rp100.000",
  },
  review_summary: {
    rating_average: 4.9,
    review_count: 124,
  },
  reviews: [
    {
      author_name: "Laras Indah",
      comment: "Ruangannya luas dan tata suara jelas.",
      created_at: "2026-05-01T00:00:00Z",
      id: "review-1",
      rating: 5,
    },
  ],
};

const calendarResponse = [
  {
    ends_at: "2026-06-01T04:00:00Z",
    starts_at: "2026-06-01T02:00:00Z",
    status: "reserved",
  },
];

const julyCalendarResponse = [
  {
    ends_at: "2026-07-15T06:00:00Z",
    starts_at: "2026-07-15T03:00:00Z",
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

function renderDetail(initialEntry = "/student/facilities/facility-uuid-1") {
  return renderWithProviders(
    <Routes>
      <Route element={<StudentFacilityDetailPage />} path="/student/facilities/:facilityId" />
    </Routes>,
    { initialEntries: [initialEntry] },
  );
}

function mockDetailFetch({
  calendar = calendarResponse,
  detail = facilityDetail,
  detailStatus = 200,
}: {
  calendar?: unknown;
  detail?: unknown;
  detailStatus?: number;
} = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);

    if (url === "http://localhost:8000/facilities/facility-uuid-1") {
      return jsonResponse(detail, detailStatus);
    }

    if (url.startsWith("http://localhost:8000/facilities/facility-uuid-1/calendar?")) {
      if (url.includes("start=2026-07-01T00%3A00%3A00.000Z")) {
        return jsonResponse(julyCalendarResponse);
      }
      return jsonResponse(calendar);
    }

    return jsonResponse({ detail: `Unhandled ${url}` }, 404);
  });
}

describe("StudentFacilityDetailPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-06-12T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("loads facility detail and privacy-safe calendar blocks from backend APIs", async () => {
    const user = userEvent.setup();
    const fetchMock = mockDetailFetch();

    renderDetail();

    expect(await screen.findByRole("heading", { name: "Auditorium Backend" })).toBeVisible();
    expect(screen.getByText((_, element) => element?.textContent === "4.9 (124 ulasan)")).toBeVisible();
    expect(screen.getByText("Kampus Timur")).toBeVisible();
    expect(screen.getByText("Auditorium utama untuk kegiatan akademik besar.")).toBeVisible();
    expect(screen.getByText("1,200")).toBeVisible();
    expect(screen.getByText("Auditorium")).toBeVisible();
    expect(screen.getByText("Senin-Jumat 08:00-18:00")).toBeVisible();
    expect(screen.getAllByText("0251-8620000")[0]).toBeVisible();
    expect(screen.getByText("Rp100.000")).toBeVisible();
    expect(screen.getByText("Ruangannya luas dan tata suara jelas.")).toBeVisible();
    expect(await screen.findByText("Belum ada jadwal terblokir pada tanggal ini.")).toBeVisible();
    const calendarHeading = screen.getByRole("heading", { name: "Kalender Publik" });
    const reviewsHeading = screen.getByRole("heading", { name: "Ulasan Peminjam" });
    expect(calendarHeading.compareDocumentPosition(reviewsHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByLabelText("Kalender publik Juni 2026")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Pilih 1 Juni 2026" }));
    expect(await screen.findByText("02:00 - 04:00")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pilih 1 Juni 2026" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Waktu sudah dipesan")).toBeVisible();
    expect(screen.queryByText("BEM KM IPB")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reservasi Sekarang" })).toHaveAttribute(
      "href",
      "/student/facilities/facility-uuid-1/reserve/time",
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/facilities/facility-uuid-1", expect.any(Object));
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/^http:\/\/localhost:8000\/facilities\/facility-uuid-1\/calendar\?/),
        expect.any(Object),
      );
    });
  });

  it("changes calendar month and refetches visible month blocks", async () => {
    const user = userEvent.setup();
    const fetchMock = mockDetailFetch();

    renderDetail();

    expect(await screen.findByText("Belum ada jadwal terblokir pada tanggal ini.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Bulan berikutnya" }));

    expect(await screen.findByText("Juli 2026")).toBeVisible();
    expect(screen.getByLabelText("Kalender publik Juli 2026")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Pilih 15 Juli 2026" }));
    expect(await screen.findByText("03:00 - 06:00")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pilih 15 Juli 2026" })).toHaveAttribute("aria-pressed", "true");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("start=2026-07-01T00%3A00%3A00.000Z"),
        expect.any(Object),
      );
    });
  });

  it("renders stable empty states for missing images, reviews, and calendar blocks", async () => {
    mockDetailFetch({
      calendar: [],
      detail: {
        ...facilityDetail,
        images: [],
        review_summary: { rating_average: null, review_count: 0 },
        reviews: [],
      },
    });

    renderDetail();

    expect(await screen.findByRole("heading", { name: "Auditorium Backend" })).toBeVisible();
    expect(screen.getAllByRole("img", { name: "Media fallback Auditorium Backend" })[0]).toBeVisible();
    expect(screen.getByText("Belum ada ulasan")).toBeVisible();
    expect(await screen.findByText("Belum ada jadwal terblokir pada tanggal ini.")).toBeVisible();
  });

  it("renders a page-level error for not found facilities", async () => {
    mockDetailFetch({ detail: { detail: "Fasilitas tidak ditemukan." }, detailStatus: 404 });

    renderDetail();

    expect(await screen.findByRole("heading", { name: "Fasilitas tidak dapat dimuat" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Kembali ke katalog" })).toHaveAttribute("href", "/student/facilities");
  });
});
