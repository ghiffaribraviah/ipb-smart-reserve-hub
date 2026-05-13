import { Bell, MapPin, Menu, Search } from "lucide-react";
import { useState } from "react";
import {
  studentReservationListFixture,
  type ReservationListItem,
  type ReservationTone,
} from "../../fixtures/studentReservationList";
import { studentHomeSession } from "../../fixtures/studentHome";

const navItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

const badgeClasses: Record<ReservationTone, string> = {
  approved: "bg-[#d1fae5] text-[#047857]",
  cancelled: "bg-[#f3f4f6] text-[#4b5563]",
  completed: "bg-[#e0f2fe] text-[#075985]",
  pending: "bg-[#fef3c7] text-[#92400e]",
  rejected: "bg-[#fee2e2] text-[#991b1b]",
  review: "bg-[#f3f4f6] text-[#4b5563]",
};

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
    <footer className="mt-20 flex justify-center border-t border-[#e5e7eb] bg-white py-[22px] max-md:mt-16">
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

function MediaPlaceholder() {
  return (
    <div className="relative flex h-full min-h-[180px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#d1fae5] via-[#e7fbd3] to-[#fef3c7] max-md:min-h-[174px]">
      <div className="absolute inset-x-5 top-5 h-1 rounded-full bg-[#9fd9b8]" />
      <div className="absolute inset-x-5 bottom-5 h-1 rounded-full bg-[#9fd9b8]" />
      <div className="absolute bottom-0 left-8 top-0 w-1 rounded-full bg-[#9fd9b8]" />
      <div className="absolute bottom-0 right-8 top-0 w-1 rounded-full bg-[#9fd9b8]" />
      <div className="relative text-center">
        <p className="m-0 font-serif text-[26px] font-bold leading-none text-[#1d7667]">
          IPB SRH
        </p>
        <p className="m-0 mt-2 text-[9px] text-[#374151]">Deterministic media fixture</p>
      </div>
    </div>
  );
}

function StatusBadge({ item }: { item: ReservationListItem }) {
  return (
    <span
      className={`inline-flex max-w-[220px] rounded-full px-4 py-2 text-center text-xs font-bold leading-tight ${badgeClasses[item.tone]}`}
    >
      {item.status}
    </span>
  );
}

function ReservationCard({ item }: { item: ReservationListItem }) {
  return (
    <article className="grid overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] md:grid-cols-[320px_1fr]">
      <MediaPlaceholder />
      <div className="grid min-w-0 gap-5 p-8 max-md:p-7 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <h2 className="m-0 break-words text-lg font-bold leading-tight text-[#111827]">
            {item.facility}
          </h2>
          <p className="m-0 mt-5 flex items-start gap-2 text-sm leading-6 text-[#6b7280] max-md:mt-4">
            <MapPin aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
            <span>{item.location}</span>
          </p>
          <div className="mt-7 grid max-w-[520px] grid-cols-2 gap-8 max-md:grid-cols-2 max-md:gap-6">
            <div>
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                Tanggal
              </p>
              <p className="m-0 mt-2 text-sm font-semibold text-[#111827]">{item.date}</p>
            </div>
            <div>
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                Waktu
              </p>
              <p className="m-0 mt-2 text-sm font-semibold text-[#111827]">{item.time}</p>
            </div>
          </div>
        </div>

        <div className="flex min-w-[210px] flex-col items-end justify-between gap-7 max-md:min-w-0 max-md:items-stretch">
          <div className="max-md:flex max-md:justify-end">
            <StatusBadge item={item} />
          </div>
          <div className="mt-auto grid w-full grid-cols-[1fr_auto] gap-4 max-md:mt-5 max-md:grid-cols-2">
            <a
              className="flex min-h-[44px] items-center justify-center rounded-lg bg-[#0f9d58] px-5 text-sm font-bold text-white no-underline"
              href={item.detailHref}
            >
              {item.primaryAction}
            </a>
            {item.secondaryAction && item.cancelHref ? (
              <a
                className={`flex min-h-[44px] items-center justify-center rounded-lg border px-5 text-sm font-bold no-underline ${
                  item.secondaryAction === "Ajukan Pembatalan"
                    ? "border-[#fbbf24] bg-[#fffbeb] text-[#92400e]"
                    : "border-[#e5e7eb] bg-white text-[#6b7280]"
                }`}
                href={item.cancelHref}
              >
                {item.secondaryAction}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function StudentReservationListPage() {
  const [view, setView] = useState<"history" | "ongoing">("ongoing");
  const reservations =
    view === "ongoing" ? studentReservationListFixture.ongoing : studentReservationListFixture.history;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <StudentHeader />
      <main className="mx-auto mt-[112px] w-[1200px] max-w-[95%] max-md:mt-[92px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
        <section className="max-w-[560px]">
          <h1 className="m-0 text-[32px] font-bold leading-tight max-md:text-[25px]">
            Reservasi Saya
          </h1>
          <p className="m-0 mt-4 text-sm leading-6 text-[#6b7280]">
            Pantau status reservasi aktif, buka detail, dan kelola pengajuan fasilitas kampus Anda.
          </p>
        </section>

        <div
          aria-label="Tampilan reservasi"
          className="mt-8 flex border-b border-[#d1d5db]"
          role="tablist"
        >
          <button
            aria-selected={view === "ongoing"}
            className={`flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-0 pr-8 text-sm font-bold max-md:pr-4 ${
              view === "ongoing"
                ? "border-[#0f9d58] text-[#0f9d58]"
                : "border-transparent text-[#6b7280]"
            }`}
            onClick={() => setView("ongoing")}
            role="tab"
            type="button"
          >
            Sedang Berlangsung
            <span className="rounded-full bg-[#dcfce7] px-2 py-1 text-xs text-[#0f9d58]">
              {studentReservationListFixture.ongoing.length}
            </span>
          </button>
          <button
            aria-selected={view === "history"}
            className={`min-h-11 whitespace-nowrap border-b-2 px-8 text-sm font-bold max-md:px-4 ${
              view === "history"
                ? "border-[#0f9d58] text-[#0f9d58]"
                : "border-transparent text-[#6b7280]"
            }`}
            onClick={() => setView("history")}
            role="tab"
            type="button"
          >
            Riwayat
          </button>
        </div>

        <div className="mt-8 grid gap-6">
          {reservations.map((item) => (
            <ReservationCard item={item} key={item.id} />
          ))}
        </div>
      </main>
      <StudentFooter />
    </div>
  );
}
