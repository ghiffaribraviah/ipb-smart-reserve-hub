import { Bell, Menu, Search } from "lucide-react";
import { cn } from "../../utils/cn";
import type { ShellFixture } from "../../fixtures/layoutShells";

const accentText = {
  green: "text-[#0f9d58] border-[#0f9d58]",
};

const avatarColor = {
  green: "bg-[#0f9d58]",
};

export function RoleShellPreview({ shell }: { shell: ShellFixture }) {
  return (
    <section className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] px-[22px] py-[18px]">
        <h2 className="text-base font-bold text-slate-950">{shell.title}</h2>
        <p className="m-0 text-sm text-slate-500">{shell.subtitle}</p>
      </div>

      <header className="flex h-[72px] items-center justify-between border-b border-[#e5e7eb] bg-white px-[22px] max-md:h-16 max-md:px-3.5">
        <div className="flex min-w-0 items-center gap-[22px] max-md:gap-3.5">
          <button
            aria-label={`Buka navigasi ${shell.role}`}
            className="hidden text-slate-500 max-md:inline-flex"
            type="button"
          >
            <Menu aria-hidden="true" size={24} />
          </button>
          <div className="font-serif text-2xl font-bold leading-none text-[#1d7667] max-md:whitespace-nowrap max-md:text-[22px]">
            <span className="hidden md:inline">
              IPB
              <br />
              SRH
            </span>
            <span className="md:hidden">IPB SRH</span>
          </div>
          {shell.search ? (
            <div className="relative flex h-10 min-w-[232px] items-center text-slate-500 max-md:hidden">
              <Search
                aria-hidden="true"
                className="absolute left-4 text-slate-400"
                size={18}
              />
              <span className="h-10 w-[250px] rounded-full border border-[#dbe2ea] bg-gradient-to-b from-white to-slate-50 py-2.5 pl-[42px] pr-4 text-[13px] font-medium leading-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(15,23,42,0.04)]">
                {shell.search}
              </span>
            </div>
          ) : null}
        </div>

        <nav aria-label={`${shell.role} utama`} className="flex items-center gap-10 max-md:hidden">
          {shell.nav.map((item) => (
            <a
              aria-current={item.key === shell.active ? "page" : undefined}
              className={cn(
                "border-b-2 border-transparent pb-1 text-sm font-bold text-slate-500 no-underline",
                item.key === shell.active && accentText[shell.accent],
              )}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-[22px] max-md:gap-3.5">
          <button
            aria-label={`Notifikasi ${shell.role}`}
            className="inline-flex text-slate-500"
            type="button"
          >
            <Bell aria-hidden="true" size={18} />
          </button>
          <a
            aria-label={`Profil ${shell.profile.name}`}
            className={cn(
              "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white no-underline",
              avatarColor[shell.accent],
            )}
            href={`/${shell.role}/profile`}
          >
            {shell.profile.initials}
          </a>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 bg-[#f8fafc] px-[22px] py-6 max-md:grid-cols-1 max-md:px-3.5 max-md:py-[18px]">
        {shell.contentLabels.map((label) => (
          <div
            className="flex h-[94px] items-center justify-center rounded-[10px] border border-dashed border-[#e5e7eb] bg-white text-[13px] text-slate-500"
            key={label}
          >
            {label}
          </div>
        ))}
      </div>

      <footer className="flex items-center justify-between gap-6 border-t border-[#e5e7eb] bg-white px-[22px] py-[22px] max-md:flex-col max-md:gap-3.5 max-md:text-center">
        <div className="flex min-w-0 items-center gap-4 max-md:flex-col max-md:gap-2">
          <p className="m-0 whitespace-nowrap font-serif text-[30px] font-bold leading-none text-[#4da38b]">
            IPB SRH
          </p>
          <p className="m-0 text-[13px] leading-5 text-slate-500">
            © 2026 IPB Smart Reserve Hub. Hak cipta dilindungi.
          </p>
        </div>
        <nav
          aria-label={`${shell.role} footer`}
          className="flex flex-wrap justify-end gap-x-[18px] gap-y-2.5 text-sm font-semibold text-slate-500 max-md:justify-center"
        >
          {shell.nav.map((item) => (
            <a className="whitespace-nowrap no-underline" href={item.href} key={item.key}>
              {item.label}
            </a>
          ))}
        </nav>
      </footer>
    </section>
  );
}
