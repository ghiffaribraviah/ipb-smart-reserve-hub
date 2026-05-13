export type StaffFacilityStatus = "active" | "maintenance";

export type StaffFacility = {
  capacity: number;
  department: string;
  description: string;
  editHref: string;
  id: string;
  imageLabel: string;
  imageTone: "amber" | "blue" | "green" | "red";
  name: string;
  rating: string;
  scheduleHref: string;
  status: StaffFacilityStatus;
  statusLabel: string;
};

export type StaffScheduleEntry = {
  action: string;
  applicant: string;
  applicantInitials: string;
  applicantRole: string;
  avatarTone: "amber" | "dark" | "slate";
  detailHref: string;
  event: string;
  id: string;
  meta: string;
  status: "approved" | "waiting";
  statusLabel: string;
  time: string;
  timeEndLabel: string;
  timeStart: string;
};

export type StaffFacilityMedia = {
  filename: string;
  label: string;
  tone: "amber" | "blue" | "green";
};

export type StaffFacilityEditFixture = {
  amenities: readonly {
    checked: boolean;
    key: string;
    label: string;
  }[];
  blackout: {
    date: string;
    reason: string;
  };
  description: string;
  errorMessage: string;
  lastChangedBy: string;
  lastChangedAt: string;
  location: string;
  media: StaffFacilityMedia[];
  name: string;
  openHours: {
    days: string;
    end: string;
    start: string;
  };
  price: string;
  capacity: string;
  successMessage: string;
};

export const staffFacilities: StaffFacility[] = [
  {
    capacity: 300,
    department: "Departemen Biosains",
    description: "Auditorium utama untuk seminar besar dan pertemuan fakultas.",
    editHref: "/staff/facilities/grand-auditorium/edit",
    id: "grand-auditorium",
    imageLabel: "Auditorium",
    imageTone: "amber",
    name: "Grand Auditorium",
    rating: "4.9",
    scheduleHref: "/staff/facilities/grand-auditorium/schedule",
    status: "active",
    statusLabel: "Aktif",
  },
  {
    capacity: 40,
    department: "Departemen Biosains",
    description: "Laboratorium riset mikrobiologi dan praktikum mahasiswa dengan peralatan lengkap.",
    editHref: "/staff/facilities/bio-labs-complex-a/edit",
    id: "bio-labs-complex-a",
    imageLabel: "Bio-Lab",
    imageTone: "blue",
    name: "Bio-Labs Complex A",
    rating: "4.7",
    scheduleHref: "/staff/facilities/bio-labs-complex-a/schedule",
    status: "active",
    statusLabel: "Aktif",
  },
  {
    capacity: 60,
    department: "Departemen Biosains",
    description: "Ruang seminar dengan proyektor, papan interaktif, dan sistem suara.",
    editHref: "/staff/facilities/seminar-room-101/edit",
    id: "seminar-room-101",
    imageLabel: "Seminar Room",
    imageTone: "red",
    name: "Seminar Room 101",
    rating: "4.5",
    scheduleHref: "/staff/facilities/seminar-room-101/schedule",
    status: "active",
    statusLabel: "Aktif",
  },
  {
    capacity: 25,
    department: "Departemen Biosains",
    description:
      "Fasilitas pertanian lingkungan terkendali yang sedang menjalani perbaikan kontrol iklim.",
    editHref: "/staff/facilities/agri-tech-greenhouses/edit",
    id: "agri-tech-greenhouses",
    imageLabel: "Greenhouse",
    imageTone: "green",
    name: "Agri-Tech Greenhouses",
    rating: "4.2",
    scheduleHref: "/staff/facilities/agri-tech-greenhouses/schedule",
    status: "maintenance",
    statusLabel: "Perawatan",
  },
];

export const staffScheduleEntries: StaffScheduleEntry[] = [
  {
    action: "Lihat Detail",
    applicant: "Johnathan Doe",
    applicantInitials: "JD",
    applicantRole: "Organisasi Mahasiswa",
    avatarTone: "dark",
    detailHref: "/staff/reservations/RSV-SCH-001",
    event: "Simposium Etika AI 2024",
    id: "RSV-SCH-001",
    meta: "Departemen Ilmu Komputer - estimasi 150 peserta",
    status: "approved",
    statusLabel: "Disetujui",
    time: "09:00 - 12:00",
    timeEndLabel: "sampai 12:00",
    timeStart: "09:00",
  },
  {
    action: "Lihat Detail",
    applicant: "Elena Rodriguez",
    applicantInitials: "ER",
    applicantRole: "Staf Fakultas",
    avatarTone: "amber",
    detailHref: "/staff/reservations/RSV-SCH-002",
    event: "Kuliah Tamu: Adaptasi Perubahan Iklim",
    id: "RSV-SCH-002",
    meta: "Fakultas Kehutanan - estimasi 200 peserta",
    status: "approved",
    statusLabel: "Disetujui",
    time: "13:00 - 15:00",
    timeEndLabel: "sampai 15:00",
    timeStart: "13:00",
  },
  {
    action: "Tinjau Pengajuan",
    applicant: "Ahmed Syah",
    applicantInitials: "AS",
    applicantRole: "Mahasiswa",
    avatarTone: "slate",
    detailHref: "/staff/reservations/RSV-SCH-003",
    event: "Kejuaraan Tahunan Klub Debat",
    id: "RSV-SCH-003",
    meta: "BEM Mahasiswa - estimasi 100 peserta",
    status: "waiting",
    statusLabel: "Menunggu Verifikasi",
    time: "16:00 - 18:00",
    timeEndLabel: "sampai 18:00",
    timeStart: "16:00",
  },
];

export const calendarDays = [
  { day: "29", muted: true },
  { day: "30", muted: true },
  { day: "1" },
  { day: "2" },
  { day: "3" },
  { day: "4" },
  { day: "5" },
  { day: "6" },
  { day: "7" },
  { day: "8" },
  { day: "9" },
  { day: "10" },
  { day: "11" },
  { day: "12" },
  { day: "13" },
  { day: "14" },
  { day: "15" },
  { day: "16" },
  { day: "17" },
  { day: "18" },
  { day: "19" },
  { day: "20" },
  { day: "21" },
  { day: "22" },
  { day: "23" },
  { day: "24", dots: ["green", "green", "amber"], selected: true },
  { day: "25" },
  { day: "26" },
  { day: "27" },
  { day: "28" },
  { day: "29" },
  { day: "30" },
  { day: "31" },
  { day: "1", muted: true },
  { day: "2", muted: true },
] as const;

export const staffFacilityEditFixture: StaffFacilityEditFixture = {
  amenities: [
    { checked: true, key: "audio", label: "Audio & Speaker" },
    { checked: true, key: "network", label: "Jaringan Gigabit" },
    { checked: true, key: "accessibility", label: "Akses Difabel" },
    { checked: false, key: "projector", label: "Layar & Proyektor" },
    { checked: true, key: "pantry", label: "Dapur Kecil" },
    { checked: false, key: "hepa", label: "Filtrasi HEPA" },
  ],
  blackout: {
    date: "30 Oktober 2024",
    reason: "Perawatan sistem tata suara auditorium.",
  },
  capacity: "1200",
  description:
    "Auditorium utama untuk seminar, kuliah umum, dan kegiatan institusi berskala besar dengan tata suara dan panggung terintegrasi.",
  errorMessage: "Harga sewa memerlukan verifikasi bendahara.",
  lastChangedAt: "24 Oktober 2024 - 14:32",
  lastChangedBy: "Admin: Sarah Jenkins",
  location: "Kampus Timur, Plaza Tengah",
  media: [
    { filename: "main-auditorium.jpg", label: "Main Auditorium", tone: "amber" },
    { filename: "stage-lighting.jpg", label: "Stage", tone: "blue" },
    { filename: "auditorium-exterior.jpg", label: "Exterior", tone: "green" },
  ],
  name: "Grand Auditorium",
  openHours: {
    days: "Senin-Jumat",
    end: "18:00",
    start: "08:00",
  },
  price: "100000",
  successMessage: "Perubahan tersimpan sebagai fixture.",
};
