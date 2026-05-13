import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, CalendarDays, FileText, Info, MapPin, Menu, Search, Star } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { ApiError, apiDownload, apiRequest } from "../../api/http";
import { NotificationSurface } from "../../components/NotificationSurface";
import { studentHomeSession } from "../../fixtures/studentHome";
import {
  mapStudentReservationWorkflow,
  type StudentReservationWorkflowProjection,
} from "../../reservations/studentReservationWorkflow";

type ReservationDocument = {
  actionLabel: string;
  downloadPath: string;
  fileName: string;
  metadata: string;
  statusLabel: string;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

function formatTime(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function formatSize(sizeBytes: number) {
  if (sizeBytes >= 1_000_000) {
    return `${(sizeBytes / 1_000_000).toFixed(1).replace(".", ",")} MB`;
  }

  return `${Math.round(sizeBytes / 1000)} KB`;
}

function formatDocumentDate(value?: string | null) {
  return value ? dateFormatter.format(new Date(value)) : null;
}

function metadataLabel(
  document: NonNullable<StudentReservationWorkflowProjection["document"]["approval_letter"]>,
) {
  const timestamp = formatDocumentDate(document.uploaded_at ?? document.generated_at ?? null);
  const prefix = document.uploaded_at ? "Diunggah" : "Dibuat";
  return [timestamp ? `${prefix} ${timestamp}` : null, formatSize(document.size_bytes)]
    .filter(Boolean)
    .join(" · ");
}

function buildDocuments(reservation: StudentReservationWorkflowProjection): ReservationDocument[] {
  const documents: ReservationDocument[] = [];

  if (reservation.document.approval_letter) {
    documents.push({
      actionLabel: "Unduh Surat",
      downloadPath: `/student/reservations/${reservation.id}/approval-letter/download`,
      fileName: reservation.document.approval_letter.filename,
      metadata: metadataLabel(reservation.document.approval_letter),
      statusLabel: "Terverifikasi",
    });
  }

  if (reservation.document.signed_approval_letter) {
    documents.push({
      actionLabel: "Lihat Dokumen",
      downloadPath: `/student/reservations/${reservation.id}/signed-approval-letter/download`,
      fileName: reservation.document.signed_approval_letter.filename,
      metadata: metadataLabel(reservation.document.signed_approval_letter),
      statusLabel: "Terverifikasi",
    });
  }

  if (reservation.payment.receipt) {
    documents.push({
      actionLabel: "Lihat Bukti",
      downloadPath: `/student/reservations/${reservation.id}/payment-receipt/download`,
      fileName: reservation.payment.receipt.filename,
      metadata: metadataLabel(reservation.payment.receipt),
      statusLabel: reservation.payment.review_status === "approved" ? "Terverifikasi" : "Menunggu Review",
    });
  }

  return documents;
}

function actionForReservation(reservation: StudentReservationWorkflowProjection) {
  const hasVisibleReview = reservation.review !== null && !reservation.review.is_deleted;

  if (reservation.status === "approved") {
    return {
      href: `/student/reservations/${reservation.id}/cancellation`,
      label: "Ajukan Pembatalan",
      tone: "caution" as const,
    };
  }

  if (reservation.status === "completed" && !hasVisibleReview) {
    return {
      href: `/student/reservations/${reservation.id}/review`,
      label: "Tulis Ulasan",
      tone: "primary" as const,
    };
  }

  return null;
}

function noticeForReservation(reservation: StudentReservationWorkflowProjection) {
  if (reservation.status === "approved") {
    return "Reservasi ini sudah disetujui. Bawa kartu identitas dan gunakan fasilitas sesuai jadwal yang tertera.";
  }

  if (reservation.status === "completed" && reservation.review && !reservation.review.is_deleted) {
    return "Reservasi telah selesai dan ulasan Anda sudah tercatat.";
  }

  if (reservation.status === "completed") {
    return "Reservasi telah selesai. Anda dapat menulis ulasan untuk membantu pengguna lain menilai fasilitas ini.";
  }

  if (reservation.status === "cancelled") {
    return "Reservasi ini sudah dibatalkan.";
  }

  return "Detail reservasi tersedia untuk ditinjau.";
}

function shouldRedirectDetail(reservation: StudentReservationWorkflowProjection) {
  if (["approved", "completed", "cancelled", "expired", "rejected"].includes(reservation.status)) {
    return null;
  }

  const projection = mapStudentReservationWorkflow(reservation);
  return projection.primaryHref === `/student/reservations/${reservation.id}` ? null : projection.primaryHref;
}

const navItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

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
          <label className="relative flex h-10 min-w-[232px] items-center text-slate-500 max-md:hidden">
            <span className="sr-only">Cari fasilitas</span>
            <Search aria-hidden="true" className="absolute left-4 text-slate-400" size={18} />
            <input
              className="h-10 w-[250px] rounded-full border border-[#dbe2ea] bg-gradient-to-b from-white to-slate-50 py-2.5 pl-[42px] pr-4 text-[13px] font-medium leading-5 outline-none focus:border-[#0f9d58] focus:bg-white"
              placeholder="Cari fasilitas..."
              type="search"
            />
          </label>
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

function MediaTile({ className = "" }: { className?: string }) {
  return (
    <div
      aria-label="Galeri Grand Auditorium"
      className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#d1fae5] via-[#e7fbd3] to-[#fef3c7] ${className}`}
      role="img"
    >
      <div className="absolute inset-[18px] rounded-[10px] border-[4px] border-[#9fd9b8]/75" />
      <div className="relative text-center">
        <p className="m-0 font-serif text-[26px] font-bold leading-none text-[#1d7667] md:text-[34px]">
          IPB SRH
        </p>
        <p className="m-0 mt-2 text-[9px] text-[#374151] md:text-xs">Deterministic media fixture</p>
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <div className="mt-8 grid h-[410px] grid-cols-[1fr_1fr] gap-3 max-md:h-auto max-md:grid-cols-1">
      <MediaTile className="h-full max-md:h-[186px] md:row-span-2" />
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        <MediaTile className="min-h-[195px] max-md:min-h-[186px]" />
        <MediaTile className="min-h-[195px] max-md:min-h-[186px]" />
      </div>
      <MediaTile className="min-h-[195px] max-md:hidden" />
    </div>
  );
}

function InfoCard({
  icon,
  label,
  title,
  value,
}: {
  icon: "building" | "calendar";
  label: string;
  title: string;
  value: string;
}) {
  const Icon = icon === "calendar" ? CalendarDays : Building2;
  return (
    <section className="flex min-w-0 gap-4 rounded-xl border border-[#e5e7eb] bg-white p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f5e9] text-[#0f9d58]">
        <Icon aria-hidden="true" size={20} />
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
          {label}
        </p>
        <h2 className="m-0 mt-2 break-words text-base font-bold">{title}</h2>
        <p className="m-0 mt-2 break-words text-sm leading-6 text-[#6b7280]">{value}</p>
      </div>
    </section>
  );
}

function DocumentRow({ document }: { document: ReservationDocument }) {
  const fileBadge = document.fileName.toLowerCase().endsWith(".pdf") ? "PDF" : "IMG";
  const downloadMutation = useMutation({
    mutationFn: () => apiDownload(document.downloadPath),
  });

  return (
    <div className="grid grid-cols-[48px_1fr_auto] items-center gap-4 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4 max-md:grid-cols-[48px_1fr]">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#ecfdf5] text-xs font-bold text-[#0f9d58]">
        {fileBadge}
      </span>
      <div className="min-w-0">
        <p className="m-0 break-words text-sm font-bold">{document.fileName}</p>
        <p className="m-0 mt-1 break-words text-xs leading-5 text-[#6b7280]">{document.metadata}</p>
      </div>
      <div className="flex items-center gap-3 max-md:col-span-2 max-md:border-t max-md:border-[#e5e7eb] max-md:pt-3">
        <span className="rounded-full bg-[#dcfce7] px-3 py-1.5 text-xs font-bold text-[#047857]">
          {document.statusLabel}
        </span>
        <button
          className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-bold text-[#0f9d58] no-underline"
          disabled={downloadMutation.isPending}
          onClick={() => downloadMutation.mutate()}
          type="button"
        >
          {downloadMutation.isPending ? "Mengunduh..." : document.actionLabel}
        </button>
      </div>
      {downloadMutation.isError ? (
        <p className="m-0 text-xs font-semibold text-[#b91c1c] max-md:col-span-2">
          {(downloadMutation.error as ApiError).message}
        </p>
      ) : null}
    </div>
  );
}

function DetailContent({ detail }: { detail: StudentReservationWorkflowProjection }) {
  const documents = buildDocuments(detail);
  const action = actionForReservation(detail);
  const notice = noticeForReservation(detail);
  const statusLabel = mapStudentReservationWorkflow(detail).statusLabel;

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-7">
      <div className="flex items-center justify-between gap-5 max-md:items-start">
        <a className="text-sm font-bold text-[#0f9d58] no-underline" href="/student/reservations">
          ← Kembali
        </a>
        {action ? (
          <a
            className={`flex min-h-[44px] items-center justify-center rounded-lg px-5 text-sm font-bold no-underline ${
              action.tone === "primary"
                ? "bg-[#0f9d58] text-white"
                : "border border-[#fbbf24] bg-[#fffbeb] text-[#92400e]"
            }`}
            href={action.href}
          >
            {action.label}
          </a>
        ) : (
          <span className="rounded-full bg-[#dcfce7] px-3 py-1.5 text-xs font-bold text-[#047857]">
            {statusLabel}
          </span>
        )}
      </div>

      <h1 className="m-0 mt-9 text-[34px] font-bold leading-tight max-md:text-[30px]">
        {detail.facility.name}
      </h1>
      <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-[#6b7280]">
        <span className="flex items-center gap-1.5">
          <Star aria-hidden="true" className="fill-[#0f9d58] text-[#0f9d58]" size={16} />
          <strong className="text-[#111827]">4.9</strong> (124 ulasan)
        </span>
        <span className="flex items-center gap-2">
          <MapPin aria-hidden="true" size={18} />
          Gedung Graha Widya Wisuda, Lantai 1
        </span>
      </div>

      <Gallery />

      <div className="mt-8 grid grid-cols-2 gap-6 max-md:grid-cols-1">
        <InfoCard
          icon="calendar"
          label="Jadwal"
          title={dateFormatter.format(new Date(detail.starts_at))}
          value={`${formatTime(detail.starts_at)} - ${formatTime(detail.ends_at)}`}
        />
        <InfoCard
          icon="building"
          label="Departemen / Organisasi"
          title={detail.organization_unit.name}
          value={detail.activity_title}
        />
      </div>

      <section className="mt-9">
        <h2 className="m-0 flex items-center gap-2 text-xl font-bold">
          <FileText aria-hidden="true" size={20} />
          Dokumen Reservasi
        </h2>
        <div className="mt-6 grid gap-3">
          {documents.length === 0 ? (
            <p className="m-0 rounded-xl border border-dashed border-[#d1d5db] bg-[#f8fafc] p-4 text-sm font-semibold text-[#6b7280]">
              Belum ada dokumen tersedia.
            </p>
          ) : null}
          {documents.map((document) => (
            <DocumentRow document={document} key={document.fileName} />
          ))}
        </div>
      </section>

      <div className="mt-5 flex gap-3 rounded-xl border border-[#86efac] bg-[#ecfdf5] p-5 text-sm leading-6 text-[#065f46]">
        <Info aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
        <p className="m-0">{notice}</p>
      </div>
    </div>
  );
}

export function StudentReservationDetailReadOnlyPage() {
  const { reservationId = "" } = useParams();
  const detailQuery = useQuery({
    enabled: reservationId.length > 0,
    queryFn: () => apiRequest<StudentReservationWorkflowProjection>(`/student/reservations/${reservationId}`),
    queryKey: ["student-reservation-detail", reservationId],
  });

  if (detailQuery.isLoading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
        <StudentHeader />
        <main className="mx-auto mt-[104px] w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-10 text-sm font-semibold text-[#475569]">
            Memuat detail reservasi...
          </div>
        </main>
        <StudentFooter />
      </div>
    );
  }

  if (detailQuery.isError) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
        <StudentHeader />
        <main className="mx-auto mt-[104px] w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
          <div className="rounded-xl border border-[#fecaca] bg-white p-10 text-sm font-semibold text-[#b91c1c]">
            {(detailQuery.error as ApiError).message}
          </div>
        </main>
        <StudentFooter />
      </div>
    );
  }

  const detail = detailQuery.data;

  if (!detail) {
    return null;
  }

  const redirectTo = shouldRedirectDetail(detail);

  if (redirectTo) {
    return <Navigate replace to={redirectTo} />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <StudentHeader />
      <main className="mx-auto mt-[104px] w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
        <DetailContent detail={detail} />
      </main>
      <StudentFooter />
    </div>
  );
}
