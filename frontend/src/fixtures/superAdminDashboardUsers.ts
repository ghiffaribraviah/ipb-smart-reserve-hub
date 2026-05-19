export const superAdminNav = [
  { href: "/super-admin", key: "dashboard", label: "Dashboard" },
  { href: "/super-admin/users", key: "users", label: "Pengguna" },
  { href: "/super-admin/facilities", key: "facilities", label: "Fasilitas" },
  { href: "/super-admin/reports", key: "reports", label: "Laporan" },
  { href: "/super-admin/system", key: "system", label: "Sistem" },
] as const;

export const superAdminDashboardFixture = {
  kpis: [
    { icon: "users", label: "Total Pengguna", tone: "green", trend: "↑ 2,4% bulan ini", value: "12,450" },
    { icon: "building", label: "Fasilitas Aktif", tone: "blue", trend: "↑ 5 fasilitas baru", value: "142" },
    { icon: "calendar", label: "Total Reservasi", tone: "green", trend: "↑ 12% bulan ini", value: "3,892" },
    { icon: "settings", label: "Status Sistem", tone: "orange", trend: "Layanan inti aktif", value: "Aktif" },
  ],
  administrators: [
    {
      department: "Biosciences",
      email: "budi.s@admin.ipb.ac.id",
      accessNote: "Akun staff aktif",
      name: "Budi Santoso",
      scope: "4 fasilitas dikelola",
      status: "Aktif",
    },
    {
      department: "Ilmu Komputer",
      email: "siti.a@admin.ipb.ac.id",
      accessNote: "Akun staff aktif",
      name: "Siti Aminah",
      scope: "6 fasilitas dikelola",
      status: "Aktif",
    },
    {
      department: "Kehutanan",
      email: "rahmat.h@admin.ipb.ac.id",
      accessNote: "Akun staff nonaktif",
      name: "Rahmat Hidayat",
      scope: "12 fasilitas dikelola",
      status: "Nonaktif",
    },
    {
      department: "Sekolah Bisnis",
      email: "anita.w@admin.ipb.ac.id",
      accessNote: "Akun staff aktif",
      name: "Anita Wijaya",
      scope: "8 fasilitas dikelola",
      status: "Aktif",
    },
  ],
  activity: [
    {
      icon: "user",
      text: "Super Admin membuat akun admin baru untuk Anita Wijaya (Sekolah Bisnis).",
      time: "Hari ini, 09:42",
    },
    {
      icon: "building",
      text: "Budi Santoso memperbarui detail fasilitas Grand Auditorium.",
      time: "Hari ini, 08:15",
    },
    {
      icon: "settings",
      text: "Sistem menyelesaikan pencadangan basis data harian secara otomatis.",
      time: "Hari ini, 02:00",
    },
    {
      icon: "x",
      text: "Akun Rahmat Hidayat dinonaktifkan sementara karena tidak aktif.",
      time: "Kemarin, 23:30",
    },
    {
      icon: "calendar",
      text: "Siti Aminah menyetujui 12 reservasi tertunda untuk Departemen Ilmu Komputer.",
      time: "Kemarin, 16:20",
    },
  ],
} as const;

export const superAdminUsersFixture = {
  kpis: [
    { icon: "users", label: "Total Akun", value: "12.450" },
    { icon: "graduation", label: "Mahasiswa", value: "11.892" },
    { icon: "briefcase", label: "Staff", value: "524" },
    { icon: "alert", label: "Butuh Tinjauan", value: "34" },
  ],
  users: [
    {
      action: "Detail",
      identity: "nadia@apps.ipb.ac.id · G64190011",
      name: "Nadia Paramita",
      role: "Mahasiswa",
      status: "Aktif",
      unit: "Ilmu Komputer",
    },
    {
      action: "Kelola Akses",
      identity: "budi.s@admin.ipb.ac.id",
      name: "Budi Santoso",
      role: "Staff",
      status: "Aktif",
      unit: "Biosciences",
    },
    {
      action: "Aktifkan",
      identity: "rahmat.h@admin.ipb.ac.id",
      name: "Rahmat Hidayat",
      role: "Staff",
      status: "Nonaktif",
      unit: "Kehutanan",
    },
    {
      action: "Tinjau",
      identity: "dewi@apps.ipb.ac.id · G64200024",
      name: "Dewi Lestari",
      role: "Mahasiswa",
      status: "Aktif",
      unit: "Teknologi Industri Pertanian · profil akademik parsial",
    },
  ],
} as const;

export const superAdminFacilitiesFixture = {
  kpis: [
    { label: "Fasilitas Aktif", sub: "5 fasilitas baru bulan ini", value: "142" },
    { label: "Tanpa Staff", sub: "Perlu penugasan pengelola", value: "8" },
    { label: "Nonaktif", sub: "Menunggu perbaikan data", value: "11" },
  ],
  facilities: [
    {
      badge: "IPB",
      meta: "Kampus Dramaga · Kapasitas 800 · 3 staff ditugaskan",
      name: "Grand Auditorium",
      status: "Aktif",
    },
    {
      badge: "SRH",
      meta: "FMIPA · Kapasitas 120 · 1 staff ditugaskan",
      name: "Ruang Seminar FMIPA",
      status: "Aktif",
    },
    {
      badge: "TU",
      meta: "Ilmu Komputer · Kapasitas 40 · belum ada staff",
      name: "Laboratorium Multimedia",
      status: "Butuh Staff",
    },
    {
      badge: "GYM",
      meta: "Pusat Olahraga · Kapasitas 350 · perbaikan jadwal",
      name: "GOR Lama",
      status: "Nonaktif",
    },
  ],
  assignments: [
    { facility: "Grand Auditorium", name: "Budi Santoso", status: "Baru" },
    { facility: "Ruang Seminar FMIPA", name: "Siti Aminah", status: "Aktif" },
    { facility: "Laboratorium Multimedia", name: "Belum ditugaskan", status: "Perlu Aksi" },
  ],
} as const;

export const superAdminReportsFixture = {
  kpis: [
    { label: "Reservasi Bulan Ini", value: "3.892" },
    { label: "Pendapatan Fasilitas", value: "Rp128 jt" },
    { label: "Ulasan Dimoderasi", value: "17" },
    { label: "Audit Penting", value: "42" },
  ],
  trend: [
    { day: "Senin", height: "48%" },
    { day: "Selasa", height: "72%" },
    { day: "Rabu", height: "56%" },
    { day: "Kamis", height: "88%" },
    { day: "Jumat", height: "64%" },
    { day: "Sabtu", height: "78%" },
    { day: "Minggu", height: "92%" },
  ],
  audit: [
    { icon: "user", meta: "Super Admin · Hari ini, 09:42", title: "Akun staff dibuat" },
    { icon: "file", meta: "Review #RV-204 · Kemarin, 16:20", title: "Ulasan dipulihkan" },
    { icon: "building", meta: "Grand Auditorium · Kemarin, 12:10", title: "Penugasan fasilitas diubah" },
  ],
  moderation: [
    {
      action: "Moderasi",
      facility: "Ruang Seminar FMIPA",
      meta: "Nadia Paramita · 2 jam lalu",
      status: "Perlu Tinjauan",
      title: "Komentar mengandung data kontak pribadi",
    },
    {
      action: "Detail",
      facility: "Grand Auditorium",
      meta: "Dimas Pratama · Kemarin",
      status: "Dipulihkan",
      title: "Ulasan dipulihkan setelah banding",
    },
  ],
} as const;

export const superAdminSystemFixture = {
  kpis: [
    { label: "Status API", value: "Aktif" },
    { label: "Database", value: "Aktif" },
    { label: "Worker Deadline", value: "12 dtk" },
    { label: "Storage", value: "78%" },
  ],
  services: [
    { meta: "Respons rata-rata 142 ms", name: "Backend API", status: "Aktif" },
    { meta: "Replikasi terakhir 2 menit lalu", name: "Database", status: "Aktif" },
    { meta: "78% kapasitas digunakan", name: "Private File Storage", status: "Pantau" },
    { meta: "Jalan terakhir hari ini, 10:00", name: "Deadline Worker", status: "Aktif" },
  ],
  settings: {
    emailDomain: "@apps.ipb.ac.id",
    letterDeadline: "24 jam setelah reservasi",
    paymentCutoff: "12 jam setelah dokumen disetujui",
  },
} as const;
