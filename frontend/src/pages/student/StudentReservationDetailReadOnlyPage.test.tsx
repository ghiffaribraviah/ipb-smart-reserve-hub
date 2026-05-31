import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import type { StudentReservationWorkflowProjection } from "../../reservations/studentReservationWorkflow";
import { StudentReservationDetailReadOnlyPage } from "./StudentReservationDetailReadOnlyPage";

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
    approval_letter: {
      content_type: "application/pdf",
      filename: "surat-persetujuan.pdf",
      generated_at: "2026-06-01T03:00:00Z",
      size_bytes: 128000,
    },
    rejection_reason: null,
    review_status: "approved",
    signed_approval_letter: {
      content_type: "application/pdf",
      filename: "surat-persetujuan-ditandatangani.pdf",
      size_bytes: 1200000,
      uploaded_at: "2026-06-02T03:00:00Z",
    },
  },
  document_upload_due_at: null,
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
  facility: {
    cover_image_url: "https://cdn.example.test/grand-auditorium-cover.jpg",
    id: "facility-1",
    name: "Grand Auditorium",
  },
  id: "reservation-1",
  organization_unit: { id: "org-1", name: "BEM KM IPB" },
  participant_count: 80,
  payment: {
    receipt: {
      content_type: "image/jpeg",
      filename: "bukti-pembayaran.jpg",
      size_bytes: 840000,
      uploaded_at: "2026-06-03T03:00:00Z",
    },
    rejection_reason: null,
    required: true,
    review_status: "approved",
  },
  payment_upload_due_at: null,
  payment_verification_due_at: null,
  price_rupiah: 1500000,
  rejection: null,
  reservation_code: "RSV-001",
  review: null,
  starts_at: "2026-06-24T09:00:00Z",
  status: "approved",
};

type ReservationOverride = Partial<Omit<StudentReservationWorkflowProjection, "document" | "payment">> & {
  document?: Partial<StudentReservationWorkflowProjection["document"]>;
  payment?: Partial<StudentReservationWorkflowProjection["payment"]>;
};

function reservation(overrides: ReservationOverride = {}): StudentReservationWorkflowProjection {
  return {
    ...baseReservation,
    ...overrides,
    document: { ...baseReservation.document, ...overrides.document },
    payment: { ...baseReservation.payment, ...overrides.payment },
  };
}

function mockReservationFetch(body: StudentReservationWorkflowProjection) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);

    if (url === `http://localhost:8000/student/reservations/${body.id}`) {
      return jsonResponse(body);
    }

    if (url.endsWith("/download")) {
      return Promise.resolve(
        new Response(new Blob(["file"]), {
          headers: {
            "Content-Disposition": 'attachment; filename="file.pdf"',
            "Content-Type": "application/pdf",
          },
          status: 200,
        }),
      );
    }

    if (url === `http://localhost:8000/student/reservations/${body.id}/review`) {
      return jsonResponse({
        admin_removal_reason: null,
        deleted_at: null,
        deleted_by: null,
        id: "review-1",
        is_deleted: false,
      }, 201);
    }

    return jsonResponse({ detail: `Unhandled ${url}` }, 404);
  });
}

function renderDetail(initialEntry = "/student/reservations/reservation-1") {
  return renderWithProviders(
    <Routes>
      <Route element={<StudentReservationDetailReadOnlyPage />} path="/student/reservations/:reservationId" />
      <Route element={<p>Upload letter route</p>} path="/student/reservations/:reservationId/letter" />
    </Routes>,
    { initialEntries: [initialEntry] },
  );
}

describe("StudentReservationDetailReadOnlyPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("loads an accepted reservation detail from the backend, hides the template, and highlights the signed letter", async () => {
    const user = userEvent.setup();
    const fetchMock = mockReservationFetch(reservation());
    const openMock = vi.spyOn(window, "open").mockImplementation(() => null);
    const createObjectURLMock = vi.spyOn(URL, "createObjectURL").mockImplementation(() => "blob:http://localhost/signed-letter");

    renderDetail();

    expect(await screen.findByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    expect(screen.getByRole("img", { name: "Foto Grand Auditorium" })).toHaveAttribute(
      "src",
      "https://cdn.example.test/grand-auditorium-cover.jpg",
    );
    expect(screen.queryByText("Deterministic media fixture")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ajukan Pembatalan" })).toHaveAttribute(
      "href",
      "/student/reservations/reservation-1/cancellation",
    );
    expect(screen.queryByText("surat-persetujuan.pdf")).not.toBeInTheDocument();
    expect(screen.getByText("surat-persetujuan-ditandatangani.pdf")).toBeVisible();
    expect(screen.getByText("bukti-pembayaran.jpg")).toBeVisible();
    expect(screen.getAllByText("Disetujui")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Lihat Dokumen" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Unduh Dokumen" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Lihat Dokumen" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/student/reservations/reservation-1/signed-approval-letter/download",
        expect.any(Object),
      );
    });
    expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
    expect(openMock).toHaveBeenCalledWith("blob:http://localhost/signed-letter", "_blank", "noopener,noreferrer");
  });

  it("offers payment continuation when a paid reservation document is accepted but payment is still due", async () => {
    mockReservationFetch(reservation({
      payment: {
        receipt: null,
        required: true,
        review_status: "upload_needed",
      },
      status: "approved",
    }));

    renderDetail();

    expect(await screen.findByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Lanjut ke Pembayaran" })).toHaveAttribute(
      "href",
      "/student/reservations/reservation-1/payment",
    );
    expect(screen.getByRole("link", { name: "Ajukan Pembatalan" })).toHaveAttribute(
      "href",
      "/student/reservations/reservation-1/cancellation",
    );
  });

  it("omits document rows when backend metadata is null", async () => {
    mockReservationFetch(reservation({
      document: { approval_letter: null, signed_approval_letter: null },
      payment: { receipt: null },
    }));

    renderDetail();

    expect(await screen.findByText("Belum ada dokumen tersedia.")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Unduh" })).not.toBeInTheDocument();
    expect(screen.queryByText("surat-persetujuan-ditandatangani.pdf")).not.toBeInTheDocument();
  });

  it("shows the inline review form for completed reservations without a visible review", async () => {
    const user = userEvent.setup();
    const fetchMock = mockReservationFetch(reservation({ status: "completed" }));

    renderDetail();

    expect(await screen.findByRole("heading", { name: "Tulis Ulasan" })).toBeVisible();
    await user.click(screen.getByRole("radio", { name: "5 dari 5" }));
    await user.type(screen.getByLabelText("Komentar"), "Ruang bersih dan perangkat audio siap digunakan.");
    await user.click(screen.getByRole("button", { name: "Kirim Ulasan" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/student/reservations/reservation-1/review",
        expect.objectContaining({
          body: JSON.stringify({
            comment: "Ruang bersih dan perangkat audio siap digunakan.",
            rating: 5,
          }),
          method: "POST",
        }),
      ),
    );
    expect(await screen.findByText("Reservasi telah selesai dan ulasan Anda sudah tercatat.")).toBeVisible();
    expect(screen.queryByRole("link", { name: "Ajukan Pembatalan" })).not.toBeInTheDocument();
  });

  it("hides duplicate review CTA when a completed reservation already has a review", async () => {
    mockReservationFetch(reservation({
      review: {
        admin_removal_reason: null,
        deleted_at: null,
        deleted_by: null,
        id: "review-1",
        is_deleted: false,
      },
      status: "completed",
    }));

    renderDetail();

    expect(await screen.findByText("Reservasi telah selesai dan ulasan Anda sudah tercatat.")).toBeVisible();
    expect(screen.queryByRole("link", { name: "Tulis Ulasan" })).not.toBeInTheDocument();
  });

  it("shows the cancellation reason on cancelled reservation detail", async () => {
    mockReservationFetch(reservation({
      cancellation_reason: "Jadwal kegiatan berubah: agenda organisasi dipindahkan.",
      status: "cancelled",
    }));

    renderDetail();

    expect(
      await screen.findByText(
        "Reservasi ini sudah dibatalkan. Alasan: Jadwal kegiatan berubah: agenda organisasi dipindahkan.",
      ),
    ).toBeVisible();
    expect(screen.queryByRole("link", { name: "Ajukan Pembatalan" })).not.toBeInTheDocument();
  });

  it("redirects document-rejected reservation detail to the declined state so the rejection reason stays visible", async () => {
    mockReservationFetch(reservation({
      document: {
        approval_letter: {
          content_type: "application/pdf",
          filename: "surat-persetujuan.pdf",
          generated_at: "2026-06-01T03:00:00Z",
          size_bytes: 128000,
        },
        rejection_reason: "Tanda tangan pembina belum terlihat jelas.",
        review_status: "rejected",
        signed_approval_letter: {
          content_type: "application/pdf",
          filename: "surat-persetujuan-ditandatangani.pdf",
          size_bytes: 1200000,
          uploaded_at: "2026-06-02T03:00:00Z",
        },
      },
      rejection: { reason: "Tanda tangan pembina belum terlihat jelas.", source: "document" },
      status: "rejected",
    }));

    renderWithProviders(
      <Routes>
        <Route element={<StudentReservationDetailReadOnlyPage />} path="/student/reservations/:reservationId" />
        <Route element={<p>Document declined route</p>} path="/student/reservations/:reservationId/verification/declined" />
      </Routes>,
      { initialEntries: ["/student/reservations/reservation-1"] },
    );

    expect(await screen.findByText("Document declined route")).toBeVisible();
  });

  it("redirects stale detail states to the canonical workflow route", async () => {
    mockReservationFetch(reservation({
      document: { approval_letter: null, review_status: "upload_needed", signed_approval_letter: null },
      id: "reservation-1",
      payment: { receipt: null, review_status: "not_required" },
      status: "pending_document_upload",
    }));

    renderDetail();

    expect(await screen.findByText("Upload letter route")).toBeVisible();
  });
});
