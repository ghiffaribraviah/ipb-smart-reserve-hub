import type { ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { cn } from "../../utils/cn";

function Card({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-5 border-t border-[#e5e7eb] py-3 text-sm first:border-t-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-right font-bold">{value}</span>
    </div>
  );
}

function DocRow({
  icon,
  name,
  meta,
  status,
  tone,
  action,
}: {
  action: string;
  icon: string;
  meta: string;
  name: string;
  status: string;
  tone: "success" | "warning" | "danger";
}) {
  const iconTone = {
    danger: "bg-[#fef2f2] text-[#991b1b]",
    success: "bg-[#ecfdf5] text-[#0f9d58]",
    warning: "bg-[#fffbeb] text-[#92400e]",
  };
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_142px] items-center gap-[18px] rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4 max-md:grid-cols-[auto_minmax(0,1fr)] max-md:items-start">
      <div
        className={cn(
          "flex h-[42px] w-[42px] items-center justify-center rounded-[10px] text-sm font-extrabold",
          iconTone[tone],
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="m-0 break-words text-sm font-bold">{name}</p>
        <p className="m-0 mt-1 text-xs text-slate-500">{meta}</p>
      </div>
      <div className="grid min-w-0 justify-items-end gap-2.5 border-l border-[#e5e7eb] pl-3.5 max-md:col-span-2 max-md:grid-cols-1 max-md:justify-items-stretch max-md:border-l-0 max-md:border-t max-md:pt-3">
        <StatusBadge label={status} tone={tone} />
        <button
          className={cn(
            "rounded-full border px-2.5 py-1.5 text-xs font-bold",
            tone === "danger"
              ? "border-[#fecaca] bg-[#fef2f2] text-[#dc2626]"
              : "border-[#bbf7d0] bg-[#f0fdf4] text-[#0f9d58]",
          )}
          type="button"
        >
          {action}
        </button>
      </div>
    </div>
  );
}

export function ReservationWorkflowComponentsPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <div className="mx-auto w-[1200px] max-w-[95%] py-12 pb-20 max-md:w-full max-md:max-w-full max-md:px-4 max-md:py-7 max-md:pb-14">
        <p className="mb-8 font-serif text-[34px] font-bold leading-none text-[#1d7667]">
          IPB SRH
        </p>
        <h1 className="mb-2 text-[32px] font-bold max-md:text-[28px]">
          Reservation Workflow Components
        </h1>
        <p className="m-0 text-sm leading-6 text-slate-500">
          Standalone reference for stepper, summary card, document/payment panels,
          upload panel, and status panel.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <Card title="Reservation Stepper">
            <div className="relative mt-2 grid grid-cols-3 text-center before:absolute before:left-[16.5%] before:right-[16.5%] before:top-[17px] before:h-0.5 before:bg-[#e5e7eb] after:absolute after:left-[16.5%] after:top-[17px] after:h-0.5 after:w-[33.5%] after:bg-[#0f9d58]">
              {[
                ["✓", "Pilih Waktu", "Selesai", "complete"],
                ["2", "Detail Reservasi", "Aktif", "active"],
                ["3", "Surat", "Berikutnya", "inactive"],
              ].map(([circle, title, state, status]) => (
                <div className="relative z-10 grid justify-items-center gap-1" key={title}>
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 font-bold",
                      status === "complete" && "border-[#d1fae5] bg-[#d1fae5] text-[#065f46]",
                      status === "active" &&
                        "border-[#0f9d58] bg-white text-[#0f9d58] shadow-[0_0_0_4px_#ecfdf5]",
                      status === "inactive" && "border-[#f3f4f6] bg-[#f3f4f6] text-slate-500",
                    )}
                  >
                    {circle}
                  </div>
                  <span className="text-sm font-bold max-md:text-xs">{title}</span>
                  <p className="m-0 text-xs text-slate-500 max-md:text-[11px]">{state}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Reservation Summary Card">
            <SummaryRow label="Fasilitas" value="Grand Auditorium" />
            <SummaryRow label="Tanggal" value="24 Oktober 2024" />
            <SummaryRow label="Waktu" value="09:00 - 13:00" />
            <SummaryRow label="Biaya" value="Rp750.000" />
            <SummaryRow label="Status" value={<StatusBadge label="Disetujui" tone="success" />} />
          </Card>

          <Card title="Document Status Panel">
            <div className="grid gap-3">
              <DocRow action="Lihat Dokumen" icon="PDF" meta="Diunggah 23 Oktober 2024 · 428 KB" name="surat-persetujuan-himalkom.pdf" status="Terverifikasi" tone="success" />
              <DocRow action="Lihat Bukti" icon="JPG" meta="Menunggu review staff fasilitas" name="bukti-pembayaran.jpg" status="Menunggu" tone="warning" />
              <DocRow action="Unggah Ulang" icon="!" meta="Tanda tangan pembina belum terlihat jelas." name="Dokumen perlu diperbaiki" status="Ditolak" tone="danger" />
            </div>
          </Card>

          <Card title="File Upload Panel">
            <div className="rounded-xl border border-dashed border-[#a7f3d0] bg-[#f8fffb] p-5 text-center">
              <strong>Unggah Surat Persetujuan</strong>
              <p className="m-0 mt-1 text-sm leading-6 text-slate-500">PDF/JPG/PNG maksimal 5 MB</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3.5 max-md:grid">
                <Button variant="secondary">Pilih File</Button>
                <Button variant="primary">Unggah</Button>
              </div>
            </div>
          </Card>

          <Card title="Payment Upload Panel">
            <div className="rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
              <span className="text-xs text-slate-500">Total pembayaran</span>
              <div className="my-1 text-[28px] font-bold text-[#065f46]">Rp750.000</div>
              <p className="m-0 text-sm leading-6 text-slate-500">
                Transfer ke rekening IPB Smart Reserve Hub dan unggah bukti pembayaran.
              </p>
              <Button className="mt-4" variant="primary">Kirim</Button>
            </div>
          </Card>

          <Card title="Reservation Status Panel">
            <div className="mx-auto max-w-[420px] text-center">
              <div className="mx-auto mb-3.5 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#ecfdf5] text-[28px] text-[#0f9d58]">
                ✓
              </div>
              <h3 className="m-0 mb-2 text-lg font-bold">Reservasi Disetujui</h3>
              <p className="m-0 text-sm leading-6 text-slate-500">
                Reservasi aktif. Simpan detail jadwal dan dokumen untuk kebutuhan registrasi kegiatan.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3.5 max-md:grid">
                <Button variant="primary">Lihat Detail</Button>
                <Button variant="warning">Ajukan Pembatalan</Button>
              </div>
            </div>
          </Card>

          <Card title="Workflow Action Colors">
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <Button variant="primary">Lanjutkan</Button>
              <Button variant="secondary">Kembali</Button>
              <Button variant="warning">Batalkan Reservasi</Button>
              <Button variant="danger">Keluar</Button>
              <Button variant="danger">Tolak Dokumen</Button>
              <Button variant="disabled" disabled>Memproses</Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
