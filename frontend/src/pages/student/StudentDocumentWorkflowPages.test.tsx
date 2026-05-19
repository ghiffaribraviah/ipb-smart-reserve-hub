import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import type { StudentReservationWorkflowProjection } from "../../reservations/studentReservationWorkflow";
import {
  StudentApprovalLetterPage,
  StudentPaymentDeclinedPage,
  StudentPaymentPage,
  StudentPaymentWaitingPage,
  StudentReservationAcceptedPage,
  StudentVerificationDeclinedPage,
  StudentVerificationWaitingPage,
} from "./StudentDocumentWorkflowPages";

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
  id: "reservation-1",
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

const approvalLetter = {
  content_type: "application/pdf",
  filename: "RSV-001-surat-persetujuan.pdf",
  generated_at: "2026-06-01T03:00:00Z",
  reservation_code: "RSV-001",
  reservation_id: "reservation-1",
  size_bytes: 128000,
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

function mockDocumentFetch({
  approval = approvalLetter,
  reservationBody = baseReservation,
  uploadStatus = 201,
}: {
  approval?: unknown;
  reservationBody?: StudentReservationWorkflowProjection;
  uploadStatus?: number;
} = {}) {
  let uploaded = false;
  return vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url = String(input);

    if (url === "http://localhost:8000/student/reservations/reservation-1") {
      if (uploaded) {
        return jsonResponse(reservation({
          document: {
            signed_approval_letter: {
              content_type: "application/pdf",
              filename: "signed-letter.pdf",
              size_bytes: 1200,
              uploaded_at: "2026-06-01T04:00:00Z",
            },
            review_status: "waiting_review",
          },
          document_verification_due_at: "2026-06-02T04:00:00Z",
          status: "pending_document_review",
        }));
      }
      return jsonResponse(reservationBody);
    }

    if (url === "http://localhost:8000/student/reservations/reservation-1/approval-letter") {
      return jsonResponse(approval);
    }

    if (url === "http://localhost:8000/student/reservations/reservation-1/approval-letter/download") {
      return Promise.resolve(
        new Response(new Blob(["pdf"]), {
          headers: {
            "Content-Disposition": 'attachment; filename="RSV-001-surat-persetujuan.pdf"',
            "Content-Type": "application/pdf",
          },
          status: 200,
        }),
      );
    }

    if (
      url === "http://localhost:8000/student/reservations/reservation-1/signed-approval-letter" &&
      init?.method === "POST"
    ) {
      if (uploadStatus !== 201) {
        return jsonResponse({ detail: "Ukuran surat bertanda tangan maksimal 5 MB." }, uploadStatus);
      }

      uploaded = true;
      return jsonResponse({
        content_type: "application/pdf",
        filename: "signed-letter.pdf",
        reservation_id: "reservation-1",
        size_bytes: 1200,
        uploaded_at: "2026-06-01T04:00:00Z",
      }, 201);
    }

    return jsonResponse({ detail: `Unhandled ${url}` }, 404);
  });
}

function renderDocumentRoutes(initialEntry: string) {
  return renderWithProviders(
    <Routes>
      <Route element={<StudentApprovalLetterPage />} path="/student/reservations/:reservationId/letter" />
      <Route element={<StudentPaymentPage />} path="/student/reservations/:reservationId/payment" />
      <Route element={<StudentPaymentWaitingPage />} path="/student/reservations/:reservationId/payment/waiting" />
      <Route element={<StudentPaymentDeclinedPage />} path="/student/reservations/:reservationId/payment/declined" />
      <Route element={<StudentReservationAcceptedPage />} path="/student/reservations/:reservationId/accepted" />
      <Route element={<StudentVerificationWaitingPage />} path="/student/reservations/:reservationId/verification/waiting" />
      <Route element={<StudentVerificationDeclinedPage />} path="/student/reservations/:reservationId/verification/declined" />
    </Routes>,
    { initialEntries: [initialEntry] },
  );
}

function paidReservation(overrides: ReservationOverride = {}) {
  return reservation({
    document: { review_status: "approved" },
    payment: { required: true, review_status: "upload_needed" },
    price_rupiah: 250000,
    status: "pending_payment",
    ...overrides,
  });
}

function mockPaymentFetch({
  paymentStatus = 200,
  reservationBody = paidReservation(),
  uploadStatus = 201,
}: {
  paymentStatus?: number;
  reservationBody?: StudentReservationWorkflowProjection;
  uploadStatus?: number;
} = {}) {
  let uploaded = false;
  return vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url = String(input);

    if (url === "http://localhost:8000/student/reservations/reservation-1") {
      if (uploaded) {
        return jsonResponse(paidReservation({
          payment: {
            receipt: {
              content_type: "image/jpeg",
              filename: "receipt.jpg",
              size_bytes: 1400,
              uploaded_at: "2026-06-01T04:00:00Z",
            },
            required: true,
            review_status: "waiting_review",
          },
          payment_verification_due_at: "2026-06-02T04:00:00Z",
        }));
      }
      return jsonResponse(reservationBody);
    }

    if (url === "http://localhost:8000/student/reservations/reservation-1/payment") {
      if (paymentStatus !== 200) {
        return jsonResponse(
          { detail: "Pembayaran hanya tersedia untuk reservasi berbayar yang menunggu pembayaran." },
          paymentStatus,
        );
      }
      return jsonResponse({
        amount_rupiah: 250000,
        payment_instructions: "Transfer ke BNI 123456789 a.n. IPB",
        reservation_code: "RSV-001",
        reservation_id: "reservation-1",
      });
    }

    if (
      url === "http://localhost:8000/student/reservations/reservation-1/payment-receipt" &&
      init?.method === "POST"
    ) {
      if (uploadStatus !== 201) {
        return jsonResponse({ detail: "Bukti pembayaran harus berupa JPG, JPEG, atau PNG." }, uploadStatus);
      }
      uploaded = true;
      return jsonResponse({
        content_type: "image/jpeg",
        filename: "receipt.jpg",
        reservation_id: "reservation-1",
        size_bytes: 1400,
        uploaded_at: "2026-06-01T04:00:00Z",
      }, 201);
    }

    return jsonResponse({ detail: `Unhandled ${url}` }, 404);
  });
}

describe("StudentDocumentWorkflowPages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("loads reservation detail and generated approval letter metadata", async () => {
    mockDocumentFetch();

    renderDocumentRoutes("/student/reservations/reservation-1/letter");

    expect(await screen.findByText("RSV-001-surat-persetujuan.pdf")).toBeVisible();
    expect(screen.getByText("Grand Auditorium")).toBeVisible();
    expect(screen.getByText("24 Juni 2026")).toBeVisible();
    expect(screen.getByText("PDF · 125 KB")).toBeVisible();
  });

  it("downloads the generated approval letter through the binary endpoint", async () => {
    const user = userEvent.setup();
    const fetchMock = mockDocumentFetch();

    renderDocumentRoutes("/student/reservations/reservation-1/letter");

    await user.click(await screen.findByRole("button", { name: "Unduh" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/student/reservations/reservation-1/approval-letter/download",
        expect.any(Object),
      );
    });
    expect(await screen.findByText("RSV-001-surat-persetujuan.pdf berhasil diunduh.")).toBeVisible();
  });

  it("validates signed approval letter type and size before upload", async () => {
    const user = userEvent.setup();
    mockDocumentFetch();

    renderDocumentRoutes("/student/reservations/reservation-1/letter");

    const input = await screen.findByLabelText("Pilih file surat persetujuan");
    await user.upload(input, new File(["bad"], "notes.txt", { type: "text/plain" }));
    expect(screen.getByText("Unggah surat bertanda tangan harus berupa PDF, JPG, JPEG, atau PNG.")).toBeVisible();

    await user.upload(
      input,
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.pdf", { type: "application/pdf" }),
    );
    expect(screen.getByText("Ukuran surat bertanda tangan maksimal 5 MB.")).toBeVisible();
  });

  it("uploads a signed approval letter and routes to waiting verification", async () => {
    const user = userEvent.setup();
    const fetchMock = mockDocumentFetch();

    renderDocumentRoutes("/student/reservations/reservation-1/letter");

    await user.upload(
      await screen.findByLabelText("Pilih file surat persetujuan"),
      new File(["pdf"], "signed-letter.pdf", { type: "application/pdf" }),
    );
    await user.click(screen.getByRole("button", { name: "Unggah" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/student/reservations/reservation-1/signed-approval-letter",
        expect.objectContaining({ body: expect.any(FormData), method: "POST" }),
      );
    });
    expect((await screen.findAllByText("Menunggu Verifikasi Dokumen"))[0]).toBeVisible();
  });

  it("shows upload errors without clearing selected file context", async () => {
    const user = userEvent.setup();
    mockDocumentFetch({ uploadStatus: 400 });

    renderDocumentRoutes("/student/reservations/reservation-1/letter");

    await user.upload(
      await screen.findByLabelText("Pilih file surat persetujuan"),
      new File(["pdf"], "signed-letter.pdf", { type: "application/pdf" }),
    );
    await user.click(screen.getByRole("button", { name: "Unggah" }));

    expect(await screen.findByText("Ukuran surat bertanda tangan maksimal 5 MB.")).toBeVisible();
    expect(screen.getAllByText("signed-letter.pdf").length).toBeGreaterThanOrEqual(1);
  });

  it("renders waiting and declined state from reservation projection", async () => {
    mockDocumentFetch({
      reservationBody: reservation({
        document: {
          rejection_reason: "Tanda tangan pembina belum terlihat jelas.",
          review_status: "rejected",
        },
        rejection: { reason: "Tanda tangan pembina belum terlihat jelas.", source: "document" },
        status: "rejected",
      }),
    });

    renderDocumentRoutes("/student/reservations/reservation-1/verification/declined");

    expect(await screen.findByText("Tanda tangan pembina belum terlihat jelas.")).toBeVisible();
    expect(screen.getByText("Ditolak")).toBeVisible();
  });

  it("redirects stale waiting routes to the canonical mapper route", async () => {
    mockDocumentFetch({
      reservationBody: reservation({
        document: { review_status: "approved" },
        payment: { review_status: "approved" },
        status: "approved",
      }),
    });

    renderDocumentRoutes("/student/reservations/reservation-1/verification/waiting");

    expect(await screen.findByRole("heading", { name: "Reservasi Disetujui" })).toBeVisible();
  });

  it("loads payment instructions for eligible paid reservations", async () => {
    mockPaymentFetch();

    renderDocumentRoutes("/student/reservations/reservation-1/payment");

    expect(await screen.findByText("Transfer ke BNI 123456789 a.n. IPB")).toBeVisible();
    expect(screen.getAllByText("Rp250.000")[0]).toBeVisible();
  });

  it("maps unsupported payment state errors from the backend", async () => {
    mockPaymentFetch({ paymentStatus: 409 });

    renderDocumentRoutes("/student/reservations/reservation-1/payment");

    expect(await screen.findByText("Pembayaran hanya tersedia untuk reservasi berbayar yang menunggu pembayaran.")).toBeVisible();
  });

  it("validates receipt type and size before upload", async () => {
    const user = userEvent.setup();
    mockPaymentFetch();

    renderDocumentRoutes("/student/reservations/reservation-1/payment");

    const input = await screen.findByLabelText("Pilih file bukti pembayaran");
    await user.upload(input, new File(["pdf"], "receipt.pdf", { type: "application/pdf" }));
    expect(screen.getByText("Bukti pembayaran harus berupa JPG, JPEG, atau PNG.")).toBeVisible();

    await user.upload(
      input,
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" }),
    );
    expect(screen.getByText("Ukuran bukti pembayaran maksimal 5 MB.")).toBeVisible();
  });

  it("uploads a payment receipt and routes to payment waiting", async () => {
    const user = userEvent.setup();
    const fetchMock = mockPaymentFetch();

    renderDocumentRoutes("/student/reservations/reservation-1/payment");

    await user.upload(
      await screen.findByLabelText("Pilih file bukti pembayaran"),
      new File(["jpg"], "receipt.jpg", { type: "image/jpeg" }),
    );
    await user.click(screen.getByRole("button", { name: "Unggah" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/student/reservations/reservation-1/payment-receipt",
        expect.objectContaining({ body: expect.any(FormData), method: "POST" }),
      );
    });
    expect((await screen.findAllByText("Menunggu Verifikasi Pembayaran"))[0]).toBeVisible();
  });

  it("shows receipt upload backend errors without clearing selected file context", async () => {
    const user = userEvent.setup();
    mockPaymentFetch({ uploadStatus: 400 });

    renderDocumentRoutes("/student/reservations/reservation-1/payment");

    await user.upload(
      await screen.findByLabelText("Pilih file bukti pembayaran"),
      new File(["jpg"], "receipt.jpg", { type: "image/jpeg" }),
    );
    await user.click(screen.getByRole("button", { name: "Unggah" }));

    expect(await screen.findByText("Bukti pembayaran harus berupa JPG, JPEG, atau PNG.")).toBeVisible();
    expect(screen.getAllByText("receipt.jpg").length).toBeGreaterThanOrEqual(1);
  });

  it("renders payment declined reason from the backend projection", async () => {
    mockPaymentFetch({
      reservationBody: paidReservation({
        payment: {
          rejection_reason: "Nominal transfer tidak sesuai.",
          required: true,
          review_status: "rejected",
        },
        rejection: { reason: "Nominal transfer tidak sesuai.", source: "payment" },
        status: "rejected",
      }),
    });

    renderDocumentRoutes("/student/reservations/reservation-1/payment/declined");

    expect(await screen.findByText("Nominal transfer tidak sesuai.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Bukti Pembayaran Ditolak" })).toBeVisible();
  });

  it("redirects stale payment waiting routes to accepted when payment is approved", async () => {
    mockPaymentFetch({
      reservationBody: paidReservation({
        payment: { required: true, review_status: "approved" },
        status: "approved",
      }),
    });

    renderDocumentRoutes("/student/reservations/reservation-1/payment/waiting");

    expect(await screen.findByRole("heading", { name: "Reservasi Disetujui" })).toBeVisible();
  });
});
