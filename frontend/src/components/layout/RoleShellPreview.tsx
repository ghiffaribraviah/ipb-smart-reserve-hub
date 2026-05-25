import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import { cn } from "../../utils/cn";
import type { ShellFixture } from "../../fixtures/layoutShells";

const accentText = {
  green: "text-[#0f9d58] border-[#0f9d58]",
};

const avatarColor = {
  green: "bg-[#0f9d58]",
};

export function RoleShellPreview({ shell }: { shell: ShellFixture }) {
  const isStudent = shell.role === "student";

  return (
    <section className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] px-[22px] py-[18px]">
        <h2 className="text-base font-bold text-slate-950">{shell.title}</h2>
        <p className="m-0 text-sm text-slate-500">{shell.subtitle}</p>
      </div>

      {isStudent ? (
        <>
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
        </>
      ) : (
        <>
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
            </div>

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

          <aside
            aria-label={`Navigasi ${shell.role} utama`}
            className="group fixed left-0 top-[72px] z-40 hidden h-[calc(100vh-72px)] w-[78px] overflow-hidden border-r border-[#e5e7eb] bg-white/95 shadow-none backdrop-blur transition-[width,box-shadow] duration-200 hover:w-[244px] hover:shadow-[8px_0_28px_rgba(15,23,42,0.08)] max-md:hidden md:flex"
          >
            <div className="flex w-full flex-col px-3 py-4">
              <div className="mb-4 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af]">
                <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Menu admin
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="shrink-0 text-[#9ca3af] transition-transform duration-200 group-hover:rotate-180"
                  size={16}
                />
              </div>

              <nav aria-label={`${shell.role} utama`} className="flex flex-1 flex-col gap-1.5">
                {shell.nav.map((item) => (
                  <a
                    aria-current={item.key === shell.active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-[12px] px-3 py-3 text-sm font-bold text-slate-500 no-underline transition-colors hover:bg-[#f8fafc] hover:text-[#111827]",
                      item.key === shell.active && "bg-[#e8f5e9] text-[#0f9d58]",
                    )}
                    href={item.href}
                    key={item.key}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8fafc] transition-colors group-hover:bg-[#eef7f1]",
                        item.key === shell.active && "bg-white",
                      )}
                    >
                      {item.label.slice(0, 1)}
                    </span>
                    <span className="whitespace-nowrap opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                      {item.label}
                    </span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="bg-[#f8fafc] px-[22px] py-6 max-md:px-3.5 max-md:py-[18px] md:pl-[78px]">
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              {shell.contentLabels.map((label) => (
                <div
                  className="flex h-[94px] items-center justify-center rounded-[10px] border border-dashed border-[#e5e7eb] bg-white text-[13px] text-slate-500"
                  key={label}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
