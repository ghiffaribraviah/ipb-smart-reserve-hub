import {
  Bell,
  Building2,
  CalendarDays,
  Home,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { drawerFixture } from "../../fixtures/layoutShells";
import { cn } from "../../utils/cn";

const drawerIcons = {
  building: Building2,
  calendar: CalendarDays,
  home: Home,
  settings: Settings,
};

export function MobileDrawerPreview() {
  return (
    <main className="relative mx-auto min-h-[844px] w-[390px] max-w-full overflow-hidden rounded-[28px] border border-[#e5e7eb] bg-[#f8fafc] shadow-[0_18px_50px_rgba(15,23,42,0.18)] max-[420px]:m-0 max-[420px]:w-full max-[420px]:rounded-none max-[420px]:border-0">
      <header className="flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4">
        <div className="flex items-center gap-3.5">
          <button aria-label="Buka navigasi" className="text-slate-500" type="button">
            <Menu aria-hidden="true" size={24} />
          </button>
          <div className="font-serif text-[22px] font-bold text-[#1d7667]">IPB SRH</div>
        </div>
        <div className="flex items-center gap-3.5">
          <button
            aria-label="Notifikasi"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fffbeb] text-slate-500"
            type="button"
          >
            <Bell aria-hidden="true" size={18} />
          </button>
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#0f9d58] text-[13px] font-bold text-white">
            NP
          </div>
        </div>
      </header>

      <section className="p-6 px-4">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <h1 className="m-0 mb-2 text-[26px] font-bold text-slate-950">Beranda</h1>
          <p className="m-0 text-sm leading-6 text-slate-500">
            Konten halaman tetap terlihat di belakang overlay saat drawer terbuka.
          </p>
        </div>
      </section>

      <div className="absolute inset-x-0 bottom-0 top-16 flex bg-slate-950/40">
        <aside
          aria-label="Navigasi mobile"
          className="flex w-[312px] max-w-[84%] flex-col bg-white px-[18px] py-4 shadow-[0_10px_30px_rgba(15,23,42,0.16)]"
        >
          <div className="mb-[18px] flex items-center gap-3 rounded-xl border border-[#e5e7eb] p-3.5">
            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#0f9d58] text-[13px] font-bold text-white">
              {drawerFixture.profile.initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-950">{drawerFixture.profile.name}</div>
              <div className="truncate text-xs text-slate-500">{drawerFixture.profile.email}</div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5" aria-label="Navigasi mobile">
            {drawerFixture.nav.map((item) => {
              const Icon = drawerIcons[item.icon];
              const isGreen = item.key === drawerFixture.activeGreen;
              const isSuper = item.key === drawerFixture.activeSuper;

              return (
                <a
                  className={cn(
                    "flex items-center gap-3 rounded-[10px] px-2.5 py-3 text-sm font-bold text-slate-500 no-underline",
                    isGreen && "bg-[#e8f5e9] text-[#0f9d58]",
                    isSuper && "bg-[#e8f5e9] text-[#0f9d58]",
                  )}
                  href={item.href}
                  key={item.key}
                >
                  <span className="flex w-6 justify-center">
                    <Icon aria-hidden="true" size={18} />
                  </span>
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[#e5e7eb] pt-4">
            <a
              className="flex items-center gap-3 rounded-[10px] px-2.5 py-3 text-sm font-bold text-[#dc2626] no-underline"
              href="/login"
            >
              <span className="flex w-6 justify-center">
                <LogOut aria-hidden="true" size={18} />
              </span>
              Keluar
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
