import {
  CalendarDays,
  Check,
  Clock,
  Info,
  Menu,
  Users,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ApiError, apiRequest } from "../../api/http";
import { NotificationSurface } from "../../components/NotificationSurface";
import { StudentHeaderSearch } from "../../components/layout/StudentHeaderSearch";
import { reservationCreateFixture } from "../../fixtures/studentReservationCreate";
import { studentHomeSession } from "../../fixtures/studentHome";
import { campusDateKey, campusUtcOffset, formatCampusDate, formatCampusTime } from "../../utils/campusTime";

type PublicCalendarEntryResponse = {
  ends_at: string;
  starts_at: string;
  status: "reserved";
};

type TimeSelectionResponse = {
  available: boolean;
  errors: {
    message: string;
    reason: string;
  }[];
};

type FacilityImageResponse = {
  alt_text?: string | null;
  id?: string;
  is_cover?: boolean;
  url: string;
};

type FacilityReservationSummaryResponse = {
  capacity: number;
  id: string;
  images?: FacilityImageResponse[];
  name: string;
  price: {
    amount_rupiah: number;
    is_free: boolean;
    summary: string;
  };
};

type StudentReservationResponse = {
  id: string;
};

type ReservationFormErrors = Partial<Record<
  "activityTitle" | "contactPhone" | "eventDescription" | "extraNotes" | "organizationUnitName" | "participantCount",
  string
>>;

type ValidationState =
  | { kind: "idle" }
  | { kind: "available" }
  | { kind: "unavailable"; messages: string[] }
  | { kind: "error"; message: string };

const navItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const defaultSelectedDateKey = "2026-06-24";

const dotColor = "bg-[#10b981]";

function dateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateKey(value: string) {
  const [year = "2026", month = "06", day = "24"] = value.split("-");
  return {
    day: Number(day),
    monthIndex: Number(month) - 1,
    year: Number(year),
  };
}

function validDateKey(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const { day, monthIndex, year } = parseDateKey(value);
  const date = new Date(Date.UTC(year, monthIndex, day));
  const normalized = dateKey(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return normalized === value ? value : null;
}

function calendarPath(facilityId: string, year: number, monthIndex: number) {
  const start = `${dateKey(year, monthIndex, 1)}T00:00:00${campusUtcOffset}`;
  const nextMonth = monthIndex === 11
    ? { monthIndex: 0, year: year + 1 }
    : { monthIndex: monthIndex + 1, year };
  const end = `${dateKey(nextMonth.year, nextMonth.monthIndex, 1)}T00:00:00${campusUtcOffset}`;
  const params = new URLSearchParams({ end, start });
  return `/facilities/${facilityId}/calendar?${params.toString()}`;
}

function selectedDateTime(selectedDateKey: string, time: string) {
  return `${selectedDateKey}T${time}:00${campusUtcOffset}`;
}

const RESERVATION_ACTIVITY_TITLE_MAX_LENGTH = 255;
const RESERVATION_CONTACT_PHONE_MAX_LENGTH = 32;
const RESERVATION_EXTRA_NOTES_MAX_LENGTH = 180;

function isValidReservationDateTime(value: string | null): value is string {
  if (!value) {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
}

function normalizedReservationRange(searchParams: URLSearchParams) {
  const fallbackStartsAt = selectedDateTime(defaultSelectedDateKey, reservationCreateFixture.startTime);
  const fallbackEndsAt = selectedDateTime(defaultSelectedDateKey, reservationCreateFixture.endTime);
  const startsAt = searchParams.get("starts_at");
  const endsAt = searchParams.get("ends_at");

  if (!isValidReservationDateTime(startsAt) || !isValidReservationDateTime(endsAt)) {
    return { startsAt: fallbackStartsAt, endsAt: fallbackEndsAt };
  }

  if (Date.parse(endsAt) <= Date.parse(startsAt)) {
    return { startsAt: fallbackStartsAt, endsAt: fallbackEndsAt };
  }

  return { startsAt, endsAt };
}

function formatTimeRange(entry: PublicCalendarEntryResponse) {
  return `${formatCampusTime(entry.starts_at)} - ${formatCampusTime(entry.ends_at)}`;
}

function formatDateLabel(value: string) {
  const { day, monthIndex, year } = parseDateKey(value);
  return `${day} ${monthNames[monthIndex]} ${year}`;
}

function localDateKeyFromIso(value: string) {
  return campusDateKey(value);
}

function durationLabel(startTime: string, endTime: string) {
  const [startHour = "0", startMinute = "0"] = startTime.split(":");
  const [endHour = "0", endMinute = "0"] = endTime.split(":");
  const start = Number(startHour) * 60 + Number(startMinute);
  const end = Number(endHour) * 60 + Number(endMinute);
  const minutes = Math.max(0, end - start);

  if (minutes === 0) {
    return "0 Jam";
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [
    hours > 0 ? `${hours} Jam` : null,
    remainder > 0 ? `${remainder} Menit` : null,
  ].filter(Boolean).join(" ");
}

function monthGrid(year: number, monthIndex: number, selectedDateKey: string, entries: PublicCalendarEntryResponse[]) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const previousMonthDays = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const entryCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    const key = localDateKeyFromIso(entry.starts_at);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - firstDay + 1;
    let cellYear = year;
    let cellMonthIndex = monthIndex;
    let day = dayOffset;
    let muted = false;

    if (dayOffset <= 0) {
      muted = true;
      cellMonthIndex = monthIndex - 1;
      day = previousMonthDays + dayOffset;
      if (cellMonthIndex < 0) {
        cellMonthIndex = 11;
        cellYear -= 1;
      }
    } else if (dayOffset > daysInMonth) {
      muted = true;
      cellMonthIndex = monthIndex + 1;
      day = dayOffset - daysInMonth;
      if (cellMonthIndex > 11) {
        cellMonthIndex = 0;
        cellYear += 1;
      }
    }

    const key = dateKey(cellYear, cellMonthIndex, day);
    return {
      day,
      dots: Math.min(entryCounts[key] ?? 0, 3),
      key,
      muted,
      selected: key === selectedDateKey,
    };
  });
}

function detailHref(facilityId: string, startsAt: string, endsAt: string) {
  const params = new URLSearchParams({ starts_at: startsAt, ends_at: endsAt });
  return `/student/facilities/${facilityId}/reserve/details?${params.toString()}`;
}

async function fetchPublicCalendar(facilityId: string, year: number, monthIndex: number) {
  return apiRequest<PublicCalendarEntryResponse[]>(calendarPath(facilityId, year, monthIndex));
}

async function validateTimeSelection({
  endsAt,
  facilityId,
  startsAt,
}: {
  endsAt: string;
  facilityId: string;
  startsAt: string;
}) {
  return apiRequest<TimeSelectionResponse>(`/facilities/${facilityId}/reservation-time-selection`, {
    body: { ends_at: endsAt, starts_at: startsAt },
    method: "POST",
  });
}

async function fetchFacilityReservationSummary(facilityId: string) {
  return apiRequest<FacilityReservationSummaryResponse>(`/facilities/${facilityId}`);
}

async function submitReservation({
  activityTitle,
  avSupport,
  contactPhone,
  endsAt,
  eventDescription,
  extraCleaning,
  facilityId,
  logisticsCoordination,
  notes,
  organizationUnitName,
  participantCount,
  securityPersonnel,
  startsAt,
}: {
  activityTitle: string;
  avSupport: boolean;
  contactPhone: string;
  endsAt: string;
  eventDescription: string;
  extraCleaning: boolean;
  facilityId: string;
  logisticsCoordination: boolean;
  notes: string;
  organizationUnitName: string;
  participantCount: number;
  securityPersonnel: boolean;
  startsAt: string;
}) {
  return apiRequest<StudentReservationResponse>(`/facilities/${facilityId}/reservations`, {
    body: {
      activity_title: activityTitle,
      contact_phone: contactPhone,
      ends_at: endsAt,
      event_description: eventDescription,
      extra_requirements: {
        av_support: avSupport,
        extra_cleaning: extraCleaning,
        logistics_coordination: logisticsCoordination,
        notes: notes.trim() ? notes.trim() : null,
        security_personnel: securityPersonnel,
      },
      organization_unit_name: organizationUnitName,
      participant_count: participantCount,
      starts_at: startsAt,
    },
    method: "POST",
  });
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

function Stepper({ current }: { current: 1 | 2 }) {
  const steps = [
    { label: "Pilih Waktu", state: current === 1 ? "Aktif" : "Selesai" },
    { label: "Detail Reservasi", state: current === 2 ? "Aktif" : "Berikutnya" },
    { label: "Surat", state: "Berikutnya" },
  ];

  return (
    <div className="mb-12 flex justify-center max-md:mb-7">
      <nav
        aria-label="Tahapan reservasi"
        className="relative grid w-[600px] max-w-full grid-cols-3 text-center before:absolute before:left-[16.5%] before:right-[16.5%] before:top-[17px] before:h-0.5 before:bg-[#e5e7eb] after:absolute after:left-[16.5%] after:top-[17px] after:h-0.5 after:bg-[#0f9d58] max-md:w-full"
      >
        <span
          className={`absolute left-[16.5%] top-[17px] h-0.5 bg-[#0f9d58] ${
            current === 1 ? "w-0" : "w-[33.5%]"
          }`}
        />
        {steps.map((step, index) => {
          const number = index + 1;
          const done = current > number;
          const active = current === number;

          return (
            <div className="relative z-10 grid justify-items-center gap-1.5" key={step.label}>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  done
                    ? "border-[#d1fae5] bg-[#d1fae5] text-[#065f46]"
                    : active
                      ? "border-[#0f9d58] bg-white text-[#0f9d58] shadow-[0_0_0_4px_#ecfdf5]"
                      : "border-[#f3f4f6] bg-[#f3f4f6] text-[#6b7280]"
                }`}
              >
                {done ? <Check aria-hidden="true" size={16} /> : number}
              </div>
              <span className="text-sm font-bold leading-tight text-[#111827] max-md:text-xs">
                {step.label}
              </span>
              <span className="text-xs text-[#6b7280] max-md:text-[11px]">{step.state}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

function CalendarCard({
  calendarEntries,
  isCalendarError,
  isCalendarLoading,
  onMonthChange,
  onSelectDate,
  selectedDateKey,
  visibleMonth,
}: {
  calendarEntries: PublicCalendarEntryResponse[];
  isCalendarError: boolean;
  isCalendarLoading: boolean;
  onMonthChange: (direction: -1 | 1) => void;
  onSelectDate: (dateKey: string) => void;
  selectedDateKey: string;
  visibleMonth: { monthIndex: number; year: number };
}) {
  const days = monthGrid(visibleMonth.year, visibleMonth.monthIndex, selectedDateKey, calendarEntries);
  const selectedDateLabel = formatDateLabel(selectedDateKey);
  const selectedDateEntries = calendarEntries.filter((entry) => localDateKeyFromIso(entry.starts_at) === selectedDateKey);
  const visibleMonthLabel = `${monthNames[visibleMonth.monthIndex]} ${visibleMonth.year}`;

  return (
    <section className="flex-1 rounded-xl bg-white p-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="m-0 mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
            Kalender Interaktif
          </p>
          <h1 className="m-0 text-2xl font-bold">{visibleMonthLabel}</h1>
        </div>
        <div className="flex gap-3">
          <button
            aria-label="Bulan sebelumnya"
            className="h-9 w-9 rounded-lg border border-[#e5e7eb] bg-white font-bold"
            onClick={() => onMonthChange(-1)}
            type="button"
          >
            &lt;
          </button>
          <button
            aria-label="Bulan berikutnya"
            className="h-9 w-9 rounded-lg border border-[#e5e7eb] bg-white font-bold"
            onClick={() => onMonthChange(1)}
            type="button"
          >
            &gt;
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center max-md:gap-1.5" aria-label={`Kalender ${visibleMonthLabel}`}>
        {dayNames.map((day) => (
          <div className="pb-1 text-[11px] font-bold uppercase text-[#6b7280]" key={day}>
            {day}
          </div>
        ))}
        {days.map((day) => (
          <button
            aria-label={`Pilih ${formatDateLabel(day.key)}`}
            aria-pressed={day.selected}
            className={`flex aspect-square min-w-0 flex-col rounded-lg border p-2 text-left max-md:p-1.5 ${
              day.muted ? "border-[#f3f4f6] bg-[#f9fafb]" : "border-[#e5e7eb] bg-white"
            }`}
            key={day.key}
            onClick={() => onSelectDate(day.key)}
            type="button"
          >
            <span
              className={`text-sm font-bold ${
                day.selected
                  ? "flex h-7 w-7 items-center justify-center rounded-md bg-[#0f9d58] text-white"
                  : day.muted
                    ? "text-slate-300"
                    : "text-[#111827]"
              }`}
            >
              {day.day}
            </span>
            {day.dots > 0 ? (
              <div className="mt-auto flex gap-1">
                {Array.from({ length: day.dots }, (_, dotIndex) => (
                  <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} key={`${day.key}-${dotIndex}`} />
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <span className="rounded-full bg-[#d1fae5] px-3 py-1.5 text-xs font-bold text-[#065f46]">
          Waktu dipesan
        </span>
        <span className="rounded-full bg-[#fef3c7] px-3 py-1.5 text-xs font-bold text-[#92400e]">
          Waktu dipesan
        </span>
        <span className="rounded-full bg-[#fee2e2] px-3 py-1.5 text-xs font-bold text-[#991b1b]">
          Blokir/perawatan
        </span>
        <span className="rounded-full bg-[#eff6ff] px-3 py-1.5 text-xs font-bold text-[#1e40af]">
          Tanggal dipilih
        </span>
      </div>
      <div className="mt-5 border-t border-[#e5e7eb] pt-4">
        <p className="m-0 mb-3 text-sm font-bold">Jadwal pada {selectedDateLabel}</p>
        {isCalendarLoading ? (
          <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4 text-sm text-[#6b7280]">
            Memuat jadwal terblokir...
          </div>
        ) : null}
        {isCalendarError ? (
          <div className="rounded-lg border border-[#fee2e2] bg-[#fef2f2] p-4 text-sm text-[#991b1b]">
            Kalender belum dapat dimuat.
          </div>
        ) : null}
        {!isCalendarLoading && !isCalendarError && selectedDateEntries.length === 0 ? (
          <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4 text-sm text-[#6b7280]">
            Belum ada jadwal terblokir pada tanggal ini.
          </div>
        ) : null}
        {!isCalendarLoading && !isCalendarError ? selectedDateEntries.map((item) => (
          <div
            className="grid grid-cols-[86px_1fr_auto] gap-3 border-t border-dashed border-[#e5e7eb] py-3 first:border-t-0 first:pt-0 max-md:grid-cols-1"
            key={`${item.starts_at}-${item.ends_at}`}
          >
            <strong className="text-xs">{formatTimeRange(item)}</strong>
            <div>
              <p className="m-0 text-sm font-bold">Waktu sudah dipesan</p>
              <p className="m-0 text-sm leading-6 text-[#6b7280]">
                Detail kegiatan tidak ditampilkan pada kalender publik.
              </p>
            </div>
            <span
              className="h-fit w-fit rounded-full bg-[#d1fae5] px-3 py-1.5 text-xs font-bold text-[#065f46]"
            >
              Dipesan
            </span>
          </div>
        )) : null}
      </div>
    </section>
  );
}

function TimeCard({
  duration,
  endsAt,
  endTime,
  facilityId,
  onEndTimeChange,
  onStartTimeChange,
  onValidate,
  startTime,
  startsAt,
  validationIsPending,
  validationState,
}: {
  duration: string;
  endsAt: string;
  endTime: string;
  facilityId: string;
  onEndTimeChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onValidate: () => void;
  startTime: string;
  startsAt: string;
  validationIsPending: boolean;
  validationState: ValidationState;
}) {
  const canContinue = validationState.kind === "available" && !validationIsPending;

  return (
    <aside className="flex w-[400px] flex-col gap-6 max-lg:w-full">
      <section className="rounded-xl bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
        <div className="mb-3 flex items-center gap-3">
          <Clock aria-hidden="true" className="text-[#0f9d58]" size={22} />
          <h2 className="m-0 text-xl font-semibold">Atur Waktu</h2>
        </div>
        <p className="mb-6 text-sm leading-6 text-[#6b7280]">
          Pilih jadwal mulai dan selesai untuk reservasi. Ketersediaan jadwal dapat dilihat
          pada kalender.
        </p>
        <label className="mb-5 block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.04em] text-[#111827]">
            Waktu Mulai
          </span>
          <input
            aria-label="Waktu Mulai"
            className="h-[52px] w-full rounded-lg border border-[#e5e7eb] bg-white px-4 text-[15px]"
            inputMode="numeric"
            maxLength={5}
            onChange={(event) => onStartTimeChange(event.target.value)}
            pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
            placeholder="09:00"
            type="text"
            value={startTime}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.04em] text-[#111827]">
            Waktu Selesai
          </span>
          <input
            aria-label="Waktu Selesai"
            className="h-[52px] w-full rounded-lg border border-[#e5e7eb] bg-white px-4 text-[15px]"
            inputMode="numeric"
            maxLength={5}
            onChange={(event) => onEndTimeChange(event.target.value)}
            pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
            placeholder="13:00"
            type="text"
            value={endTime}
          />
        </label>
        <div className="mt-6 flex gap-3 rounded-lg bg-[#e8f5e9] p-4 text-[#0b7340]">
          <Info aria-hidden="true" size={17} />
          <div>
            <h3 className="m-0 mb-1 text-sm font-semibold">Total Durasi: {duration}</h3>
            <p className="m-0 text-xs leading-5">
              Waktu minimum reservasi adalah 1 jam. Zona waktu mengikuti zona waktu lokal kampus.
            </p>
          </div>
        </div>
        <button
          className="mt-5 flex min-h-[46px] w-full items-center justify-center rounded-lg border border-[#0f9d58] bg-white px-4 text-sm font-bold text-[#0f9d58] disabled:cursor-not-allowed disabled:border-[#d1d5db] disabled:text-[#9ca3af]"
          disabled={validationIsPending}
          onClick={onValidate}
          type="button"
        >
          {validationIsPending ? "Memeriksa..." : "Cek Ketersediaan"}
        </button>
        {validationState.kind === "available" ? (
          <div className="mt-4 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#166534]">
            Waktu tersedia. Anda dapat melanjutkan reservasi.
          </div>
        ) : null}
        {validationState.kind === "unavailable" ? (
          <div className="mt-4 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#9a3412]">
            {validationState.messages.map((message) => (
              <p className="m-0" key={message}>{message}</p>
            ))}
          </div>
        ) : null}
        {validationState.kind === "error" ? (
          <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#991b1b]">
            {validationState.message}
          </div>
        ) : null}
      </section>
      <a
        aria-disabled={canContinue ? undefined : "true"}
        className={`flex min-h-[52px] items-center justify-center rounded-lg px-5 text-base font-semibold no-underline shadow-[0_4px_6px_rgba(15,157,88,0.2)] ${
          canContinue
            ? "bg-[#0f9d58] text-white"
            : "pointer-events-none bg-[#d1d5db] text-white"
        }`}
        href={canContinue ? detailHref(facilityId, startsAt, endsAt) : "#"}
      >
        Lanjutkan
      </a>
    </aside>
  );
}

function SummaryMedia({
  altText,
  facilityName,
  imageUrl,
}: {
  altText?: string;
  facilityName: string;
  imageUrl?: string | null;
}) {
  if (imageUrl) {
    return (
      <div className="relative h-[180px] overflow-hidden bg-[#e5e7eb]">
        <img
          alt={altText ?? `Foto ${facilityName}`}
          className="h-full w-full object-cover"
          src={imageUrl}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-[180px] items-center justify-center bg-gradient-to-br from-[#d1fae5] via-[#e7fbd3] to-[#fef3c7]">
      <div className="absolute inset-[18px] rounded-[10px] border-[4px] border-[#9fd9b8]/75" />
      <div className="relative text-center">
        <p className="m-0 font-serif text-[24px] font-bold leading-none text-[#1d7667]">
          IPB SRH
        </p>
        <p className="m-0 mt-2 text-[9px] text-[#374151]">Deterministic media fixture</p>
      </div>
    </div>
  );
}

function formatParticipantCapacity(value: number) {
  return `${new Intl.NumberFormat("id-ID").format(value)} orang`;
}

function facilityCoverImage(facility?: FacilityReservationSummaryResponse) {
  const images = facility?.images ?? [];
  return images.find((image) => image.is_cover) ?? images[0] ?? null;
}

function ReservationSummary({
  facility,
  isError = false,
  isLoading = false,
  endsAt,
  startsAt,
}: {
  facility?: FacilityReservationSummaryResponse;
  isError?: boolean;
  isLoading?: boolean;
  endsAt: string;
  startsAt: string;
}) {
  const facilityName = facility?.name ?? (isError ? "Ringkasan fasilitas" : "Memuat fasilitas...");
  const summaryTitle = facility
    ? `Reservasi ${facility.name}`
    : isError
      ? "Ringkasan fasilitas belum dapat dimuat"
      : "Memuat ringkasan reservasi...";
  const capacityLabel = facility ? formatParticipantCapacity(facility.capacity) : isError ? "Tidak tersedia" : "Memuat...";
  const coverImage = facilityCoverImage(facility);
  const totalCostLabel = facility ? facility.price.summary : isError ? "Tidak tersedia" : "Memuat...";
  const dateLabel = formatCampusDate(startsAt);
  const timeLabel = `${formatCampusTime(startsAt)} - ${formatCampusTime(endsAt)}`;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      {facility ? (
        <SummaryMedia
          altText={coverImage?.alt_text ?? undefined}
          facilityName={facilityName}
          imageUrl={coverImage?.url ?? null}
        />
      ) : (
        <div className="flex h-[180px] items-center justify-center bg-[#f8fafc] px-6 text-center text-sm font-semibold text-[#6b7280]">
          {isLoading ? "Memuat media fasilitas..." : "Media fasilitas belum tersedia."}
        </div>
      )}
      <div className="p-6">
        <p className="m-0 mb-1 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
          {facilityName}
        </p>
        <h3 className="m-0 mb-6 text-xl font-bold">{summaryTitle}</h3>
        <p className="m-0 mb-3 flex gap-3 text-sm text-[#6b7280]">
          <CalendarDays aria-hidden="true" className="text-[#0f9d58]" size={18} />
          {dateLabel}
        </p>
        <p className="m-0 mb-3 flex gap-3 text-sm text-[#6b7280]">
          <Clock aria-hidden="true" className="text-[#0f9d58]" size={18} />
          {timeLabel}
        </p>
        <p className="m-0 mb-6 flex gap-3 text-sm text-[#6b7280]">
          <Users aria-hidden="true" className="text-[#0f9d58]" size={18} />
          Kapasitas: {capacityLabel}
        </p>
        <div className="border-t border-[#e5e7eb] pt-5">
          <h4 className="m-0 mb-4 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
            Ringkasan Biaya
          </h4>
          <div className="space-y-3 text-sm text-[#6b7280]">
            <p className="m-0 flex justify-between gap-4">
              <span>Total biaya reservasi</span>
              <strong>{totalCostLabel}</strong>
            </p>
            <p className="m-0 flex justify-between gap-4 border-t border-[#e5e7eb] pt-4 text-base font-bold text-[#111827]">
              <span>Total Biaya</span>
              <span>{totalCostLabel}</span>
            </p>
          </div>
        </div>
        {isError ? (
          <p className="m-0 mt-4 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-xs font-semibold text-[#9a3412]">
            Ringkasan fasilitas belum dapat dimuat dari server.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PolicyBox() {
  return (
    <div className="flex gap-3 rounded-lg border border-[#ccfbf1] bg-[#f0fdfa] p-4 text-[#0f766e]">
      <Info aria-hidden="true" size={17} />
      <div>
        <strong className="mb-1 block text-[10px] uppercase tracking-[0.05em]">
          Kebijakan Departemen
        </strong>
        <p className="m-0 text-xs leading-5">{reservationCreateFixture.policy}</p>
      </div>
    </div>
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

function PageFrame({
  backHref,
  children,
  currentStep,
}: {
  backHref: string;
  children: ReactNode;
  currentStep: 1 | 2;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <StudentHeader />
      <main className="mx-auto mb-20 mt-[104px] w-[1200px] max-w-[95%] max-md:mb-10 max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
        <a className="mb-8 inline-flex text-sm font-semibold text-[#0f9d58] no-underline" href={backHref}>
          ← Kembali
        </a>
        <Stepper current={currentStep} />
        {children}
      </main>
      <StudentFooter />
    </div>
  );
}

export function StudentReservationTimePage() {
  const { facilityId = reservationCreateFixture.facilityId } = useParams();
  const [searchParams] = useSearchParams();
  const initialDateKey = validDateKey(searchParams.get("date")) ?? defaultSelectedDateKey;
  const initialSelectedDate = parseDateKey(initialDateKey);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(initialDateKey);
  const [visibleMonth, setVisibleMonth] = useState({
    monthIndex: initialSelectedDate.monthIndex,
    year: initialSelectedDate.year,
  });
  const [startTime, setStartTime] = useState<string>(reservationCreateFixture.startTime);
  const [endTime, setEndTime] = useState<string>(reservationCreateFixture.endTime);
  const [validationState, setValidationState] = useState<ValidationState>({ kind: "idle" });
  const duration = useMemo(() => durationLabel(startTime, endTime), [startTime, endTime]);
  const startsAt = useMemo(() => selectedDateTime(selectedDateKey, startTime), [selectedDateKey, startTime]);
  const endsAt = useMemo(() => selectedDateTime(selectedDateKey, endTime), [selectedDateKey, endTime]);
  const calendarQuery = useQuery({
    enabled: facilityId.length > 0,
    queryFn: () => fetchPublicCalendar(facilityId, visibleMonth.year, visibleMonth.monthIndex),
    queryKey: ["reservation-time-calendar", facilityId, visibleMonth.year, visibleMonth.monthIndex],
  });
  const validationMutation = useMutation({
    mutationFn: () => validateTimeSelection({ endsAt, facilityId, startsAt }),
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Validasi waktu belum dapat dilakukan.";
      setValidationState({ kind: "error", message });
    },
    onSuccess: (response) => {
      if (response.available) {
        setValidationState({ kind: "available" });
        return;
      }

      setValidationState({
        kind: "unavailable",
        messages: response.errors.length > 0
          ? response.errors.map((item) => item.message)
          : ["Waktu tidak tersedia."],
      });
    },
  });

  function handleStartTimeChange(value: string) {
    setStartTime(value);
    setValidationState({ kind: "idle" });
  }

  function handleEndTimeChange(value: string) {
    setEndTime(value);
    setValidationState({ kind: "idle" });
  }

  function handleDateSelect(nextDateKey: string) {
    const nextDate = parseDateKey(nextDateKey);
    setSelectedDateKey(nextDateKey);
    setVisibleMonth({ monthIndex: nextDate.monthIndex, year: nextDate.year });
    setValidationState({ kind: "idle" });
  }

  function handleMonthChange(direction: -1 | 1) {
    setVisibleMonth((current) => {
      const nextMonthIndex = current.monthIndex + direction;
      if (nextMonthIndex < 0) {
        return { monthIndex: 11, year: current.year - 1 };
      }
      if (nextMonthIndex > 11) {
        return { monthIndex: 0, year: current.year + 1 };
      }
      return { ...current, monthIndex: nextMonthIndex };
    });
  }

  return (
    <PageFrame backHref={`/student/facilities/${facilityId}`} currentStep={1}>
      <div className="flex items-start gap-8 max-lg:flex-col">
        <CalendarCard
          calendarEntries={calendarQuery.data ?? []}
          isCalendarError={calendarQuery.isError}
          isCalendarLoading={calendarQuery.isLoading}
          onMonthChange={handleMonthChange}
          onSelectDate={handleDateSelect}
          selectedDateKey={selectedDateKey}
          visibleMonth={visibleMonth}
        />
        <TimeCard
          duration={duration}
          endsAt={endsAt}
          endTime={endTime}
          facilityId={facilityId}
          onEndTimeChange={handleEndTimeChange}
          onStartTimeChange={handleStartTimeChange}
          onValidate={() => validationMutation.mutate()}
          startTime={startTime}
          startsAt={startsAt}
          validationIsPending={validationMutation.isPending}
          validationState={validationState}
        />
      </div>
    </PageFrame>
  );
}

export function StudentReservationDetailPage() {
  const { facilityId = reservationCreateFixture.facilityId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { startsAt, endsAt } = useMemo(() => normalizedReservationRange(searchParams), [searchParams]);
  const [activityTitle, setActivityTitle] = useState("");
  const [participantCount, setParticipantCount] = useState("");
  const [organizationUnitName, setOrganizationUnitName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [avSupport, setAvSupport] = useState(false);
  const [logisticsCoordination, setLogisticsCoordination] = useState(false);
  const [extraCleaning, setExtraCleaning] = useState(false);
  const [securityPersonnel, setSecurityPersonnel] = useState(false);
  const [extraNotes, setExtraNotes] = useState("");
  const [errors, setErrors] = useState<ReservationFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const facilitySummaryQuery = useQuery({
    enabled: facilityId.length > 0,
    queryFn: () => fetchFacilityReservationSummary(facilityId),
    queryKey: ["facility-reservation-summary", facilityId],
  });
  const submitMutation = useMutation({
    mutationFn: () => submitReservation({
      activityTitle: activityTitle.trim(),
      avSupport,
      contactPhone: contactPhone.trim(),
      endsAt,
      eventDescription: eventDescription.trim(),
      extraCleaning,
      facilityId,
      logisticsCoordination,
      notes: extraNotes,
      organizationUnitName: organizationUnitName.trim(),
      participantCount: Number(participantCount),
      securityPersonnel,
      startsAt,
    }),
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Reservasi belum dapat disimpan.";
      setFormError(message);
    },
    onSuccess: (reservation) => {
      navigate(`/student/reservations/${reservation.id}/letter`);
    },
  });

  function validateForm() {
    const nextErrors: ReservationFormErrors = {};
    if (!activityTitle.trim()) nextErrors.activityTitle = "Nama kegiatan wajib diisi.";
    if (activityTitle.trim().length > RESERVATION_ACTIVITY_TITLE_MAX_LENGTH) {
      nextErrors.activityTitle = "Nama kegiatan maksimal 255 karakter.";
    }
    if (!participantCount || Number(participantCount) <= 0) {
      nextErrors.participantCount = "Jumlah peserta harus lebih dari 0.";
    }
    if (!organizationUnitName.trim()) nextErrors.organizationUnitName = "Organisasi wajib diisi.";
    if (!contactPhone.trim()) nextErrors.contactPhone = "Nomor kontak wajib diisi.";
    if (contactPhone.trim().length > RESERVATION_CONTACT_PHONE_MAX_LENGTH) {
      nextErrors.contactPhone = "Nomor kontak maksimal 32 karakter.";
    }
    if (!eventDescription.trim()) nextErrors.eventDescription = "Deskripsi kegiatan wajib diisi.";
    if (extraNotes.length > RESERVATION_EXTRA_NOTES_MAX_LENGTH) {
      nextErrors.extraNotes = "Catatan tambahan maksimal 180 karakter.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!validateForm()) return;
    submitMutation.mutate();
  }

  return (
    <PageFrame backHref={`/student/facilities/${facilityId}/reserve/time`} currentStep={2}>
      <div className="flex items-start gap-8 max-lg:flex-col">
        <form
          id="student-reservation-detail-form"
          ref={formRef}
          className="flex-1 rounded-xl bg-white p-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6"
          onSubmit={handleSubmit}
        >
          <h1 className="m-0 mb-2 text-2xl font-bold">Detail Reservasi</h1>
          <p className="m-0 mb-8 text-sm leading-6 text-[#6b7280]">
            Silahkan lengkapi data berikut untuk melanjutkan proses reservasi Anda
          </p>
          {formError ? (
            <div className="mb-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#991b1b]">
              {formError}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
            <label>
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Nama Kegiatan
              </span>
              <input
                aria-label="Nama Kegiatan"
                className="h-[52px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm"
                maxLength={RESERVATION_ACTIVITY_TITLE_MAX_LENGTH}
                onChange={(event) => setActivityTitle(event.target.value)}
                placeholder="Contoh: Simposium Etika AI"
                value={activityTitle}
              />
              {errors.activityTitle ? <span className="mt-1 block text-xs font-semibold text-[#991b1b]">{errors.activityTitle}</span> : null}
            </label>
            <label>
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Estimasi Jumlah Peserta
              </span>
              <input
                aria-label="Estimasi Jumlah Peserta"
                className="h-[52px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm"
                onChange={(event) => setParticipantCount(event.target.value)}
                placeholder="45"
                type="number"
                value={participantCount}
              />
              {errors.participantCount ? <span className="mt-1 block text-xs font-semibold text-[#991b1b]">{errors.participantCount}</span> : null}
            </label>
            <label className="col-span-2 max-md:col-span-1">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Organisasi
              </span>
              <input
                aria-label="Organisasi"
                className="h-[52px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm"
                maxLength={RESERVATION_ACTIVITY_TITLE_MAX_LENGTH}
                onChange={(event) => setOrganizationUnitName(event.target.value)}
                placeholder="Masukkan nama organisasi"
                value={organizationUnitName}
              />
              {errors.organizationUnitName ? <span className="mt-1 block text-xs font-semibold text-[#991b1b]">{errors.organizationUnitName}</span> : null}
            </label>
            <label className="col-span-2 max-md:col-span-1">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Nomor Kontak
              </span>
              <input
                aria-label="Nomor Kontak"
                className="h-[52px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm"
                maxLength={RESERVATION_CONTACT_PHONE_MAX_LENGTH}
                onChange={(event) => setContactPhone(event.target.value)}
                placeholder="08123456789"
                value={contactPhone}
              />
              {errors.contactPhone ? <span className="mt-1 block text-xs font-semibold text-[#991b1b]">{errors.contactPhone}</span> : null}
            </label>
            <label className="col-span-2 max-md:col-span-1">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Deskripsi Kegiatan
              </span>
              <textarea
                aria-label="Deskripsi Kegiatan"
                className="min-h-[118px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm"
                onChange={(event) => setEventDescription(event.target.value)}
                placeholder="Jelaskan tujuan reservasi dan kebutuhan tata ruang secara singkat..."
                value={eventDescription}
              />
              {errors.eventDescription ? <span className="mt-1 block text-xs font-semibold text-[#991b1b]">{errors.eventDescription}</span> : null}
            </label>
            <div className="col-span-2 max-md:col-span-1">
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Keperluan Tambahan
              </span>
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <label className="flex min-h-[58px] items-center gap-3 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold">
                  <input aria-label="Dukungan AV & mikrofon" checked={avSupport} className="h-[18px] w-[18px] accent-[#0f9d58]" onChange={(event) => setAvSupport(event.target.checked)} type="checkbox" />
                  Dukungan AV & mikrofon
                </label>
                <label className="flex min-h-[58px] items-center gap-3 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold">
                  <input aria-label="Koordinasi Logistik" checked={logisticsCoordination} className="h-[18px] w-[18px] accent-[#0f9d58]" onChange={(event) => setLogisticsCoordination(event.target.checked)} type="checkbox" />
                  Koordinasi Logistik
                </label>
                <label className="flex min-h-[58px] items-center gap-3 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold">
                  <input aria-label="Jasa kebersihan ekstra" checked={extraCleaning} className="h-[18px] w-[18px] accent-[#0f9d58]" onChange={(event) => setExtraCleaning(event.target.checked)} type="checkbox" />
                  Jasa kebersihan ekstra
                </label>
                <label className="flex min-h-[58px] items-center gap-3 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold">
                  <input aria-label="Personel Keamanan" checked={securityPersonnel} className="h-[18px] w-[18px] accent-[#0f9d58]" onChange={(event) => setSecurityPersonnel(event.target.checked)} type="checkbox" />
                  Personel Keamanan
                </label>
              </div>
            </div>
            <label className="col-span-2 max-md:col-span-1">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Catatan Tambahan
              </span>
              <textarea
                aria-label="Catatan Tambahan"
                className="min-h-[86px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm"
                maxLength={RESERVATION_EXTRA_NOTES_MAX_LENGTH}
                onChange={(event) => setExtraNotes(event.target.value)}
                placeholder="Opsional, maksimal 180 karakter"
                value={extraNotes}
              />
              {errors.extraNotes ? <span className="mt-1 block text-xs font-semibold text-[#991b1b]">{errors.extraNotes}</span> : null}
            </label>
          </div>
          <div className="mt-12 flex items-center justify-start gap-4 border-t border-transparent pt-3">
            <a className="text-sm font-semibold text-[#6b7280] no-underline max-md:order-2" href={`/student/facilities/${facilityId}/reserve/time`}>
              Kembali ke Pencarian
            </a>
          </div>
        </form>

        <aside className="flex w-[400px] flex-col gap-6 max-lg:w-full">
          <ReservationSummary
            endsAt={endsAt}
            facility={facilitySummaryQuery.data}
            isError={facilitySummaryQuery.isError}
            isLoading={facilitySummaryQuery.isLoading}
            startsAt={startsAt}
          />
          <PolicyBox />
          <button
            className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[#0f9d58] px-6 text-[15px] font-semibold text-white shadow-[0_4px_6px_rgba(15,157,88,0.18)] disabled:cursor-not-allowed disabled:bg-[#d1d5db]"
            disabled={submitMutation.isPending}
            onClick={() => formRef.current?.requestSubmit()}
            type="button"
          >
            {submitMutation.isPending ? "Menyimpan..." : "Lanjutkan"}
          </button>
        </aside>
      </div>
    </PageFrame>
  );
}
