import { AlertTriangle, CalendarDays, Clock3, Search, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { dataStateFixture } from "../../fixtures/sharedStates";
import { cn } from "../../utils/cn";

const deadlineStyles = {
  danger: {
    icon: XCircle,
    row: "border-[#fecaca] bg-[#fef2f2] before:bg-[#dc2626]",
    iconBox: "bg-[#fee2e2] text-[#991b1b]",
    badge: "bg-[#fee2e2] text-[#991b1b]",
  },
  neutral: {
    icon: Clock3,
    row: "border-[#e5e7eb] bg-[#f9fafb] before:bg-[#6b7280]",
    iconBox: "bg-[#f3f4f6] text-[#4b5563]",
    badge: "bg-[#f3f4f6] text-[#4b5563]",
  },
  warning: {
    icon: AlertTriangle,
    row: "border-[#fde68a] bg-[#fffbeb] before:bg-[#d97706]",
    iconBox: "bg-[#fef3c7] text-[#92400e]",
    badge: "bg-[#fef3c7] text-[#92400e]",
  },
};

function PageHeader() {
  return (
    <>
      <p className="mb-8 font-serif text-[32px] font-bold leading-none text-[#1d7667]">
        IPB SRH
      </p>
      <h1 className="mb-2 text-[32px] font-bold leading-tight text-slate-950 max-md:text-[28px]">
        Data dan Auth States
      </h1>
      <p className="m-0 text-sm leading-6 text-slate-500">
        Referensi loading, empty, error, expired session, unauthorized role, overdue
        verification, dan expired reservation.
      </p>
    </>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <article className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      {children}
    </article>
  );
}

export function DataAuthStatesPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <div className="mx-auto w-[1200px] max-w-[95%] py-12 pb-20 max-md:w-full max-md:max-w-full max-md:px-4 max-md:py-7 max-md:pb-14">
        <PageHeader />
        <section className="mt-7 grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <Card>
            <h2 className="mb-3.5 text-lg font-bold">Loading Data</h2>
            <div className="my-3 h-3.5 rounded-full bg-gradient-to-r from-[#f3f4f6] via-[#e5e7eb] to-[#f3f4f6]" />
            <div className="my-3 h-3.5 w-[56%] rounded-full bg-gradient-to-r from-[#f3f4f6] via-[#e5e7eb] to-[#f3f4f6]" />
            <div className="my-3 h-3.5 rounded-full bg-gradient-to-r from-[#f3f4f6] via-[#e5e7eb] to-[#f3f4f6]" />
            <div className="my-3 h-3.5 w-[56%] rounded-full bg-gradient-to-r from-[#f3f4f6] via-[#e5e7eb] to-[#f3f4f6]" />
          </Card>

          <Card>
            <div className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#e8f5e9] text-[#0f9d58]">
              <CalendarDays aria-hidden="true" size={22} />
            </div>
            <h2 className="mb-3.5 text-lg font-bold">Belum Ada Reservasi</h2>
            <p className="m-0 text-sm leading-6 text-slate-500">
              Reservasi yang Anda buat akan muncul di sini setelah pengajuan pertama terkirim.
            </p>
            <Button className="mt-4" variant="primary">
              Cari Fasilitas
            </Button>
          </Card>

          <Card>
            <h2 className="mb-3.5 text-lg font-bold">API Error Dengan Retry</h2>
            <div className="flex items-start gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-[#991b1b]">
              <strong>!</strong>
              <span>Data gagal dimuat. Periksa koneksi Anda lalu coba lagi.</span>
            </div>
            <Button className="mt-4">Coba Lagi</Button>
          </Card>

          <Card>
            <h2 className="mb-3.5 text-lg font-bold">Auth Recovery</h2>
            <div className="flex items-start gap-3 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-4 text-[#1e40af]">
              <strong>i</strong>
              <span>Sesi Anda berakhir. Masuk kembali untuk melanjutkan ke halaman sebelumnya.</span>
            </div>
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 text-[#92400e]">
              <strong>!</strong>
              <span>Akun Anda tidak memiliki akses ke halaman Super Admin.</span>
            </div>
            <Button className="mt-4" variant="primary">
              Masuk Kembali
            </Button>
          </Card>

          <Card>
            <h2 className="mb-3.5 text-lg font-bold">Status Deadline</h2>
            <div className="grid gap-3.5">
              {dataStateFixture.deadlineRows.map((row) => {
                const style = deadlineStyles[row.tone];
                const Icon = style.icon;
                return (
                  <div
                    className={cn(
                      "relative grid grid-cols-[44px_1fr_auto] items-center gap-3.5 overflow-hidden rounded-xl border p-4 pl-[18px] before:absolute before:inset-y-0 before:left-0 before:w-1 max-md:grid-cols-[44px_1fr] max-md:items-start",
                      style.row,
                    )}
                    key={row.title}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl",
                        style.iconBox,
                      )}
                    >
                      <Icon aria-hidden="true" size={21} />
                    </div>
                    <div>
                      <strong className="mb-0.5 block text-[15px]">{row.title}</strong>
                      <p className="m-0 text-sm leading-5 text-slate-500">{row.message}</p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-bold max-md:col-start-2 max-md:w-fit",
                        style.badge,
                      )}
                    >
                      {row.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#e8f5e9] text-[#0f9d58]">
              <Search aria-hidden="true" size={22} />
            </div>
            <h2 className="mb-3.5 text-lg font-bold">Pencarian Kosong</h2>
            <p className="m-0 text-sm leading-6 text-slate-500">
              Tidak ada fasilitas yang cocok dengan filter saat ini. Ubah kategori atau rentang tanggal.
            </p>
            <Button className="mt-4">Reset Filter</Button>
          </Card>
        </section>
      </div>
    </main>
  );
}
