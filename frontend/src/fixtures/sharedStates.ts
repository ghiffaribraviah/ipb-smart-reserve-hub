export const dataStateFixture = {
  deadlineRows: [
    {
      badge: "Butuh Tindak Lanjut",
      message: "Mahasiswa perlu menghubungi TU fasilitas untuk tindak lanjut.",
      title: "Melewati Batas Verifikasi",
      tone: "warning",
    },
    {
      badge: "Kedaluwarsa",
      message: "Hold waktu dibatalkan otomatis karena dokumen belum diunggah.",
      title: "Reservasi Kedaluwarsa",
      tone: "neutral",
    },
    {
      badge: "Ditutup",
      message: "Reservasi tidak lagi bisa diproses oleh staff.",
      title: "Dibatalkan Sistem",
      tone: "danger",
    },
  ],
} as const;

export const uploadCalendarFixture = {
  selectedDate: "24 Oktober 2024",
  agenda: [
    {
      badge: "Disetujui",
      name: "Simposium Etika AI 2024",
      organization: "Himpunan Mahasiswa Ilmu Komputer",
      time: "09:00 - 12:00",
      tone: "success",
    },
    {
      badge: "Disetujui",
      name: "Kuliah Tamu: Perubahan Iklim",
      organization: "Departemen Geofisika",
      time: "13:00 - 15:00",
      tone: "success",
    },
    {
      badge: "Menunggu",
      name: "Kejuaraan Tahunan Klub Debat",
      organization: "UKM Debat IPB",
      time: "16:00 - 18:00",
      tone: "warning",
    },
  ],
} as const;
