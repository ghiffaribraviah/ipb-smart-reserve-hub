import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import { StaffFacilityEditPage, StaffFacilityListPage, StaffFacilitySchedulePage } from "./StaffFacilityPages";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
      status,
    }),
  );
}

const facilitiesResponse = [
  {
    capacity: 300,
    category: "Auditorium / Seminar",
    contact_email: "auditorium@apps.ipb.ac.id",
    contact_name: "Staff Auditorium",
    contact_phone: "08123456789",
    description: "Auditorium utama untuk seminar besar dan pertemuan fakultas.",
    id: "grand-auditorium",
    is_active: true,
    location: "Kampus Dramaga",
    name: "Grand Auditorium",
    open_hours_summary: "Senin-Jumat, 08:00-18:00",
    payment_instructions: null,
    price_rupiah: 100000,
    price_summary: "Rp100.000 / jam",
  },
  {
    capacity: 25,
    category: "Lanskap / Outdoor",
    contact_email: null,
    contact_name: "Staff Greenhouse",
    contact_phone: "08129876543",
    description: "Fasilitas pertanian lingkungan terkendali.",
    id: "agri-tech-greenhouses",
    is_active: false,
    location: "Kampus Barat",
    name: "Agri-Tech Greenhouses",
    open_hours_summary: "Senin-Jumat, 08:00-16:00",
    payment_instructions: null,
    price_rupiah: 0,
    price_summary: "Gratis",
  },
];

const scheduleResponse = [
  {
    activity_title: "Simposium Etika AI 2024",
    detail_url: "/staff/reservations/RSV-SCH-001",
    ends_at: "2024-10-24T12:00:00+07:00",
    organization_unit: { id: "org-1", name: "Departemen Ilmu Komputer" },
    reservation_code: "RSV-SCH-001",
    reservation_id: "reservation-schedule-1",
    review_status: "not_actionable",
    starts_at: "2024-10-24T09:00:00+07:00",
    status: "approved",
    workflow_type: "reservation",
  },
  {
    activity_title: "Kejuaraan Tahunan Klub Debat",
    detail_url: "/staff/reservations/RSV-SCH-003",
    ends_at: "2024-10-24T18:00:00+07:00",
    organization_unit: { id: "org-3", name: "BEM Mahasiswa" },
    reservation_code: "RSV-SCH-003",
    reservation_id: "reservation-schedule-3",
    review_status: "pending_review",
    starts_at: "2024-10-24T16:00:00+07:00",
    status: "pending_document_review",
    workflow_type: "document_review",
  },
];

function renderFacilityList() {
  return renderWithProviders(
    <Routes>
      <Route element={<StaffFacilityListPage />} path="/staff/facilities" />
    </Routes>,
    { initialEntries: ["/staff/facilities"] },
  );
}

function renderFacilitySchedule(entry = "/staff/facilities/grand-auditorium/schedule") {
  return renderWithProviders(
    <Routes>
      <Route element={<StaffFacilitySchedulePage />} path="/staff/facilities/:facilityId/schedule" />
    </Routes>,
    { initialEntries: [entry] },
  );
}

function renderFacilityEdit(entry = "/staff/facilities/grand-auditorium/edit") {
  return renderWithProviders(
    <Routes>
      <Route element={<StaffFacilityEditPage />} path="/staff/facilities/:facilityId/edit" />
    </Routes>,
    { initialEntries: [entry] },
  );
}

describe("StaffFacilityPages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("loads assigned facilities from the staff backend and links by backend id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities") {
        return jsonResponse(facilitiesResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityList();

    expect(await screen.findByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Agri-Tech Greenhouses" })).toBeVisible();
    expect(screen.getByText((_, element) => element?.textContent === "Menampilkan 2 fasilitas")).toBeVisible();
    expect(screen.getByText("Rp100.000 / jam")).toBeVisible();
    expect(screen.getByText("Senin-Jumat, 08:00-18:00")).toBeVisible();
    expect(screen.getAllByText("Nonaktif")[1]).toBeVisible();
    expect(screen.getByRole("link", { name: "Lihat Jadwal Grand Auditorium" })).toHaveAttribute(
      "href",
      "/staff/facilities/grand-auditorium/schedule",
    );
    expect(screen.getByRole("link", { name: "Edit Detail Grand Auditorium" })).toHaveAttribute(
      "href",
      "/staff/facilities/grand-auditorium/edit",
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/staff/facilities", expect.any(Object));
    });
  });

  it("renders empty and recoverable error states for assigned facilities", async () => {
    const user = userEvent.setup();
    let calls = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities") {
        calls += 1;
        return calls === 1 ? jsonResponse({ detail: "temporary outage" }, 503) : jsonResponse([]);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityList();

    await user.click(await screen.findByRole("button", { name: "Muat ulang fasilitas" }));
    expect(await screen.findByText("Belum ada fasilitas yang ditugaskan kepada Anda.")).toBeVisible();
  });

  it("loads private facility schedule entries with workflow-aware actions", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/staff/facilities/grand-auditorium/schedule")) {
        return jsonResponse(scheduleResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilitySchedule();

    expect(await screen.findByRole("heading", { name: "Jadwal Grand Auditorium" })).toBeVisible();
    expect((await screen.findAllByText("Simposium Etika AI 2024"))[0]).toBeVisible();
    expect(screen.getAllByText("Departemen Ilmu Komputer")[0]).toBeVisible();
    expect(screen.getAllByText("Menunggu Verifikasi Dokumen")[0]).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Tinjau Pengajuan BEM Mahasiswa" })[0]).toHaveAttribute(
      "href",
      "/staff/reservations/RSV-SCH-003",
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(
          /^http:\/\/localhost:8000\/staff\/facilities\/grand-auditorium\/schedule\?start=2024-10-01T00%3A00%3A00%2B07%3A00&end=2024-10-31T23%3A59%3A59%2B07%3A00$/,
        ),
        expect.any(Object),
      );
    });
  });

  it("shows schedule empty and access-denied states", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/staff/facilities/empty-room/schedule")) {
        return jsonResponse([]);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    const { unmount } = renderWithProviders(
      <Routes>
        <Route element={<StaffFacilitySchedulePage />} path="/staff/facilities/:facilityId/schedule" />
      </Routes>,
      { initialEntries: ["/staff/facilities/empty-room/schedule"] },
    );

    expect(await screen.findByText("Tidak ada reservasi pada rentang jadwal ini.")).toBeVisible();
    unmount();
    vi.restoreAllMocks();

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/staff/facilities/private-room/schedule")) {
        return jsonResponse({ detail: "Forbidden" }, 403);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilitySchedule("/staff/facilities/private-room/schedule");
    expect(await screen.findByText("Jadwal fasilitas tidak ditemukan atau tidak dapat diakses.")).toBeVisible();
  });

  it("loads the assigned facility edit form and saves supported profile fields", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities" && !init?.method) {
        return jsonResponse(facilitiesResponse);
      }

      if (url === "http://localhost:8000/staff/facilities/grand-auditorium" && init?.method === "PATCH") {
        expect(init.body).toBe(
          JSON.stringify({
            capacity: 350,
            contact_email: "auditorium@apps.ipb.ac.id",
            contact_name: "Staff Auditorium",
            contact_phone: "08123456789",
            description: "Auditorium utama untuk seminar besar dan pertemuan fakultas.",
            is_active: true,
            location: "Kampus Dramaga",
            name: "Grand Auditorium Baru",
            open_hours_summary: "Senin-Jumat, 08:00-18:00",
            payment_instructions: null,
            price_rupiah: 100000,
          }),
        );
        return jsonResponse({ ...facilitiesResponse[0], capacity: 350, name: "Grand Auditorium Baru" });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityEdit();

    expect(await screen.findByLabelText("Nama")).toHaveValue("Grand Auditorium");
    await user.clear(screen.getByLabelText("Nama"));
    await user.type(screen.getByLabelText("Nama"), "Grand Auditorium Baru");
    await user.clear(screen.getByLabelText("Kapasitas (Orang)"));
    await user.type(screen.getByLabelText("Kapasitas (Orang)"), "350");
    await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

    expect(await screen.findByText("Perubahan fasilitas tersimpan.")).toBeVisible();
    expect(screen.getByLabelText("Nama")).toHaveValue("Grand Auditorium Baru");
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/facilities/grand-auditorium",
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("maps client and API validation errors to visible edit feedback", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities" && !init?.method) {
        return jsonResponse(facilitiesResponse);
      }

      if (url === "http://localhost:8000/staff/facilities/grand-auditorium" && init?.method === "PATCH") {
        return jsonResponse({ detail: "Harga sewa memerlukan verifikasi bendahara." }, 422);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityEdit();

    await user.clear(await screen.findByLabelText("Kapasitas (Orang)"));
    await user.type(screen.getByLabelText("Kapasitas (Orang)"), "0");
    await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    expect(await screen.findByText("Kapasitas harus lebih dari 0.")).toBeVisible();

    await user.clear(screen.getByLabelText("Kapasitas (Orang)"));
    await user.type(screen.getByLabelText("Kapasitas (Orang)"), "300");
    await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    expect(await screen.findByText("Harga sewa memerlukan verifikasi bendahara.")).toBeVisible();
  });

  it("shows edit access denial when the assigned facility is not returned", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities") {
        return jsonResponse([]);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityEdit("/staff/facilities/not-assigned/edit");

    expect(await screen.findByText("Fasilitas tidak ditemukan atau tidak dapat diakses.")).toBeVisible();
  });

  it("deactivates the assigned facility and updates the visible active state", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities" && !init?.method) {
        return jsonResponse(facilitiesResponse);
      }

      if (url === "http://localhost:8000/staff/facilities/grand-auditorium/deactivate" && init?.method === "POST") {
        return jsonResponse({ ...facilitiesResponse[0], is_active: false });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityEdit();

    await user.click(await screen.findByRole("button", { name: "Nonaktifkan" }));
    expect(await screen.findByText("Fasilitas dinonaktifkan.")).toBeVisible();
    expect(screen.getByText("Nonaktif")).toBeVisible();
  });

  it("submits supported image, open-hour, and blackout creation payloads", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities" && !init?.method) {
        return jsonResponse(facilitiesResponse);
      }

      if (url === "http://localhost:8000/staff/facilities/grand-auditorium/images" && init?.method === "POST") {
        expect(init.body).toBe(
          JSON.stringify({
            alt_text: "Cover auditorium",
            display_order: 0,
            is_cover: false,
            url: "https://cdn.example.test/auditorium.jpg",
          }),
        );
        return jsonResponse({ id: "image-1" }, 201);
      }

      if (url === "http://localhost:8000/staff/facilities/grand-auditorium/open-hours" && init?.method === "POST") {
        expect(init.body).toBe(JSON.stringify({ closes_at: "16:00", day_of_week: 0, opens_at: "08:00" }));
        return jsonResponse({ id: "open-hour-1" }, 201);
      }

      if (url === "http://localhost:8000/staff/facilities/grand-auditorium/blackouts" && init?.method === "POST") {
        expect(init.body).toBe(
          JSON.stringify({
            ends_at: "2026-06-01T04:00:00+07:00",
            reason: "Maintenance",
            starts_at: "2026-06-01T03:00:00+07:00",
          }),
        );
        return jsonResponse({ id: "blackout-1" }, 201);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityEdit();

    await user.type(await screen.findByLabelText("URL Gambar"), "https://cdn.example.test/auditorium.jpg");
    await user.type(screen.getByLabelText("Teks Alternatif"), "Cover auditorium");
    await user.click(screen.getByRole("button", { name: "Tambah Gambar" }));
    expect(await screen.findByText("Gambar fasilitas ditambahkan.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Tambah Jam Buka" }));
    expect(await screen.findByText("Jam buka fasilitas ditambahkan.")).toBeVisible();

    await user.type(screen.getByLabelText("Alasan blackout"), "Maintenance");
    await user.click(screen.getByRole("button", { name: "Tambah Blackout" }));
    expect(await screen.findByText("Blackout fasilitas ditambahkan.")).toBeVisible();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/facilities/grand-auditorium/images",
        expect.objectContaining({ method: "POST" }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/facilities/grand-auditorium/open-hours",
        expect.objectContaining({ method: "POST" }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/facilities/grand-auditorium/blackouts",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
