import { CalendarDays, Check, Clock, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { apiDownload, apiRequest } from "../../api/http";
import {
  staffDecisionDialogFixture,
  staffReservationDetailFixture,
} from "../../fixtures/staffReservationDetail";
import { formatStaffDate, mapStaffReservationStatus } from "../../reservations/staffReservationOperations";
import { StaffShell } from "./StaffReservationOperationsPages";

type StaffFileMetadata = {
  content_type: string;
  filename: string;
  generated_at: string | null;
  size_bytes: number;
  uploaded_at: string | null;
};

type StaffReviewActionUrls = {
  approve_url: string;
  download_url: string | null;
  reject_url: string;
};

type StaffReviewTarget = "cancellation" | "document" | "payment";

type StaffReservationDetailResponse = {
  activity_title: string;
  cancellation: {
    reason: string | null;
    rejection_reason: string | null;
    requested: boolean;
    review_status: string;
  };
  contact_phone: string;
  document: {
    approval_letter: StaffFileMetadata | null;
    due_at: string | null;
    rejection_reason: string | null;
    review_status: string;
    signed_approval_letter: StaffFileMetadata | null;
  };
  ends_at: string;
  event_description: string;
  extra_requirements: {
    av_support: boolean;
    extra_cleaning: boolean;
    logistics_coordination: boolean;
    notes: string | null;
    security_personnel: boolean;
  };
  facility: { id: string; name: string };
  id: string;
  organization_unit: { id: string; name: string };
  participant_count: number;
  payment: {
    due_at: string | null;
    receipt: StaffFileMetadata | null;
    rejection_reason: string | null;
    required: boolean;
    review_status: string;
  };
  price_rupiah: number;
  reservation_code: string;
  review_actions: Record<StaffReviewTarget, StaffReviewActionUrls>;
  starts_at: string;
  status: string;
  student: {
    email: string;
    full_name: string;
    id: string;
  };
};

function fetchStaffReservationDetail(reservationId: string) {
  return apiRequest<StaffReservationDetailResponse>(`/staff/reservations/${reservationId}`);
}

function postReviewAction(path: string, body?: { reason: string }) {
  return apiRequest<unknown>(path, { body, method: "POST" });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";
}

function formatBytes(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toLocaleString("id-ID", { maximumFractionDigits: 1 })} MB`;
  }

  return `${(size / 1024).toLocaleString("id-ID", { maximumFractionDigits: 1 })} KB`;
}

function formatTimeRange(startsAt: string, endsAt: string) {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  return `${formatter.format(new Date(startsAt)).replace(".", ":")} - ${formatter.format(new Date(endsAt)).replace(".", ":")}`;
}

function extraRequirementSummary(extra: StaffReservationDetailResponse["extra_requirements"]) {
  const labels = [
    extra.av_support ? "Dukungan AV" : null,
    extra.logistics_coordination ? "Koordinasi logistik" : null,
    extra.extra_cleaning ? "Kebersihan tambahan" : null,
    extra.security_personnel ? "Personel keamanan" : null,
  ].filter(Boolean);

  if (extra.notes) {
    labels.push(`Catatan: ${extra.notes}`);
  }

  return labels.length > 0 ? labels.join(", ") : "Tidak ada kebutuhan tambahan";
}

function activeReviewTarget(detail: StaffReservationDetailResponse): StaffReviewTarget {
  if (detail.document.review_status === "pending_review") {
    return "document";
  }
  if (detail.payment.review_status === "pending_review") {
    return "payment";
  }
  if (detail.cancellation.review_status === "pending_review") {
    return "cancellation";
  }
  return "document";
}

function hasPendingReview(detail: StaffReservationDetailResponse, target: StaffReviewTarget) {
  return detail[target].review_status === "pending_review";
}

function targetLabel(target: StaffReviewTarget) {
  return target === "document" ? "Dokumen" : target === "payment" ? "Pembayaran" : "Pembatalan";
}

function StaffDetailStatus({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3 py-1.5 text-[13px] font-bold text-[#92400e]">
      <Clock aria-hidden="true" size={14} />
      {label}
    </span>
  );
}

function DetailCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
      <div className="mb-6 border-b border-[#e5e7eb] pb-4">
        <h2 className="m-0 text-lg font-bold text-[#111827]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoItem({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2 max-md:col-span-1" : ""}>
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
        {label}
      </p>
      <p className="m-0 mt-1 break-words text-sm font-semibold leading-6 text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function DocumentRow({
  file,
  onDownload,
  status,
}: {
  file: StaffFileMetadata;
  onDownload: () => void;
  status: string;
}) {
  const uploadedAt = file.uploaded_at ?? file.generated_at;

  return (
    <article className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4 max-md:grid-cols-[44px_minmax(0,1fr)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ecfdf5] text-xs font-black text-[#0f9d58]">
        {file.content_type.includes("pdf") ? "PDF" : "FILE"}
      </div>
      <div className="min-w-0">
        <h3 className="m-0 break-words text-sm font-bold text-[#111827]">{file.filename}</h3>
        <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">
          {uploadedAt ? `Diunggah ${formatStaffDate(uploadedAt)} - ${formatBytes(file.size_bytes)}` : formatBytes(file.size_bytes)}
        </p>
      </div>
      <div className="flex items-center gap-3 max-md:col-span-2 max-md:flex-wrap max-md:border-t max-md:border-[#e5e7eb] max-md:pt-3">
        <span className="rounded-full bg-[#fffbeb] px-2.5 py-1 text-xs font-bold text-[#b45309]">
          {status}
        </span>
        <button
          aria-label={`Unduh Dokumen ${file.filename}`}
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] font-bold text-[#0f9d58] max-md:flex-1"
          onClick={onDownload}
          type="button"
        >
          Unduh Dokumen
        </button>
      </div>
    </article>
  );
}

function SummaryImage() {
  return (
    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[#4a2511] via-[#7c4a24] to-[#f59e0b] text-lg font-bold text-white">
      Auditorium
    </div>
  );
}

export function StaffReservationDetailPage() {
  const { reservationId = staffReservationDetailFixture.detailHref.split("/").at(-1) ?? "" } = useParams();
  const queryClient = useQueryClient();
  const detailQuery = useQuery({
    queryFn: () => fetchStaffReservationDetail(reservationId),
    queryKey: ["staff-reservation-detail", reservationId],
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const approveMutation = useMutation({
    mutationFn: (url: string) => postReviewAction(url),
    onError: (error) => setActionError(errorMessage(error, "Keputusan belum dapat dikirim.")),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["staff-reservation-detail", reservationId] });
    },
  });

  const detail = detailQuery.data;
  const activeTarget = detail ? activeReviewTarget(detail) : "document";
  const activeLabel = targetLabel(activeTarget);
  const canReviewActiveTarget = detail ? hasPendingReview(detail, activeTarget) : false;
  const status = detail ? mapStaffReservationStatus(
    activeTarget === "document"
      ? detail.document.review_status
      : activeTarget === "payment"
        ? detail.payment.review_status
        : detail.cancellation.review_status,
  ) : { label: "Memuat", tone: "neutral" as const };
  const documentFile = detail?.document.signed_approval_letter ?? null;
  const paymentFile = detail?.payment.receipt ?? null;

  return (
    <StaffShell active="reservations">
      <main className="mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
        <a
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0f9d58] no-underline max-md:mb-6"
          href="/staff/reservations"
        >
          ← Kembali ke Daftar Reservasi
        </a>
        {detailQuery.isLoading ? (
          <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 text-sm font-semibold text-[#6b7280]">
            Memuat detail reservasi...
          </section>
        ) : null}
        {detailQuery.isError ? (
          <section className="rounded-xl border border-[#fee2e2] bg-[#fef2f2] p-8">
            <h1 className="m-0 text-xl font-bold text-[#991b1b]">
              Reservasi tidak ditemukan atau tidak dapat diakses.
            </h1>
            <p className="m-0 mt-2 text-sm text-[#991b1b]">
              Pastikan reservasi berada di fasilitas yang ditugaskan kepada akun staff ini.
            </p>
          </section>
        ) : null}
        {detail ? (
        <div className="flex items-start gap-8 max-lg:flex-col">
          <div className="grid min-w-0 flex-1 gap-6">
            <DetailCard title="Informasi Pemohon">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#064e3b] text-2xl font-bold text-white">
                  {initials(detail.student.full_name)}
                </div>
                <div className="min-w-0">
                  <h1 className="m-0 break-words text-lg font-bold text-[#111827]">
                    {detail.student.full_name}
                  </h1>
                  <p className="m-0 mt-1 break-words text-sm text-[#6b7280]">
                    {detail.organization_unit.name} • {detail.student.id}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                <InfoItem label="Kode Reservasi" value={detail.reservation_code} />
                <InfoItem label="Nomor Kontak" value={detail.contact_phone || "-"} />
                <InfoItem label="Email Kampus" value={detail.student.email} />
                <InfoItem label="Organisasi" value={detail.organization_unit.name} />
              </div>
            </DetailCard>

            <DetailCard title="Detail Reservasi">
              <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                <InfoItem label="Nama Kegiatan" value={detail.activity_title} />
                <InfoItem label="Estimasi Peserta" value={`${detail.participant_count} orang`} />
                <InfoItem label="Deskripsi Kegiatan" value={detail.event_description} wide />
                <InfoItem label="Kebutuhan Tambahan" value={extraRequirementSummary(detail.extra_requirements)} wide />
              </div>
            </DetailCard>

            <DetailCard title="Verifikasi Dokumen">
              <div className="grid gap-4">
                {documentFile && detail.review_actions.document.download_url ? (
                  <DocumentRow
                    file={documentFile}
                    onDownload={() => void apiDownload(detail.review_actions.document.download_url as string)}
                    status={mapStaffReservationStatus(detail.document.review_status).label}
                  />
                ) : (
                  <p className="m-0 text-sm font-semibold text-[#6b7280]">
                    Dokumen bertanda tangan belum tersedia.
                  </p>
                )}
                {paymentFile && detail.review_actions.payment.download_url ? (
                  <DocumentRow
                    file={paymentFile}
                    onDownload={() => void apiDownload(detail.review_actions.payment.download_url as string)}
                    status={mapStaffReservationStatus(detail.payment.review_status).label}
                  />
                ) : null}
              </div>
            </DetailCard>
          </div>

          <aside className="grid w-[380px] shrink-0 gap-6 max-lg:w-full">
            <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
              <SummaryImage />
              <div className="p-6">
                <h2 className="m-0 text-xl font-bold text-[#111827]">{detail.facility.name}</h2>
                <p className="m-0 mt-4 flex items-center gap-3 text-sm font-semibold text-[#111827]">
                  <CalendarDays aria-hidden="true" className="text-[#0f9d58]" size={18} />
                  {formatStaffDate(detail.starts_at)}
                </p>
                <p className="m-0 mt-3 flex items-center gap-3 text-sm font-semibold text-[#111827]">
                  <Clock aria-hidden="true" className="text-[#0f9d58]" size={18} />
                  {formatTimeRange(detail.starts_at, detail.ends_at)}
                </p>
                <div className="mt-6 border-t border-[#e5e7eb] pt-5">
                  <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                    Status Saat Ini
                  </p>
                  <StaffDetailStatus label={status.label} />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
              <h2 className="m-0 text-base font-bold text-[#111827]">Aksi Administrator</h2>
              <p className="m-0 mt-2 text-sm leading-6 text-[#6b7280]">
                {canReviewActiveTarget
                  ? `Tinjau tahap ${activeLabel.toLowerCase()} dan kirim keputusan berdasarkan data backend.`
                  : "Tidak ada tahap review yang membutuhkan keputusan saat ini."}
              </p>
              {actionError ? (
                <p className="mt-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm font-semibold text-[#991b1b]">
                  {actionError}
                </p>
              ) : null}
              {canReviewActiveTarget ? (
              <div className="mt-4 grid gap-3">
                <button
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(detail.review_actions[activeTarget].approve_url)}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0f9d58] px-4 text-sm font-bold text-white"
                  type="button"
                >
                  <Check aria-hidden="true" size={18} />
                  Setujui {activeLabel}
                </button>
                <a
                  className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#fee2e2] px-4 text-sm font-bold text-[#dc2626] no-underline"
                  href={`/staff/reservations/${detail.id}/review-decision?target=${activeTarget}`}
                >
                  <X aria-hidden="true" size={18} />
                  Tolak Pengajuan
                </a>
              </div>
              ) : null}
            </section>
          </aside>
        </div>
        ) : null}
      </main>
    </StaffShell>
  );
}

function DecisionSummaryRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 border-t border-[#e5e7eb] py-2 first:border-t-0 max-md:flex-col max-md:gap-1">
      <span className="text-sm text-[#6b7280]">{label}</span>
      <span className="break-words text-right text-sm font-bold text-[#111827] max-md:text-left">
        {value}
      </span>
    </div>
  );
}

export function StaffReviewDecisionPage() {
  const { reservationId = staffReservationDetailFixture.detailHref.split("/").at(-2) ?? "" } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const detailQuery = useQuery({
    queryFn: () => fetchStaffReservationDetail(reservationId),
    queryKey: ["staff-reservation-detail", reservationId],
  });
  const detail = detailQuery.data;
  const queryTarget = searchParams.get("target");
  const requestedTarget: StaffReviewTarget | null =
    queryTarget === "payment" || queryTarget === "cancellation" || queryTarget === "document" ? queryTarget : null;
  const selectedTarget: StaffReviewTarget =
    detail && requestedTarget && hasPendingReview(detail, requestedTarget)
      ? requestedTarget
      : detail
        ? activeReviewTarget(detail)
        : "document";
  const selectedLabel = targetLabel(selectedTarget);
  const [reason, setReason] = useState<string>(staffDecisionDialogFixture.reason);
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const rejectMutation = useMutation({
    mutationFn: ({ rejectUrl, reason }: { rejectUrl: string; reason: string }) => postReviewAction(rejectUrl, { reason }),
    onError: (error) => setMutationError(errorMessage(error, "Keputusan belum dapat dikirim.")),
    onSuccess: async () => {
      setMutationError(null);
      await queryClient.invalidateQueries({ queryKey: ["staff-reservation-detail", reservationId] });
    },
  });

  function submitReject() {
    if (!detail) {
      return;
    }

    if (!reason.trim()) {
      setReasonError("Alasan penolakan wajib diisi.");
      return;
    }

    setReasonError(null);
    rejectMutation.mutate({
      reason: reason.trim(),
      rejectUrl: detail.review_actions[selectedTarget].reject_url,
    });
  }

  return (
    <StaffShell active="reservations">
      <main className="relative mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
        <section className="mb-7">
          <h1 className="m-0 text-[32px] font-bold leading-tight text-[#111827] max-md:text-[28px]">
            Dialog Keputusan Review
          </h1>
          <p className="m-0 mt-2 text-sm text-[#6b7280]">
            Referensi modal untuk approve, reject, dan konfirmasi aksi destruktif staff.
          </p>
        </section>

        <div className="grid grid-cols-[1fr_280px] gap-6 opacity-55 blur-[1px] max-md:hidden">
          <section className="min-h-[380px] rounded-xl border border-[#e5e7eb] bg-white p-7 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <h2 className="m-0 text-lg font-bold text-[#111827]">Detail Reservasi #RSV-2048</h2>
            <p className="m-0 mt-2 text-sm text-[#6b7280]">
              Dokumen surat persetujuan menunggu verifikasi staff fasilitas.
            </p>
            <div className="mt-6 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4">
              <DecisionSummaryRow label="Pemohon" value={detail?.student.full_name ?? "Memuat"} />
              <DecisionSummaryRow label="Fasilitas" value={detail?.facility.name ?? "Memuat"} />
              <DecisionSummaryRow label="Tanggal" value={detail ? formatStaffDate(detail.starts_at) : "Memuat"} />
              <DecisionSummaryRow
                label="Status"
                value={<span className="rounded-full bg-[#fef3c7] px-2.5 py-1 text-xs text-[#92400e]">Menunggu Verifikasi Dokumen</span>}
              />
            </div>
          </section>
          <aside className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <h2 className="m-0 text-lg font-bold text-[#111827]">Aksi Review</h2>
            <p className="m-0 mt-2 text-sm text-[#6b7280]">
              Staff dapat menyetujui atau menolak dokumen setelah memeriksa file.
            </p>
            <div className="mt-5 grid gap-3">
              <button className="rounded-lg bg-[#0f9d58] px-4 py-3 text-sm font-bold text-white" type="button">
                Setujui Dokumen
              </button>
              <button className="rounded-lg bg-[#fee2e2] px-4 py-3 text-sm font-bold text-[#dc2626]" type="button">
                Tolak Dokumen
              </button>
            </div>
          </aside>
        </div>

        <div className="fixed inset-x-0 bottom-0 top-[72px] z-[60] flex items-start justify-center bg-slate-900/40 px-5 py-16 max-md:static max-md:block max-md:bg-transparent max-md:p-0">
          <section
            aria-labelledby="decision-title"
            className="w-[620px] max-w-[calc(100vw-40px)] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:w-full max-md:max-w-full"
            role="dialog"
          >
            <div className="border-b border-[#e5e7eb] p-6 max-md:p-5">
              <div>
                <h2 className="m-0 text-lg font-bold text-[#111827]" id="decision-title">
                  Tolak {selectedLabel} Reservasi
                </h2>
                <p className="m-0 mt-1 text-sm text-[#6b7280]">
                  Isi alasan yang jelas sebelum menolak pengajuan.
                </p>
              </div>
            </div>
            <div className="p-6 max-md:p-5">
              <label className="grid gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                  Alasan penolakan
                </span>
                <textarea
                  aria-label="Alasan penolakan"
                  className="min-h-[118px] rounded-lg border border-[#e5e7eb] p-3 text-sm leading-6 text-[#111827]"
                  onChange={(event) => setReason(event.target.value)}
                  value={reason}
                />
              </label>
              {reasonError ? (
                <p className="m-0 mt-2 text-sm font-semibold text-[#dc2626]">{reasonError}</p>
              ) : null}
              {mutationError ? (
                <p className="m-0 mt-2 text-sm font-semibold text-[#dc2626]">{mutationError}</p>
              ) : null}
            </div>
            <div className="flex justify-end gap-3 border-t border-[#e5e7eb] bg-[#f9fafb] p-5 max-md:grid max-md:grid-cols-1">
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-bold text-[#111827] no-underline"
                href={`/staff/reservations/${reservationId}`}
              >
                Kembali
              </a>
              <button
                className="min-h-11 rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 text-sm font-bold text-[#dc2626]"
                disabled={rejectMutation.isPending || detailQuery.isLoading}
                onClick={submitReject}
                type="button"
              >
                Tolak {selectedLabel}
              </button>
            </div>
          </section>
        </div>
      </main>
    </StaffShell>
  );
}
