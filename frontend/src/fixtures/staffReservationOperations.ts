export type StaffBadgeTone = "danger" | "neutral" | "success" | "warning";

export type StaffVerificationItem = {
  applicant: string;
  avatar: string;
  avatarTone: "dark" | "green" | "light" | "neutral";
  date: string;
  facility: string;
  id: string;
  role: string;
  status: string;
  tone: StaffBadgeTone;
};

export type StaffReservationListItem = {
  activity: string;
  applicant: string;
  avatar: string;
  avatarTone: "dark" | "green" | "light" | "neutral";
  date: string;
  detailHref: string;
  facility: string;
  facilityId?: string;
  id: string;
  role: string;
  status: string;
  time: string;
  tone: StaffBadgeTone;
};

export const staffVerificationQueue: StaffVerificationItem[] = [
  {
    applicant: "Johnathan Doe",
    avatar: "JD",
    avatarTone: "dark",
    date: "24 Oktober 2024",
    facility: "Bio-Labs Complex A",
    id: "RSV-STF-001",
    role: "Kandidat Doktor, Fisika",
    status: "Dokumen Diunggah",
    tone: "warning",
  },
  {
    applicant: "Elena Rodriguez",
    avatar: "ER",
    avatarTone: "neutral",
    date: "23 Oktober 2024",
    facility: "Materials Sci Wing",
    id: "RSV-STF-002",
    role: "Peneliti Senior",
    status: "Bukti Bayar Diunggah",
    tone: "warning",
  },
  {
    applicant: "Marcus Knight",
    avatar: "MK",
    avatarTone: "light",
    date: "22 Oktober 2024",
    facility: "Innovation Hub Pod 4",
    id: "RSV-STF-003",
    role: "Mitra Eksternal",
    status: "Dokumen Terverifikasi",
    tone: "success",
  },
  {
    applicant: "Sarah Chen",
    avatar: "SC",
    avatarTone: "green",
    date: "21 Oktober 2024",
    facility: "Quantum Computing Lab",
    id: "RSV-STF-004",
    role: "Peneliti Pascasarjana",
    status: "Pembayaran Terverifikasi",
    tone: "success",
  },
  {
    applicant: "Arthur Hansen",
    avatar: "AH",
    avatarTone: "neutral",
    date: "20 Oktober 2024",
    facility: "Agri-Tech Greenhouses",
    id: "RSV-STF-005",
    role: "Staf Fakultas",
    status: "Dokumen Ditolak",
    tone: "danger",
  },
  {
    applicant: "Linda Wu",
    avatar: "LW",
    avatarTone: "light",
    date: "19 Oktober 2024",
    facility: "Neuroscience Center",
    id: "RSV-STF-006",
    role: "Peneliti Pascadoktoral",
    status: "Menunggu Peninjauan",
    tone: "neutral",
  },
];

export const staffReservationList: StaffReservationListItem[] = [
  {
    activity: "Praktikum Mikrobiologi Lanjutan",
    applicant: "Johnathan Doe",
    avatar: "JD",
    avatarTone: "dark",
    date: "24 Oktober 2024",
    detailHref: "/staff/reservations/RSV-STF-001",
    facility: "Bio-Labs Complex A",
    id: "RSV-STF-001",
    role: "Kandidat Doktor",
    status: "Disetujui",
    time: "09:00 - 13:00",
    tone: "success",
  },
  {
    activity: "Pengujian Material",
    applicant: "Elena Rodriguez",
    avatar: "ER",
    avatarTone: "neutral",
    date: "25 Oktober 2024",
    detailHref: "/staff/reservations/RSV-STF-002",
    facility: "Materials Sci Wing",
    id: "RSV-STF-002",
    role: "Peneliti Senior",
    status: "Menunggu Pembayaran",
    time: "10:00 - 12:00",
    tone: "warning",
  },
  {
    activity: "Seminar Industri 2024",
    applicant: "Marcus Knight",
    avatar: "MK",
    avatarTone: "light",
    date: "20 Oktober 2024",
    detailHref: "/staff/reservations/RSV-STF-003",
    facility: "Grand Auditorium",
    id: "RSV-STF-003",
    role: "Mitra Eksternal",
    status: "Selesai",
    time: "08:00 - 16:00",
    tone: "success",
  },
  {
    activity: "Pertemuan Klub Mingguan",
    applicant: "Sarah Chen",
    avatar: "SC",
    avatarTone: "green",
    date: "26 Oktober 2024",
    detailHref: "/staff/reservations/RSV-STF-004",
    facility: "Seminar Room 101",
    id: "RSV-STF-004",
    role: "Organisasi Mahasiswa",
    status: "Disetujui",
    time: "16:00 - 18:00",
    tone: "success",
  },
  {
    activity: "Praktikum Fisiologi Tanaman",
    applicant: "Arthur Hansen",
    avatar: "AH",
    avatarTone: "neutral",
    date: "19 Oktober 2024",
    detailHref: "/staff/reservations/RSV-STF-005",
    facility: "Agri-Tech Greenhouses",
    id: "RSV-STF-005",
    role: "Staf Fakultas",
    status: "Ditolak",
    time: "09:00 - 11:00",
    tone: "danger",
  },
  {
    activity: "Observasi Studi Perilaku",
    applicant: "Linda Wu",
    avatar: "LW",
    avatarTone: "light",
    date: "28 Oktober 2024",
    detailHref: "/staff/reservations/RSV-STF-006",
    facility: "Neuroscience Center",
    id: "RSV-STF-006",
    role: "Peneliti Pascadoktoral",
    status: "Menunggu Peninjauan",
    time: "13:00 - 17:00",
    tone: "neutral",
  },
];
