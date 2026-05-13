import { CalendarDays, Check, Clock, X } from "lucide-react";
import type { ReactNode } from "react";
import {
  staffDecisionDialogFixture,
  staffReservationDetailFixture,
} from "../../fixtures/staffReservationDetail";
import { StaffShell } from "./StaffReservationOperationsPages";

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
  document,
}: {
  document: (typeof staffReservationDetailFixture.documents)[number];
}) {
  return (
    <article className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4 max-md:grid-cols-[44px_minmax(0,1fr)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ecfdf5] text-xs font-black text-[#0f9d58]">
        {document.type}
      </div>
      <div className="min-w-0">
        <h3 className="m-0 break-words text-sm font-bold text-[#111827]">{document.filename}</h3>
        <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">{document.meta}</p>
      </div>
      <div className="flex items-center gap-3 max-md:col-span-2 max-md:flex-wrap max-md:border-t max-md:border-[#e5e7eb] max-md:pt-3">
        <span className="rounded-full bg-[#fffbeb] px-2.5 py-1 text-xs font-bold text-[#b45309]">
          {document.status}
        </span>
        <button
          aria-label={`Unduh Dokumen ${document.filename}`}
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] font-bold text-[#0f9d58] max-md:flex-1"
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
  const fixture = staffReservationDetailFixture;

  return (
    <StaffShell active="reservations">
      <main className="mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
        <a
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0f9d58] no-underline max-md:mb-6"
          href="/staff/reservations"
        >
          ← Kembali ke Daftar Reservasi
        </a>
        <div className="flex items-start gap-8 max-lg:flex-col">
          <div className="grid min-w-0 flex-1 gap-6">
            <DetailCard title="Informasi Pemohon">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#064e3b] text-2xl font-bold text-white">
                  {fixture.applicant.initials}
                </div>
                <div className="min-w-0">
                  <h1 className="m-0 break-words text-lg font-bold text-[#111827]">
                    {fixture.applicant.name}
                  </h1>
                  <p className="m-0 mt-1 break-words text-sm text-[#6b7280]">
                    {fixture.applicant.role} • {fixture.applicant.id}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                <InfoItem label="Fakultas / Program Studi" value={fixture.applicant.facultyProgram} />
                <InfoItem label="Nomor Kontak" value={fixture.applicant.phone} />
                <InfoItem label="Email Kampus" value={fixture.applicant.email} />
                <InfoItem label="Organisasi" value={fixture.applicant.organization} />
              </div>
            </DetailCard>

            <DetailCard title="Detail Reservasi">
              <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                <InfoItem label="Nama Kegiatan" value={fixture.reservation.activity} />
                <InfoItem label="Estimasi Peserta" value={fixture.reservation.participants} />
                <InfoItem label="Deskripsi Kegiatan" value={fixture.reservation.description} wide />
                <InfoItem label="Kebutuhan Tambahan" value={fixture.reservation.extraNeeds} wide />
              </div>
            </DetailCard>

            <DetailCard title="Verifikasi Dokumen">
              <div className="grid gap-4">
                {fixture.documents.map((document) => (
                  <DocumentRow document={document} key={document.filename} />
                ))}
              </div>
            </DetailCard>
          </div>

          <aside className="grid w-[380px] shrink-0 gap-6 max-lg:w-full">
            <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
              <SummaryImage />
              <div className="p-6">
                <h2 className="m-0 text-xl font-bold text-[#111827]">{fixture.facility.name}</h2>
                <p className="m-0 mt-4 flex items-center gap-3 text-sm font-semibold text-[#111827]">
                  <CalendarDays aria-hidden="true" className="text-[#0f9d58]" size={18} />
                  {fixture.facility.date}
                </p>
                <p className="m-0 mt-3 flex items-center gap-3 text-sm font-semibold text-[#111827]">
                  <Clock aria-hidden="true" className="text-[#0f9d58]" size={18} />
                  {fixture.facility.duration}
                </p>
                <div className="mt-6 border-t border-[#e5e7eb] pt-5">
                  <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                    Status Saat Ini
                  </p>
                  <StaffDetailStatus label={fixture.facility.status} />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
              <h2 className="m-0 text-base font-bold text-[#111827]">Aksi Administrator</h2>
              <textarea
                aria-label="Catatan administrator"
                className="mt-4 min-h-24 w-full resize-y rounded-lg border border-[#e5e7eb] bg-white p-3 text-sm text-[#111827]"
                placeholder="Tambahkan catatan atau alasan penolakan jika diperlukan..."
              />
              <div className="mt-4 grid gap-3">
                <button
                  className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0f9d58] px-4 text-sm font-bold text-white"
                  type="button"
                >
                  <Check aria-hidden="true" size={18} />
                  Setujui Reservasi
                </button>
                <a
                  className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#fee2e2] px-4 text-sm font-bold text-[#dc2626] no-underline"
                  href={fixture.decisionHref}
                >
                  <X aria-hidden="true" size={18} />
                  Tolak Pengajuan
                </a>
              </div>
            </section>
          </aside>
        </div>
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
  const detail = staffReservationDetailFixture;
  const dialog = staffDecisionDialogFixture;

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
              <DecisionSummaryRow label="Pemohon" value="Nadia Paramita" />
              <DecisionSummaryRow label="Fasilitas" value={detail.facility.name} />
              <DecisionSummaryRow label="Tanggal" value="24 Oktober 2024" />
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
            <div className="flex justify-between gap-4 border-b border-[#e5e7eb] p-6 max-md:p-5">
              <div>
                <h2 className="m-0 text-lg font-bold text-[#111827]" id="decision-title">
                  Tolak Dokumen Reservasi
                </h2>
                <p className="m-0 mt-1 text-sm text-[#6b7280]">
                  Alasan penolakan akan ditampilkan kepada mahasiswa.
                </p>
              </div>
              <button
                aria-label="Tutup"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-xl"
                type="button"
              >
                ×
              </button>
            </div>
            <div className="p-6 max-md:p-5">
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <DecisionSummaryRow label="File" value={dialog.summary.file} />
                <DecisionSummaryRow label="Tahap" value={dialog.summary.stage} />
                <DecisionSummaryRow
                  label="Keputusan"
                  value={<span className="rounded-full bg-[#fef3c7] px-2.5 py-1 text-xs text-[#92400e]">{dialog.summary.decision}</span>}
                />
              </div>
              <label className="mt-4 grid gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                  Alasan penolakan
                </span>
                <textarea
                  className="min-h-[118px] rounded-lg border border-[#e5e7eb] p-3 text-sm leading-6 text-[#111827]"
                  defaultValue={dialog.reason}
                />
              </label>
              <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-[13px] leading-5 text-[#991b1b]">
                <strong>Surat:</strong> Menolak dokumen akan mengubah reservasi menjadi ditolak
                dan menghentikan alur pembayaran.
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#e5e7eb] bg-[#f9fafb] p-5 max-md:grid max-md:grid-cols-1">
              <button className="min-h-11 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-bold text-[#111827]" type="button">
                Kembali
              </button>
              <button className="min-h-11 rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 text-sm font-bold text-[#dc2626]" type="button">
                Tolak Dokumen
              </button>
            </div>
          </section>
        </div>
      </main>
    </StaffShell>
  );
}
