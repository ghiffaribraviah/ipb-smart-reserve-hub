import { screen, waitFor, within } from "@testing-library/react";
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
    category_id: "category-auditorium",
    contact_email: "auditorium@apps.ipb.ac.id",
    contact_name: "Staff Auditorium",
    contact_phone: "08123456789",
    description: "Auditorium utama untuk seminar besar dan pertemuan fakultas.",
    id: "grand-auditorium",
    is_active: true,
    location: "Kampus Dramaga",
    name: "Grand Auditorium",
    open_hours: [
      { id: "open-hour-1", day_of_week: 0, opens_at: "08:00", closes_at: "18:00" },
      { id: "open-hour-2", day_of_week: 1, opens_at: "08:00", closes_at: "18:00" },
    ],
    open_hours_summary: "Senin-Jumat, 08:00-18:00",
    payment_instructions: null,
    price_rupiah: 100000,
    price_summary: "Rp100.000 / jam",
  },
  {
    capacity: 25,
    category: "Lanskap / Outdoor",
    category_id: "category-outdoor",
    contact_email: null,
    contact_name: "Staff Greenhouse",
    contact_phone: "08129876543",
    description: "Fasilitas pertanian lingkungan terkendali.",
    id: "agri-tech-greenhouses",
    is_active: false,
    location: "Kampus Barat",
    name: "Agri-Tech Greenhouses",
    open_hours: [{ id: "open-hour-3", day_of_week: 0, opens_at: "08:00", closes_at: "16:00" }],
    open_hours_summary: "Senin-Jumat, 08:00-16:00",
    payment_instructions: null,
    price_rupiah: 0,
    price_summary: "Gratis",
  },
];

const categoriesResponse = [
  { facility_count: 1, icon_hint: "presentation", id: "category-auditorium", name: "Auditorium / Seminar", slug: "auditorium" },
  { facility_count: 0, icon_hint: "book", id: "category-classroom", name: "Ruang Kelas", slug: "kelas" },
  { facility_count: 1, icon_hint: "leaf", id: "category-outdoor", name: "Lanskap / Outdoor", slug: "outdoor" },
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
    vi.useRealTimers();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("loads assigned facilities from the staff backend and links by backend id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities") {
        return jsonResponse([
          {
            ...facilitiesResponse[0],
            images: [
              {
                alt_text: "Cover Grand Auditorium",
                display_order: 0,
                id: "image-cover",
                is_active: true,
                is_cover: true,
                url: "https://cdn.example.test/grand-auditorium-cover.jpg",
              },
            ],
          },
          facilitiesResponse[1],
        ]);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityList();

    expect(await screen.findByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    expect(screen.getByRole("img", { name: "Cover Grand Auditorium" })).toHaveAttribute(
      "src",
      "https://cdn.example.test/grand-auditorium-cover.jpg",
    );
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
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2024-10-24T00:00:00.000Z"));
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities") {
        return jsonResponse(facilitiesResponse);
      }

      if (url.startsWith("http://localhost:8000/staff/facilities/grand-auditorium/schedule")) {
        return jsonResponse(scheduleResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilitySchedule();

    expect(await screen.findByRole("heading", { name: "Jadwal Fasilitas" })).toBeVisible();
    expect(screen.getByText("Grand Auditorium")).toBeVisible();
    expect((await screen.findAllByText("Simposium Etika AI 2024"))[0]).toBeVisible();
    expect(screen.getByRole("button", { name: "Pilih 24 Oktober 2024: 2 reservasi" })).toBeVisible();
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

  it("lets staff select a calendar date and page between schedule months", async () => {
    const user = userEvent.setup();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2024-10-24T00:00:00.000Z"));
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities") {
        return jsonResponse(facilitiesResponse);
      }

      if (url.startsWith("http://localhost:8000/staff/facilities/grand-auditorium/schedule")) {
        return jsonResponse(scheduleResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilitySchedule();

    await user.click(await screen.findByRole("button", { name: "Pilih 25 Oktober 2024: 0 reservasi" }));
    const agenda = screen.getByLabelText("Agenda tanggal terpilih");
    expect(screen.getByLabelText("Tanggal jadwal terpilih")).toHaveValue("2024-10-25");
    expect(within(agenda).getByText("25 Oktober 2024")).toBeVisible();
    expect(await within(agenda).findByText("Tidak ada reservasi pada tanggal ini.")).toBeVisible();
    expect(within(agenda).queryByText("Simposium Etika AI 2024")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Bulan berikutnya" }));
    expect(screen.getByLabelText("Tanggal jadwal terpilih")).toHaveValue("2024-11-25");
    expect(screen.getByRole("heading", { name: "November 2024" })).toBeVisible();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(
          /^http:\/\/localhost:8000\/staff\/facilities\/grand-auditorium\/schedule\?start=2024-11-01T00%3A00%3A00%2B07%3A00&end=2024-11-30T23%3A59%3A59%2B07%3A00$/,
        ),
        expect.any(Object),
      );
    });
  });

  it("shows schedule empty and access-denied states", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2024-10-24T00:00:00.000Z"));
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

  it("does not render fixture month or reservation dots when the backend schedule is empty", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-06-12T00:00:00.000Z"));
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/staff/facilities/empty-room/schedule")) {
        return jsonResponse([]);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilitySchedule("/staff/facilities/empty-room/schedule");

    expect(await screen.findByText("Tidak ada reservasi pada rentang jadwal ini.")).toBeVisible();
    expect(screen.getByLabelText("Tanggal jadwal terpilih")).toHaveValue("2026-06-12");
    expect(screen.getByRole("heading", { name: "Juni 2026" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Oktober 2024" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pilih 24 Juni 2026: 0 reservasi" })).toBeVisible();
  });

  it("loads the assigned facility edit form and saves supported profile fields", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities" && !init?.method) {
        return jsonResponse(facilitiesResponse);
      }

      if (url === "http://localhost:8000/facility-categories") {
        return jsonResponse(categoriesResponse);
      }

      if (url === "http://localhost:8000/staff/facilities/grand-auditorium" && init?.method === "PATCH") {
        expect(init.body).toBe(
          JSON.stringify({
            capacity: 350,
            category_id: "category-classroom",
            contact_email: "auditorium@apps.ipb.ac.id",
            contact_name: "Staff Auditorium",
            contact_phone: "08123456789",
            description: "Auditorium utama untuk seminar besar dan pertemuan fakultas.",
            is_active: true,
            location: "Kampus Dramaga",
            name: "Grand Auditorium Baru",
            open_hours: [
              { closes_at: "18:00", day_of_week: 0, opens_at: "08:00" },
              { closes_at: "18:00", day_of_week: 1, opens_at: "08:00" },
              { closes_at: "17:00", day_of_week: 2, opens_at: "09:00" },
            ],
            payment_instructions: null,
            price_rupiah: 100000,
          }),
        );
        return jsonResponse({
          ...facilitiesResponse[0],
          capacity: 350,
          category: "Ruang Kelas",
          category_id: "category-classroom",
          name: "Grand Auditorium Baru",
          open_hours: [
            ...facilitiesResponse[0].open_hours,
            { id: "open-hour-4", day_of_week: 2, opens_at: "09:00", closes_at: "17:00" },
          ],
          open_hours_summary: "Senin 08:00-18:00; Selasa 08:00-18:00; Rabu 09:00-17:00",
        });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityEdit();

    expect(await screen.findByLabelText("Nama")).toHaveValue("Grand Auditorium");
    expect(screen.getByLabelText("Kategori Fasilitas")).toHaveValue("category-auditorium");
    await user.clear(screen.getByLabelText("Nama"));
    await user.type(screen.getByLabelText("Nama"), "Grand Auditorium Baru");
    await user.selectOptions(screen.getByLabelText("Kategori Fasilitas"), "category-classroom");
    await user.clear(screen.getByLabelText("Kapasitas (Orang)"));
    await user.type(screen.getByLabelText("Kapasitas (Orang)"), "350");
    await user.click(screen.getByRole("button", { name: "Tambah Baris Jam Buka" }));
    await user.click(screen.getByRole("button", { name: "Hapus Jam Buka 3" }));
    await user.click(screen.getByRole("button", { name: "Tambah Baris Jam Buka" }));
    await user.selectOptions(screen.getByLabelText("Hari buka 3"), "2");
    await user.clear(screen.getByLabelText("Jam buka mulai 3"));
    await user.type(screen.getByLabelText("Jam buka mulai 3"), "09:00");
    await user.clear(screen.getByLabelText("Jam buka selesai 3"));
    await user.type(screen.getByLabelText("Jam buka selesai 3"), "17:00");
    await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

    expect(await screen.findByText("Perubahan fasilitas tersimpan.")).toBeVisible();
    expect(screen.getByLabelText("Nama")).toHaveValue("Grand Auditorium Baru");
    expect(screen.getByLabelText("Kategori Fasilitas")).toHaveValue("category-classroom");
    expect(
      screen.getAllByText((_, element) =>
        Boolean(element?.textContent?.includes("Senin 08:00-18:00; Selasa 08:00-18:00; Rabu 09:00-17:00")),
      )[0],
    ).toBeVisible();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/facilities/grand-auditorium",
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("renders edit open-hour controls as 24-hour HH:mm fields", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities") {
        return jsonResponse(facilitiesResponse);
      }

      if (url === "http://localhost:8000/facility-categories") {
        return jsonResponse(categoriesResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityEdit();

    const opensAt = await screen.findByLabelText("Jam buka mulai 1");
    const closesAt = screen.getByLabelText("Jam buka selesai 1");

    expect(opensAt).toHaveAttribute("type", "text");
    expect(opensAt).toHaveAttribute("inputmode", "numeric");
    expect(opensAt).toHaveAttribute("pattern", "(?:[01][0-9]|2[0-3]):[0-5][0-9]");
    expect(opensAt).toHaveValue("08:00");
    expect(closesAt).toHaveAttribute("type", "text");
    expect(closesAt).toHaveAttribute("inputmode", "numeric");
    expect(closesAt).toHaveAttribute("pattern", "(?:[01][0-9]|2[0-3]):[0-5][0-9]");
    expect(closesAt).toHaveValue("18:00");
  });

  it("renders blackout controls as date fields and 24-hour time selectors", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities") {
        return jsonResponse(facilitiesResponse);
      }

      if (url === "http://localhost:8000/facility-categories") {
        return jsonResponse(categoriesResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityEdit();

    const startsDate = await screen.findByLabelText("Tanggal blackout mulai");
    const startsTime = screen.getByLabelText("Jam blackout mulai");
    const endsDate = screen.getByLabelText("Tanggal blackout selesai");
    const endsTime = screen.getByLabelText("Jam blackout selesai");

    expect(startsDate).toHaveAttribute("type", "date");
    expect(startsDate).toHaveValue("2026-06-01");
    expect(startsTime).toHaveValue("03:00");
    expect(startsTime).toHaveDisplayValue("03:00");
    expect(endsDate).toHaveAttribute("type", "date");
    expect(endsDate).toHaveValue("2026-06-01");
    expect(endsTime).toHaveValue("04:00");
    expect(endsTime).toHaveDisplayValue("04:00");
  });

  it("maps client and API validation errors to visible edit feedback", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities" && !init?.method) {
        return jsonResponse(facilitiesResponse);
      }

      if (url === "http://localhost:8000/facility-categories") {
        return jsonResponse(categoriesResponse);
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
    await user.clear(screen.getByLabelText("Jam buka selesai 1"));
    await user.type(screen.getByLabelText("Jam buka selesai 1"), "07:00");
    await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    expect(await screen.findByText("Jam tutup harus setelah jam buka.")).toBeVisible();

    await user.clear(screen.getByLabelText("Jam buka selesai 1"));
    await user.type(screen.getByLabelText("Jam buka selesai 1"), "18:00");
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

      if (url === "http://localhost:8000/facility-categories") {
        return jsonResponse(categoriesResponse);
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

  it("reactivates an inactive assigned facility from the edit page", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities" && !init?.method) {
        return jsonResponse(facilitiesResponse);
      }

      if (url === "http://localhost:8000/facility-categories") {
        return jsonResponse(categoriesResponse);
      }

      if (url === "http://localhost:8000/staff/facilities/agri-tech-greenhouses" && init?.method === "PATCH") {
        expect(init.body).toBe(JSON.stringify({ is_active: true }));
        return jsonResponse({ ...facilitiesResponse[1], is_active: true });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityEdit("/staff/facilities/agri-tech-greenhouses/edit");

    expect(await screen.findByText("Nonaktif")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Nonaktifkan" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Aktifkan" }));

    expect(await screen.findByText("Fasilitas diaktifkan.")).toBeVisible();
    expect(screen.getByText("Aktif")).toBeVisible();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/facilities/agri-tech-greenhouses",
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("submits supported image and blackout creation payloads", async () => {
    const user = userEvent.setup();
    let facilitiesGetCount = 0;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities" && !init?.method) {
        facilitiesGetCount += 1;
        return jsonResponse([
          {
            ...facilitiesResponse[0],
            images:
              facilitiesGetCount === 1
                ? [
                    {
                      alt_text: "Existing auditorium view",
                      display_order: 1,
                      id: "image-existing",
                      is_active: true,
                      is_cover: true,
                      url: "https://cdn.example.test/existing-auditorium.jpg",
                    },
                  ]
                : [
                    {
                      alt_text: "Cover auditorium",
                      display_order: 0,
                      id: "image-1",
                      is_active: true,
                      is_cover: false,
                      url: "https://cdn.example.test/auditorium.jpg",
                    },
                    {
                      alt_text: "Existing auditorium view",
                      display_order: 1,
                      id: "image-existing",
                      is_active: true,
                      is_cover: true,
                      url: "https://cdn.example.test/existing-auditorium.jpg",
                    },
                  ],
          },
        ]);
      }

      if (url === "http://localhost:8000/facility-categories") {
        return jsonResponse(categoriesResponse);
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

    expect(await screen.findByRole("img", { name: "Existing auditorium view" })).toHaveAttribute(
      "src",
      "https://cdn.example.test/existing-auditorium.jpg",
    );
    await user.type(await screen.findByLabelText("URL Gambar"), "https://cdn.example.test/auditorium.jpg");
    await user.type(screen.getByLabelText("Teks Alternatif"), "Cover auditorium");
    await user.click(screen.getByRole("button", { name: "Tambah Gambar" }));
    expect(await screen.findByText("Gambar fasilitas ditambahkan.")).toBeVisible();
    expect(await screen.findByRole("img", { name: "Cover auditorium" })).toHaveAttribute(
      "src",
      "https://cdn.example.test/auditorium.jpg",
    );

    await user.type(screen.getByLabelText("Alasan blackout"), "Maintenance");
    await user.click(screen.getByRole("button", { name: "Tambah Blackout" }));
    expect(await screen.findByText("Blackout fasilitas ditambahkan.")).toBeVisible();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/facilities/grand-auditorium/images",
        expect.objectContaining({ method: "POST" }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/facilities/grand-auditorium/blackouts",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("lets staff choose an existing facility image as the cover", async () => {
    const user = userEvent.setup();
    let facilitiesGetCount = 0;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/facilities" && !init?.method) {
        facilitiesGetCount += 1;
        return jsonResponse([
          {
            ...facilitiesResponse[0],
            images:
              facilitiesGetCount === 1
                ? [
                    {
                      alt_text: "Cover auditorium",
                      display_order: 0,
                      id: "image-cover",
                      is_active: true,
                      is_cover: true,
                      url: "https://cdn.example.test/auditorium-cover.jpg",
                    },
                    {
                      alt_text: "Tampak samping auditorium",
                      display_order: 1,
                      id: "image-side",
                      is_active: true,
                      is_cover: false,
                      url: "https://cdn.example.test/auditorium-side.jpg",
                    },
                  ]
                : [
                    {
                      alt_text: "Cover auditorium",
                      display_order: 0,
                      id: "image-cover",
                      is_active: true,
                      is_cover: false,
                      url: "https://cdn.example.test/auditorium-cover.jpg",
                    },
                    {
                      alt_text: "Tampak samping auditorium",
                      display_order: 1,
                      id: "image-side",
                      is_active: true,
                      is_cover: true,
                      url: "https://cdn.example.test/auditorium-side.jpg",
                    },
                  ],
          },
        ]);
      }

      if (url === "http://localhost:8000/facility-categories") {
        return jsonResponse(categoriesResponse);
      }

      if (
        url === "http://localhost:8000/staff/facilities/grand-auditorium/images/image-side/cover" &&
        init?.method === "POST"
      ) {
        return jsonResponse({
          alt_text: "Tampak samping auditorium",
          display_order: 1,
          id: "image-side",
          is_active: true,
          is_cover: true,
          url: "https://cdn.example.test/auditorium-side.jpg",
        });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilityEdit();

    await user.click(await screen.findByRole("button", { name: "Pilih Tampak samping auditorium sebagai cover" }));

    expect(await screen.findByText("Cover fasilitas diperbarui.")).toBeVisible();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/facilities/grand-auditorium/images/image-side/cover",
        expect.objectContaining({ method: "POST" }),
      );
    });
    expect(screen.getByText("Cover", { selector: "span" })).toBeVisible();
  });
});
