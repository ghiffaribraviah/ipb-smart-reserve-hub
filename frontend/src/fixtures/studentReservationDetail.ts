export type StudentReservationDetailVariant = "accepted" | "completed";

export type StudentReservationDetailFixture = {
  action: {
    href: string;
    label: string;
    tone: "caution" | "primary";
  };
  documents: Array<{
    actionLabel: string;
    fileName: string;
    href: string;
    metadata: string;
  }>;
  id: string;
  notice: string;
  variant: StudentReservationDetailVariant;
};

const baseDocuments = [
  {
    actionLabel: "Lihat Dokumen",
    fileName: "surat-persetujuan-ditandatangani.pdf",
    href: "/student/reservations/RSV-FIXTURE-001/files/signed-letter",
    metadata: "Diunggah 15 Oktober 2024 · 1,2 MB",
  },
  {
    actionLabel: "Lihat Bukti",
    fileName: "bukti-pembayaran.jpg",
    href: "/student/reservations/RSV-FIXTURE-001/files/payment-receipt",
    metadata: "Diunggah 18 Oktober 2024 · 840 KB",
  },
] as const;

export const studentReservationDetailBase = {
  date: "24 Oktober 2024",
  department: "Himpunan Mahasiswa Ilmu Komputer",
  faculty: "Fakultas Matematika dan IPA",
  facility: "Grand Auditorium",
  location: "Gedung Graha Widya Wisuda, Lantai 1",
  rating: "4.9",
  reviews: "124 ulasan",
  time: "09:00 - 13:00 (4 jam)",
} as const;

export const studentReservationDetailFixtures: Record<string, StudentReservationDetailFixture> = {
  "RSV-FIXTURE-001": {
    action: {
      href: "/student/reservations/RSV-FIXTURE-001/cancellation",
      label: "Ajukan Pembatalan",
      tone: "caution",
    },
    documents: [...baseDocuments],
    id: "RSV-FIXTURE-001",
    notice:
      "Reservasi ini sudah disetujui. Bawa kartu identitas dan gunakan fasilitas sesuai jadwal yang tertera.",
    variant: "accepted",
  },
  "RSV-FIXTURE-010": {
    action: {
      href: "/student/reservations/RSV-FIXTURE-010/review",
      label: "Tulis Ulasan",
      tone: "primary",
    },
    documents: [...baseDocuments],
    id: "RSV-FIXTURE-010",
    notice:
      "Reservasi telah selesai. Anda dapat menulis ulasan untuk membantu pengguna lain menilai fasilitas ini.",
    variant: "completed",
  },
} as const;
