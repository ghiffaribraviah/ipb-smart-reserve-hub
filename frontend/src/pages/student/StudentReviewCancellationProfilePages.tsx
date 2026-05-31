import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, LogOut, Menu } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ApiError, apiRequest } from "../../api/http";
import { useAuth } from "../../auth/session";
import { NotificationSurface } from "../../components/NotificationSurface";
import { StudentHeaderSearch } from "../../components/layout/StudentHeaderSearch";
import { studentHomeSession } from "../../fixtures/studentHome";
import { studentReviewCancellationProfileFixture } from "../../fixtures/studentReviewCancellationProfile";
import {
  mapStudentReservationWorkflow,
  type StudentReservationWorkflowProjection,
} from "../../reservations/studentReservationWorkflow";
import { formatCampusDate, formatCampusTime } from "../../utils/campusTime";

const navItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

function reservationDetailHref(reservationId: string) {
  return `/student/reservations/${reservationId}`;
}

function cancellationEligible(reservation: StudentReservationWorkflowProjection) {
  return reservation.status === "approved";
}

function queryReservation(reservationId: string) {
  return apiRequest<StudentReservationWorkflowProjection>(`/student/reservations/${reservationId}`);
}

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Permintaan belum dapat diproses.";
}

function StudentHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-[72px] justify-center border-b border-[#e5e7eb] bg-white max-md:h-16">
      <div className="flex h-full w-[1200px] max-w-[95%] items-center justify-between gap-[22px] max-md:max-w-full max-md:px-3.5">
        <div className="flex min-w-0 items-center gap-[22px] max-md:gap-3.5">
          <button
            aria-label="Buka navigasi mahasiswa"
            className="hidden text-slate-500 max-md:inline-flex"
            type="button"
          >
            <Menu aria-hidden="true" size={24} />
          </button>
          <a
            aria-label="IPB Smart Reserve Hub"
            className="whitespace-nowrap font-serif text-2xl font-bold leading-none text-[#1d7667] no-underline max-md:text-[22px]"
            href="/student"
          >
            <span className="hidden md:inline">
              IPB
              <br />
              SRH
            </span>
            <span className="md:hidden">IPB SRH</span>
          </a>
          <StudentHeaderSearch />
        </div>

        <nav
          aria-label="Navigasi mahasiswa"
          className="flex items-center gap-10 max-md:hidden"
        >
          {navItems.map((item) => (
            <a
              aria-current={item.label === "Reservasi" ? "page" : undefined}
              className={`border-b-2 pb-1 text-sm font-bold no-underline ${
                item.label === "Reservasi"
                  ? "border-[#0f9d58] text-[#0f9d58]"
                  : "border-transparent text-slate-500"
              }`}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-[22px] max-md:gap-3.5">
          <NotificationSurface className="text-slate-500" role="student" />
          <a
            aria-label={`Profil ${studentHomeSession.name}`}
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#0f9d58] text-[13px] font-bold text-white no-underline"
            href="/student/profile"
          >
            {studentHomeSession.initials}
          </a>
        </div>
      </div>
    </header>
  );
}

function StudentFooter() {
  return (
    <footer className="mt-20 flex justify-center border-t border-[#e5e7eb] bg-white py-[22px] max-md:mt-16">
      <div className="flex w-[1200px] max-w-[95%] items-center justify-between gap-6 max-md:flex-col max-md:gap-3.5 max-md:text-center">
        <div className="flex min-w-0 items-center gap-4 max-md:flex-col max-md:gap-2">
          <p className="m-0 whitespace-nowrap font-serif text-[30px] font-bold leading-none text-[#4da38b]">
            IPB SRH
          </p>
          <p className="m-0 text-[13px] leading-5 text-[#6b7280]">
            © 2026 IPB Smart Reserve Hub. Hak cipta dilindungi.
          </p>
        </div>
        <nav
          aria-label="Navigasi footer mahasiswa"
          className="flex flex-wrap justify-end gap-x-[18px] gap-y-2.5 text-sm font-semibold text-[#6b7280] max-md:justify-center"
        >
          {navItems.map((item) => (
            <a className="whitespace-nowrap no-underline" href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <StudentHeader />
      <main className="mx-auto mt-[104px] w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
        {children}
      </main>
      <StudentFooter />
    </div>
  );
}

function SummaryMedia({
  coverImageUrl,
  facilityName,
}: {
  coverImageUrl?: string | null;
  facilityName: string;
}) {
  if (coverImageUrl) {
    return (
      <div className="relative h-[190px] overflow-hidden rounded-t-xl bg-[#e5e7eb]">
        <img
          alt={`Foto ${facilityName}`}
          className="h-full w-full object-cover"
          src={coverImageUrl}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-[190px] items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-br from-[#d1fae5] via-[#e7fbd3] to-[#fef3c7]">
      <div className="absolute inset-[18px] rounded-[10px] border-[4px] border-[#9fd9b8]/75" />
      <div className="relative text-center">
        <p className="m-0 font-serif text-[24px] font-bold leading-none text-[#1d7667]">
          IPB SRH
        </p>
        <p className="m-0 mt-2 text-[9px] text-[#374151]">Deterministic media fixture</p>
      </div>
    </div>
  );
}

function ReservationSummaryCard({
  includeStatus = false,
  reservation,
}: {
  includeStatus?: boolean;
  reservation: StudentReservationWorkflowProjection;
}) {
  const projection = mapStudentReservationWorkflow(reservation);

  return (
    <aside className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <SummaryMedia
        coverImageUrl={reservation.facility.cover_image_url}
        facilityName={reservation.facility.name}
      />
      <div className="p-6">
        <p className="m-0 mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
          Ringkasan Reservasi
        </p>
        <h2 className="m-0 text-xl font-bold">{reservation.facility.name}</h2>
        <div className="mt-6 grid gap-4 text-sm">
          <p className="m-0 flex items-center gap-3 text-[#6b7280]">
            <CalendarDays aria-hidden="true" className="text-[#0f9d58]" size={18} />
            {formatCampusDate(reservation.starts_at)}
          </p>
          <p className="m-0 flex items-center gap-3 text-[#6b7280]">
            <Clock aria-hidden="true" className="text-[#0f9d58]" size={18} />
            {formatCampusTime(reservation.starts_at)} - {formatCampusTime(reservation.ends_at)}
          </p>
        </div>
        {includeStatus ? (
          <dl className="m-0 mt-6 space-y-4 border-t border-[#e5e7eb] pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#6b7280]">Organisasi</dt>
              <dd className="m-0 font-bold">{reservation.organization_unit.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#6b7280]">Status saat ini</dt>
              <dd className="m-0">
                <span className="rounded-full bg-[#dcfce7] px-3 py-1.5 text-xs font-bold text-[#047857]">
                  {projection.statusLabel}
                </span>
              </dd>
            </div>
          </dl>
        ) : null}
      </div>
    </aside>
  );
}

export function StudentReviewPage() {
  const { reservationId = "" } = useParams();
  const reservationQuery = useQuery({
    enabled: reservationId.length > 0,
    queryFn: () => queryReservation(reservationId),
    queryKey: ["student-review-reservation", reservationId],
  });

  if (reservationQuery.isLoading) {
    return <PageShell><p className="rounded-xl border border-[#e5e7eb] bg-white p-8 text-sm font-semibold text-[#475569]">Memuat reservasi...</p></PageShell>;
  }

  if (reservationQuery.isError) {
    return <PageShell><p className="rounded-xl border border-[#fecaca] bg-white p-8 text-sm font-semibold text-[#b91c1c]">{errorMessage(reservationQuery.error)}</p></PageShell>;
  }

  const reservation = reservationQuery.data;

  if (!reservation) {
    return null;
  }

  return <Navigate replace to={`${reservationDetailHref(reservation.id)}#review`} />;
}

export function StudentCancellationRequestPage() {
  const { reservationId = "" } = useParams();
  const navigate = useNavigate();
  const [reasonGroup, setReasonGroup] = useState("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const reservationQuery = useQuery({
    enabled: reservationId.length > 0,
    queryFn: () => queryReservation(reservationId),
    queryKey: ["student-cancellation-reservation", reservationId],
  });
  const cancellationMutation = useMutation({
    mutationFn: () =>
      apiRequest<StudentReservationWorkflowProjection>(`/student/reservations/${reservationId}/cancellation-request`, {
        body: {
          reason: [reasonGroup, reasonDetail.trim()].filter(Boolean).join(": "),
        },
        method: "POST",
      }),
    onSuccess: (reservation) => navigate(mapStudentReservationWorkflow(reservation).primaryHref, { replace: true }),
  });

  if (reservationQuery.isLoading) {
    return <PageShell><p className="rounded-xl border border-[#e5e7eb] bg-white p-8 text-sm font-semibold text-[#475569]">Memuat reservasi...</p></PageShell>;
  }

  if (reservationQuery.isError) {
    return <PageShell><p className="rounded-xl border border-[#fecaca] bg-white p-8 text-sm font-semibold text-[#b91c1c]">{errorMessage(reservationQuery.error)}</p></PageShell>;
  }

  const reservation = reservationQuery.data;

  if (!reservation) {
    return null;
  }

  if (!cancellationEligible(reservation)) {
    return <Navigate replace to={mapStudentReservationWorkflow(reservation).primaryHref} />;
  }

  function submitCancellation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    if (!reasonGroup) {
      setValidationError("Pilih alasan utama pembatalan.");
      return;
    }

    if (reasonDetail.trim().length < 20) {
      setValidationError("Detail alasan minimal 20 karakter.");
      return;
    }

    cancellationMutation.mutate();
  }

  return (
    <PageShell>
      <a className="text-sm font-bold text-[#0f9d58] no-underline" href={reservationDetailHref(reservation.id)}>
        ← Kembali ke Detail Reservasi
      </a>
      <div className="mt-6 grid grid-cols-[1fr_360px] items-start gap-8 max-lg:grid-cols-1">
        <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-7">
          <h1 className="m-0 text-[30px] font-bold">Ajukan Pembatalan</h1>
          <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
            Pembatalan akan langsung mengubah status reservasi menjadi dibatalkan setelah alasan dikirim.
          </p>
          <div className="mt-6 rounded-xl border border-[#fbbf24] bg-[#fffbeb] p-5 text-sm leading-6 text-[#92400e]">
            Pastikan keputusan sudah final. Pembatalan dapat berdampak pada denda, sanksi penggunaan fasilitas,
            atau tidak adanya refund untuk reservasi berbayar sesuai kebijakan fasilitas.
          </div>
          <form className="mt-7" onSubmit={submitCancellation}>
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                Alasan Pembatalan
              </span>
              <select
                aria-label="Alasan Pembatalan"
                className="h-[52px] w-full rounded-lg border border-[#d1d5db] bg-white px-4 text-sm"
                onChange={(event) => setReasonGroup(event.target.value)}
                value={reasonGroup}
              >
                <option value="">Pilih alasan utama</option>
                <option>Jadwal kegiatan berubah</option>
                <option>Fasilitas tidak lagi dibutuhkan</option>
                <option>Kesalahan data reservasi</option>
              </select>
            </label>
            <label className="mt-6 block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                Detail Alasan
              </span>
              <textarea
                aria-label="Detail Alasan"
                className="min-h-[150px] w-full rounded-lg border border-[#d1d5db] bg-white p-4 text-sm leading-6"
                onChange={(event) => setReasonDetail(event.target.value)}
                value={reasonDetail}
              />
            </label>
            <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
              Minimal 20 karakter. Alasan ini akan tersimpan di detail reservasi.
            </p>
            {validationError || cancellationMutation.isError ? (
              <p className="m-0 mt-3 text-sm font-semibold text-[#b91c1c]">
                {validationError ?? errorMessage(cancellationMutation.error)}
              </p>
            ) : null}
            <div className="mt-7 grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <button
                className="min-h-[52px] rounded-lg border border-[#e5e7eb] bg-white text-sm font-bold"
                onClick={() => navigate(reservationDetailHref(reservation.id))}
                type="button"
              >
                Batalkan
              </button>
              <button
                className="min-h-[52px] rounded-lg border border-[#fbbf24] bg-[#fffbeb] text-sm font-bold text-[#92400e]"
                disabled={cancellationMutation.isPending}
                type="submit"
              >
                {cancellationMutation.isPending ? "Mengirim..." : "Kirim Pengajuan"}
              </button>
            </div>
          </form>
        </section>
        <div className="grid gap-6">
          <ReservationSummaryCard includeStatus reservation={reservation} />
          <section>
            <h2 className="m-0 text-xl font-bold">Setelah Dikirim</h2>
            <p className="m-0 mt-4 text-sm leading-6 text-[#6b7280]">
              Sistem langsung menutup reservasi dan mengembalikan mahasiswa ke detail reservasi.
            </p>
            <div className="mt-5 grid gap-4">
              <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-5 text-[#991b1b]">
                <h3 className="m-0 text-base font-bold">Reservasi Dibatalkan</h3>
                <p className="m-0 mt-2 text-sm leading-6">
                  Jadwal dilepas dari kalender fasilitas dan alasan pembatalan tetap terlihat di riwayat.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "M";
}

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Belum tersedia" : String(value);
}

export function StudentProfilePage() {
  const auth = useAuth();
  const profile = auth.user ?? null;
  const fixtureProfile = studentReviewCancellationProfileFixture.profile;
  const visibleProfile = profile
    ? {
        degree: displayValue(profile.academic_profile?.degree),
        email: profile.email,
        entryYear: displayValue(profile.academic_profile?.entry_year),
        faculty: displayValue(profile.academic_profile?.faculty),
        initials: initials(profile.full_name),
        name: profile.full_name,
        nim: displayValue(profile.nim),
        phone: displayValue(profile.phone),
        program: displayValue(profile.academic_profile?.program_studi),
        status: profile.is_active ? "Mahasiswa Aktif" : "Tidak Aktif",
      }
    : fixtureProfile;
  const profileRows = useMemo(
    () =>
      [
        ["Nomor Induk Mahasiswa (NIM)", visibleProfile.nim],
        ["Email", visibleProfile.email],
        ["Nomor Telepon", visibleProfile.phone],
        ["Program Studi", visibleProfile.program],
        ["Fakultas", visibleProfile.faculty],
        ["Tahun Masuk", visibleProfile.entryYear],
        ["Strata", visibleProfile.degree],
      ] as const,
    [visibleProfile.degree, visibleProfile.email, visibleProfile.entryYear, visibleProfile.faculty, visibleProfile.nim, visibleProfile.phone, visibleProfile.program],
  );

  return (
    <PageShell>
      <section className="max-w-[620px]">
        <h1 className="m-0 text-[32px] font-bold max-md:text-[30px]">Profil Mahasiswa</h1>
        <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
          Lihat identitas akun dan informasi akademik yang terhubung dengan NIM Anda.
        </p>
      </section>
      <div className="mt-8 grid grid-cols-[320px_1fr] items-start gap-8 max-lg:grid-cols-1">
        <aside className="rounded-xl border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
          <div className="mx-auto flex h-[116px] w-[116px] items-center justify-center rounded-full border-4 border-white bg-[#e8f5e9] text-[38px] font-bold text-[#0f9d58] shadow">
            {visibleProfile.initials}
          </div>
          <h2 className="m-0 mt-6 text-xl font-bold">{visibleProfile.name}</h2>
          <p className="m-0 mt-2 text-sm text-[#6b7280]">{visibleProfile.nim}</p>
          <p className="m-0 mt-1 break-words text-sm text-[#6b7280]">{visibleProfile.email}</p>
          <span className="mt-5 inline-flex rounded-full bg-[#dcfce7] px-4 py-2 text-sm font-bold text-[#047857]">
            {visibleProfile.status}
          </span>
          <button
            aria-label="Keluar"
            className="mt-7 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-[#fecaca] bg-[#fee2e2] text-sm font-bold text-[#b91c1c]"
            onClick={() => auth.logout()}
            type="button"
          >
            <LogOut aria-hidden="true" size={18} />
            Keluar
          </button>
        </aside>
        <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
          <h2 className="m-0 text-xl font-bold">Informasi Akademik</h2>
          <dl className="m-0 mt-6 grid grid-cols-2 gap-x-10 gap-y-7 border-t border-[#e5e7eb] pt-6 max-md:grid-cols-1">
            {profileRows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  {label}
                </dt>
                <dd className="m-0 mt-3 break-words text-base font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </PageShell>
  );
}
