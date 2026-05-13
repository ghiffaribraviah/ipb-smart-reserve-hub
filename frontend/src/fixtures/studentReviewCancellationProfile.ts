export const studentReviewCancellationProfileFixture = {
  reservation: {
    cancellationHref: "/student/reservations/RSV-FIXTURE-001/cancellation",
    completedDetailHref: "/student/reservations/RSV-FIXTURE-010",
    date: "24 Oktober 2024",
    detailHref: "/student/reservations/RSV-FIXTURE-001",
    facility: "Grand Auditorium",
    organization: "Himalkom",
    time: "09:00 - 13:00",
  },
  profile: {
    degree: "Sarjana (S1)",
    email: "ari.rahman@apps.ipb.ac.id",
    entryYear: "2019",
    faculty: "Matematika dan Ilmu Pengetahuan Alam (FMIPA)",
    initials: "AR",
    name: "Ari Rahman",
    nim: "G64190001",
    phone: "+62 812 3456 7890",
    program: "Ilmu Komputer",
    status: "Mahasiswa Aktif",
  },
} as const;
