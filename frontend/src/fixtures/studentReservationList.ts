export type ReservationTone =
  | "approved"
  | "cancelled"
  | "completed"
  | "pending"
  | "rejected"
  | "review";

export type ReservationListItem = {
  cancelHref?: string;
  date: string;
  detailHref: string;
  facility: string;
  id: string;
  location: string;
  primaryAction: string;
  secondaryAction?: string;
  status: string;
  time: string;
  tone: ReservationTone;
};

export const studentReservationListFixture = {
  ongoing: [
    {
      cancelHref: "/student/reservations/RSV-FIXTURE-001/cancellation",
      date: "24 Oktober 2024",
      detailHref: "/student/reservations/RSV-FIXTURE-001",
      facility: "Grand Auditorium",
      id: "RSV-FIXTURE-001",
      location: "Gedung Graha Widya Wisuda, Lantai 1",
      primaryAction: "Detail Reservasi",
      secondaryAction: "Ajukan Pembatalan",
      status: "Disetujui",
      time: "09:00 - 13:00",
      tone: "approved",
    },
    {
      cancelHref: "/student/reservations/RSV-FIXTURE-002/cancel",
      date: "29 Oktober 2024",
      detailHref: "/student/reservations/RSV-FIXTURE-002",
      facility: "Ruang Seminar Cendekia",
      id: "RSV-FIXTURE-002",
      location: "Fakultas Ekonomi dan Manajemen, Lantai 2",
      primaryAction: "Detail Reservasi",
      secondaryAction: "Batalkan",
      status: "Menunggu Pembayaran",
      time: "13:00 - 15:00",
      tone: "pending",
    },
    {
      cancelHref: "/student/reservations/RSV-FIXTURE-003/cancel",
      date: "31 Oktober 2024",
      detailHref: "/student/reservations/RSV-FIXTURE-003",
      facility: "Ruang Rapat Fahutan",
      id: "RSV-FIXTURE-003",
      location: "Fakultas Kehutanan dan Lingkungan, Lantai 1",
      primaryAction: "Detail Reservasi",
      secondaryAction: "Batalkan",
      status: "Menunggu Verifikasi Dokumen",
      time: "10:00 - 12:00",
      tone: "review",
    },
  ] satisfies ReservationListItem[],
  history: [
    {
      date: "12 September 2024",
      detailHref: "/student/reservations/RSV-FIXTURE-010",
      facility: "Studio Kreatif Cendana",
      id: "RSV-FIXTURE-010",
      location: "Fakultas Ekologi Manusia, Lantai 3",
      primaryAction: "Detail Reservasi",
      status: "Selesai",
      time: "08:00 - 10:00",
      tone: "completed",
    },
    {
      date: "18 September 2024",
      detailHref: "/student/reservations/RSV-FIXTURE-011",
      facility: "Aula Student Center",
      id: "RSV-FIXTURE-011",
      location: "Student Center IPB, Lantai 1",
      primaryAction: "Detail Reservasi",
      status: "Ditolak",
      time: "14:00 - 16:00",
      tone: "rejected",
    },
    {
      date: "2 Oktober 2024",
      detailHref: "/student/reservations/RSV-FIXTURE-012",
      facility: "Lapangan Agria",
      id: "RSV-FIXTURE-012",
      location: "Kompleks Olahraga Kampus Dramaga",
      primaryAction: "Detail Reservasi",
      status: "Dibatalkan",
      time: "07:00 - 09:00",
      tone: "cancelled",
    },
  ] satisfies ReservationListItem[],
} as const;
