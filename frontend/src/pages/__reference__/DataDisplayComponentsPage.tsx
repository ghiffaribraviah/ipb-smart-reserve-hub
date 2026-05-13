import { Building2, Monitor, School, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";

function Card({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function DataDisplayComponentsPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <div className="mx-auto w-[1200px] max-w-[95%] py-12 pb-20 max-md:w-full max-md:max-w-full max-md:px-4 max-md:py-7 max-md:pb-14">
        <p className="mb-8 font-serif text-[34px] font-bold leading-none text-[#1d7667]">
          IPB SRH
        </p>
        <h1 className="mb-2 text-[32px] font-bold max-md:text-[28px]">
          Data Display Components
        </h1>
        <p className="m-0 text-sm leading-6 text-slate-500">
          Standalone reference for facility cards, filters, mobile-card-list/table
          conversion, KPI cards, activity log, profile identity, and governance rows.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <Card title="Facility Card">
            <div className="grid grid-cols-[150px_1fr] gap-4 max-md:grid-cols-1">
              <div className="flex h-28 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#d1fae5] to-[#fef3c7] font-bold text-[#1d7667]">
                IPB SRH
              </div>
              <div>
                <strong>Grand Auditorium</strong>
                <p className="m-0 mt-1 text-sm leading-6 text-slate-500">
                  Kampus Dramaga · Kapasitas 800 · ★ 4,8
                </p>
                <Button className="mt-3" variant="primary">Lihat Detail</Button>
              </div>
            </div>
          </Card>

          <Card title="Category Shortcut">
            <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
              {[
                [Building2, "Aula", "18 fasilitas"],
                [Monitor, "Lab", "24 fasilitas"],
                [School, "Kelas", "36 fasilitas"],
              ].map(([Icon, label, count]) => (
                <div
                  className="rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] p-3.5 text-center"
                  key={String(label)}
                >
                  <Icon aria-hidden="true" className="mx-auto mb-1" size={18} />
                  <strong>{String(label)}</strong>
                  <p className="m-0 text-sm leading-6 text-slate-500">{String(count)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Facility Filter Bar">
            <div className="grid grid-cols-3 gap-2.5 max-md:grid-cols-1">
              <div className="min-h-11 rounded-lg border border-[#e5e7eb] bg-white p-2.5 text-slate-500">
                Cari fasilitas
              </div>
              <div className="min-h-11 rounded-lg border border-[#e5e7eb] bg-white p-2.5 text-slate-500">
                Kategori
              </div>
              <div className="min-h-11 rounded-lg border border-[#e5e7eb] bg-white p-2.5 text-slate-500">
                Urutkan
              </div>
            </div>
          </Card>

          <Card title="Staff / Mobile Card List">
            <table className="w-full border-collapse text-left max-md:block">
              <thead className="max-md:hidden">
                <tr>
                  <th className="bg-[#f9fafb] p-2.5 text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">Reservasi</th>
                  <th className="bg-[#f9fafb] p-2.5 text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">Fasilitas</th>
                  <th className="bg-[#f9fafb] p-2.5 text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="max-md:block">
                {[
                  ["#RSV-2048", "Nadia Paramita", "Grand Auditorium", "Menunggu", "warning"],
                  ["#RSV-2049", "Dimas Pratama", "Ruang Seminar", "Disetujui", "success"],
                ].map(([code, name, facility, status, tone]) => (
                  <tr className="max-md:mb-3 max-md:block max-md:rounded-[10px] max-md:border max-md:border-[#e5e7eb] max-md:p-3" key={code}>
                    <td className="border-t border-[#e5e7eb] p-3 text-[13px] max-md:block max-md:border-0 max-md:p-0 max-md:pb-2">
                      <span className="hidden text-[10px] font-bold uppercase text-slate-500 max-md:block">Reservasi</span>
                      <strong>{code}</strong>
                      <p className="m-0 text-sm leading-6 text-slate-500">{name}</p>
                    </td>
                    <td className="border-t border-[#e5e7eb] p-3 text-[13px] max-md:block max-md:border-0 max-md:p-0 max-md:pb-2">
                      <span className="hidden text-[10px] font-bold uppercase text-slate-500 max-md:block">Fasilitas</span>
                      {facility}
                    </td>
                    <td className="border-t border-[#e5e7eb] p-3 text-[13px] max-md:block max-md:border-0 max-md:p-0">
                      <span className="hidden text-[10px] font-bold uppercase text-slate-500 max-md:block">Status</span>
                      <StatusBadge label={status} tone={tone === "warning" ? "warning" : "success"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Super KPI Cards">
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <div className="rounded-[10px] border border-[#e5e7eb] p-4">
                <p className="m-0 text-sm text-slate-500">Total Pengguna</p>
                <div className="text-[26px] font-bold">12.450</div>
              </div>
              <div className="rounded-[10px] border border-[#e5e7eb] p-4">
                <p className="m-0 text-sm text-slate-500">Kesehatan Sistem</p>
                <div className="text-[26px] font-bold">99,9%</div>
              </div>
            </div>
          </Card>

          <Card title="Activity Log Item">
            {[
              ["Super Admin membuat akun staff baru.", "Hari ini, 09:42"],
              ["Detail fasilitas diperbarui.", "Kemarin, 16:20"],
            ].map(([text, time]) => (
              <div className="flex gap-3 border-t border-[#e5e7eb] py-3.5 first:border-t-0 first:pt-0" key={text}>
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#ede9fe] text-[#6366f1]">
                  <UserRound aria-hidden="true" size={18} />
                </div>
                <div>
                  <strong>{text}</strong>
                  <p className="m-0 text-sm leading-6 text-slate-500">{time}</p>
                </div>
              </div>
            ))}
          </Card>

          <Card title="Profile Identity Card">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0f9d58] text-[22px] font-bold text-white">NP</div>
              <div>
                <strong>Nadia Paramita</strong>
                <p className="m-0 text-sm leading-6 text-slate-500">nadia@apps.ipb.ac.id</p>
                <StatusBadge label="Aktif" tone="success" />
              </div>
            </div>
          </Card>

          <Card title="Super Governance Row">
            <table className="w-full border-collapse text-left">
              <tbody>
                <tr className="max-md:block max-md:rounded-[10px] max-md:border max-md:border-[#e5e7eb] max-md:p-3">
                  <td className="p-3 text-[13px] max-md:block max-md:p-0 max-md:pb-2">
                    <strong>Budi Santoso</strong>
                    <p className="m-0 text-sm leading-6 text-slate-500">budi.s@admin.ipb.ac.id</p>
                  </td>
                  <td className="p-3 text-[13px] max-md:block max-md:p-0 max-md:pb-2">Biosciences</td>
                  <td className="p-3 text-[13px] max-md:block max-md:p-0">
                    <StatusBadge label="Aktif" tone="success" />
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </main>
  );
}
