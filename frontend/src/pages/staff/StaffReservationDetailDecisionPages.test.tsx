import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import {
  StaffReservationDetailPage,
  StaffReviewDecisionPage,
} from "./StaffReservationDetailDecisionPages";

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json", ...headers },
      status,
    }),
  );
}

const detailResponse = {
  activity_title: "Seminar Detail",
  cancellation: {
    reason: null,
    rejection_reason: null,
    requested: false,
    review_status: "not_requested",
  },
  contact_phone: "08123456789",
  document: {
    approval_letter: null,
    due_at: "2026-05-03T00:00:00Z",
    rejection_reason: null,
    review_status: "pending_review",
    signed_approval_letter: {
      content_type: "application/pdf",
      filename: "surat-persetujuan.pdf",
      generated_at: null,
      size_bytes: 2048,
      uploaded_at: "2026-05-01T00:00:00Z",
    },
  },
  ends_at: "2026-06-01T04:00:00Z",
  event_description: "Private event description",
  extra_requirements: {
    av_support: true,
    extra_cleaning: false,
    logistics_coordination: false,
    notes: "Butuh dua mikrofon.",
    security_personnel: false,
  },
  facility: {
    cover_image_url: "https://cdn.example.test/auditorium-detail-cover.jpg",
    id: "facility-1",
    name: "Auditorium Andi Hakim Nasoetion",
  },
  id: "reservation-1",
  organization_unit: { id: "org-1", name: "BEM KM IPB" },
  participant_count: 80,
  payment: {
    due_at: null,
    receipt: {
      content_type: "image/png",
      filename: "bukti-pembayaran.png",
      generated_at: null,
      size_bytes: 1024,
      uploaded_at: "2026-05-02T00:00:00Z",
    },
    rejection_reason: null,
    required: false,
    review_status: "pending_review",
  },
  price_rupiah: 0,
  reservation_code: "RSV-SEMINAR-DETAIL",
  review_actions: {
    cancellation: {
      approve_url: "/staff/reservations/reservation-1/cancellation-review/approve",
      download_url: null,
      reject_url: "/staff/reservations/reservation-1/cancellation-review/reject",
    },
    document: {
      approve_url: "/staff/reservations/reservation-1/document-review/approve",
      download_url: "/staff/reservations/reservation-1/signed-approval-letter/download",
      reject_url: "/staff/reservations/reservation-1/document-review/reject",
    },
    payment: {
      approve_url: "/staff/reservations/reservation-1/payment-review/approve",
      download_url: "/staff/reservations/reservation-1/payment-receipt/download",
      reject_url: "/staff/reservations/reservation-1/payment-review/reject",
    },
  },
  starts_at: "2026-06-01T02:00:00Z",
  status: "pending_document_review",
  student: {
    email: "student@apps.ipb.ac.id",
    full_name: "Student Reservasi",
    id: "student-1",
  },
};

function renderDetail(entry = "/staff/reservations/reservation-1") {
  return renderWithProviders(
    <Routes>
      <Route element={<StaffReservationDetailPage />} path="/staff/reservations/:reservationId" />
      <Route element={<StaffReviewDecisionPage />} path="/staff/reservations/:reservationId/review-decision" />
    </Routes>,
    { initialEntries: [entry] },
  );
}

describe("StaffReservationDetailDecisionPages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("loads assigned reservation detail and downloads only available staff private files", async () => {
    const user = userEvent.setup();
    const openMock = vi.spyOn(window, "open").mockImplementation(() => null);
    const createObjectURLMock = vi
      .spyOn(URL, "createObjectURL")
      .mockImplementation(() => "blob:http://localhost/staff-preview");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/reservations/reservation-1") {
        return jsonResponse(detailResponse);
      }

      if (url === "http://localhost:8000/staff/reservations/reservation-1/signed-approval-letter/download") {
        return Promise.resolve(
          new Response("pdf-bytes", {
            headers: {
              "Content-Disposition": 'attachment; filename="surat-persetujuan.pdf"',
              "Content-Type": "application/pdf",
            },
            status: 200,
          }),
        );
      }

      if (url === "http://localhost:8000/staff/reservations/reservation-1/payment-receipt/download") {
        return Promise.resolve(
          new Response("image-bytes", {
            headers: {
              "Content-Disposition": 'attachment; filename="bukti-pembayaran.png"',
              "Content-Type": "image/png",
            },
            status: 200,
          }),
        );
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDetail();

    expect(await screen.findByRole("heading", { name: "Student Reservasi" })).toBeVisible();
    expect(screen.getByText("BEM KM IPB")).toBeVisible();
    expect(screen.getByText("Auditorium Andi Hakim Nasoetion")).toBeVisible();
    expect(screen.getByRole("img", { name: "Foto Auditorium Andi Hakim Nasoetion" })).toHaveAttribute(
      "src",
      "https://cdn.example.test/auditorium-detail-cover.jpg",
    );
    expect(screen.getByText("Seminar Detail")).toBeVisible();
    expect(screen.getByText("Dukungan AV, Catatan: Butuh dua mikrofon.")).toBeVisible();
    expect(screen.getByText("surat-persetujuan.pdf")).toBeVisible();
    expect(screen.getByText("bukti-pembayaran.png")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Lihat Dokumen surat-persetujuan.pdf" }));
    await user.click(screen.getByRole("button", { name: "Unduh Dokumen surat-persetujuan.pdf" }));
    await user.click(screen.getByRole("button", { name: "Unduh Dokumen bukti-pembayaran.png" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/reservations/reservation-1/signed-approval-letter/download",
        expect.any(Object),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/reservations/reservation-1/payment-receipt/download",
        expect.any(Object),
      );
    });
    expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
    expect(openMock).toHaveBeenCalledWith("blob:http://localhost/staff-preview", "_blank", "noopener,noreferrer");
  });

  it("shows inline file action errors when preview or download fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/reservations/reservation-1") {
        return jsonResponse(detailResponse);
      }

      if (url === "http://localhost:8000/staff/reservations/reservation-1/signed-approval-letter/download") {
        return jsonResponse({ detail: "Dokumen belum dikirim untuk verifikasi." }, 409);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDetail();

    await user.click(await screen.findByRole("button", { name: "Lihat Dokumen surat-persetujuan.pdf" }));

    expect(await screen.findByText("Dokumen belum dikirim untuk verifikasi.")).toBeVisible();
  });

  it("submits approve actions through the active review action URL and refetches detail", async () => {
    const user = userEvent.setup();
    let detailCalls = 0;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/reservations/reservation-1") {
        detailCalls += 1;
        return jsonResponse({
          ...detailResponse,
          document: {
            ...detailResponse.document,
            review_status: detailCalls > 1 ? "approved" : "pending_review",
          },
        });
      }

      if (url === "http://localhost:8000/staff/reservations/reservation-1/document-review/approve") {
        expect(init?.method).toBe("POST");
        return jsonResponse({ ok: true });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDetail();

    await user.click(await screen.findByRole("button", { name: "Setujui Dokumen" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/reservations/reservation-1/document-review/approve",
        expect.objectContaining({ method: "POST" }),
      );
      expect(detailCalls).toBeGreaterThan(1);
    });
    expect((await screen.findAllByText("Disetujui"))[0]).toBeVisible();
  });

  it("requires a rejection reason and submits reject actions through the active review URL", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/reservations/reservation-1") {
        return jsonResponse(detailResponse);
      }

      if (url === "http://localhost:8000/staff/reservations/reservation-1/document-review/reject") {
        expect(init?.method).toBe("POST");
        expect(init?.body).toBe(JSON.stringify({ reason: "Dokumen belum ditandatangani." }));
        return jsonResponse({ ok: true });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDetail("/staff/reservations/reservation-1/review-decision");
    const dialog = await screen.findByRole("dialog", { name: "Tolak Dokumen Reservasi" });
    const rejectButton = within(dialog).getByRole("button", { name: "Tolak Dokumen" });

    expect(within(dialog).getByRole("link", { name: "Kembali" })).toHaveAttribute(
      "href",
      "/staff/reservations/reservation-1",
    );
    expect(within(dialog).queryByText("Memerlukan Alasan")).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/Menolak dokumen/)).not.toBeInTheDocument();

    await user.clear(await screen.findByLabelText("Alasan penolakan"));
    await user.click(rejectButton);
    expect(await screen.findByText("Alasan penolakan wajib diisi.")).toBeVisible();

    await user.type(screen.getByLabelText("Alasan penolakan"), "Dokumen belum ditandatangani.");
    await user.click(rejectButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/reservations/reservation-1/document-review/reject",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("hides the redundant reject CTA when the dedicated review-decision route is open", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url === "http://localhost:8000/staff/reservations/reservation-1") {
        return jsonResponse(detailResponse);
      }
      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDetail("/staff/reservations/reservation-1/review-decision");

    const dialog = await screen.findByRole("dialog", { name: "Tolak Dokumen Reservasi" });
    expect(within(dialog).getByRole("button", { name: "Tolak Dokumen" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "Tolak Pengajuan" })).not.toBeInTheDocument();
  });

  it("shows mutation errors and stable access errors", async () => {
    const user = userEvent.setup();
    let approveCalls = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/reservations/reservation-1") {
        return jsonResponse(detailResponse);
      }

      if (url === "http://localhost:8000/staff/reservations/reservation-1/document-review/approve") {
        approveCalls += 1;
        return jsonResponse({ detail: "Review sudah diproses." }, 409);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDetail();
    await user.click(await screen.findByRole("button", { name: "Setujui Dokumen" }));
    expect(await screen.findByText("Review sudah diproses.")).toBeVisible();
    expect(approveCalls).toBe(1);

    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url === "http://localhost:8000/staff/reservations/reservation-1") {
        return jsonResponse({ detail: "Reservasi tidak ditemukan." }, 404);
      }
      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDetail();
    expect(await screen.findByText("Reservasi tidak ditemukan atau tidak dapat diakses.")).toBeVisible();
  });
});
