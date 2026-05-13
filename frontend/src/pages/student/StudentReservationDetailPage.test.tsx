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

function mockReservationSubmitFetch({
  organizations = organizationUnits,
  submit = reservationResponse,
  submitStatus = 201,
}: {
  organizations?: unknown;
  submit?: unknown;
  submitStatus?: number;
} = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);

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
    await user.click(screen.getByRole("button", { name: "Lanjut ke Surat" }));

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

  it("renders an inline state when no organization units are available", async () => {
    mockReservationSubmitFetch({ organizations: [] });

    renderDetailPage();

    expect(await screen.findByText("Belum ada unit organisasi aktif.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Lanjut ke Surat" })).toBeDisabled();
  });

  it("validates required fields, participant count, contact phone, and extra notes", async () => {
    const user = userEvent.setup();
    mockReservationSubmitFetch();

    renderDetailPage();
    await user.click(await screen.findByRole("button", { name: "Lanjut ke Surat" }));

    expect(screen.getByText("Nama kegiatan wajib diisi.")).toBeVisible();
    expect(screen.getByText("Jumlah peserta harus lebih dari 0.")).toBeVisible();
    expect(screen.getByText("Nomor kontak wajib diisi.")).toBeVisible();
    expect(screen.getByText("Deskripsi kegiatan wajib diisi.")).toBeVisible();

    await user.type(screen.getByLabelText("Catatan Tambahan"), "x".repeat(181));
    await user.click(screen.getByRole("button", { name: "Lanjut ke Surat" }));
    expect(screen.getByText("Catatan tambahan maksimal 180 karakter.")).toBeVisible();
  });

  it("shows conflict feedback and keeps the form actionable", async () => {
    const user = userEvent.setup();
    mockReservationSubmitFetch({
      submit: { detail: "Waktu reservasi tidak tersedia." },
      submitStatus: 409,
    });

    renderDetailPage();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Lanjut ke Surat" }));

    expect(await screen.findByText("Waktu reservasi tidak tersedia.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Lanjut ke Surat" })).toBeEnabled();
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
    await user.click(screen.getByRole("button", { name: "Lanjut ke Surat" }));

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
