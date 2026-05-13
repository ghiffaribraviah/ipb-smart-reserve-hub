import { Upload } from "lucide-react";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { uploadCalendarFixture } from "../../fixtures/sharedStates";
import { cn } from "../../utils/cn";

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const calendarDays = [
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 1 },
  { day: 2 },
  { day: 3 },
  { day: 4, dots: ["success"] },
  { day: 5 },
  { day: 6 },
  { day: 7 },
  { day: 8 },
  { day: 9 },
  { day: 10, dots: ["danger"] },
  { day: 11, dots: ["warning"] },
  { day: 12 },
  { day: 13 },
  { day: 14 },
  { day: 15 },
  { day: 16, dots: ["success", "success"] },
  { day: 17 },
  { day: 18 },
  { day: 19 },
  { day: 20 },
  { day: 21 },
  { day: 22 },
  { day: 23, dots: ["warning"] },
  { day: 24, selected: true, dots: ["success", "success", "warning"] },
  { day: 25 },
  { day: 26, dots: ["danger"] },
  { day: 27 },
  { day: 28 },
  { day: 29 },
  { day: 30 },
  { day: 31, dots: ["success"] },
  { day: 1, muted: true },
  { day: 2, muted: true },
] as const;

const dotColors = {
  danger: "bg-[#ef4444]",
  success: "bg-[#10b981]",
  warning: "bg-[#f59e0b]",
};

const compactBadge = {
  danger: "bg-[#fee2e2] text-[#991b1b]",
  info: "bg-[#eff6ff] text-[#1e40af]",
  success: "bg-[#d1fae5] text-[#065f46]",
  warning: "bg-[#fef3c7] text-[#92400e]",
};

function PageHeader() {
  return (
    <>
      <p className="mb-8 font-serif text-[32px] font-bold leading-none text-[#1d7667]">
        IPB SRH
      </p>
      <h1 className="mb-2 text-[32px] font-bold leading-tight text-slate-950 max-md:text-[28px]">
        Upload dan Calendar States
      </h1>
      <p className="m-0 text-sm leading-6 text-slate-500">
        Referensi upload progress, validasi file, retry, dan state kalender interaktif.
      </p>
    </>
  );
}

export function UploadCalendarStatesPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <div className="mx-auto w-[1200px] max-w-[95%] py-12 pb-20 max-md:w-full max-md:max-w-full max-md:px-4 max-md:py-7 max-md:pb-14">
        <PageHeader />
        <div className="mt-7 grid grid-cols-2 gap-7 max-md:grid-cols-1">
          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <h2 className="mb-4 text-lg font-bold">Upload Dokumen</h2>
            <div className="rounded-xl border border-dashed border-[#a7f3d0] bg-[#f8fffb] p-[22px] text-center">
              <Upload aria-hidden="true" className="mx-auto mb-2 text-[#0f9d58]" size={30} />
              <strong>surat-persetujuan-himalkom.pdf</strong>
              <p className="m-0 text-sm leading-6 text-slate-500">
                PDF · 3,2 MB · sedang diunggah
              </p>
              <div className="my-4 h-2.5 overflow-hidden rounded-full bg-[#e5e7eb]">
                <span className="block h-full w-[64%] bg-[#0f9d58]" />
              </div>
              <p className="m-0 text-sm text-slate-500">64% selesai</p>
            </div>

            <div className="mt-3.5 grid grid-cols-[1fr_auto] items-center gap-3 rounded-[10px] border border-[#e5e7eb] p-3.5">
              <div className="min-w-0">
                <strong className="break-words">bukti-pembayaran.jpg</strong>
                <p className="m-0 text-sm leading-6 text-slate-500">JPG · 1,4 MB · siap dikirim</p>
              </div>
              <StatusBadge label="Valid" tone="success" />
            </div>

            <div className="mt-3.5 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] p-3.5 text-[13px] leading-5 text-[#991b1b]">
              <strong>File ditolak.</strong> Format DOCX tidak didukung. Unggah PDF, JPG,
              JPEG, atau PNG.
            </div>
            <div className="mt-3.5 rounded-[10px] border border-[#fde68a] bg-[#fffbeb] p-3.5 text-[13px] leading-5 text-[#92400e]">
              <strong>Ukuran terlalu besar.</strong> Maksimal file adalah 5 MB. Kompres
              file lalu coba lagi.
            </div>
          </section>

          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <div className="mb-5 flex items-center justify-between gap-3 max-md:items-start">
              <div>
                <p className="m-0 mb-1 text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
                  Kalender Interaktif
                </p>
                <h2 className="m-0 text-lg font-bold">Oktober 2024</h2>
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Bulan sebelumnya"
                  className="h-8 w-8 rounded-md border border-[#e5e7eb] bg-white text-base font-bold text-slate-500"
                  type="button"
                >
                  &lt;
                </button>
                <button
                  aria-label="Bulan berikutnya"
                  className="h-8 w-8 rounded-md border border-[#e5e7eb] bg-white text-base font-bold text-slate-500"
                  type="button"
                >
                  &gt;
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 max-md:gap-1.5" aria-label="Kalender Oktober 2024">
              {dayNames.map((day) => (
                <div
                  className="pb-1 text-center text-[11px] font-bold uppercase text-slate-500 max-md:text-[10px]"
                  key={day}
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                <div
                  className={cn(
                    "flex aspect-square min-w-0 flex-col gap-1.5 rounded-lg border border-[#e5e7eb] bg-white p-2 max-md:rounded-md max-md:p-1.5",
                    "muted" in day && day.muted && "border-[#f3f4f6] bg-[#f9fafb]",
                    "selected" in day &&
                      day.selected &&
                      "border-[#0f9d58] shadow-[0_0_0_2px_rgba(15,157,88,0.14)]",
                  )}
                  key={`${day.day}-${index}`}
                >
                  <span
                    className={cn(
                      "text-[13px] font-bold leading-none text-slate-950 max-md:text-xs",
                      "muted" in day && day.muted && "text-slate-300",
                      "selected" in day &&
                        day.selected &&
                        "flex h-6 w-6 items-center justify-center rounded-md bg-[#0f9d58] text-white",
                    )}
                  >
                    {day.day}
                  </span>
                  {"dots" in day ? (
                    <div className="mt-auto flex flex-wrap gap-1">
                      {day.dots.map((dot, dotIndex) => (
                        <span
                          className={cn(
                            "h-[7px] w-[7px] rounded-full max-md:h-[5px] max-md:w-[5px]",
                            dotColors[dot],
                          )}
                          key={`${dot}-${dotIndex}`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-3.5 flex flex-wrap gap-2.5">
              <span className={cn("inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold", compactBadge.success)}>
                Reservasi disetujui
              </span>
              <span className={cn("inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold", compactBadge.warning)}>
                Menunggu review
              </span>
              <span className={cn("inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold", compactBadge.danger)}>
                Blokir/perawatan
              </span>
              <span className={cn("inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold", compactBadge.info)}>
                Tanggal dipilih
              </span>
            </div>

            <div className="mt-4 border-t border-[#e5e7eb] pt-3.5">
              <p className="m-0 mb-2.5 text-[13px] font-bold">
                Jadwal pada {uploadCalendarFixture.selectedDate}
              </p>
              {uploadCalendarFixture.agenda.map((item, index) => (
                <div
                  className="grid grid-cols-[82px_1fr_auto] items-start gap-2.5 border-t border-dashed border-[#e5e7eb] py-2.5 first:border-t-0 first:pt-0 max-md:grid-cols-1"
                  key={item.name}
                >
                  <span className="text-xs font-bold">{item.time}</span>
                  <div>
                    <p className="m-0 text-[13px] font-bold">{item.name}</p>
                    <p className="m-0 text-sm leading-6 text-slate-500">{item.organization}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-full px-2.5 py-1.5 text-xs font-bold",
                      index === 2 ? compactBadge.warning : compactBadge.success,
                    )}
                  >
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
