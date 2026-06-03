import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarDays, FileText, Info, MapPin, Menu, Star } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ApiError, apiDownload, apiPreview, apiRequest } from "../../api/http";
import { NotificationSurface } from "../../components/NotificationSurface";
import { StudentHeaderSearch } from "../../components/layout/StudentHeaderSearch";
import { studentHomeSession } from "../../fixtures/studentHome";
import {
  mapStudentReservationWorkflow,
  type StudentReservationWorkflowProjection,
} from "../../reservations/studentReservationWorkflow";
import { formatCampusDate, formatCampusTime } from "../../utils/campusTime";
import logo from "../../assets/logo.png";
type ReservationDocument = {
  downloadPath: string;
  fileName: string;
  metadata: string;
  previewLabel: string;
  previewPath: string;
  stampLabel?: string;
  statusLabel: string;
};

type ReviewResponse = {
  admin_removal_reason?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  id: string;
  is_deleted?: boolean;
};

function formatSize(sizeBytes: number) {
  if (sizeBytes >= 1_000_000) {
    return `${(sizeBytes / 1_000_000).toFixed(1).replace(".", ",")} MB`;
  }

  return `${Math.round(sizeBytes / 1000)} KB`;
}

function formatDocumentDate(value?: string | null) {
  return value ? formatCampusDate(value) : null;
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
  const hideTemplateDocument = reservation.status === "rejected";

  if (reservation.document.approval_letter && reservation.status !== "approved" && !hideTemplateDocument) {
    documents.push({
      downloadPath: `/student/reservations/${reservation.id}/approval-letter/download`,
      fileName: reservation.document.approval_letter.filename,
      metadata: metadataLabel(reservation.document.approval_letter),
      previewLabel: "Lihat Dokumen",
      previewPath: `/student/reservations/${reservation.id}/approval-letter/download`,
      stampLabel: "Template",
      statusLabel: "Terverifikasi",
    });
  }

  if (reservation.document.signed_approval_letter) {
    documents.push({
      downloadPath: `/student/reservations/${reservation.id}/signed-approval-letter/download`,
      fileName: reservation.document.signed_approval_letter.filename,
      metadata: metadataLabel(reservation.document.signed_approval_letter),
      previewLabel: "Lihat Dokumen",
      previewPath: `/student/reservations/${reservation.id}/signed-approval-letter/download`,
      stampLabel: reservation.status === "approved" ? "Disetujui" : "Terkirim",
      statusLabel: "Terverifikasi",
    });
  }

  if (reservation.payment.receipt) {
    documents.push({
      downloadPath: `/student/reservations/${reservation.id}/payment-receipt/download`,
      fileName: reservation.payment.receipt.filename,
      metadata: metadataLabel(reservation.payment.receipt),
      previewLabel: "Lihat Bukti",
      previewPath: `/student/reservations/${reservation.id}/payment-receipt/download`,
      statusLabel: reservation.payment.review_status === "approved" ? "Terverifikasi" : "Menunggu Review",
    });
  }

  return documents;
}

type DetailAction = {
  href: string;
  label: string;
  tone: "caution" | "primary";
};

function actionsForReservation(reservation: StudentReservationWorkflowProjection): DetailAction[] {
  const actions: DetailAction[] = [];

  if (
    reservation.payment.required &&
    reservation.payment.review_status === "upload_needed" &&
    reservation.status === "approved"
  ) {
    actions.push({
      href: `/student/reservations/${reservation.id}/payment`,
      label: "Lanjut ke Pembayaran",
      tone: "primary",
    });
  }

  if (reservation.status === "approved") {
    actions.push({
      href: `/student/reservations/${reservation.id}/cancellation`,
      label: "Ajukan Pembatalan",
      tone: "caution",
    });
  }

  return actions;
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
    return reservation.cancellation_reason
      ? `Reservasi ini sudah dibatalkan. Alasan: ${reservation.cancellation_reason}`
      : "Reservasi ini sudah dibatalkan.";
  }

  return "Detail reservasi tersedia untuk ditinjau.";
}

function shouldRedirectDetail(reservation: StudentReservationWorkflowProjection) {
  if (reservation.status === "rejected" && (reservation.rejection?.source === "document" || reservation.rejection?.source === "payment")) {
    return mapStudentReservationWorkflow(reservation).primaryHref;
  }

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
            className="flex shrink-0 items-center no-underline"
            href="/student"
          >
            <img
              src={logo}
              alt="IPB Smart Reserve Hub"
              className="h-10 w-auto max-md:h-9"
            />
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
          <a
            aria-label="IPB Smart Reserve Hub"
            className="flex shrink-0 items-center no-underline"
            href="/student"
          >
            <img
              src={logo}
              alt="IPB Smart Reserve Hub"
              className="h-10 w-auto max-md:h-9"
            />
          </a>
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

function Gallery({
  coverImageUrl,
  facilityName,
}: {
  coverImageUrl?: string | null;
  facilityName: string;
}) {
  if (coverImageUrl) {
    return (
      <div className="mt-8 h-[410px] overflow-hidden rounded-lg bg-[#e5e7eb] max-md:h-[240px]">
        <img
          alt={`Foto ${facilityName}`}
          className="h-full w-full object-cover"
          src={coverImageUrl}
        />
      </div>
    );
  }

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
  const previewMutation = useMutation({
    mutationFn: () => apiPreview(document.previewPath),
  });

  return (
    <div className="relative grid grid-cols-[48px_1fr_auto] items-center gap-4 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4 max-md:grid-cols-[48px_1fr]">
      {document.stampLabel ? (
        <span className="absolute -right-1 -top-3 rotate-12 rounded-full border-2 border-[#0f9d58] bg-[#ecfdf5] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#047857] shadow-[0_2px_4px_rgba(0,0,0,0.08)] max-md:right-3 max-md:top-3 max-md:rotate-0">
          {document.stampLabel}
        </span>
      ) : null}
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
          disabled={previewMutation.isPending}
          onClick={() => previewMutation.mutate()}
          type="button"
        >
          {previewMutation.isPending ? "Membuka..." : document.previewLabel}
        </button>
        <button
          className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-bold text-[#0f9d58] no-underline"
          disabled={downloadMutation.isPending}
          onClick={() => downloadMutation.mutate()}
          type="button"
        >
          {downloadMutation.isPending ? "Mengunduh..." : document.previewLabel.startsWith("Lihat") ? `Unduh ${document.previewLabel.replace("Lihat ", "")}` : "Unduh"}
        </button>
      </div>
      {downloadMutation.isError || previewMutation.isError ? (
        <p className="m-0 text-xs font-semibold text-[#b91c1c] max-md:col-span-2">
          {((previewMutation.error ?? downloadMutation.error) as ApiError).message}
        </p>
      ) : null}
    </div>
  );
}

function ReservationReviewPanel({ detail }: { detail: StudentReservationWorkflowProjection }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const hasVisibleReview = detail.review !== null && !detail.review.is_deleted;
  const reviewMutation = useMutation({
    mutationFn: () =>
      apiRequest<ReviewResponse>(`/student/reservations/${detail.id}/review`, {
        body: { comment: comment.trim() || null, rating },
        method: "POST",
      }),
    onSuccess: (review) => {
      queryClient.setQueryData<StudentReservationWorkflowProjection>(["student-reservation-detail", detail.id], {
        ...detail,
        review: {
          admin_removal_reason: review.admin_removal_reason ?? null,
          deleted_at: review.deleted_at ?? null,
          deleted_by: review.deleted_by ?? null,
          id: review.id,
          is_deleted: review.is_deleted ?? false,
        },
      });
    },
  });

  if (detail.status !== "completed") {
    return null;
  }

  if (hasVisibleReview) {
    return (
      <section id="review" className="mt-9 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-6">
        <h2 className="m-0 text-xl font-bold text-[#065f46]">Ulasan Anda</h2>
        <p className="m-0 mt-3 text-sm leading-6 text-[#166534]">
          Ulasan Anda sudah tercatat.
        </p>
      </section>
    );
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    if (rating === null) {
      setValidationError("Penilaian bintang wajib diisi.");
      return;
    }

    reviewMutation.mutate();
  }

  return (
    <section id="review" className="mt-9 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-6">
      <h2 className="m-0 text-xl font-bold">Tulis Ulasan</h2>
      <p className="m-0 mt-3 max-w-[560px] text-sm leading-6 text-[#6b7280]">
        Bagikan pengalaman Anda menggunakan fasilitas ini untuk membantu mahasiswa lain.
      </p>
      <form className="mt-7" onSubmit={submitReview}>
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-4 text-sm font-bold">
            Penilaian Fasilitas <span className="text-[#dc2626]">*</span>
          </legend>
          <div aria-label="Penilaian Fasilitas" className="flex gap-3" role="radiogroup">
            {[1, 2, 3, 4, 5].map((star) => (
              <label
                className={`flex h-11 w-11 cursor-pointer items-center justify-center ${
                  rating !== null && rating >= star ? "text-[#0f9d58]" : "text-[#d1d5db]"
                }`}
                key={star}
              >
                <input
                  checked={rating === star}
                  className="sr-only"
                  name="rating"
                  onChange={() => setRating(star)}
                  type="radio"
                  value={star}
                />
                <span className="sr-only">{star} dari 5</span>
                <Star aria-hidden="true" className="fill-current" size={30} />
              </label>
            ))}
          </div>
        </fieldset>
        <label className="mt-7 block">
          <span className="mb-3 block text-sm font-bold">Komentar</span>
          <textarea
            aria-label="Komentar"
            className="min-h-[132px] w-full rounded-lg border border-[#d1d5db] bg-white p-4 text-sm leading-6"
            onChange={(event) => setComment(event.target.value)}
            placeholder="Opsional: ceritakan pengalaman Anda terkait kebersihan, kelengkapan alat, pelayanan, atau hal lain yang membantu."
            value={comment}
          />
        </label>
        <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
          Komentar bersifat opsional. Penilaian bintang wajib diisi.
        </p>
        {validationError || reviewMutation.isError ? (
          <p className="m-0 mt-3 text-sm font-semibold text-[#b91c1c]">
            {validationError ?? (reviewMutation.error as ApiError).message}
          </p>
        ) : null}
        <div className="mt-7 flex justify-end">
          <button
            className="min-h-[52px] rounded-lg bg-[#0f9d58] px-6 text-sm font-bold text-white"
            disabled={reviewMutation.isPending}
            type="submit"
          >
            {reviewMutation.isPending ? "Mengirim..." : "Kirim Ulasan"}
          </button>
        </div>
      </form>
    </section>
  );
}

function DetailContent({ detail }: { detail: StudentReservationWorkflowProjection }) {
  const documents = buildDocuments(detail);
  const actions = actionsForReservation(detail);
  const notice = noticeForReservation(detail);
  const mappedDetail = mapStudentReservationWorkflow(detail);
  const statusLabel = mappedDetail.statusLabel;
  const statusToneClasses =
    mappedDetail.tone === "rejected"
      ? "bg-[#fee2e2] text-[#991b1b]"
      : "bg-[#dcfce7] text-[#047857]";

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-7">
      <div className="flex items-center justify-between gap-5 max-md:items-start">
        <a className="text-sm font-bold text-[#0f9d58] no-underline" href="/student/reservations">
          ← Kembali
        </a>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusToneClasses}`}>
          {statusLabel}
        </span>
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

      <Gallery coverImageUrl={detail.facility.cover_image_url} facilityName={detail.facility.name} />

      <div className="mt-8 grid grid-cols-2 gap-6 max-md:grid-cols-1">
        <InfoCard
          icon="calendar"
          label="Jadwal"
          title={formatCampusDate(detail.starts_at)}
          value={`${formatCampusTime(detail.starts_at)} - ${formatCampusTime(detail.ends_at)}`}
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

      <ReservationReviewPanel detail={detail} />

      {actions.length > 0 ? (
        <div className="mt-9 flex flex-wrap justify-end gap-3 border-t border-[#e5e7eb] pt-7 max-md:justify-stretch">
          {actions.map((action) => (
            <a
              className={`flex min-h-[44px] items-center justify-center rounded-lg px-5 text-sm font-bold no-underline max-md:w-full ${
                action.tone === "primary"
                  ? "border border-[#0f9d58] bg-[#0f9d58] text-white"
                  : "border border-[#fbbf24] bg-[#fffbeb] text-[#92400e]"
              }`}
              href={action.href}
              key={action.href}
            >
              {action.label}
            </a>
          ))}
        </div>
      ) : null}
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
