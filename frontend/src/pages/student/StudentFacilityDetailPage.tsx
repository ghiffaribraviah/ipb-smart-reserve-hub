import { Building2, CalendarDays, Clock, Mail, MapPin, Menu, Phone, Star, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../../api/http";
import { NotificationSurface } from "../../components/NotificationSurface";
import { StudentHeaderSearch } from "../../components/layout/StudentHeaderSearch";
import { studentHomeSession } from "../../fixtures/studentHome";
import { campusDateKey, campusUtcOffset, formatCampusTime } from "../../utils/campusTime";

type FacilityImageResponse = {
  alt_text: string;
  is_cover: boolean;
  url: string;
};

type FacilityDetailResponse = {
  capacity: number;
  category: string;
  contact: {
    email: string | null;
    name: string;
    phone: string;
  };
  description: string;
  id: string;
  images: FacilityImageResponse[];
  location: string;
  name: string;
  open_hours?: FacilityOpenHourResponse[];
  open_hours_summary: string;
  price: {
    amount_rupiah: number;
    is_free: boolean;
    summary: string;
  };
  review_summary: {
    rating_average: number | null;
    review_count: number;
  };
  reviews: {
    author_name: string;
    comment: string | null;
    created_at: string;
    id: string;
    rating: number;
  }[];
};

type FacilityOpenHourResponse = {
  closes_at: string;
  day_of_week: number;
  opens_at: string;
};

type PublicCalendarEntryResponse = {
  ends_at: string;
  starts_at: string;
  status: "reserved";
};

type DetailFeature = {
  icon: LucideIcon;
  label: string;
  value: string;
};

const operationalDayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const navItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const dotClass = {
  reserved: "bg-[#10b981]",
};

const statusLabel: Record<PublicCalendarEntryResponse["status"], string> = {
  reserved: "Dipesan",
};

const statusClass: Record<PublicCalendarEntryResponse["status"], string> = {
  reserved: "bg-[#d1fae5] text-[#065f46]",
};

type CalendarDot = keyof typeof dotClass;

type CalendarDay = {
  date: Date;
  day: number;
  dots: CalendarDot[];
  key: string;
  muted: boolean;
};

function calendarPath(facilityId: string, month: Date) {
  const { end, start } = calendarRange(month);
  const params = new URLSearchParams({ end, start });
  return `/facilities/${facilityId}/calendar?${params.toString()}`;
}

async function fetchFacilityDetail(facilityId: string) {
  return apiRequest<FacilityDetailResponse>(`/facilities/${facilityId}`);
}

async function fetchPublicCalendar(facilityId: string, month: Date) {
  return apiRequest<PublicCalendarEntryResponse[]>(calendarPath(facilityId, month));
}

function startOfUtcMonth(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));
}

function addUtcMonths(value: Date, amount: number) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + amount, 1));
}

function calendarRange(month: Date) {
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const nextMonth = addUtcMonths(month, 1);
  return {
    end: `${nextMonth.getUTCFullYear()}-${String(nextMonth.getUTCMonth() + 1).padStart(2, "0")}-01T00:00:00${campusUtcOffset}`,
    start: `${year}-${String(monthIndex + 1).padStart(2, "0")}-01T00:00:00${campusUtcOffset}`,
  };
}

function monthLabel(month: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(month);
}

function fullDateLabel(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function dateKey(value: Date | string) {
  if (typeof value === "string") {
    return campusDateKey(value);
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function calendarDaysForMonth(month: Date, entries: PublicCalendarEntryResponse[]) {
  const firstDay = startOfUtcMonth(month);
  const gridStart = new Date(firstDay);
  gridStart.setUTCDate(firstDay.getUTCDate() - firstDay.getUTCDay());
  const entryCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    const key = dateKey(entry.starts_at);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  return Array.from({ length: 35 }, (_, index): CalendarDay => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + index);
    const count = Math.min(entryCounts[dateKey(date)] ?? 0, 3);
    return {
      date,
      day: date.getUTCDate(),
      dots: Array.from({ length: count }, (): CalendarDot => "reserved"),
      key: dateKey(date),
      muted: date.getUTCMonth() !== firstDay.getUTCMonth(),
    };
  });
}

function formatCapacity(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRating(value: number | null) {
  return value === null ? "Belum ada rating" : value.toFixed(1);
}

function formatTimeRange(entry: PublicCalendarEntryResponse) {
  return `${formatCampusTime(entry.starts_at)} - ${formatCampusTime(entry.ends_at)}`;
}

function formatOperatingTime(value: string) {
  return value.replace(":", ".");
}

function currentCampusDayIndex() {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
  }).format(new Date());
  return { Fri: 4, Mon: 0, Sat: 5, Sun: 6, Thu: 3, Tue: 1, Wed: 2 }[weekday] ?? 0;
}

function operatingHoursForToday(openHours: FacilityOpenHourResponse[]) {
  const today = currentCampusDayIndex();
  const openHour = openHours.find((item) => item.day_of_week === today);

  if (!openHour) {
    return "Hari ini: tutup";
  }

  return `Hari ini: ${formatOperatingTime(openHour.opens_at)}–${formatOperatingTime(openHour.closes_at)}`;
}

function fullOperatingSchedule(openHours: FacilityOpenHourResponse[]) {
  return operationalDayNames.map((dayName, dayIndex) => {
    const openHour = openHours.find((item) => item.day_of_week === dayIndex);
    return {
      dayName,
      label: openHour
        ? `${formatOperatingTime(openHour.opens_at)}–${formatOperatingTime(openHour.closes_at)}`
        : "Tutup",
    };
  });
}

function reviewInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function detailFeatures(detail: FacilityDetailResponse, operatingHoursLabel: string): DetailFeature[] {
  return [
    { icon: Users, label: "Kapasitas", value: formatCapacity(detail.capacity) },
    { icon: Building2, label: "Kategori", value: detail.category },
    { icon: Clock, label: "Jam Buka", value: operatingHoursLabel },
    { icon: Phone, label: "Kontak", value: detail.contact.phone },
  ];
}

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
          <StudentHeaderSearch />
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
          <NotificationSurface className="text-slate-500" role="student" />
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
  url,
}: {
  className: string;
  label: string;
  large?: boolean;
  url: string;
}) {
  const hasImage = Boolean(url);

  return (
    <div
      aria-label={hasImage ? undefined : label}
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#d1fae5] via-[#e7fbd3] to-[#fef3c7] ${className}`}
      role={hasImage ? undefined : "img"}
    >
      {hasImage ? <img alt={label} className="h-full w-full object-cover" src={url} /> : null}
      {!hasImage ? (
        <>
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
        </>
      ) : null}
    </div>
  );
}

function Gallery({ detail }: { detail: FacilityDetailResponse }) {
  const images = detail.images.length > 0 ? detail.images : [{ alt_text: `Media fallback ${detail.name}`, is_cover: true, url: "" }];
  const galleryImages = [0, 1, 2, 3].map(
    (index) => images[index % images.length] ?? { alt_text: `Media fallback ${detail.name}`, is_cover: true, url: "" },
  );

  return (
    <section
      aria-label={`Galeri ${detail.name}`}
      className="mb-12 grid grid-cols-[2fr_1fr_1fr] grid-rows-[200px_200px] gap-4 overflow-hidden rounded-2xl max-md:mb-6 max-md:grid-cols-3 max-md:grid-rows-[226px_76px] max-md:gap-2.5 max-md:overflow-visible"
    >
      <MediaBox
        className="col-start-1 row-span-2 row-start-1 max-md:col-span-3 max-md:row-span-1"
        label={galleryImages[0].alt_text}
        large
        url={galleryImages[0].url}
      />
      <MediaBox
        className="col-start-2 row-start-1 max-md:col-start-1 max-md:row-start-2"
        label={galleryImages[1].alt_text}
        url={galleryImages[1].url}
      />
      <MediaBox
        className="col-start-3 row-start-1 max-md:col-start-2 max-md:row-start-2"
        label={galleryImages[2].alt_text}
        url={galleryImages[2].url}
      />
      <MediaBox
        className="col-span-2 col-start-2 row-start-2 max-md:col-span-1 max-md:col-start-3 max-md:row-start-2"
        label={galleryImages[3].alt_text}
        large
        url={galleryImages[3].url}
      />
    </section>
  );
}

type PublicCalendarProps = {
  compact?: boolean;
  entries: PublicCalendarEntryResponse[];
  isError: boolean;
  isLoading: boolean;
  month: Date;
  onMonthChange: (month: Date) => void;
  onSelectDate: (dateKey: string) => void;
  selectedDateKey: string;
};

function ReserveWidget({
  calendar,
  detail,
}: {
  calendar: Omit<PublicCalendarProps, "compact">;
  detail: FacilityDetailResponse;
}) {
  return (
    <aside className="order-2 w-[380px] shrink-0 max-lg:order-first max-lg:w-full">
      <div className="sticky top-[112px] rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.01)] max-lg:static max-md:rounded-[14px] max-md:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="m-0 mb-2 text-xs text-[#6b7280]">Biaya peminjaman</p>
            <p className="m-0 text-2xl font-bold leading-tight text-[#111827] max-md:text-[22px]">
              {detail.price.summary}
            </p>
          </div>
          <span className="rounded-full bg-[#e8f5e9] px-3 py-1.5 text-xs font-semibold text-[#0b7340]">
            Tersedia
          </span>
        </div>
        <div className="mb-8 flex flex-col gap-3 max-md:mb-6">
          <div className="flex items-center gap-3 text-xs text-[#6b7280]">
            <Phone aria-hidden="true" className="text-[#0f9d58]" size={17} />
            <span>{detail.contact.phone}</span>
          </div>
          {detail.contact.email ? (
            <div className="flex items-center gap-3 text-xs text-[#6b7280]">
              <Mail aria-hidden="true" className="text-[#0f9d58]" size={17} />
              <span>{detail.contact.email}</span>
            </div>
          ) : null}
        </div>
        <PublicCalendar {...calendar} compact />
        <a
          className="mt-6 flex w-full items-center justify-center rounded-lg bg-[#0f9d58] px-4 py-4 text-[15px] font-semibold text-white no-underline hover:bg-[#0b7340]"
          href={`/student/facilities/${detail.id}/reserve/time`}
        >
          Reservasi Sekarang
        </a>
      </div>
    </aside>
  );
}

function Reviews({ detail }: { detail: FacilityDetailResponse }) {
  return (
    <section className="mt-10 border-t border-[#e5e7eb] pt-10 max-md:mt-9 max-md:pt-9">
      <div className="mb-6 flex items-center justify-between gap-4 max-md:items-start">
        <h2 className="m-0 text-xl font-semibold">Ulasan Peminjam</h2>
        <div className="flex items-center gap-1 font-semibold">
          <Star aria-hidden="true" className="fill-[#0f9d58] text-[#0f9d58]" size={16} />
          {formatRating(detail.review_summary.rating_average)}
          <span className="font-normal text-[#6b7280]">
            / {detail.review_summary.review_count} ulasan
          </span>
        </div>
      </div>
      {detail.reviews.length === 0 ? (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 text-sm text-[#6b7280]">
          Belum ada ulasan
        </div>
      ) : null}
      {detail.reviews.map((review) => (
        <article
          className="mb-4 rounded-xl border border-[#e5e7eb] bg-white p-6 max-md:rounded-[14px] max-md:p-5"
          key={review.id}
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f5e9] text-sm font-bold text-[#0b7340]">
              {reviewInitials(review.author_name)}
            </div>
            <div>
              <h3 className="m-0 mb-1 text-sm font-semibold">{review.author_name}</h3>
              <p className="m-0 text-xs text-[#6b7280]">{review.rating} / 5</p>
            </div>
          </div>
          <p className="m-0 text-sm leading-[1.6] text-[#6b7280]">{review.comment ?? "Tanpa komentar"}</p>
        </article>
      ))}
      <a
        className="mt-4 inline-block text-sm font-semibold text-[#0f9d58] underline"
        href={`/student/facilities/${detail.id}/reviews`}
      >
        Tampilkan semua ulasan
      </a>
    </section>
  );
}

function PublicCalendar({
  compact = false,
  entries,
  isError,
  isLoading,
  month,
  onMonthChange,
  onSelectDate,
  selectedDateKey,
}: PublicCalendarProps) {
  const days = useMemo(() => calendarDaysForMonth(month, entries), [entries, month]);
  const selectedDateEntries = entries.filter((entry) => dateKey(entry.starts_at) === selectedDateKey);
  const selectedDate = new Date(`${selectedDateKey}T00:00:00.000Z`);
  const selectedDateLabel = fullDateLabel(selectedDate);
  const visibleMonthLabel = monthLabel(month);

  return (
    <section
      className={
        compact
          ? "border-t border-[#e5e7eb] pt-6"
          : "mt-10 rounded-2xl border border-[#e5e7eb] bg-white p-6 max-md:rounded-[14px] max-md:p-4"
      }
    >
      <div className={compact ? "mb-4 flex flex-col gap-3" : "mb-5 flex items-start justify-between gap-4"}>
        <div>
          <p className="m-0 mb-1 text-[11px] font-bold uppercase tracking-[0.04em] text-[#6b7280]">
            Kalender Ketersediaan
          </p>
          <h2 className={`m-0 font-semibold ${compact ? "text-base" : "text-xl"}`}>Kalender Publik</h2>
        </div>
        <div className={`flex items-center gap-2 font-semibold text-[#6b7280] ${compact ? "text-xs" : "text-sm"}`}>
          <button
            aria-label="Bulan sebelumnya"
            className={`${compact ? "h-8 w-8" : "h-9 w-9"} rounded-lg border border-[#e5e7eb] bg-white text-[#111827]`}
            onClick={() => onMonthChange(addUtcMonths(month, -1))}
            type="button"
          >
            ‹
          </button>
          <span className={`inline-flex items-center justify-center gap-2 ${compact ? "min-w-0 flex-1" : "min-w-[128px]"}`}>
            <CalendarDays aria-hidden="true" size={compact ? 15 : 17} />
            {visibleMonthLabel}
          </span>
          <button
            aria-label="Bulan berikutnya"
            className={`${compact ? "h-8 w-8" : "h-9 w-9"} rounded-lg border border-[#e5e7eb] bg-white text-[#111827]`}
            onClick={() => onMonthChange(addUtcMonths(month, 1))}
            type="button"
          >
            ›
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-7 ${compact ? "gap-1" : "gap-2 max-md:gap-1.5"}`}
        aria-label={`Kalender publik ${visibleMonthLabel}`}
      >
        {dayNames.map((day) => (
          <div
            className={`pb-1 text-center font-bold uppercase text-[#6b7280] ${compact ? "text-[9px]" : "text-[11px] max-md:text-[10px]"}`}
            key={day}
          >
            {day}
          </div>
        ))}
        {days.map((day) => (
          <button
            aria-label={`Pilih ${fullDateLabel(day.date)}`}
            aria-pressed={day.key === selectedDateKey}
            className={`flex aspect-square min-w-0 flex-col rounded-lg border text-left max-md:rounded-md ${
              compact ? "gap-1 p-1.5" : "gap-1.5 p-2 max-md:p-1.5"
            } ${
              day.key === selectedDateKey
                ? "border-[#0f9d58] shadow-[0_0_0_2px_rgba(15,157,88,0.14)]"
                : day.muted
                  ? "border-[#f3f4f6] bg-[#f9fafb]"
                  : "border-[#e5e7eb] bg-white"
            } ${
              day.muted
                ? "bg-[#f9fafb]"
                : "bg-white"
            }`}
            key={day.key}
            onClick={() => onSelectDate(day.key)}
            type="button"
          >
            <span
              className={`font-bold leading-none ${compact ? "text-[11px]" : "text-[13px] max-md:text-xs"} ${
                day.key === selectedDateKey
                  ? `flex items-center justify-center rounded-md bg-[#0f9d58] text-white ${compact ? "h-5 w-5" : "h-6 w-6"}`
                  : day.muted
                    ? "text-slate-300"
                    : "text-[#111827]"
              }`}
            >
              {day.day}
            </span>
            {day.dots.length > 0 ? (
              <div className="mt-auto flex flex-wrap gap-1">
                {day.dots.map((dot, dotIndex) => (
                  <span
                    className={`rounded-full ${compact ? "h-[5px] w-[5px]" : "h-[7px] w-[7px] max-md:h-[5px] max-md:w-[5px]"} ${dotClass[dot]}`}
                    key={`${dot}-${dotIndex}`}
                  />
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-[#e5e7eb] pt-4">
        <p className={`m-0 mb-3 font-bold ${compact ? "text-xs" : "text-sm"}`}>
          Jadwal pada {selectedDateLabel}
        </p>
        {isLoading ? (
          <div className={`rounded-lg border border-[#e5e7eb] bg-[#f8fafc] text-[#6b7280] ${compact ? "p-3 text-xs" : "p-4 text-sm"}`}>
            Memuat kalender publik...
          </div>
        ) : null}
        {isError ? (
          <div className={`rounded-lg border border-[#fee2e2] bg-[#fef2f2] text-[#991b1b] ${compact ? "p-3 text-xs" : "p-4 text-sm"}`}>
            Kalender belum dapat dimuat.
          </div>
        ) : null}
        {!isLoading && !isError && selectedDateEntries.length === 0 ? (
          <div className={`rounded-lg border border-[#e5e7eb] bg-[#f8fafc] text-[#6b7280] ${compact ? "p-3 text-xs" : "p-4 text-sm"}`}>
            Belum ada jadwal terblokir pada tanggal ini.
          </div>
        ) : null}
        {!isLoading && !isError ? selectedDateEntries.map((entry) => (
          <div
            className={
              compact
                ? "grid grid-cols-1 items-start gap-2 border-t border-dashed border-[#e5e7eb] py-3 first:border-t-0 first:pt-0"
                : "grid grid-cols-[96px_1fr_auto] items-start gap-3 border-t border-dashed border-[#e5e7eb] py-3 first:border-t-0 first:pt-0 max-md:grid-cols-1"
            }
            key={`${entry.starts_at}-${entry.ends_at}`}
          >
            <span className="text-xs font-bold">{formatTimeRange(entry)}</span>
            <div>
              <p className={`m-0 font-bold ${compact ? "text-xs" : "text-sm"}`}>Waktu sudah dipesan</p>
              <p className={`m-0 text-[#6b7280] ${compact ? "text-xs leading-5" : "text-sm leading-6"}`}>
                Detail kegiatan tidak ditampilkan pada kalender publik.
              </p>
            </div>
            <span className={`inline-flex w-fit rounded-full px-2.5 py-1.5 text-xs font-bold ${statusClass[entry.status]}`}>
              {statusLabel[entry.status]}
            </span>
          </div>
        )) : null}
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
  const { facilityId = "" } = useParams();
  const [calendarMonth, setCalendarMonth] = useState(() => startOfUtcMonth(new Date()));
  const [isFullScheduleOpen, setIsFullScheduleOpen] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState(() => dateKey(new Date()));
  const detailQuery = useQuery({
    enabled: facilityId.length > 0,
    queryFn: () => fetchFacilityDetail(facilityId),
    queryKey: ["facility-detail", facilityId],
  });
  const calendarQuery = useQuery({
    enabled: facilityId.length > 0 && detailQuery.isSuccess,
    queryFn: () => fetchPublicCalendar(facilityId, calendarMonth),
    queryKey: ["facility-calendar", facilityId, calendarMonth.toISOString()],
  });

  if (detailQuery.isLoading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-white text-[#111827]">
        <StudentHeader />
        <main className="mx-auto mb-20 mt-[112px] w-[1200px] max-w-[95%] max-md:mb-10 max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-6">
          <div className="h-8 w-40 rounded-lg bg-[#f3f4f6]" />
          <div className="mt-8 h-[420px] rounded-2xl border border-[#e5e7eb] bg-[#f8fafc]" />
        </main>
        <StudentFooter />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-white text-[#111827]">
        <StudentHeader />
        <main className="mx-auto mb-20 mt-[112px] w-[1200px] max-w-[95%] max-md:mb-10 max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-6">
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
            <h1 className="m-0 text-2xl font-bold">Fasilitas tidak dapat dimuat</h1>
            <p className="mx-auto mb-0 mt-3 max-w-[520px] text-sm leading-6 text-[#6b7280]">
              Fasilitas tidak ditemukan atau belum tersedia untuk reservasi.
            </p>
            <a
              className="mt-6 inline-flex rounded-lg bg-[#0f9d58] px-4 py-3 text-sm font-semibold text-white no-underline"
              href="/student/facilities"
            >
              Kembali ke katalog
            </a>
          </section>
        </main>
        <StudentFooter />
      </div>
    );
  }

  const detail = detailQuery.data;
  const calendarEntries = calendarQuery.data ?? [];
  const detailOpenHours = detail.open_hours ?? [];
  const todayOperatingHours = detailOpenHours.length > 0
    ? operatingHoursForToday(detailOpenHours)
    : detail.open_hours_summary;
  const fullSchedule = fullOperatingSchedule(detailOpenHours);

  function handleMonthChange(nextMonth: Date) {
    const normalizedMonth = startOfUtcMonth(nextMonth);
    setCalendarMonth(normalizedMonth);
    setSelectedDateKey(dateKey(normalizedMonth));
  }

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
          {detail.name}
        </h1>
        <div className="mb-8 flex items-center gap-4 text-sm text-[#6b7280] max-md:mb-6 max-md:items-start max-md:gap-3">
          <div className="flex items-center gap-1 font-semibold text-[#111827] max-md:flex-1">
            <Star aria-hidden="true" className="fill-[#0f9d58] text-[#0f9d58]" size={16} />
            {formatRating(detail.review_summary.rating_average)}{" "}
            <span className="font-normal text-[#6b7280]">
              ({detail.review_summary.review_count} ulasan)
            </span>
          </div>
          <div className="flex items-center gap-1.5 max-md:flex-1 max-md:items-start">
            <MapPin aria-hidden="true" className="shrink-0 text-[#6b7280]" size={18} />
            {detail.location}
          </div>
        </div>

        <Gallery detail={detail} />

        <div className="flex items-start gap-[60px] max-lg:flex-col max-lg:gap-7">
          <ReserveWidget
            calendar={{
              entries: calendarEntries,
              isError: calendarQuery.isError,
              isLoading: calendarQuery.isLoading,
              month: calendarMonth,
              onMonthChange: handleMonthChange,
              onSelectDate: setSelectedDateKey,
              selectedDateKey,
            }}
            detail={detail}
          />

          <div className="order-1 min-w-0 flex-1">
            <section>
              <h2 className="m-0 mb-4 text-xl font-semibold">Tentang Fasilitas</h2>
              <p className="mb-8 max-w-[600px] text-sm leading-[1.6] text-[#6b7280] max-md:mb-6">
                {detail.description}
              </p>
              <div className="mb-12 grid grid-cols-4 gap-4 max-md:mb-9 max-md:grid-cols-2 max-md:gap-3">
                {detailFeatures(detail, todayOperatingHours).map(({ icon: Icon, label, value }) => (
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
              {detailOpenHours.length > 0 ? (
                <section className="mb-12 rounded-xl bg-[#f8fafc] p-5 max-md:mb-9">
                  <div className="flex items-center justify-between gap-4 max-md:items-start">
                    <div>
                      <h3 className="m-0 text-sm font-bold text-[#111827]">Jam operasional</h3>
                      <p className="m-0 mt-1 text-sm text-[#6b7280]">{todayOperatingHours}</p>
                    </div>
                    <button
                      className="shrink-0 rounded-lg border border-[#d1fae5] bg-white px-3 py-2 text-xs font-bold text-[#0f9d58]"
                      onClick={() => setIsFullScheduleOpen((current) => !current)}
                      type="button"
                    >
                      {isFullScheduleOpen ? "Tutup jadwal" : "Lihat jadwal lengkap"}
                    </button>
                  </div>
                  {isFullScheduleOpen ? (
                    <dl className="mt-4 grid grid-cols-2 gap-2 max-md:grid-cols-1">
                      {fullSchedule.map((item) => (
                        <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm" key={item.dayName}>
                          <dt className="font-semibold text-[#111827]">{item.dayName}</dt>
                          <dd className="m-0 text-[#6b7280]">{item.label}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </section>
              ) : null}
            </section>

            <Reviews detail={detail} />
          </div>
        </div>
      </main>
      <StudentFooter />
    </div>
  );
}
