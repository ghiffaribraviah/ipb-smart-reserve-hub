import {
  AlertCircle,
  Bell,
  Check,
  Clock3,
  Download,
  FileText,
  Menu,
  Search,
  UploadCloud,
} from "lucide-react";
import type { ReactNode } from "react";
import { studentDocumentWorkflowFixture } from "../../fixtures/studentDocumentWorkflow";
import { studentHomeSession } from "../../fixtures/studentHome";

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

const paymentSummaryRows = [
  ...summaryRows,
  { label: "Total Pembayaran", value: studentDocumentWorkflowFixture.payment.amount },
] as const;

const acceptedSummaryRows = [
  ...summaryRows,
  { label: "Kode Reservasi", value: studentDocumentWorkflowFixture.payment.code },
] as const;

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
          <button aria-label="Notifikasi" className="inline-flex text-slate-500" type="button">
            <Bell aria-hidden="true" size={18} />
          </button>
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
  children,
  showBack = true,
}: {
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
            href={studentDocumentWorkflowFixture.backHref}
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
  return (
    <PageFrame>
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
                  type="button"
                >
                  Unduh Template
                </button>
              }
              fileName={studentDocumentWorkflowFixture.template.fileName}
              metadata={studentDocumentWorkflowFixture.template.metadata}
            />
          </section>

          <section className="rounded-xl bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
            <h2 className="m-0 text-2xl font-bold">Unggah Dokumen</h2>
            <p className="m-0 mt-2 text-sm leading-6 text-[#6b7280]">
              Unggah surat permohonan yang sudah ditandatangani. Dokumen harus berformat PDF
              dengan ukuran maksimal 5 MB.
            </p>
            <div
              aria-label="Pilih file surat persetujuan"
              className="mt-6 rounded-xl border-2 border-dashed border-[#bbf7d0] bg-[#f8fafc] p-7 text-center"
            >
              <UploadCloud aria-hidden="true" className="mx-auto text-[#0f9d58]" size={34} />
              <p className="m-0 mt-3 text-base font-bold">Unggah Surat Persetujuan</p>
              <p className="m-0 mt-1 text-sm text-[#6b7280]">PDF maksimal 5 MB</p>
              <div className="mt-5 flex justify-center gap-3 max-md:flex-col">
                <button
                  className="min-h-11 rounded-lg border border-[#d1d5db] bg-white px-5 text-sm font-bold text-[#374151]"
                  type="button"
                >
                  Pilih File
                </button>
                <button
                  className="min-h-11 rounded-lg bg-[#0f9d58] px-5 text-sm font-bold text-white"
                  type="button"
                >
                  Unggah Dokumen
                </button>
              </div>
            </div>
            <div className="mt-5">
              <FileRow
                badge={<StatusBadge tone="valid">{studentDocumentWorkflowFixture.selectedFile.status}</StatusBadge>}
                fileName={studentDocumentWorkflowFixture.selectedFile.fileName}
                metadata={studentDocumentWorkflowFixture.selectedFile.metadata}
              />
            </div>
          </section>
        </div>

        <SummaryCard
          action={
            <>
              <a
                className="flex min-h-[52px] items-center justify-center rounded-lg bg-[#0f9d58] px-5 text-base font-semibold text-white no-underline"
                href={studentDocumentWorkflowFixture.waitingHref}
              >
                Kirim Reservasi
              </a>
              <p className="m-0 mt-4 text-center text-xs leading-5 text-[#6b7280]">
                Pastikan surat yang diunggah sudah ditandatangani.
              </p>
            </>
          }
        />
      </div>
    </PageFrame>
  );
}

function PaymentUploadPage() {
  return (
    <PageFrame>
      <div className="grid grid-cols-[1fr_360px] items-start gap-8 max-lg:grid-cols-1">
        <section className="rounded-xl bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
          <div className="mb-6 flex items-start gap-4 max-md:gap-3">
            <FileText aria-hidden="true" className="mt-1 shrink-0 text-[#0f9d58]" size={22} />
            <div>
              <h1 className="m-0 text-2xl font-bold leading-tight">Unggah Bukti Pembayaran</h1>
              <p className="m-0 mt-3 max-w-[620px] text-sm leading-6 text-[#6b7280]">
                Unggah bukti pembayaran reservasi. Dokumen harus berformat PDF, JPG, atau PNG
                dengan ukuran maksimal 5 MB.
              </p>
            </div>
          </div>

          <div
            aria-label="Pilih file bukti pembayaran"
            className="rounded-xl border border-dashed border-[#86efac] bg-[#f7fffb] p-8 text-center max-md:p-6"
          >
            <strong className="block text-base">Unggah Bukti Pembayaran</strong>
            <p className="m-0 mt-2 text-sm text-[#6b7280]">PDF/JPG/PNG maksimal 5 MB</p>
            <div className="mt-6 flex justify-center gap-3 max-md:flex-col">
              <button
                className="min-h-11 rounded-lg border border-[#d1d5db] bg-white px-8 text-sm font-bold text-[#111827]"
                type="button"
              >
                Pilih File
              </button>
              <button
                className="min-h-11 rounded-lg bg-[#0f9d58] px-8 text-sm font-bold text-white"
                type="button"
              >
                Unggah Bukti
              </button>
            </div>
          </div>

          <div className="mt-5">
            <FileRow
              badge={<StatusBadge tone="valid">Valid</StatusBadge>}
              fileName={studentDocumentWorkflowFixture.payment.receiptFileName}
              metadata={studentDocumentWorkflowFixture.payment.receiptMetadata}
            />
          </div>
        </section>

        <SummaryCard
          action={
            <>
              <a
                className="flex min-h-[52px] items-center justify-center rounded-lg bg-[#0f9d58] px-5 text-base font-semibold text-white no-underline"
                href={studentDocumentWorkflowFixture.payment.waitingHref}
              >
                Unggah Bukti
              </a>
              <p className="m-0 mt-4 text-center text-xs leading-5 text-[#6b7280]">
                Pastikan bukti pembayaran terlihat jelas.
              </p>
            </>
          }
          rows={paymentSummaryRows}
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
  const isWaiting = kind === "waiting";
  const isAccepted = kind === "accepted";
  const rows = isAccepted ? acceptedSummaryRows : paymentSummaryRows;
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
                : "Bukti pembayaran belum dapat diverifikasi. Unggah ulang bukti pembayaran yang lebih jelas."}
          </p>
          {isAccepted ? (
            <a
              className="mt-7 flex min-h-[52px] items-center justify-center rounded-lg bg-[#0f9d58] px-5 text-sm font-bold text-white no-underline"
              href={studentDocumentWorkflowFixture.payment.detailHref}
            >
              Lihat Detail Reservasi
            </a>
          ) : null}
          {!isWaiting && !isAccepted ? (
            <a
              className="mt-7 flex min-h-[48px] items-center justify-center rounded-lg bg-[#fee2e2] px-5 text-sm font-bold text-[#991b1b] no-underline"
              href={studentDocumentWorkflowFixture.payment.paymentHref}
            >
              Unggah Ulang Bukti Pembayaran
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
  return (
    <PageFrame showBack={false}>
      <section className="mx-auto max-w-[560px] rounded-xl bg-white p-8 text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
        <StatusSummary
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
              {studentDocumentWorkflowFixture.rejectionReason}
            </div>
          ) : null}
          {!isWaiting ? (
            <a
              className="mt-7 flex min-h-[48px] items-center justify-center rounded-lg bg-[#fee2e2] px-5 text-sm font-bold text-[#991b1b] no-underline"
              href={studentDocumentWorkflowFixture.reservationsHref}
            >
              Kembali ke Daftar Reservasi
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
