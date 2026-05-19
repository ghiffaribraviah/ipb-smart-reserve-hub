import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import type { StudentReservationWorkflowProjection } from "../../reservations/studentReservationWorkflow";
import { StudentReservationListPage } from "./StudentReservationListPage";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
      status,
    }),
  );
}

const baseReservation: StudentReservationWorkflowProjection = {
  activity_title: "Simposium Etika AI",
  cancellation_reason: null,
  cancellation_rejection_reason: null,
  contact_phone: "08123456789",
  document: {
    approval_letter: null,
    rejection_reason: null,
    review_status: "upload_needed",
    signed_approval_letter: null,
  },
  document_upload_due_at: "2026-06-23T09:00:00Z",
  document_verification_due_at: null,
  ends_at: "2026-06-24T13:00:00Z",
  event_description: "Diskusi akademik lintas fakultas.",
  extra_requirements: {
    av_support: false,
    extra_cleaning: false,
    logistics_coordination: false,
    notes: null,
    security_personnel: false,
  },
  facility: { id: "facility-1", name: "Grand Auditorium" },
  id: "doc-upload",
  organization_unit: { id: "org-1", name: "BEM KM IPB" },
  participant_count: 80,
  payment: {
    receipt: null,
    rejection_reason: null,
    required: false,
    review_status: "not_required",
  },
  payment_upload_due_at: null,
  payment_verification_due_at: null,
  price_rupiah: 0,
  rejection: null,
  reservation_code: "RSV-001",
  review: null,
  starts_at: "2026-06-24T09:00:00Z",
  status: "pending_document_upload",
};

type ReservationOverride = Partial<Omit<StudentReservationWorkflowProjection, "document" | "payment">> & {
  document?: Partial<StudentReservationWorkflowProjection["document"]>;
  payment?: Partial<StudentReservationWorkflowProjection["payment"]>;
};

function reservation(overrides: ReservationOverride): StudentReservationWorkflowProjection {
  return {
    ...baseReservation,
    ...overrides,
    document: { ...baseReservation.document, ...overrides.document },
    payment: { ...baseReservation.payment, ...overrides.payment },
  };
}

function mockReservationsFetch(reservations: StudentReservationWorkflowProjection[], status = 200) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);

    if (url === "http://localhost:8000/student/reservations") {
      return jsonResponse(status === 200 ? reservations : { detail: "temporary outage" }, status);
    }

    return jsonResponse({ detail: `Unhandled ${url}` }, 404);
  });
}

function renderList() {
  return renderWithProviders(
    <Routes>
      <Route element={<StudentReservationListPage />} path="/student/reservations" />
    </Routes>,
    { initialEntries: ["/student/reservations"] },
  );
}

describe("StudentReservationListPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("loads reservation cards from the backend", async () => {
    const fetchMock = mockReservationsFetch([baseReservation]);

    renderList();

    expect(await screen.findByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    expect(screen.getByText("Menunggu Unggah Dokumen")).toBeVisible();
    expect(screen.getByText("BEM KM IPB")).toBeVisible();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/student/reservations", expect.any(Object));
    });
  });

  it("routes card actions through the shared workflow mapper", async () => {
    mockReservationsFetch([
      baseReservation,
      reservation({
        document: { review_status: "approved" },
        id: "approved",
        payment: { review_status: "approved" },
        status: "approved",
      }),
      reservation({
        id: "completed",
        review: null,
        status: "completed",
      }),
    ]);

    renderList();

    expect(await screen.findByRole("link", { name: "Unggah Surat" })).toHaveAttribute(
      "href",
      "/student/reservations/doc-upload/letter",
    );
    expect(screen.getByRole("link", { name: "Ajukan Pembatalan" })).toHaveAttribute(
      "href",
      "/student/reservations/approved/cancellation",
    );
    expect(screen.getAllByRole("link", { name: "Lihat Detail" }).at(-1)).toHaveAttribute(
      "href",
      "/student/reservations/completed",
    );
  });

  it("renders terminal history cards without cancellation actions", async () => {
    const user = userEvent.setup();
    mockReservationsFetch([
      reservation({ id: "cancelled", status: "cancelled" }),
      reservation({ id: "expired", status: "expired" }),
    ]);

    renderList();

    await screen.findByRole("heading", { name: "Reservasi Saya" });
    await user.click(screen.getByRole("tab", { name: "Riwayat" }));

    expect(await screen.findByText("Dibatalkan")).toBeVisible();
    expect(screen.getByText("Kedaluwarsa")).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Lihat Detail" })[0]).toHaveAttribute(
      "href",
      "/student/reservations/cancelled",
    );
    expect(screen.queryByRole("link", { name: "Batalkan" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ajukan Pembatalan" })).not.toBeInTheDocument();
  });

  it("renders a stable empty state", async () => {
    mockReservationsFetch([]);

    renderList();

    expect(await screen.findByText("Belum ada reservasi aktif.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Cari Fasilitas" })).toHaveAttribute("href", "/student/facilities");
  });

  it("shows recoverable feedback when loading reservations fails", async () => {
    const user = userEvent.setup();
    let calls = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/student/reservations") {
        calls += 1;
        return calls === 1
          ? jsonResponse({ detail: "temporary outage" }, 503)
          : jsonResponse([baseReservation]);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderList();

    expect(await screen.findByText("Daftar reservasi belum dapat dimuat.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Coba Lagi" }));

    expect(await screen.findByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
  });
});
