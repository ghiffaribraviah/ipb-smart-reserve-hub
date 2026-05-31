import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import { StudentReservationDetailPage } from "./StudentReservationCreatePages";

const organizationUnits = [
  { code: "BEM-KM", id: "org-1", name: "BEM KM IPB", type: "student_organization" },
  { code: "HIMALKOM", id: "org-2", name: "Himalkom", type: "student_organization" },
];

const facilityDetail = {
  capacity: 300,
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
      alt_text: "Foto auditorium utama",
      id: "image-1",
      is_cover: true,
      url: "https://cdn.example.test/auditorium-backend-cover.jpg",
    },
  ],
  location: "Kampus Timur",
  name: "Auditorium Backend",
  open_hours_summary: "Senin-Jumat 08:00-18:00",
  price: {
    amount_rupiah: 250000,
    is_free: false,
    summary: "Rp250.000",
  },
  review_summary: {
    rating_average: 4.9,
    review_count: 124,
  },
  reviews: [],
};

const reservationResponse = {
  id: "reservation-uuid-1",
  reservation_code: "RSV-001",
  status: "pending_document_upload",
};

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
      status,
    }),
  );
}

function renderDetailPage() {
  return renderWithProviders(
    <Routes>
      <Route element={<StudentReservationDetailPage />} path="/student/facilities/:facilityId/reserve/details" />
      <Route element={<h1>Approval Letter</h1>} path="/student/reservations/:reservationId/letter" />
    </Routes>,
    {
      initialEntries: [
        "/student/facilities/facility-uuid-1/reserve/details?starts_at=2026-06-24T09%3A00%3A00.000Z&ends_at=2026-06-24T13%3A00%3A00.000Z",
      ],
    },
  );
}

function renderDetailPageAt(initialEntry: string) {
  return renderWithProviders(
    <Routes>
      <Route element={<StudentReservationDetailPage />} path="/student/facilities/:facilityId/reserve/details" />
      <Route element={<h1>Approval Letter</h1>} path="/student/reservations/:reservationId/letter" />
    </Routes>,
    { initialEntries: [initialEntry] },
  );
}

function mockReservationSubmitFetch({
  facility = facilityDetail,
  organizations = organizationUnits,
  submit = reservationResponse,
  submitStatus = 201,
}: {
  facility?: unknown;
  organizations?: unknown;
  submit?: unknown;
  submitStatus?: number;
} = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);

    if (url === "http://localhost:8000/facilities/facility-uuid-1") {
      return jsonResponse(facility);
    }

    if (url === "http://localhost:8000/organization-units") {
      return jsonResponse(organizations);
    }

    if (url === "http://localhost:8000/facilities/facility-uuid-1/reservations") {
      return jsonResponse(submit, submitStatus);
    }

    return jsonResponse({ detail: `Unhandled ${url}` }, 404);
  });
}

async function fillValidForm(user = userEvent.setup()) {
  await user.type(await screen.findByLabelText("Nama Kegiatan"), "Simposium Etika AI");
  await user.type(screen.getByLabelText("Estimasi Jumlah Peserta"), "80");
  await user.selectOptions(screen.getByLabelText("Organisasi"), "org-1");
  await user.type(screen.getByLabelText("Nomor Kontak"), "08123456789");
  await user.type(screen.getByLabelText("Deskripsi Kegiatan"), "Diskusi akademik lintas fakultas.");
  await user.click(screen.getByLabelText("Dukungan AV & mikrofon"));
  await user.click(screen.getByLabelText("Koordinasi Logistik"));
  await user.type(screen.getByLabelText("Catatan Tambahan"), "Butuh dua mikrofon nirkabel.");
  return user;
}

describe("StudentReservationDetailPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("loads organization units and submits reservation details to the backend", async () => {
    const fetchMock = mockReservationSubmitFetch();
    const user = userEvent.setup();

    renderDetailPage();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Lanjutkan" }));

    expect(await screen.findByRole("heading", { name: "Approval Letter" })).toBeVisible();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/facilities/facility-uuid-1/reservations",
        expect.objectContaining({
          body: JSON.stringify({
            activity_title: "Simposium Etika AI",
            contact_phone: "08123456789",
            ends_at: "2026-06-24T13:00:00.000Z",
            event_description: "Diskusi akademik lintas fakultas.",
            extra_requirements: {
              av_support: true,
              extra_cleaning: false,
              logistics_coordination: true,
              notes: "Butuh dua mikrofon nirkabel.",
              security_personnel: false,
            },
            organization_unit_id: "org-1",
            participant_count: 80,
            starts_at: "2026-06-24T09:00:00.000Z",
          }),
          method: "POST",
        }),
      );
    });
  });

  it("renders reservation summary from backend facility data without fixture admin fees", async () => {
    mockReservationSubmitFetch();

    renderDetailPage();

    expect(await screen.findByText("Auditorium Backend")).toBeVisible();
    expect(screen.getByRole("img", { name: "Foto auditorium utama" })).toHaveAttribute(
      "src",
      "https://cdn.example.test/auditorium-backend-cover.jpg",
    );
    expect(screen.queryByText("Deterministic media fixture")).not.toBeInTheDocument();
    expect(screen.getByText("Kapasitas: 300 orang")).toBeVisible();
    expect(screen.getAllByText("Rp250.000")).toHaveLength(2);
    expect(screen.getByText("Total Biaya")).toBeVisible();
    expect(screen.queryByText("Biaya admin")).not.toBeInTheDocument();
    expect(screen.queryByText("Rp 115.000,00")).not.toBeInTheDocument();
  });

  it("renders the reservation summary schedule from the selected query range", async () => {
    mockReservationSubmitFetch();

    renderDetailPageAt(
      "/student/facilities/facility-uuid-1/reserve/details?starts_at=2026-06-25T14%3A30%3A00%2B07%3A00&ends_at=2026-06-25T16%3A45%3A00%2B07%3A00",
    );

    expect(await screen.findByText("Auditorium Backend")).toBeVisible();
    expect(screen.getByText("25 Juni 2026")).toBeVisible();
    expect(screen.getByText("14:30 - 16:45")).toBeVisible();
    expect(screen.queryByText("24 Oktober 2024")).not.toBeInTheDocument();
    expect(screen.queryByText("09:00 - 13:00")).not.toBeInTheDocument();
  });

  it("renders an inline state when no organization units are available", async () => {
    mockReservationSubmitFetch({ organizations: [] });

    renderDetailPage();

    expect(await screen.findByText("Belum ada unit organisasi aktif.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Lanjutkan" })).toBeDisabled();
  });

  it("validates required fields and participant count", async () => {
    const user = userEvent.setup();
    mockReservationSubmitFetch();

    renderDetailPage();
    await user.click(await screen.findByRole("button", { name: "Lanjutkan" }));

    expect(screen.getByText("Nama kegiatan wajib diisi.")).toBeVisible();
    expect(screen.getByText("Jumlah peserta harus lebih dari 0.")).toBeVisible();
    expect(screen.getByText("Nomor kontak wajib diisi.")).toBeVisible();
    expect(screen.getByText("Deskripsi kegiatan wajib diisi.")).toBeVisible();
  });

  it("caps title, contact, and extra notes at the intended input lengths", async () => {
    const user = userEvent.setup();
    mockReservationSubmitFetch();

    renderDetailPage();
    const titleInput = await screen.findByLabelText("Nama Kegiatan");
    const contactInput = screen.getByLabelText("Nomor Kontak");
    const notesInput = screen.getByLabelText("Catatan Tambahan");

    await user.type(titleInput, "A".repeat(256));
    await user.type(contactInput, "0".repeat(33));
    await user.type(notesInput, "x".repeat(181));

    expect(titleInput).toHaveAttribute("maxlength", "255");
    expect(contactInput).toHaveAttribute("maxlength", "32");
    expect(notesInput).toHaveAttribute("maxlength", "180");
    expect(titleInput).toHaveValue("A".repeat(255));
    expect(contactInput).toHaveValue("0".repeat(32));
    expect(notesInput).toHaveValue("x".repeat(180));
  }, 10_000);

  it("shows conflict feedback and keeps the form actionable", async () => {
    const user = userEvent.setup();
    mockReservationSubmitFetch({
      submit: { detail: "Waktu reservasi tidak tersedia." },
      submitStatus: 409,
    });

    renderDetailPage();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Lanjutkan" }));

    expect(await screen.findByText("Waktu reservasi tidak tersedia.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Lanjutkan" })).toBeEnabled();
  });

  it("falls back to the default reservation time window when query params are invalid", async () => {
    const fetchMock = mockReservationSubmitFetch();
    const user = userEvent.setup();

    renderDetailPageAt("/student/facilities/facility-uuid-1/reserve/details?starts_at=invalid&ends_at=also-invalid");
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Lanjutkan" }));

    expect(await screen.findByRole("heading", { name: "Approval Letter" })).toBeVisible();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/facilities/facility-uuid-1/reservations",
        expect.objectContaining({
          body: JSON.stringify({
            activity_title: "Simposium Etika AI",
            contact_phone: "08123456789",
            ends_at: "2026-06-24T13:00:00+07:00",
            event_description: "Diskusi akademik lintas fakultas.",
            extra_requirements: {
              av_support: true,
              extra_cleaning: false,
              logistics_coordination: true,
              notes: "Butuh dua mikrofon nirkabel.",
              security_personnel: false,
            },
            organization_unit_id: "org-1",
            participant_count: 80,
            starts_at: "2026-06-24T09:00:00+07:00",
          }),
          method: "POST",
        }),
      );
    });
  });

  it("falls back to the default reservation time window when query params are reversed", async () => {
    const fetchMock = mockReservationSubmitFetch();
    const user = userEvent.setup();

    renderDetailPageAt(
      "/student/facilities/facility-uuid-1/reserve/details?starts_at=2026-06-24T13%3A00%3A00%2B07%3A00&ends_at=2026-06-24T09%3A00%3A00%2B07%3A00",
    );
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Lanjutkan" }));

    expect(await screen.findByRole("heading", { name: "Approval Letter" })).toBeVisible();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/facilities/facility-uuid-1/reservations",
        expect.objectContaining({
          body: JSON.stringify({
            activity_title: "Simposium Etika AI",
            contact_phone: "08123456789",
            ends_at: "2026-06-24T13:00:00+07:00",
            event_description: "Diskusi akademik lintas fakultas.",
            extra_requirements: {
              av_support: true,
              extra_cleaning: false,
              logistics_coordination: true,
              notes: "Butuh dua mikrofon nirkabel.",
              security_personnel: false,
            },
            organization_unit_id: "org-1",
            participant_count: 80,
            starts_at: "2026-06-24T09:00:00+07:00",
          }),
          method: "POST",
        }),
      );
    });
  });

  it("disables submit while reservation creation is loading", async () => {
    const user = userEvent.setup();
    let resolveSubmit: (response: Response) => void = () => undefined;

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/organization-units") {
        return jsonResponse(organizationUnits);
      }

      if (url === "http://localhost:8000/facilities/facility-uuid-1/reservations") {
        return new Promise((resolve) => {
          resolveSubmit = resolve;
        });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDetailPage();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Lanjutkan" }));

    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
    resolveSubmit(
      new Response(JSON.stringify(reservationResponse), {
        headers: { "Content-Type": "application/json" },
        status: 201,
      }),
    );
    expect(await screen.findByRole("heading", { name: "Approval Letter" })).toBeVisible();
  });
});
