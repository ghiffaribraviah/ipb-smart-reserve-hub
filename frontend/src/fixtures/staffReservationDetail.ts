export const staffReservationDetailFixture = {
  applicant: {
    facultyProgram: "FMIPA / Ilmu Komputer",
    email: "johnathan_doe@apps.ipb.ac.id",
    id: "G64190001",
    initials: "JD",
    name: "Johnathan Doe",
    organization: "Himpunan Mahasiswa Ilmu Komputer",
    phone: "+62 812-3456-7890",
    role: "Kandidat Doktor",
  },
  detailHref: "/staff/reservations/RSV-STF-001",
  decisionHref: "/staff/reservations/RSV-STF-001/review-decision",
  documents: [
    {
      filename: "proposal-kegiatan.pdf",
      meta: "Diunggah 15 Oktober 2024 - 2,4 MB",
      status: "Menunggu",
      type: "PDF",
    },
    {
      filename: "surat-dekan.pdf",
      meta: "Diunggah 15 Oktober 2024 - 1,1 MB",
      status: "Menunggu",
      type: "PDF",
    },
  ],
  facility: {
    date: "Kamis, 24 Oktober 2024",
    duration: "09:00 - 13:00 (4 jam)",
    name: "Grand Auditorium",
    status: "Menunggu Peninjauan",
  },
  reservation: {
    activity: "AI Ethics Symposium 2024",
    description:
      "Simposium tahunan yang mempertemukan mahasiswa, dosen, dan praktisi industri untuk membahas implikasi etis teknologi kecerdasan buatan.",
    extraNeeds: "Dukungan AV & mikrofon, layanan kebersihan tambahan",
    participants: "150 orang",
  },
} as const;

export const staffDecisionDialogFixture = {
  reason:
    "Surat persetujuan belum memuat tanda tangan pembina organisasi. Mohon unggah ulang dokumen yang sudah ditandatangani.",
  summary: {
    decision: "Memerlukan Alasan",
    file: "surat-persetujuan-himalkom.pdf",
    stage: "Review Dokumen",
  },
} as const;
