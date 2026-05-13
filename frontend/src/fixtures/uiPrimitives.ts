export const uiPrimitiveFixture = {
  buttons: [
    { label: "Lanjutkan", variant: "primary" },
    { label: "Tambah Admin", variant: "super" },
    { label: "Kembali", variant: "secondary" },
    { label: "Ajukan Pembatalan", variant: "warning" },
    { label: "Keluar", variant: "danger" },
    { label: "Memproses", variant: "disabled", disabled: true },
  ],
  badges: [
    { label: "Disetujui", tone: "success" },
    { label: "Menunggu Verifikasi Dokumen", tone: "warning" },
    { label: "Ditolak", tone: "danger" },
    { label: "Expired", tone: "neutral" },
  ],
  fields: [
    { label: "Nama Kegiatan", value: "Seminar Nasional Himalkom" },
    { label: "Fasilitas", value: "Grand Auditorium" },
    {
      label: "Catatan",
      value: "Kegiatan membutuhkan proyektor dan meja registrasi.",
      multiline: true,
    },
    {
      label: "Error Validasi",
      value: "Tanggal mulai wajib dipilih.",
      error: true,
    },
  ],
  checkbox: {
    label: "Saya menyetujui kebijakan fasilitas",
    description: "Termasuk aturan pembatalan dan penggunaan ruang.",
  },
  rating: 4,
} as const;
