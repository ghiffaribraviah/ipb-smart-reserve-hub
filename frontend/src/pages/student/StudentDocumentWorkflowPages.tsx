import {
  AlertCircle,
  Check,
  Clock3,
  Download,
  FileText,
  Menu,
  Search,
  UploadCloud,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiError, apiDownload, apiRequest } from "../../api/http";
import { NotificationSurface } from "../../components/NotificationSurface";
import { studentDocumentWorkflowFixture } from "../../fixtures/studentDocumentWorkflow";
import { studentHomeSession } from "../../fixtures/studentHome";
import {
  mapStudentReservationWorkflow,
  type StudentReservationWorkflowProjection,
} from "../../reservations/studentReservationWorkflow";

const navItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

const summaryRows = [
  { label: "Fasilitas", value: studentDocumentWorkflowFixture.facilityName },
  { label: "Tanggal", value: studentDocumentWorkflowFixture.date },
  { label: "Waktu", value: studentDocumentWorkflowFixture.time },
] as const;

type ApprovalLetterResponse = {
  content_type: string;
  filename: string;
  generated_at: string;
  reservation_code: string;
  reservation_id: string;
  size_bytes: number;
};

type SignedApprovalLetterResponse = {
  content_type: string;
  filename: string;
  reservation_id: string;
  size_bytes: number;
  uploaded_at: string;
};

type PaymentResponse = {
  amount_rupiah: number;
  payment_instructions: string;
  reservation_code: string;
  reservation_id: string;
};

type PaymentReceiptResponse = {
  content_type: string;
  filename: string;
  reservation_id: string;
  size_bytes: number;
  uploaded_at: string;
};

const signedLetterTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);
const maxSignedLetterBytes = 5 * 1024 * 1024;
const paymentReceiptTypes = new Set(["image/jpeg", "image/jpg", "image/png"]);
const maxPaymentReceiptBytes = 5 * 1024 * 1024;

function reservationPath(reservationId: string) {
  return `/student/reservations/${reservationId}`;
}

function approvalLetterPath(reservationId: string) {
  return `/student/reservations/${reservationId}/approval-letter`;
}

async function fetchStudentReservation(reservationId: string) {
  return apiRequest<StudentReservationWorkflowProjection>(reservationPath(reservationId));
}

async function fetchApprovalLetter(reservationId: string) {
  return apiRequest<ApprovalLetterResponse>(approvalLetterPath(reservationId));
}

async function uploadSignedApprovalLetter({
  file,
  reservationId,
}: {
  file: File;
  reservationId: string;
}) {
  const body = new FormData();
  body.append("file", file);
  return apiRequest<SignedApprovalLetterResponse>(
    `/student/reservations/${reservationId}/signed-approval-letter`,
    { body, method: "POST" },
  );
}

async function fetchPayment(reservationId: string) {
  return apiRequest<PaymentResponse>(`/student/reservations/${reservationId}/payment`);
}

async function uploadPaymentReceipt({
  file,
  reservationId,
}: {
  file: File;
  reservationId: string;
}) {
  const body = new FormData();
  body.append("file", file);
  return apiRequest<PaymentReceiptResponse>(
    `/student/reservations/${reservationId}/payment-receipt`,
    { body, method: "POST" },
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  }
  return `${Math.round(value / 1024)} KB`;
}

function formatRupiah(value: number) {
  return `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)}`;
}

function contentTypeLabel(contentType: string) {
  if (contentType === "application/pdf") return "PDF";
  if (contentType === "image/png") return "PNG";
  if (contentType === "image/jpeg" || contentType === "image/jpg") return "JPG";
  return contentType;
}

function summaryRowsFromReservation(reservation: StudentReservationWorkflowProjection | undefined) {
  if (!reservation) return summaryRows;
  return [
    { label: "Fasilitas", value: reservation.facility.name },
    { label: "Tanggal", value: formatDate(reservation.starts_at) },
    { label: "Waktu", value: `${formatTime(reservation.starts_at)} - ${formatTime(reservation.ends_at)}` },
  ];
}

function paymentRowsFromReservation(
  reservation: StudentReservationWorkflowProjection | undefined,
  amount = reservation?.price_rupiah,
) {
  return [
    ...summaryRowsFromReservation(reservation),
    { label: "Total Pembayaran", value: formatRupiah(amount ?? 0) },
  ];
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
    <footer className="mt-10 flex justify-center border-t border-[#e5e7eb] bg-white py-[22px]">
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

function Stepper() {
  const steps = [
    { label: "Pilih Waktu", state: "Selesai" },
    { label: "Detail Reservasi", state: "Selesai" },
    { label: "Surat", state: "Aktif" },
  ] as const;

  return (
    <div className="mb-12 flex justify-center max-md:mb-7">
      <nav
        aria-label="Tahapan reservasi"
        className="relative grid w-[600px] max-w-full grid-cols-3 text-center before:absolute before:left-[16.5%] before:right-[16.5%] before:top-[17px] before:h-0.5 before:bg-[#e5e7eb] after:absolute after:left-[16.5%] after:top-[17px] after:h-0.5 after:w-[67%] after:bg-[#0f9d58] max-md:w-full"
      >
        {steps.map((step, index) => {
          const done = index < 2;
          return (
            <div className="relative z-10 grid justify-items-center gap-1.5" key={step.label}>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  done
                    ? "border-[#d1fae5] bg-[#d1fae5] text-[#065f46]"
                    : "border-[#0f9d58] bg-white text-[#0f9d58] shadow-[0_0_0_4px_#ecfdf5]"
                }`}
              >
                {done ? <Check aria-hidden="true" size={16} /> : index + 1}
              </div>
              <span className="text-sm font-bold leading-tight text-[#111827] max-md:text-xs">
                {step.label}
              </span>
              <span className="text-xs text-[#6b7280] max-md:text-[11px]">{step.state}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

function PageFrame({
  backHref = studentDocumentWorkflowFixture.backHref,
  children,
  showBack = true,
}: {
  backHref?: string;
  children: ReactNode;
  showBack?: boolean;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <StudentHeader />
      <main className="mx-auto mb-20 mt-[104px] w-[1200px] max-w-[95%] max-md:mb-10 max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
        {showBack ? (
          <a
            className="mb-8 inline-flex text-sm font-semibold text-[#0f9d58] no-underline"
            href={backHref}
          >
            ← Kembali
          </a>
        ) : (
          <div className="h-8" />
        )}
        <Stepper />
        {children}
      </main>
      <StudentFooter />
    </div>
  );
}

function FileRow({
  action,
  badge,
  fileName,
  metadata,
}: {
  action?: ReactNode;
  badge?: ReactNode;
  fileName: string;
  metadata: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4 max-md:flex-col max-md:items-start">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#ecfdf5] text-[#0f9d58]">
          <FileText aria-hidden="true" size={22} />
        </span>
        <div className="min-w-0">
          <p className="m-0 break-words text-sm font-bold text-[#111827]">{fileName}</p>
          <p className="m-0 mt-1 text-xs leading-5 text-[#6b7280]">{metadata}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 max-md:w-full max-md:border-t max-md:border-[#e5e7eb] max-md:pt-3">
        {badge}
        {action}
      </div>
    </div>
  );
}

function SummaryCard({
  action,
  rows = summaryRows,
  status,
}: {
  action?: ReactNode;
  rows?: readonly { label: string; value: string }[];
  status?: ReactNode;
}) {
  return (
    <aside className="rounded-xl bg-white p-7 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
      <h2 className="m-0 mb-6 text-xl font-bold">Rangkuman Reservasi</h2>
      <dl className="m-0 space-y-4">
        {rows.map((row) => (
          <div className="flex justify-between gap-6 text-sm max-md:flex-col max-md:gap-1" key={row.label}>
            <dt className="text-[#6b7280]">{row.label}</dt>
            <dd className="m-0 max-w-[58%] text-right font-bold text-[#111827] max-md:max-w-full max-md:text-left">
              {row.value}
            </dd>
          </div>
        ))}
        {status ? (
          <div className="flex justify-between gap-6 text-sm max-md:flex-col max-md:gap-2">
            <dt className="text-[#6b7280]">Status</dt>
            <dd className="m-0 flex justify-end max-md:justify-start">{status}</dd>
          </div>
        ) : null}
      </dl>
      {action ? <div className="mt-7 border-t border-[#e5e7eb] pt-6">{action}</div> : null}
    </aside>
  );
}

function StatusSummary({
  rows = summaryRows,
  status,
}: {
  rows?: readonly { label: string; value: string }[];
  status: ReactNode;
}) {
  return (
    <div>
      <h2 className="m-0 mb-6 text-xl font-bold">Rangkuman Reservasi</h2>
      <dl className="m-0 space-y-4">
        {rows.map((row) => (
          <div className="flex justify-between gap-6 text-sm max-md:flex-col max-md:items-center max-md:gap-1" key={row.label}>
            <dt className="text-[#6b7280]">{row.label}</dt>
            <dd className="m-0 font-bold text-[#111827]">{row.value}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-6 text-sm max-md:flex-col max-md:items-center max-md:gap-2">
          <dt className="text-[#6b7280]">Status</dt>
          <dd className="m-0">{status}</dd>
        </div>
      </dl>
    </div>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "approved" | "declined" | "valid" | "waiting";
  children: ReactNode;
}) {
  const classes = {
    approved: "bg-[#dcfce7] text-[#166534]",
    declined: "bg-[#fee2e2] text-[#991b1b]",
    valid: "bg-[#dcfce7] text-[#166534]",
    waiting: "bg-[#fef3c7] text-[#92400e]",
  };

  return (
    <span className={`inline-flex w-fit max-w-full rounded-full px-3 py-1.5 text-xs font-bold ${classes[tone]}`}>
      {children}
    </span>
  );
}

export function StudentApprovalLetterPage() {
  const { reservationId = studentDocumentWorkflowFixture.payment.code } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const reservationQuery = useQuery({
    queryFn: () => fetchStudentReservation(reservationId),
    queryKey: ["student-reservation", reservationId],
  });
  const approvalLetterQuery = useQuery({
    queryFn: () => fetchApprovalLetter(reservationId),
    queryKey: ["student-approval-letter", reservationId],
  });
  const rows = useMemo(
    () => summaryRowsFromReservation(reservationQuery.data),
    [reservationQuery.data],
  );
  const downloadMutation = useMutation({
    mutationFn: () => apiDownload(`/student/reservations/${reservationId}/approval-letter/download`),
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Surat belum dapat diunduh.";
      setDownloadMessage(message);
    },
    onSuccess: ({ filename }) => {
      setDownloadMessage(`${filename ?? approvalLetterQuery.data?.filename ?? "Surat persetujuan"} berhasil diunduh.`);
    },
  });
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadSignedApprovalLetter({ file, reservationId }),
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Dokumen belum dapat diunggah.";
      setUploadError(message);
    },
    onSuccess: (signedLetter) => {
      const current = reservationQuery.data;
      if (current) {
        queryClient.setQueryData<StudentReservationWorkflowProjection>(["student-reservation", reservationId], {
          ...current,
          document: {
            ...current.document,
            review_status: "waiting_review",
            signed_approval_letter: signedLetter,
          },
          status: "pending_document_review",
        });
      }
      navigate(`/student/reservations/${reservationId}/verification/waiting`);
    },
  });

  function validateFile(file: File) {
    if (!signedLetterTypes.has(file.type)) {
      return "Unggah surat bertanda tangan harus berupa PDF, JPG, JPEG, atau PNG.";
    }
    if (file.size > maxSignedLetterBytes) {
      return "Ukuran surat bertanda tangan maksimal 5 MB.";
    }
    return null;
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadError(null);
    if (!file) {
      setFileError(null);
      return;
    }
    setFileError(validateFile(file));
  }

  function handleUpload() {
    if (!selectedFile) {
      setFileError("Pilih surat bertanda tangan terlebih dahulu.");
      return;
    }
    const error = validateFile(selectedFile);
    setFileError(error);
    setUploadError(null);
    if (error) return;
    uploadMutation.mutate(selectedFile);
  }

  const approvalLetter = approvalLetterQuery.data;

  return (
    <PageFrame backHref={reservationPath(reservationId)}>
      <div className="grid grid-cols-[1fr_360px] items-start gap-8 max-lg:grid-cols-1">
        <div className="grid gap-6">
          <section className="rounded-xl bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
            <div className="mb-6 flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ecfdf5] text-[#0f9d58]">
                <Download aria-hidden="true" size={22} />
              </span>
              <div>
                <h1 className="m-0 text-2xl font-bold">Template Surat</h1>
                <p className="m-0 mt-2 max-w-[620px] text-sm leading-6 text-[#6b7280]">
                  Unduh template surat resmi, lengkapi data kegiatan, lalu unggah kembali dokumen
                  yang sudah ditandatangani.
                </p>
              </div>
            </div>
            <FileRow
              action={
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#0f9d58] px-4 text-sm font-bold text-[#0f9d58]"
                  disabled={downloadMutation.isPending || !approvalLetter}
                  onClick={() => downloadMutation.mutate()}
                  type="button"
                >
                  {downloadMutation.isPending ? "Mengunduh..." : "Unduh"}
                </button>
              }
              fileName={approvalLetter?.filename ?? "Memuat surat persetujuan..."}
              metadata={approvalLetter
                ? `${contentTypeLabel(approvalLetter.content_type)} · ${formatBytes(approvalLetter.size_bytes)}`
                : "Metadata surat belum tersedia"}
            />
            {downloadMessage ? (
              <p className="m-0 mt-3 text-sm font-semibold text-[#0f9d58]">{downloadMessage}</p>
            ) : null}
          </section>

          <section className="rounded-xl bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
            <h2 className="m-0 text-2xl font-bold">Unggah Dokumen</h2>
            <p className="m-0 mt-2 text-sm leading-6 text-[#6b7280]">
              Unggah surat permohonan yang sudah ditandatangani. Dokumen harus berformat PDF
              , JPG, JPEG, atau PNG dengan ukuran maksimal 5 MB.
            </p>
            <div className="mt-6 block rounded-xl border-2 border-dashed border-[#bbf7d0] bg-[#f8fafc] p-7 text-center">
              <UploadCloud aria-hidden="true" className="mx-auto text-[#0f9d58]" size={34} />
              <p className="m-0 mt-3 text-base font-bold">Unggah Surat Persetujuan</p>
              <p className="m-0 mt-1 text-sm text-[#6b7280]">PDF/JPG/JPEG/PNG maksimal 5 MB</p>
              <input
                id="signed-approval-letter-file"
                aria-label="Pilih file surat persetujuan"
                className="sr-only"
                onChange={handleFileChange}
                type="file"
              />
              <p className="m-0 mt-5 text-sm font-semibold text-[#374151]">
                {selectedFile ? selectedFile.name : "Belum ada file dipilih"}
              </p>
              <div className="mt-5 flex justify-center gap-3 max-md:flex-col">
                <label
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-5 text-sm font-bold text-[#374151]"
                  htmlFor="signed-approval-letter-file"
                >
                  Pilih File
                </label>
                <button
                  className="min-h-11 rounded-lg bg-[#0f9d58] px-5 text-sm font-bold text-white"
                  disabled={uploadMutation.isPending}
                  onClick={handleUpload}
                  type="button"
                >
                  {uploadMutation.isPending ? "Mengunggah..." : "Unggah"}
                </button>
              </div>
            </div>
            {fileError || uploadError ? (
              <p className="m-0 mt-3 text-sm font-semibold text-[#991b1b]">{fileError ?? uploadError}</p>
            ) : null}
            {selectedFile ? (
              <div className="mt-5">
                <FileRow
                  fileName={selectedFile.name}
                  metadata={`${contentTypeLabel(selectedFile.type)} · ${formatBytes(selectedFile.size)}`}
                />
              </div>
            ) : null}
          </section>
        </div>

        <SummaryCard
          action={
            <>
              <a
                className="flex min-h-[52px] items-center justify-center rounded-lg bg-[#0f9d58] px-5 text-base font-semibold text-white no-underline"
                href={`/student/reservations/${reservationId}/verification/waiting`}
              >
                Kirim
              </a>
              <p className="m-0 mt-4 text-center text-xs leading-5 text-[#6b7280]">
                Pastikan surat yang diunggah sudah ditandatangani.
              </p>
            </>
          }
          rows={rows}
        />
      </div>
    </PageFrame>
  );
}

function PaymentUploadPage() {
  const { reservationId = studentDocumentWorkflowFixture.payment.code } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const reservationQuery = useQuery({
    queryFn: () => fetchStudentReservation(reservationId),
    queryKey: ["student-reservation", reservationId],
  });
  const paymentQuery = useQuery({
    queryFn: () => fetchPayment(reservationId),
    queryKey: ["student-payment", reservationId],
  });
  const rows = useMemo(
    () => paymentRowsFromReservation(reservationQuery.data, paymentQuery.data?.amount_rupiah),
    [paymentQuery.data?.amount_rupiah, reservationQuery.data],
  );
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadPaymentReceipt({ file, reservationId }),
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Bukti pembayaran belum dapat diunggah.";
      setUploadError(message);
    },
    onSuccess: (receipt) => {
      const current = reservationQuery.data;
      if (current) {
        queryClient.setQueryData<StudentReservationWorkflowProjection>(["student-reservation", reservationId], {
          ...current,
          payment: {
            ...current.payment,
            receipt,
            review_status: "waiting_review",
          },
          status: "pending_payment",
        });
      }
      navigate(`/student/reservations/${reservationId}/payment/waiting`);
    },
  });
  const paymentError = paymentQuery.error instanceof ApiError
    ? paymentQuery.error.message
    : paymentQuery.isError
      ? "Instruksi pembayaran belum dapat dimuat."
      : null;

  function validateFile(file: File) {
    if (!paymentReceiptTypes.has(file.type)) {
      return "Bukti pembayaran harus berupa JPG, JPEG, atau PNG.";
    }
    if (file.size > maxPaymentReceiptBytes) {
      return "Ukuran bukti pembayaran maksimal 5 MB.";
    }
    return null;
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadError(null);
    if (!file) {
      setFileError(null);
      return;
    }
    setFileError(validateFile(file));
  }

  function handleUpload() {
    if (!selectedFile) {
      setFileError("Pilih bukti pembayaran terlebih dahulu.");
      return;
    }
    const error = validateFile(selectedFile);
    setFileError(error);
    setUploadError(null);
    if (error) return;
    uploadMutation.mutate(selectedFile);
  }

  return (
    <PageFrame backHref={reservationPath(reservationId)}>
      <div className="grid grid-cols-[1fr_360px] items-start gap-8 max-lg:grid-cols-1">
        <section className="rounded-xl bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
          <div className="mb-6 flex items-start gap-4 max-md:gap-3">
            <FileText aria-hidden="true" className="mt-1 shrink-0 text-[#0f9d58]" size={22} />
            <div>
              <h1 className="m-0 text-2xl font-bold leading-tight">Unggah Bukti Pembayaran</h1>
              <p className="m-0 mt-3 max-w-[620px] text-sm leading-6 text-[#6b7280]">
                Unggah bukti pembayaran reservasi. Dokumen harus berformat JPG, JPEG, atau PNG
                dengan ukuran maksimal 5 MB.
              </p>
            </div>
          </div>
          {paymentQuery.data ? (
            <div className="mb-6 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-5 text-sm leading-6 text-[#166534]">
              <strong className="block text-xs uppercase tracking-[0.06em] text-[#065f46]">
                Tujuan Transfer
              </strong>
              <p className="m-0 mt-2 whitespace-pre-line">{paymentQuery.data.payment_instructions}</p>
              <p className="m-0 mt-4 border-t border-[#bbf7d0] pt-4 text-sm">
                Total pembayaran: <strong className="text-[#065f46]">{formatRupiah(paymentQuery.data.amount_rupiah)}</strong>
              </p>
            </div>
          ) : null}
          {paymentError ? (
            <div className="mb-6 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-semibold text-[#991b1b]">
              {paymentError}
            </div>
          ) : null}

          <div className="block rounded-xl border border-dashed border-[#86efac] bg-[#f7fffb] p-8 text-center max-md:p-6">
            <strong className="block text-base">Unggah Bukti Pembayaran</strong>
            <p className="m-0 mt-2 text-sm text-[#6b7280]">JPG/JPEG/PNG maksimal 5 MB</p>
            <input
              id="payment-receipt-file"
              aria-label="Pilih file bukti pembayaran"
              className="sr-only"
              onChange={handleFileChange}
              type="file"
            />
            <p className="m-0 mt-5 text-sm font-semibold text-[#374151]">
              {selectedFile ? selectedFile.name : "Belum ada file dipilih"}
            </p>
            <div className="mt-6 flex justify-center gap-3 max-md:flex-col">
              <label
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-8 text-sm font-bold text-[#111827]"
                htmlFor="payment-receipt-file"
              >
                Pilih File
              </label>
              <button
                className="min-h-11 rounded-lg bg-[#0f9d58] px-8 text-sm font-bold text-white"
                disabled={uploadMutation.isPending || !paymentQuery.data}
                onClick={handleUpload}
                type="button"
              >
                {uploadMutation.isPending ? "Mengunggah..." : "Unggah"}
              </button>
            </div>
          </div>
          {fileError || uploadError ? (
            <p className="m-0 mt-3 text-sm font-semibold text-[#991b1b]">{fileError ?? uploadError}</p>
          ) : null}

          <div className="mt-5">
            {selectedFile ? (
              <FileRow
                fileName={selectedFile.name}
                metadata={`${contentTypeLabel(selectedFile.type)} · ${formatBytes(selectedFile.size)}`}
              />
            ) : null}
          </div>
        </section>

        <SummaryCard
          action={
            <>
              <a
                className="flex min-h-[52px] items-center justify-center rounded-lg bg-[#0f9d58] px-5 text-base font-semibold text-white no-underline"
                href={`/student/reservations/${reservationId}/payment/waiting`}
              >
                Kirim
              </a>
              <p className="m-0 mt-4 text-center text-xs leading-5 text-[#6b7280]">
                Pastikan bukti pembayaran terlihat jelas.
              </p>
            </>
          }
          rows={rows}
        />
      </div>
    </PageFrame>
  );
}

function PaymentStatusPage({
  kind,
}: {
  kind: "accepted" | "declined" | "waiting";
}) {
  const { reservationId = studentDocumentWorkflowFixture.payment.code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const reservationQuery = useQuery({
    queryFn: () => fetchStudentReservation(reservationId),
    queryKey: ["student-reservation", reservationId],
  });
  const reservation = reservationQuery.data;
  const reason = reservation?.payment.rejection_reason
    ?? reservation?.rejection?.reason
    ?? "Bukti pembayaran belum dapat diverifikasi.";
  const rows = useMemo(() => {
    if (kind === "accepted") {
      return [
        ...summaryRowsFromReservation(reservation),
        { label: "Kode Reservasi", value: reservation?.reservation_code ?? studentDocumentWorkflowFixture.payment.code },
      ];
    }
    return paymentRowsFromReservation(reservation);
  }, [kind, reservation]);

  useEffect(() => {
    if (!reservation) return;
    const canonicalHref = mapStudentReservationWorkflow(reservation).primaryHref;
    if (canonicalHref !== location.pathname) {
      navigate(canonicalHref, { replace: true });
    }
  }, [location.pathname, navigate, reservation]);

  const isWaiting = kind === "waiting";
  const isAccepted = kind === "accepted";
  const statusLabel = isAccepted
    ? "Disetujui"
    : isWaiting
      ? "Menunggu Verifikasi Pembayaran"
      : "Pembayaran Ditolak";
  const statusTone = isAccepted ? "approved" : isWaiting ? "waiting" : "declined";

  return (
    <PageFrame>
      <section className="mx-auto max-w-[560px] rounded-xl bg-white p-8 text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
        <StatusSummary
          rows={rows}
          status={<StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>}
        />
        <div className="mt-7 border-t border-[#e5e7eb] pt-7">
          <span
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              isAccepted
                ? "bg-[#dcfce7] text-[#0f9d58]"
                : isWaiting
                  ? "bg-[#fef3c7] text-[#92400e]"
                  : "bg-[#fee2e2] text-[#991b1b]"
            }`}
          >
            {isAccepted ? (
              <Check aria-hidden="true" size={28} />
            ) : isWaiting ? (
              <Check aria-hidden="true" size={28} />
            ) : (
              <AlertCircle aria-hidden="true" size={30} />
            )}
          </span>
          <h1 className="m-0 mt-5 text-2xl font-bold">
            {isAccepted
              ? "Reservasi Disetujui"
              : isWaiting
                ? "Menunggu Verifikasi Pembayaran"
                : "Bukti Pembayaran Ditolak"}
          </h1>
          <p className="mx-auto mb-0 mt-3 max-w-[390px] text-sm leading-6 text-[#6b7280]">
            {isAccepted
              ? "Fasilitas sudah terkonfirmasi untuk jadwal kegiatan Anda."
              : isWaiting
                ? "Tim fasilitas sedang meninjau bukti pembayaran yang Anda unggah."
                : reason}
          </p>
          {isAccepted ? (
            <a
              className="mt-7 flex min-h-[52px] items-center justify-center rounded-lg bg-[#0f9d58] px-5 text-sm font-bold text-white no-underline"
              href={studentDocumentWorkflowFixture.payment.detailHref}
            >
              Lihat Detail
            </a>
          ) : null}
          {!isWaiting && !isAccepted ? (
            <a
              className="mt-7 flex min-h-[48px] items-center justify-center rounded-lg bg-[#fee2e2] px-5 text-sm font-bold text-[#991b1b] no-underline"
              href={studentDocumentWorkflowFixture.payment.paymentHref}
            >
              Unggah Ulang
            </a>
          ) : null}
        </div>
      </section>
    </PageFrame>
  );
}

function DocumentStatusPage({
  kind,
}: {
  kind: "declined" | "waiting";
}) {
  const isWaiting = kind === "waiting";
  const { reservationId = studentDocumentWorkflowFixture.payment.code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const reservationQuery = useQuery({
    queryFn: () => fetchStudentReservation(reservationId),
    queryKey: ["student-reservation", reservationId],
  });
  const reservation = reservationQuery.data;
  const rows = useMemo(() => summaryRowsFromReservation(reservation), [reservation]);
  const reason = reservation?.document.rejection_reason
    ?? reservation?.rejection?.reason
    ?? studentDocumentWorkflowFixture.rejectionReason;

  useEffect(() => {
    if (!reservation) return;
    const canonicalHref = mapStudentReservationWorkflow(reservation).primaryHref;
    if (canonicalHref !== location.pathname) {
      navigate(canonicalHref, { replace: true });
    }
  }, [location.pathname, navigate, reservation]);

  return (
    <PageFrame showBack={false}>
      <section className="mx-auto max-w-[560px] rounded-xl bg-white p-8 text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
        <StatusSummary
          rows={rows}
          status={
            <StatusBadge tone={isWaiting ? "waiting" : "declined"}>
              {isWaiting ? "Menunggu Verifikasi Dokumen" : "Ditolak"}
            </StatusBadge>
          }
        />
        <div className="mt-7 border-t border-[#e5e7eb] pt-7">
          <span
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              isWaiting ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#fee2e2] text-[#991b1b]"
            }`}
          >
            {isWaiting ? <Clock3 aria-hidden="true" size={28} /> : <AlertCircle aria-hidden="true" size={30} />}
          </span>
          <h1 className="m-0 mt-5 text-2xl font-bold">
            {isWaiting ? "Menunggu Verifikasi Dokumen" : "Dokumen Perlu Diperbaiki"}
          </h1>
          <p className="mx-auto mb-0 mt-3 max-w-[390px] text-sm leading-6 text-[#6b7280]">
            {isWaiting
              ? "Tim fasilitas sedang meninjau surat permohonan yang Anda unggah."
              : "Reservasi belum dapat diterima karena dokumen perlu diperbaiki."}
          </p>
          {!isWaiting ? (
            <div className="mt-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-4 text-left text-sm leading-6 text-[#991b1b]">
              <strong className="block text-xs uppercase">Alasan Penolakan</strong>
              {reason}
            </div>
          ) : null}
          {!isWaiting ? (
            <a
              className="mt-7 flex min-h-[48px] items-center justify-center rounded-lg bg-[#fee2e2] px-5 text-sm font-bold text-[#991b1b] no-underline"
              href={studentDocumentWorkflowFixture.reservationsHref}
            >
              Kembali
            </a>
          ) : null}
        </div>
      </section>
    </PageFrame>
  );
}

export function StudentVerificationWaitingPage() {
  return <DocumentStatusPage kind="waiting" />;
}

export function StudentVerificationDeclinedPage() {
  return <DocumentStatusPage kind="declined" />;
}

export function StudentPaymentPage() {
  return <PaymentUploadPage />;
}

export function StudentPaymentWaitingPage() {
  return <PaymentStatusPage kind="waiting" />;
}

export function StudentPaymentDeclinedPage() {
  return <PaymentStatusPage kind="declined" />;
}

export function StudentReservationAcceptedPage() {
  return <PaymentStatusPage kind="accepted" />;
}
