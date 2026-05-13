import { describe, expect, it } from "vitest";
import {
  mapStudentReservationWorkflow,
  type StudentReservationWorkflowProjection,
} from "./studentReservationWorkflow";

const baseReservation: StudentReservationWorkflowProjection = {
  activity_title: "Simposium Etika AI",
  cancellation_reason: null,
  cancellation_rejection_reason: null,
  contact_phone: "08123456789",
  document: {
    approval_letter: null,
    rejection_reason: null,
    review_status: "not_ready",
    signed_approval_letter: null,
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

describe("mapStudentReservationWorkflow", () => {
  it.each([
    [
      "document upload needed",
      reservation({ document: { review_status: "upload_needed" }, status: "pending_document_upload" }),
      {
        bucket: "ongoing",
        primaryHref: "/student/reservations/reservation-1/letter",
        primaryLabel: "Unggah Surat",
        secondaryHref: "/student/reservations/reservation-1/cancel",
        secondaryLabel: "Batalkan",
        statusLabel: "Menunggu Unggah Dokumen",
        tone: "pending",
      },
    ],
    [
      "document waiting",
      reservation({ document: { review_status: "waiting_review" }, status: "pending_document_review" }),
      {
        bucket: "ongoing",
        primaryHref: "/student/reservations/reservation-1/verification/waiting",
        primaryLabel: "Lihat Status",
        secondaryHref: "/student/reservations/reservation-1/cancel",
        secondaryLabel: "Batalkan",
        statusLabel: "Menunggu Verifikasi Dokumen",
        tone: "review",
      },
    ],
    [
      "document declined",
      reservation({
        document: { rejection_reason: "Tanda tangan belum lengkap.", review_status: "rejected" },
        rejection: { reason: "Tanda tangan belum lengkap.", source: "document" },
        status: "rejected",
      }),
      {
        bucket: "history",
        primaryHref: "/student/reservations/reservation-1/verification/declined",
        primaryLabel: "Lihat Penolakan",
        secondaryHref: undefined,
        secondaryLabel: undefined,
        statusLabel: "Dokumen Ditolak",
        tone: "rejected",
      },
    ],
    [
      "payment upload needed",
      reservation({
        document: { review_status: "approved" },
        payment: { required: true, review_status: "upload_needed" },
        price_rupiah: 250000,
        status: "pending_payment",
      }),
      {
        bucket: "ongoing",
        primaryHref: "/student/reservations/reservation-1/payment",
        primaryLabel: "Unggah Pembayaran",
        secondaryHref: "/student/reservations/reservation-1/cancel",
        secondaryLabel: "Batalkan",
        statusLabel: "Menunggu Pembayaran",
        tone: "pending",
      },
    ],
    [
      "payment waiting",
      reservation({
        document: { review_status: "approved" },
        payment: { receipt: { content_type: "image/jpeg", filename: "receipt.jpg", size_bytes: 1200, uploaded_at: "2026-06-01T03:00:00Z" }, required: true, review_status: "waiting_review" },
        price_rupiah: 250000,
        status: "pending_payment",
      }),
      {
        bucket: "ongoing",
        primaryHref: "/student/reservations/reservation-1/payment/waiting",
        primaryLabel: "Lihat Status",
        secondaryHref: "/student/reservations/reservation-1/cancel",
        secondaryLabel: "Batalkan",
        statusLabel: "Menunggu Verifikasi Pembayaran",
        tone: "review",
      },
    ],
    [
      "payment declined",
      reservation({
        payment: { rejection_reason: "Bukti tidak valid.", required: true, review_status: "rejected" },
        price_rupiah: 250000,
        rejection: { reason: "Bukti tidak valid.", source: "payment" },
        status: "rejected",
      }),
      {
        bucket: "history",
        primaryHref: "/student/reservations/reservation-1/payment/declined",
        primaryLabel: "Lihat Penolakan",
        secondaryHref: undefined,
        secondaryLabel: undefined,
        statusLabel: "Pembayaran Ditolak",
        tone: "rejected",
      },
    ],
    [
      "approved",
      reservation({ document: { review_status: "approved" }, payment: { review_status: "approved" }, status: "approved" }),
      {
        bucket: "ongoing",
        primaryHref: "/student/reservations/reservation-1/accepted",
        primaryLabel: "Detail Reservasi",
        secondaryHref: "/student/reservations/reservation-1/cancellation",
        secondaryLabel: "Ajukan Pembatalan",
        statusLabel: "Disetujui",
        tone: "approved",
      },
    ],
    [
      "completed without review",
      reservation({ review: null, status: "completed" }),
      {
        bucket: "ongoing",
        primaryHref: "/student/reservations/reservation-1/review",
        primaryLabel: "Beri Ulasan",
        secondaryHref: undefined,
        secondaryLabel: undefined,
        statusLabel: "Selesai",
        tone: "completed",
      },
    ],
    [
      "completed with review",
      reservation({ review: { admin_removal_reason: null, deleted_at: null, deleted_by: null, id: "review-1", is_deleted: false }, status: "completed" }),
      {
        bucket: "history",
        primaryHref: "/student/reservations/reservation-1",
        primaryLabel: "Detail Reservasi",
        secondaryHref: undefined,
        secondaryLabel: undefined,
        statusLabel: "Selesai",
        tone: "completed",
      },
    ],
    [
      "cancelled",
      reservation({ status: "cancelled" }),
      {
        bucket: "history",
        primaryHref: "/student/reservations/reservation-1",
        primaryLabel: "Detail Reservasi",
        secondaryHref: undefined,
        secondaryLabel: undefined,
        statusLabel: "Dibatalkan",
        tone: "cancelled",
      },
    ],
    [
      "expired",
      reservation({ status: "expired" }),
      {
        bucket: "history",
        primaryHref: "/student/reservations/reservation-1",
        primaryLabel: "Detail Reservasi",
        secondaryHref: undefined,
        secondaryLabel: undefined,
        statusLabel: "Kedaluwarsa",
        tone: "rejected",
      },
    ],
    [
      "rejected unknown source",
      reservation({ rejection: { reason: "Tidak memenuhi syarat.", source: "unknown" }, status: "rejected" }),
      {
        bucket: "history",
        primaryHref: "/student/reservations/reservation-1",
        primaryLabel: "Detail Reservasi",
        secondaryHref: undefined,
        secondaryLabel: undefined,
        statusLabel: "Ditolak",
        tone: "rejected",
      },
    ],
    [
      "cancellation requested",
      reservation({ cancellation_reason: "Agenda pindah.", status: "cancellation_requested" }),
      {
        bucket: "ongoing",
        primaryHref: "/student/reservations/reservation-1/cancellation-request",
        primaryLabel: "Lihat Pengajuan",
        secondaryHref: undefined,
        secondaryLabel: undefined,
        statusLabel: "Pembatalan Diajukan",
        tone: "review",
      },
    ],
  ])("maps %s", (_, input, expected) => {
    expect(mapStudentReservationWorkflow(input)).toMatchObject(expected);
  });
});
