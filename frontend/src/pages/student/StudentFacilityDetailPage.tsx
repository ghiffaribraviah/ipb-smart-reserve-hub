import { Bell, CalendarDays, MapPin, Menu, Search, Star } from "lucide-react";
import { studentFacilityDetail, type PublicCalendarEntry } from "../../fixtures/studentFacilityDetail";
import { studentHomeSession } from "../../fixtures/studentHome";

const navItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const calendarDays = [
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 1 },
  { day: 2 },
  { day: 3 },
  { day: 4, dots: ["approved"] },
  { day: 5 },
  { day: 6 },
  { day: 7 },
  { day: 8 },
  { day: 9 },
  { day: 10, dots: ["maintenance"] },
  { day: 11, dots: ["waiting"] },
  { day: 12 },
  { day: 13 },
  { day: 14 },
  { day: 15 },
  { day: 16, dots: ["approved", "approved"] },
  { day: 17 },
  { day: 18 },
  { day: 19 },
  { day: 20 },
  { day: 21 },
  { day: 22 },
  { day: 23, dots: ["waiting"] },
  { day: 24, selected: true, dots: ["approved", "approved", "maintenance"] },
  { day: 25 },
  { day: 26, dots: ["maintenance"] },
  { day: 27 },
  { day: 28 },
  { day: 29 },
  { day: 30 },
  { day: 31, dots: ["approved"] },
  { day: 1, muted: true },
  { day: 2, muted: true },
] as const;

const dotClass = {
  approved: "bg-[#10b981]",
  maintenance: "bg-[#ef4444]",
  waiting: "bg-[#f59e0b]",
};

const statusLabel: Record<PublicCalendarEntry["status"], string> = {
  approved: "Disetujui",
  maintenance: "Perawatan",
  waiting: "Menunggu",
};

const statusClass: Record<PublicCalendarEntry["status"], string> = {
  approved: "bg-[#d1fae5] text-[#065f46]",
  maintenance: "bg-[#fee2e2] text-[#991b1b]",
  waiting: "bg-[#fef3c7] text-[#92400e]",
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
              className="h-10 w-[250px] rounded-full border border-[#dbe2ea] bg-gradient-to-b from-white to-slate-50 py-2.5 pl-[42px] pr-4 text-[13px] font-medium leading-5 outline-none focus:border-[#10b981] focus:bg-white"
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
              aria-current={item.label === "Fasilitas" ? "page" : undefined}
              className={`border-b-2 pb-1 text-sm font-bold no-underline ${
                item.label === "Fasilitas"
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

function MediaBox({
  className,
  label,
  large = false,
}: {
  className: string;
  label: string;
  large?: boolean;
}) {
  return (
    <div
      aria-label={label}
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#d1fae5] via-[#e7fbd3] to-[#fef3c7] ${className}`}
      role="img"
    >
      <div className="absolute inset-[18px] rounded-[10px] border-[4px] border-[#9fd9b8]/75" />
      <div className="relative text-center">
        <p
          className={`m-0 font-serif font-bold leading-none text-[#1d7667] ${
            large ? "text-[38px] max-md:text-[22px]" : "text-[24px] max-md:text-[12px]"
          }`}
        >
          IPB SRH
        </p>
        <p
          className={`m-0 mt-2 text-[#374151] ${
            large ? "text-sm max-md:text-[9px]" : "text-[9px] max-md:text-[5px]"
          }`}
        >
          Deterministic media fixture
        </p>
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <section
      aria-label="Galeri Grand Auditorium"
      className="mb-12 grid grid-cols-[2fr_1fr_1fr] grid-rows-[200px_200px] gap-4 overflow-hidden rounded-2xl max-md:mb-6 max-md:grid-cols-3 max-md:grid-rows-[226px_76px] max-md:gap-2.5 max-md:overflow-visible"
    >
      <MediaBox
        className="col-start-1 row-span-2 row-start-1 max-md:col-span-3 max-md:row-span-1"
        label="Foto utama Grand Auditorium"
        large
      />
      <MediaBox className="col-start-2 row-start-1 max-md:col-start-1 max-md:row-start-2" label="Foto panggung Grand Auditorium" />
      <MediaBox className="col-start-3 row-start-1 max-md:col-start-2 max-md:row-start-2" label="Foto kursi Grand Auditorium" />
      <MediaBox
        className="col-span-2 col-start-2 row-start-2 max-md:col-span-1 max-md:col-start-3 max-md:row-start-2"
        label="Foto tirai Grand Auditorium"
        large
      />
    </section>
  );
}

function ReserveWidget() {
  return (
    <aside className="w-[380px] shrink-0 max-lg:order-first max-lg:w-full">
      <div className="sticky top-[112px] rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.01)] max-lg:static max-md:rounded-[14px] max-md:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="m-0 mb-2 text-xs text-[#6b7280]">Biaya peminjaman</p>
            <p className="m-0 text-2xl font-bold leading-tight text-[#111827] max-md:text-[22px]">
              {studentFacilityDetail.price}{" "}
              <span className="text-sm font-normal text-[#6b7280]">
                {studentFacilityDetail.priceUnit}
              </span>
            </p>
          </div>
          <span className="rounded-full bg-[#e8f5e9] px-3 py-1.5 text-xs font-semibold text-[#0b7340]">
            {studentFacilityDetail.availability}
          </span>
        </div>
        <div className="mb-8 flex flex-col gap-3 max-md:mb-6">
          {studentFacilityDetail.notes.map(({ icon: Icon, text }) => (
            <div className="flex items-center gap-3 text-xs text-[#6b7280]" key={text}>
              <Icon aria-hidden="true" className="text-[#0f9d58]" size={17} />
              <span>{text}</span>
            </div>
          ))}
        </div>
        <a
          className="flex w-full items-center justify-center rounded-lg bg-[#0f9d58] px-4 py-4 text-[15px] font-semibold text-white no-underline hover:bg-[#0b7340]"
          href={studentFacilityDetail.reserveHref}
        >
          Reservasi Sekarang
        </a>
      </div>
    </aside>
  );
}

function Reviews() {
  return (
    <section className="mt-10 border-t border-[#e5e7eb] pt-10 max-md:mt-9 max-md:pt-9">
      <div className="mb-6 flex items-center justify-between gap-4 max-md:items-start">
        <h2 className="m-0 text-xl font-semibold">Ulasan Peminjam</h2>
        <div className="flex items-center gap-1 font-semibold">
          <Star aria-hidden="true" className="fill-[#0f9d58] text-[#0f9d58]" size={16} />
          {studentFacilityDetail.ratingAverage}
          <span className="font-normal text-[#6b7280]">
            / {studentFacilityDetail.reviewCount} ulasan
          </span>
        </div>
      </div>
      {studentFacilityDetail.reviews.map((review) => (
        <article
          className="mb-4 rounded-xl border border-[#e5e7eb] bg-white p-6 max-md:rounded-[14px] max-md:p-5"
          key={`${review.name}-${review.text}`}
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f5e9] text-sm font-bold text-[#0b7340]">
              {review.initials}
            </div>
            <div>
              <h3 className="m-0 mb-1 text-sm font-semibold">{review.name}</h3>
              <p className="m-0 text-xs text-[#6b7280]">{review.context}</p>
            </div>
          </div>
          <p className="m-0 text-sm leading-[1.6] text-[#6b7280]">{review.text}</p>
        </article>
      ))}
      <a
        className="mt-4 inline-block text-sm font-semibold text-[#0f9d58] underline"
        href="/student/facilities/grand-auditorium/reviews"
      >
        Tampilkan semua ulasan
      </a>
    </section>
  );
}

function PublicCalendar() {
  return (
    <section className="mt-10 rounded-2xl border border-[#e5e7eb] bg-white p-6 max-md:rounded-[14px] max-md:p-4">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="m-0 mb-1 text-[11px] font-bold uppercase tracking-[0.04em] text-[#6b7280]">
            Kalender Ketersediaan
          </p>
          <h2 className="m-0 text-xl font-semibold">Kalender Publik</h2>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#6b7280]">
          <CalendarDays aria-hidden="true" size={17} />
          {studentFacilityDetail.publicCalendar.period}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 max-md:gap-1.5" aria-label="Kalender publik Oktober 2024">
        {dayNames.map((day) => (
          <div className="pb-1 text-center text-[11px] font-bold uppercase text-[#6b7280] max-md:text-[10px]" key={day}>
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            className={`flex aspect-square min-w-0 flex-col gap-1.5 rounded-lg border p-2 max-md:rounded-md max-md:p-1.5 ${
              "muted" in day && day.muted
                ? "border-[#f3f4f6] bg-[#f9fafb]"
                : "border-[#e5e7eb] bg-white"
            } ${
              "selected" in day && day.selected
                ? "border-[#0f9d58] shadow-[0_0_0_2px_rgba(15,157,88,0.14)]"
                : ""
            }`}
            key={`${day.day}-${index}`}
          >
            <span
              className={`text-[13px] font-bold leading-none max-md:text-xs ${
                "muted" in day && day.muted ? "text-slate-300" : "text-[#111827]"
              } ${
                "selected" in day && day.selected
                  ? "flex h-6 w-6 items-center justify-center rounded-md bg-[#0f9d58] text-white"
                  : ""
              }`}
            >
              {day.day}
            </span>
            {"dots" in day ? (
              <div className="mt-auto flex flex-wrap gap-1">
                {day.dots.map((dot, dotIndex) => (
                  <span
                    className={`h-[7px] w-[7px] rounded-full max-md:h-[5px] max-md:w-[5px] ${dotClass[dot]}`}
                    key={`${dot}-${dotIndex}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[#e5e7eb] pt-4">
        <p className="m-0 mb-3 text-sm font-bold">
          Jadwal pada {studentFacilityDetail.publicCalendar.selectedDate}
        </p>
        {studentFacilityDetail.publicCalendar.entries.map((entry) => (
          <div
            className="grid grid-cols-[96px_1fr_auto] items-start gap-3 border-t border-dashed border-[#e5e7eb] py-3 first:border-t-0 first:pt-0 max-md:grid-cols-1"
            key={entry.activityTitle}
          >
            <span className="text-xs font-bold">{entry.timeRange}</span>
            <div>
              <p className="m-0 text-sm font-bold">{entry.activityTitle}</p>
              <p className="m-0 text-sm leading-6 text-[#6b7280]">{entry.organizationUnit}</p>
            </div>
            <span className={`inline-flex w-fit rounded-full px-2.5 py-1.5 text-xs font-bold ${statusClass[entry.status]}`}>
              {statusLabel[entry.status]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function StudentFooter() {
  return (
    <footer className="mt-10 flex justify-center border-t border-[#e5e7eb] bg-white py-[22px]">
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

export function StudentFacilityDetailPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#111827]">
      <StudentHeader />
      <main className="mx-auto mb-20 mt-[112px] w-[1200px] max-w-[95%] max-md:mb-10 max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-6">
        <a
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0f9d58] no-underline max-md:mb-[18px]"
          href="/student/facilities"
        >
          ← Kembali
        </a>
        <h1 className="m-0 mb-3 text-[32px] font-bold leading-tight max-md:mb-4">
          {studentFacilityDetail.name}
        </h1>
        <div className="mb-8 flex items-center gap-4 text-sm text-[#6b7280] max-md:mb-6 max-md:items-start max-md:gap-3">
          <div className="flex items-center gap-1 font-semibold text-[#111827] max-md:flex-1">
            <Star aria-hidden="true" className="fill-[#0f9d58] text-[#0f9d58]" size={16} />
            {studentFacilityDetail.ratingAverage}{" "}
            <span className="font-normal text-[#6b7280]">
              ({studentFacilityDetail.reviewCount} ulasan)
            </span>
          </div>
          <div className="flex items-center gap-1.5 max-md:flex-1 max-md:items-start">
            <MapPin aria-hidden="true" className="shrink-0 text-[#6b7280]" size={18} />
            {studentFacilityDetail.location}
          </div>
        </div>

        <Gallery />

        <div className="flex items-start gap-[60px] max-lg:flex-col max-lg:gap-7">
          <div className="min-w-0 flex-1">
            <section>
              <h2 className="m-0 mb-4 text-xl font-semibold">Tentang Fasilitas</h2>
              <p className="mb-8 max-w-[600px] text-sm leading-[1.6] text-[#6b7280] max-md:mb-6">
                {studentFacilityDetail.description}
              </p>
              <div className="mb-12 grid grid-cols-4 gap-4 max-md:mb-9 max-md:grid-cols-2 max-md:gap-3">
                {studentFacilityDetail.features.map(({ icon: Icon, label, value }) => (
                  <div
                    className="flex min-h-[108px] flex-col items-center justify-center rounded-xl border border-[#e5e7eb] bg-white px-3 py-5 text-center"
                    key={label}
                  >
                    <Icon aria-hidden="true" className="mb-3 text-[#0f9d58]" size={24} />
                    <p className="m-0 mb-1 text-sm font-semibold text-[#111827]">{value}</p>
                    <p className="m-0 text-xs text-[#6b7280]">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <Reviews />
            <PublicCalendar />
          </div>

          <ReserveWidget />
        </div>
      </main>
      <StudentFooter />
    </div>
  );
}
