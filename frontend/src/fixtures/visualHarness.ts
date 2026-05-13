export const visualHarnessFixture = {
  seed: "visual-harness-2026-05",
  title: "Visual Harness",
  summary:
    "Rute smoke non-produk untuk memverifikasi routing, fixture deterministik, screenshot, dan overflow mobile.",
  checks: [
    "React route aktif",
    "Fixture lokal digunakan",
    "Screenshot desktop dan mobile siap",
    "Overflow mobile dapat dideteksi",
  ],
  sampleReservation: {
    facility: "Auditorium Fakultas Teknologi Pertanian",
    date: "24 Oktober 2024",
    time: "09:00 - 13:00",
    status: "Siap Diverifikasi",
  },
} as const;
