export const studentDocumentWorkflowFixture = {
  reservationId: "RSV-FIXTURE-001",
  facilityName: "Grand Auditorium",
  date: "24 Oktober 2024",
  time: "09:00 - 13:00",
  backHref: "/student/facilities/grand-auditorium/reserve/details",
  reservationsHref: "/student/reservations",
  waitingHref: "/student/reservations/RSV-FIXTURE-001/verification/waiting",
  template: {
    fileName: "template-surat-permohonan-reservasi.pdf",
    metadata: "PDF · 1 halaman · 1,2 MB",
  },
  selectedFile: {
    fileName: "surat-reservasi.pdf",
    metadata: "PDF · 1,2 MB · siap dikirim",
    status: "Valid",
  },
  payment: {
    amount: "Rp1.500.000",
    receiptFileName: "bukti-pembayaran.jpg",
    receiptMetadata: "JPG · 840 KB · siap dikirim",
    waitingHref: "/student/reservations/RSV-FIXTURE-001/payment/waiting",
    paymentHref: "/student/reservations/RSV-FIXTURE-001/payment",
    detailHref: "/student/reservations/RSV-FIXTURE-001",
    code: "RSV-2026-00024",
  },
  rejectionReason: "Tanda tangan pembina belum terlihat jelas.",
} as const;
