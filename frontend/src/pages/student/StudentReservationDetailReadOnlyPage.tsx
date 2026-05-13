import { Bell, Building2, CalendarDays, FileText, Info, MapPin, Menu, Search, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  studentReservationDetailBase,
  studentReservationDetailFixtures,
  type StudentReservationDetailFixture,
} from "../../fixtures/studentReservationDetail";
import { studentHomeSession } from "../../fixtures/studentHome";

const navItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

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

function MediaTile({ className = "" }: { className?: string }) {
  return (
    <div
      aria-label="Galeri Grand Auditorium"
      className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#d1fae5] via-[#e7fbd3] to-[#fef3c7] ${className}`}
      role="img"
    >
      <div className="absolute inset-[18px] rounded-[10px] border-[4px] border-[#9fd9b8]/75" />
      <div className="relative text-center">
        <p className="m-0 font-serif text-[26px] font-bold leading-none text-[#1d7667] md:text-[34px]">
          IPB SRH
        </p>
        <p className="m-0 mt-2 text-[9px] text-[#374151] md:text-xs">Deterministic media fixture</p>
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <div className="mt-8 grid h-[410px] grid-cols-[1fr_1fr] gap-3 max-md:h-auto max-md:grid-cols-1">
      <MediaTile className="h-full max-md:h-[186px] md:row-span-2" />
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        <MediaTile className="min-h-[195px] max-md:min-h-[186px]" />
        <MediaTile className="min-h-[195px] max-md:min-h-[186px]" />
      </div>
      <MediaTile className="min-h-[195px] max-md:hidden" />
    </div>
  );
}

function InfoCard({
  icon,
  label,
  title,
  value,
}: {
  icon: "building" | "calendar";
  label: string;
  title: string;
  value: string;
}) {
  const Icon = icon === "calendar" ? CalendarDays : Building2;
  return (
    <section className="flex min-w-0 gap-4 rounded-xl border border-[#e5e7eb] bg-white p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f5e9] text-[#0f9d58]">
        <Icon aria-hidden="true" size={20} />
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
          {label}
        </p>
        <h2 className="m-0 mt-2 break-words text-base font-bold">{title}</h2>
        <p className="m-0 mt-2 break-words text-sm leading-6 text-[#6b7280]">{value}</p>
      </div>
    </section>
  );
}

function DocumentRow({ document }: { document: StudentReservationDetailFixture["documents"][number] }) {
  return (
    <div className="grid grid-cols-[48px_1fr_auto] items-center gap-4 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4 max-md:grid-cols-[48px_1fr]">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#ecfdf5] text-xs font-bold text-[#0f9d58]">
        PDF
      </span>
      <div className="min-w-0">
        <p className="m-0 break-words text-sm font-bold">{document.fileName}</p>
        <p className="m-0 mt-1 break-words text-xs leading-5 text-[#6b7280]">{document.metadata}</p>
      </div>
      <div className="flex items-center gap-3 max-md:col-span-2 max-md:border-t max-md:border-[#e5e7eb] max-md:pt-3">
        <span className="rounded-full bg-[#dcfce7] px-3 py-1.5 text-xs font-bold text-[#047857]">
          Terverifikasi
        </span>
        <a
          className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-bold text-[#0f9d58] no-underline"
          href={document.href}
        >
          {document.actionLabel}
        </a>
      </div>
    </div>
  );
}

function DetailContent({ detail }: { detail: StudentReservationDetailFixture }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-7">
      <div className="flex items-center justify-between gap-5 max-md:items-start">
        <a className="text-sm font-bold text-[#0f9d58] no-underline" href="/student/reservations">
          ← Kembali
        </a>
        <a
          className={`flex min-h-[44px] items-center justify-center rounded-lg px-5 text-sm font-bold no-underline ${
            detail.action.tone === "primary"
              ? "bg-[#0f9d58] text-white"
              : "border border-[#fbbf24] bg-[#fffbeb] text-[#92400e]"
          }`}
          href={detail.action.href}
        >
          {detail.action.label}
        </a>
      </div>

      <h1 className="m-0 mt-9 text-[34px] font-bold leading-tight max-md:text-[30px]">
        {studentReservationDetailBase.facility}
      </h1>
      <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-[#6b7280]">
        <span className="flex items-center gap-1.5">
          <Star aria-hidden="true" className="fill-[#0f9d58] text-[#0f9d58]" size={16} />
          <strong className="text-[#111827]">{studentReservationDetailBase.rating}</strong> (
          {studentReservationDetailBase.reviews})
        </span>
        <span className="flex items-center gap-2">
          <MapPin aria-hidden="true" size={18} />
          {studentReservationDetailBase.location}
        </span>
      </div>

      <Gallery />

      <div className="mt-8 grid grid-cols-2 gap-6 max-md:grid-cols-1">
        <InfoCard
          icon="calendar"
          label="Jadwal"
          title={studentReservationDetailBase.date}
          value={studentReservationDetailBase.time}
        />
        <InfoCard
          icon="building"
          label="Departemen / Organisasi"
          title={studentReservationDetailBase.department}
          value={studentReservationDetailBase.faculty}
        />
      </div>

      <section className="mt-9">
        <h2 className="m-0 flex items-center gap-2 text-xl font-bold">
          <FileText aria-hidden="true" size={20} />
          Dokumen Reservasi
        </h2>
        <div className="mt-6 grid gap-3">
          {detail.documents.map((document) => (
            <DocumentRow document={document} key={document.fileName} />
          ))}
        </div>
      </section>

      <div className="mt-5 flex gap-3 rounded-xl border border-[#86efac] bg-[#ecfdf5] p-5 text-sm leading-6 text-[#065f46]">
        <Info aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
        <p className="m-0">{detail.notice}</p>
      </div>
    </div>
  );
}

export function StudentReservationDetailReadOnlyPage() {
  const { reservationId = "RSV-FIXTURE-001" } = useParams();
  const detail =
    studentReservationDetailFixtures[reservationId] ??
    studentReservationDetailFixtures["RSV-FIXTURE-001"];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <StudentHeader />
      <main className="mx-auto mt-[104px] w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
        <DetailContent detail={detail} />
      </main>
      <StudentFooter />
    </div>
  );
}
