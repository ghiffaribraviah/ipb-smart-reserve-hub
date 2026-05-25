import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  Star,
  Upload,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ApiError, apiRequest } from "../../api/http";
import {
  calendarDays,
  type StaffFacility,
  type StaffScheduleEntry,
} from "../../fixtures/staffFacilities";
import { mapStaffReservationStatus } from "../../reservations/staffReservationOperations";
import { cn } from "../../utils/cn";

type FacilityManagementProfileResponse = {
  capacity: number;
  category: string;
  category_id: string;
  contact_email: string | null;
  contact_name: string;
  contact_phone: string;
  description: string;
  id: string;
  is_active: boolean;
  location: string;
  name: string;
  open_hours: FacilityOpenHourResponse[];
  open_hours_summary: string;
  payment_instructions: string | null;
  price_rupiah: number;
  price_summary: string;
};

type FacilityCategoryResponse = {
  facility_count: number;
  icon_hint: string | null;
  id: string;
  name: string;
  slug: string;
};

type FacilityOpenHourResponse = {
  closes_at: string;
  day_of_week: number;
  id?: string;
  opens_at: string;
};

type StaffFacilityScheduleEntryResponse = {
  activity_title: string;
  detail_url: string;
  ends_at: string;
  organization_unit: {
    id: string;
    name: string;
  };
  reservation_code: string;
  reservation_id: string;
  review_status: string;
  starts_at: string;
  status: string;
  workflow_type: string;
};

type FacilityEditForm = {
  capacity: string;
  category_id: string;
  contact_email: string;
  contact_name: string;
  contact_phone: string;
  description: string;
  is_active: boolean;
  location: string;
  name: string;
  open_hours: FacilityOpenHourResponse[];
  open_hours_summary: string;
  payment_instructions: string;
  price_rupiah: string;
};

type ApiJsonValue = string | number | boolean | null | ApiJsonObject | ApiJsonValue[];
type ApiJsonObject = { [key: string]: ApiJsonValue };
import { StaffShell } from "./StaffReservationOperationsPages";

const imageToneClasses = {
  amber: "from-[#4a2511] via-[#7c4a24] to-[#f59e0b]",
  blue: "from-[#1e3a5f] via-[#2563eb] to-[#93c5fd]",
  green: "from-[#1f4f3a] via-[#2f6f4f] to-[#a7f3d0]",
  red: "from-[#802020] via-[#b91c1c] to-[#fecaca]",
};

const scheduleAvatarClasses = {
  amber: "bg-[#b45309] text-white",
  dark: "bg-[#064e3b] text-white",
  slate: "bg-[#475569] text-white",
};

function fetchStaffFacilities() {
  return apiRequest<FacilityManagementProfileResponse[]>("/staff/facilities");
}

function fetchFacilityCategories() {
  return apiRequest<FacilityCategoryResponse[]>("/facility-categories");
}

function updateStaffFacility(facilityId: string, body: ApiJsonObject) {
  return apiRequest<FacilityManagementProfileResponse>(`/staff/facilities/${facilityId}`, {
    body,
    method: "PATCH",
  });
}

function deactivateStaffFacility(facilityId: string) {
  return apiRequest<FacilityManagementProfileResponse>(`/staff/facilities/${facilityId}/deactivate`, {
    method: "POST",
  });
}

function createStaffFacilityImage(facilityId: string, body: ApiJsonObject) {
  return apiRequest<unknown>(`/staff/facilities/${facilityId}/images`, { body, method: "POST" });
}

function createStaffFacilityBlackout(facilityId: string, body: ApiJsonObject) {
  return apiRequest<unknown>(`/staff/facilities/${facilityId}/blackouts`, { body, method: "POST" });
}

function scheduleRange(date: string) {
  const [year, month] = date.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const start = `${year}-${String(month).padStart(2, "0")}-01T00:00:00+07:00`;
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59+07:00`;
  return { start, end };
}

function staffFacilitySchedulePath(facilityId: string, date: string) {
  const range = scheduleRange(date);
  const params = new URLSearchParams(range);
  return `/staff/facilities/${facilityId}/schedule?${params.toString()}`;
}

function fetchStaffFacilitySchedule(facilityId: string, date: string) {
  return apiRequest<StaffFacilityScheduleEntryResponse[]>(staffFacilitySchedulePath(facilityId, date));
}

function titleFromId(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function imageTone(seed: string): StaffFacility["imageTone"] {
  const tones: StaffFacility["imageTone"][] = ["amber", "blue", "green", "red"];
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tones[total % tones.length];
}

function avatarTone(seed: string): StaffScheduleEntry["avatarTone"] {
  const tones: StaffScheduleEntry["avatarTone"][] = ["amber", "dark", "slate"];
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tones[total % tones.length];
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST"
  );
}

function formatStaffTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  })
    .format(new Date(value))
    .replace(".", ":");
}

function formatScheduleDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function formatScheduleMonth(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 7)}-01T00:00:00+07:00`));
}

function mapStaffFacility(facility: FacilityManagementProfileResponse): StaffFacility {
  return {
    capacity: facility.capacity,
    categoryLabel: facility.category,
    description: `${facility.description} ${facility.location}.`.trim(),
    editHref: `/staff/facilities/${facility.id}/edit`,
    id: facility.id,
    imageLabel: facility.category.split("/")[0]?.trim() || facility.name,
    imageTone: imageTone(facility.id),
    name: facility.name,
    openHoursSummary: facility.open_hours_summary,
    priceSummary: facility.price_summary,
    scheduleHref: `/staff/facilities/${facility.id}/schedule`,
    status: facility.is_active ? "active" : "inactive",
    statusLabel: facility.is_active ? "Aktif" : "Nonaktif",
  };
}

function facilityToEditForm(facility: FacilityManagementProfileResponse): FacilityEditForm {
  return {
    capacity: String(facility.capacity),
    category_id: facility.category_id,
    contact_email: facility.contact_email ?? "",
    contact_name: facility.contact_name,
    contact_phone: facility.contact_phone,
    description: facility.description,
    is_active: facility.is_active,
    location: facility.location,
    name: facility.name,
    open_hours: facility.open_hours ?? [],
    open_hours_summary: facility.open_hours_summary,
    payment_instructions: facility.payment_instructions ?? "",
    price_rupiah: String(facility.price_rupiah),
  };
}

function apiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

function mapScheduleEntry(entry: StaffFacilityScheduleEntryResponse): StaffScheduleEntry {
  const status = mapStaffReservationStatus(entry.status);
  const timeStart = formatStaffTime(entry.starts_at);
  const timeEnd = formatStaffTime(entry.ends_at);

  return {
    action: status.tone === "warning" ? "Tinjau Pengajuan" : "Lihat Detail",
    applicant: entry.organization_unit.name,
    applicantInitials: initials(entry.organization_unit.name),
    applicantRole: "Unit organisasi",
    avatarTone: avatarTone(entry.reservation_id),
    detailHref: entry.detail_url,
    event: entry.activity_title,
    id: entry.reservation_id,
    meta: `${entry.reservation_code} - ${entry.organization_unit.name}`,
    status: status.tone === "warning" ? "waiting" : "approved",
    statusLabel: status.label,
    time: `${timeStart} - ${timeEnd}`,
    timeEndLabel: `sampai ${timeEnd}`,
    timeStart,
  };
}

function QueryStateMessage({
  actionLabel,
  children,
  onRetry,
}: {
  actionLabel?: string;
  children: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white px-5 py-6 text-sm font-semibold text-[#6b7280]">
      <p className="m-0">{children}</p>
      {onRetry ? (
        <button
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-[#0f9d58] px-4 text-sm font-bold text-white"
          onClick={onRetry}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function FacilityStatus({ facility }: { facility: StaffFacility }) {
  return (
    <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#111827] shadow-sm">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          facility.status === "active" ? "bg-[#10b981]" : "bg-[#f59e0b]",
        )}
      />
      {facility.statusLabel}
    </span>
  );
}

function FacilityCard({ facility }: { facility: StaffFacility }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <div
        className={cn(
          "relative flex h-[180px] items-center justify-center bg-gradient-to-br text-white",
          imageToneClasses[facility.imageTone],
        )}
      >
        <FacilityStatus facility={facility} />
        <span className="text-xl font-bold tracking-wide">{facility.imageLabel}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.05em] text-[#0f9d58]">
          {facility.categoryLabel}
        </p>
        <h2 className="m-0 mt-2 break-words text-lg font-bold text-[#111827]">{facility.name}</h2>
        <p className="m-0 mt-3 flex-1 text-[13px] leading-5 text-[#6b7280]">
          {facility.description}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 border-b border-[#e5e7eb] pb-5 text-[13px] text-[#6b7280]">
          <span className="inline-flex items-center gap-2">
            <Users aria-hidden="true" className="text-[#111827]" size={16} />
            Kapasitas: {facility.capacity}
          </span>
          <span className="inline-flex items-center gap-2">
            <Star aria-hidden="true" className="text-[#111827]" size={15} />
            Status: {facility.statusLabel}
          </span>
          {facility.priceSummary ? <span className="break-words">{facility.priceSummary}</span> : null}
          {facility.openHoursSummary ? <span className="break-words">{facility.openHoursSummary}</span> : null}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            aria-label={`Edit Detail ${facility.name}`}
            className="flex min-h-10 items-center justify-center rounded-md border border-[#e5e7eb] bg-[#f8fafc] px-3 text-center text-[13px] font-bold text-[#111827] no-underline"
            href={facility.editHref}
          >
            Edit Detail
          </a>
          <a
            aria-label={`Lihat Jadwal ${facility.name}`}
            className="flex min-h-10 items-center justify-center rounded-md bg-[#e8f5e9] px-3 text-center text-[13px] font-bold text-[#0f9d58] no-underline"
            href={facility.scheduleHref}
          >
            Lihat Jadwal
          </a>
        </div>
      </div>
    </article>
  );
}

export function StaffFacilityListPage() {
  const facilitiesQuery = useQuery({
    queryFn: fetchStaffFacilities,
    queryKey: ["staff", "facilities"],
  });
  const facilities = facilitiesQuery.data?.map(mapStaffFacility) ?? [];

  return (
    <StaffShell active="facilities">
      <main className="mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
        <section className="flex items-end justify-between gap-5 max-md:flex-col max-md:items-stretch">
          <div className="max-w-[620px]">
            <h1 className="m-0 text-[32px] font-bold leading-tight max-md:text-[28px]">
              Fasilitas Terkelola
            </h1>
            <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
              Kelola detail, pantau status, dan tinjau jadwal fasilitas dalam lingkup departemen
              Anda.
            </p>
          </div>
        </section>

        <section className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-[#e5e7eb] bg-white px-6 py-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:flex-col max-md:items-stretch max-md:p-4">
          <div className="flex items-center gap-4 max-md:grid max-md:grid-cols-2 max-md:gap-3">
            <select
              aria-label="Filter by facility type"
              className="h-10 rounded-md border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none max-md:w-full"
              defaultValue=""
            >
              <option value="">Semua Tipe</option>
              <option value="auditorium">Auditorium</option>
              <option value="lab">Laboratorium</option>
              <option value="class">Ruang Kelas</option>
            </select>
            <select
              aria-label="Filter by facility status"
              className="h-10 rounded-md border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none max-md:w-full"
              defaultValue=""
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
          <p className="m-0 text-sm text-[#6b7280]">
            Menampilkan <strong>{facilitiesQuery.isLoading ? "-" : facilities.length}</strong> fasilitas
          </p>
        </section>

        <section className="mt-6 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-5">
          {facilitiesQuery.isLoading ? (
            <QueryStateMessage>Memuat fasilitas yang ditugaskan...</QueryStateMessage>
          ) : null}
          {facilitiesQuery.isError ? (
            <QueryStateMessage actionLabel="Muat ulang fasilitas" onRetry={() => void facilitiesQuery.refetch()}>
              Fasilitas belum dapat dimuat.
            </QueryStateMessage>
          ) : null}
          {facilitiesQuery.isSuccess && facilities.length === 0 ? (
            <QueryStateMessage>Belum ada fasilitas yang ditugaskan kepada Anda.</QueryStateMessage>
          ) : null}
          {facilities.map((facility) => (
            <FacilityCard facility={facility} key={facility.id} />
          ))}
        </section>
      </main>
    </StaffShell>
  );
}

function ScheduleStatus({ entry }: { entry: StaffScheduleEntry }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-[180px] rounded-full px-3 py-1.5 text-xs font-bold leading-4 max-md:max-w-[150px]",
        entry.status === "approved"
          ? "bg-[#d1fae5] text-[#065f46]"
          : "bg-[#fef3c7] text-[#92400e]",
      )}
    >
      {entry.statusLabel}
    </span>
  );
}

function ScheduleApplicant({ entry }: { entry: StaffScheduleEntry }) {
  return (
    <div className="flex items-center gap-3 max-md:rounded-lg max-md:border max-md:border-[#e5e7eb] max-md:bg-[#f9fafb] max-md:p-3">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
          scheduleAvatarClasses[entry.avatarTone],
        )}
      >
        {entry.applicantInitials}
      </span>
      <span className="min-w-0">
        <span className="block break-words text-sm font-bold text-[#111827]">{entry.applicant}</span>
        <span className="block break-words text-xs text-[#6b7280]">{entry.applicantRole}</span>
      </span>
    </div>
  );
}

function AgendaItem({ entry }: { entry: StaffScheduleEntry }) {
  return (
    <article className="flex gap-4 border-b border-dashed border-[#e5e7eb] pb-4 last:border-b-0 last:pb-0 max-md:flex-col max-md:gap-2">
      <p className="m-0 w-[85px] shrink-0 text-[13px] font-bold text-[#111827] max-md:w-full">
        {entry.timeStart}
        <span className="block text-[11px] font-normal text-[#6b7280] max-md:inline max-md:pl-2">
          {entry.timeEndLabel}
        </span>
      </p>
      <div className="min-w-0 flex-1">
        <h3 className="m-0 break-words text-sm font-bold text-[#111827]">{entry.event}</h3>
        <div className="mt-2 flex items-center justify-between gap-3 max-md:grid max-md:grid-cols-1">
          <ScheduleStatus entry={entry} />
          <a
            aria-label={`${entry.action} ${entry.applicant}`}
            className={cn(
              "text-xs font-bold no-underline max-md:flex max-md:min-h-10 max-md:items-center max-md:justify-center max-md:rounded-lg max-md:border max-md:border-[#e5e7eb] max-md:bg-[#f9fafb]",
              entry.status === "waiting" ? "text-[#d97706]" : "text-[#0f9d58]",
            )}
            href={entry.detailHref}
          >
            {entry.action}
          </a>
        </div>
      </div>
    </article>
  );
}

function CalendarGrid() {
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  return (
    <div className="min-w-0">
      <div className="grid grid-cols-7 gap-2 max-md:gap-1.5">
        {weekDays.map((day) => (
          <span
            className="pb-2 text-center text-[11px] font-bold uppercase text-[#6b7280]"
            key={day}
          >
            {day}
          </span>
        ))}
        {calendarDays.map((day, index) => (
          <div
            className={cn(
              "flex min-h-[60px] flex-col justify-between rounded-[10px] border border-[#e5e7eb] bg-white p-2 text-sm font-bold text-[#111827] max-md:min-h-10 max-md:p-1.5 max-md:text-xs",
              "muted" in day && day.muted && "border-[#f3f4f6] bg-[#f9fafb] text-[#9ca3af]",
              "selected" in day && day.selected && "border-[#0f9d58] bg-[#e8f5e9] text-[#064e3b]",
            )}
            key={`${day.day}-${index}`}
          >
            <span>{day.day}</span>
            {"dots" in day ? (
              <span className="flex flex-wrap gap-1">
                {day.dots.map((dot, dotIndex) => (
                  <span
                    className={cn(
                      "h-[7px] w-[7px] rounded-full",
                      dot === "green" ? "bg-[#10b981]" : "bg-[#f59e0b]",
                    )}
                    key={`${dot}-${dotIndex}`}
                  />
                ))}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-[18px] flex flex-wrap gap-3 text-xs text-[#6b7280]">
        <span className="inline-flex items-center gap-1.5">
          <i className="h-[7px] w-[7px] rounded-full bg-[#10b981]" /> Disetujui
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-[7px] w-[7px] rounded-full bg-[#f59e0b]" /> Menunggu
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-[7px] w-[7px] rounded-full bg-[#ef4444]" /> Konflik
        </span>
      </div>
    </div>
  );
}

function ScheduleRow({ entry }: { entry: StaffScheduleEntry }) {
  return (
    <tr className="max-md:grid max-md:grid-cols-[1fr_auto] max-md:gap-4 max-md:rounded-xl max-md:border max-md:border-[#e5e7eb] max-md:bg-white max-md:p-4 max-md:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-top text-sm font-bold text-[#111827] max-md:col-start-1 max-md:row-start-1 max-md:border-0 max-md:p-0">
        {entry.time}
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-top max-md:col-span-2 max-md:row-start-2 max-md:border-0 max-md:p-0">
        <h3 className="m-0 break-words text-[15px] font-bold text-[#111827] max-md:text-base">
          {entry.event}
        </h3>
        <p className="m-0 mt-1 break-words text-[13px] leading-5 text-[#6b7280]">{entry.meta}</p>
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-top max-md:col-span-2 max-md:row-start-3 max-md:border-0 max-md:p-0">
        <ScheduleApplicant entry={entry} />
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-top max-md:col-start-2 max-md:row-start-1 max-md:border-0 max-md:p-0 max-md:text-right">
        <ScheduleStatus entry={entry} />
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-top max-md:col-span-2 max-md:row-start-4 max-md:border-0 max-md:border-t max-md:border-[#e5e7eb] max-md:p-0 max-md:pt-4">
        <a
          aria-label={`${entry.action} ${entry.applicant}`}
          className={cn(
            "text-[13px] font-bold no-underline max-md:flex max-md:min-h-11 max-md:items-center max-md:justify-center max-md:rounded-lg max-md:border max-md:border-[#e5e7eb] max-md:bg-[#f9fafb]",
            entry.status === "waiting" ? "text-[#d97706]" : "text-[#0f9d58]",
          )}
          href={entry.detailHref}
        >
          {entry.action}
        </a>
      </td>
    </tr>
  );
}

export function StaffFacilitySchedulePage() {
  const { facilityId = "" } = useParams();
  const [selectedDate, setSelectedDate] = useState("2024-10-24");
  const facilityName = titleFromId(facilityId);
  const scheduleQuery = useQuery({
    enabled: facilityId.length > 0,
    queryFn: () => fetchStaffFacilitySchedule(facilityId, selectedDate),
    queryKey: ["staff", "facilities", facilityId, "schedule", scheduleRange(selectedDate)],
  });
  const scheduleEntries = scheduleQuery.data?.map(mapScheduleEntry) ?? [];
  const scheduleAccessDenied =
    scheduleQuery.error instanceof ApiError && [403, 404].includes(scheduleQuery.error.status);

  return (
    <StaffShell active="facilities">
      <main className="mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
        <a
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#0f9d58] no-underline"
          href="/staff/facilities"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Kembali ke Daftar Fasilitas
        </a>

        <section className="flex items-end justify-between gap-5 max-md:flex-col max-md:items-stretch">
          <div className="max-w-[620px]">
            <h1 className="m-0 text-[32px] font-bold leading-tight max-md:text-[28px]">
              Jadwal {facilityName}
            </h1>
            <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
              Kelola agenda harian, reservasi disetujui, dan pengajuan yang masih menunggu untuk
              fasilitas ini.
            </p>
          </div>
          <div className="flex items-center gap-4 max-md:w-full max-md:gap-3">
            <button
              className="min-h-11 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-bold text-[#111827] max-md:flex-1"
              type="button"
            >
              Hari Ini
            </button>
            <input
              aria-label="Tanggal jadwal terpilih"
              className="min-h-11 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none max-md:min-w-0 max-md:flex-[2]"
              onChange={(event) => setSelectedDate(event.target.value)}
              type="date"
              value={selectedDate}
            />
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          <article className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-4">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="m-0 text-xs font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                  Kalender Fasilitas
                </p>
                <h2 className="m-0 mt-1 text-xl font-bold text-[#111827]">
                  {formatScheduleMonth(selectedDate)}
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Previous month"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280]"
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={18} />
                </button>
                <button
                  aria-label="Next month"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280]"
                  type="button"
                >
                  <ChevronRight aria-hidden="true" size={18} />
                </button>
              </div>
            </div>
            <CalendarGrid />
          </article>

          <article className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-4">
            <div className="mb-5 border-b border-[#e5e7eb] pb-4">
              <h2 className="m-0 text-lg font-bold text-[#111827]">Agenda</h2>
              <p className="m-0 mt-1 text-[13px] text-[#6b7280]">{formatScheduleDate(selectedDate)}</p>
            </div>
            <div className="grid gap-4">
              {scheduleQuery.isLoading ? <QueryStateMessage>Memuat agenda fasilitas...</QueryStateMessage> : null}
              {scheduleQuery.isError && !scheduleAccessDenied ? (
                <QueryStateMessage actionLabel="Muat ulang jadwal" onRetry={() => void scheduleQuery.refetch()}>
                  Jadwal belum dapat dimuat.
                </QueryStateMessage>
              ) : null}
              {scheduleAccessDenied ? (
                <QueryStateMessage>Jadwal fasilitas tidak ditemukan atau tidak dapat diakses.</QueryStateMessage>
              ) : null}
              {scheduleQuery.isSuccess && scheduleEntries.length === 0 ? (
                <QueryStateMessage>Tidak ada reservasi pada rentang jadwal ini.</QueryStateMessage>
              ) : null}
              {scheduleEntries.map((entry) => (
                <AgendaItem entry={entry} key={entry.id} />
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:overflow-visible max-md:border-0 max-md:bg-transparent max-md:shadow-none">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-8 py-6 max-md:border-0 max-md:px-0 max-md:py-0 max-md:pb-4">
            <h2 className="m-0 text-lg font-bold text-[#111827] max-md:text-xl">
              Semua Reservasi
            </h2>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-bold text-[#6b7280]"
              type="button"
            >
              <CalendarDays aria-hidden="true" size={15} />
              Filter
            </button>
          </div>
          <table className="w-full border-collapse text-left max-md:block">
            <thead className="bg-[#f9fafb] max-md:hidden">
              <tr>
                <th className="w-[17%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Waktu
                </th>
                <th className="w-[34%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Detail Kegiatan
                </th>
                <th className="w-[22%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Pemohon
                </th>
                <th className="w-[15%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Status
                </th>
                <th className="w-[12%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="max-md:block max-md:space-y-4">
              {scheduleEntries.map((entry) => (
                <ScheduleRow entry={entry} key={entry.id} />
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </StaffShell>
  );
}

function Field({
  children,
  id,
  label,
}: {
  children: ReactNode;
  id: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-[13px] font-semibold text-[#111827]" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function StaffFacilityEditPage() {
  const { facilityId = "" } = useParams();
  const queryClient = useQueryClient();
  const facilitiesQuery = useQuery({
    queryFn: fetchStaffFacilities,
    queryKey: ["staff", "facilities"],
  });
  const categoriesQuery = useQuery({
    queryFn: fetchFacilityCategories,
    queryKey: ["facility-categories"],
  });
  const facility = facilitiesQuery.data?.find((item) => item.id === facilityId) ?? null;
  const accessDenied =
    facilitiesQuery.error instanceof ApiError && [403, 404].includes(facilitiesQuery.error.status);
  const emptyForm: FacilityEditForm = {
    capacity: "",
    category_id: "",
    contact_email: "",
    contact_name: "",
    contact_phone: "",
    description: "",
    is_active: true,
    location: "",
    name: "",
    open_hours: [],
    open_hours_summary: "",
    payment_instructions: "",
    price_rupiah: "",
  };
  const [formEdits, setFormEdits] = useState<Partial<FacilityEditForm>>({});
  const form: FacilityEditForm = { ...(facility ? facilityToEditForm(facility) : emptyForm), ...formEdits };
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [imageForm, setImageForm] = useState({ alt_text: "", url: "" });
  const [blackoutForm, setBlackoutForm] = useState({
    ends_at: "2026-06-01T04:00",
    reason: "",
    starts_at: "2026-06-01T03:00",
  });

  const invalidateFacilities = async () => {
    await queryClient.invalidateQueries({ queryKey: ["staff", "facilities"] });
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const capacity = Number(form.capacity);
      const price = Number(form.price_rupiah);

      if (!form.name.trim()) {
        throw new Error("Nama fasilitas wajib diisi.");
      }

      if (!Number.isFinite(capacity) || capacity < 1) {
        throw new Error("Kapasitas harus lebih dari 0.");
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Harga sewa tidak boleh negatif.");
      }

      const openHours = form.open_hours.map((openHour) => {
        if (openHour.closes_at <= openHour.opens_at) {
          throw new Error("Jam tutup harus setelah jam buka.");
        }
        return {
          closes_at: openHour.closes_at,
          day_of_week: openHour.day_of_week,
          opens_at: openHour.opens_at,
        };
      });

      return updateStaffFacility(facilityId, {
        capacity,
        category_id: form.category_id,
        contact_email: form.contact_email.trim() || null,
        contact_name: form.contact_name.trim(),
        contact_phone: form.contact_phone.trim(),
        description: form.description.trim(),
        is_active: form.is_active,
        location: form.location.trim(),
        name: form.name.trim(),
        open_hours: openHours,
        payment_instructions: form.payment_instructions.trim() || null,
        price_rupiah: price,
      });
    },
    onError: (error) => {
      setMessage("");
      setFormError(apiErrorMessage(error, "Perubahan fasilitas belum dapat disimpan."));
    },
    onSuccess: async (updated) => {
      setFormEdits(facilityToEditForm(updated));
      setFormError("");
      setMessage("Perubahan fasilitas tersimpan.");
      await invalidateFacilities();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateStaffFacility(facilityId),
    onError: (error) => {
      setMessage("");
      setFormError(apiErrorMessage(error, "Fasilitas belum dapat dinonaktifkan."));
    },
    onSuccess: async (updated) => {
      setFormEdits(facilityToEditForm(updated));
      setFormError("");
      setMessage("Fasilitas dinonaktifkan.");
      await invalidateFacilities();
    },
  });

  const imageMutation = useMutation({
    mutationFn: () =>
      createStaffFacilityImage(facilityId, {
        alt_text: imageForm.alt_text.trim(),
        display_order: 0,
        is_cover: false,
        url: imageForm.url.trim(),
      }),
    onError: (error) => {
      setMessage("");
      setFormError(apiErrorMessage(error, "Gambar fasilitas belum dapat ditambahkan."));
    },
    onSuccess: () => {
      setFormError("");
      setImageForm({ alt_text: "", url: "" });
      setMessage("Gambar fasilitas ditambahkan.");
    },
  });

  const blackoutMutation = useMutation({
    mutationFn: () =>
      createStaffFacilityBlackout(facilityId, {
        ends_at: `${blackoutForm.ends_at}:00+07:00`,
        reason: blackoutForm.reason.trim(),
        starts_at: `${blackoutForm.starts_at}:00+07:00`,
      }),
    onError: (error) => {
      setMessage("");
      setFormError(apiErrorMessage(error, "Blackout fasilitas belum dapat ditambahkan."));
    },
    onSuccess: () => {
      setBlackoutForm((current) => ({ ...current, reason: "" }));
      setFormError("");
      setMessage("Blackout fasilitas ditambahkan.");
    },
  });

  const busy =
    saveMutation.isPending ||
    deactivateMutation.isPending ||
    imageMutation.isPending ||
    blackoutMutation.isPending;

  const updateField = (field: keyof FacilityEditForm, value: string | boolean) => {
    setFormEdits((current) => ({ ...current, [field]: value }));
  };

  const updateOpenHour = (index: number, updates: Partial<FacilityOpenHourResponse>) => {
    setFormEdits((current) => {
      const currentOpenHours = current.open_hours ?? form.open_hours;
      return {
        ...current,
        open_hours: currentOpenHours.map((openHour, currentIndex) =>
          currentIndex === index ? { ...openHour, ...updates } : openHour
        ),
      };
    });
  };

  const addOpenHourRow = () => {
    setFormEdits((current) => ({
      ...current,
      open_hours: [
        ...(current.open_hours ?? form.open_hours),
        { day_of_week: 0, opens_at: "08:00", closes_at: "16:00" },
      ],
    }));
  };

  const removeOpenHourRow = (index: number) => {
    setFormEdits((current) => ({
      ...current,
      open_hours: (current.open_hours ?? form.open_hours).filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const categoryOptions = categoriesQuery.data ?? (
    facility ? [{ id: facility.category_id, name: facility.category }] : []
  );

  return (
    <StaffShell active="facilities">
      <main className="mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
        <a
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#0f9d58] no-underline"
          href="/staff/facilities"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Kembali
        </a>

        <section className="mb-8">
          <h1 className="m-0 text-[32px] font-bold leading-tight text-[#111827] max-md:text-[28px]">
            Edit Detail Fasilitas
          </h1>
          <p className="m-0 mt-2 text-sm text-[#6b7280]">
            Kelola identitas, aset, dan parameter operasional fasilitas ini.
          </p>
        </section>

        {facilitiesQuery.isLoading ? <QueryStateMessage>Memuat detail fasilitas...</QueryStateMessage> : null}
        {facilitiesQuery.isError && !accessDenied ? (
          <QueryStateMessage actionLabel="Muat ulang fasilitas" onRetry={() => void facilitiesQuery.refetch()}>
            Detail fasilitas belum dapat dimuat.
          </QueryStateMessage>
        ) : null}
        {accessDenied || (facilitiesQuery.isSuccess && !facility) ? (
          <QueryStateMessage>Fasilitas tidak ditemukan atau tidak dapat diakses.</QueryStateMessage>
        ) : null}

        {facility ? (
        <form
          className="flex items-start gap-8 max-lg:flex-col"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <div className="grid min-w-0 flex-1 gap-6">
            <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="m-0 text-sm font-bold text-[#111827]">Informasi Umum</h2>
                <span className="inline-flex rounded-full bg-[#e8f5e9] px-3 py-1 text-xs font-bold text-[#0b7340]">
                  {form.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                <Field id="facility-name" label="Nama">
                  <input
                    className="h-[46px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white max-md:h-[52px]"
                    disabled={busy}
                    id="facility-name"
                    onChange={(event) => updateField("name", event.target.value)}
                    value={form.name}
                  />
                </Field>
                <Field id="facility-location" label="Lokasi">
                  <input
                    className="h-[46px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white max-md:h-[52px]"
                    disabled={busy}
                    id="facility-location"
                    onChange={(event) => updateField("location", event.target.value)}
                    value={form.location}
                  />
                </Field>
                <Field id="facility-category" label="Kategori Fasilitas">
                  <select
                    aria-label="Kategori Fasilitas"
                    className="h-[46px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white max-md:h-[52px]"
                    disabled={busy || categoriesQuery.isLoading}
                    id="facility-category"
                    onChange={(event) => updateField("category_id", event.target.value)}
                    value={form.category_id}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="col-span-2 grid gap-2 max-md:col-span-1">
                  <label className="text-[13px] font-semibold text-[#111827]" htmlFor="facility-about">
                    Tentang Fasilitas
                  </label>
                  <textarea
                    className="min-h-[112px] w-full resize-y rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white max-md:min-h-[132px]"
                    disabled={busy}
                    id="facility-about"
                    onChange={(event) => updateField("description", event.target.value)}
                    value={form.description}
                  />
                </div>
                <Field id="facility-capacity" label="Kapasitas (Orang)">
                  <input
                    className="h-[46px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white max-md:h-[52px]"
                    disabled={busy}
                    id="facility-capacity"
                    min={1}
                    onChange={(event) => updateField("capacity", event.target.value)}
                    type="number"
                    value={form.capacity}
                  />
                </Field>
                <Field id="facility-price" label="Harga sewa (Rupiah)">
                  <input
                    className="h-[46px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white max-md:h-[52px]"
                    disabled={busy}
                    id="facility-price"
                    min={0}
                    onChange={(event) => updateField("price_rupiah", event.target.value)}
                    type="number"
                    value={form.price_rupiah}
                  />
                </Field>
                <Field id="facility-contact-name" label="Nama Kontak">
                  <input
                    className="h-[46px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white max-md:h-[52px]"
                    disabled={busy}
                    id="facility-contact-name"
                    onChange={(event) => updateField("contact_name", event.target.value)}
                    value={form.contact_name}
                  />
                </Field>
                <Field id="facility-contact-phone" label="Nomor Kontak">
                  <input
                    className="h-[46px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white max-md:h-[52px]"
                    disabled={busy}
                    id="facility-contact-phone"
                    onChange={(event) => updateField("contact_phone", event.target.value)}
                    value={form.contact_phone}
                  />
                </Field>
                <Field id="facility-contact-email" label="Email Kontak">
                  <input
                    className="h-[46px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white max-md:h-[52px]"
                    disabled={busy}
                    id="facility-contact-email"
                    onChange={(event) => updateField("contact_email", event.target.value)}
                    type="email"
                    value={form.contact_email}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
              <div className="mb-6 flex items-start justify-between gap-4 max-md:grid">
                <div>
                  <h2 className="m-0 text-sm font-bold text-[#111827]">Jadwal Operasional</h2>
                  <p className="m-0 mt-2 text-sm leading-6 text-[#6b7280]">
                    Ringkasan saat ini: {form.open_hours_summary || "Belum ada jam buka"}
                  </p>
                </div>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#d1fae5] bg-[#e8f5e9] px-4 text-sm font-bold text-[#0f9d58]"
                  disabled={busy}
                  onClick={addOpenHourRow}
                  type="button"
                >
                  <Plus aria-hidden="true" size={16} />
                  Tambah Baris Jam Buka
                </button>
              </div>
              <div className="grid gap-3">
                {form.open_hours.length === 0 ? (
                  <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4 text-sm font-semibold text-[#6b7280]">
                    Belum ada jam buka terstruktur.
                  </div>
                ) : null}
                {form.open_hours.map((openHour, index) => {
                  const rowNumber = index + 1;
                  return (
                    <div
                      className="grid grid-cols-[1.1fr_1fr_1fr_auto] items-end gap-3 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3 max-md:grid-cols-1"
                      key={openHour.id ?? `new-${index}`}
                    >
                      <label className="grid gap-2 text-[13px] font-semibold text-[#111827]">
                        Hari
                        <select
                          aria-label={`Hari buka ${rowNumber}`}
                          className="h-10 rounded-md border border-[#e5e7eb] bg-white px-3 text-sm"
                          disabled={busy}
                          onChange={(event) => updateOpenHour(index, { day_of_week: Number(event.target.value) })}
                          value={String(openHour.day_of_week)}
                        >
                          <option value="0">Senin</option>
                          <option value="1">Selasa</option>
                          <option value="2">Rabu</option>
                          <option value="3">Kamis</option>
                          <option value="4">Jumat</option>
                          <option value="5">Sabtu</option>
                          <option value="6">Minggu</option>
                        </select>
                      </label>
                      <label className="grid gap-2 text-[13px] font-semibold text-[#111827]">
                        Jam Buka
                        <input
                          aria-label={`Jam buka mulai ${rowNumber}`}
                          className="h-10 rounded-md border border-[#e5e7eb] bg-white px-3 text-sm"
                          disabled={busy}
                          onChange={(event) => updateOpenHour(index, { opens_at: event.target.value })}
                          type="time"
                          value={openHour.opens_at}
                        />
                      </label>
                      <label className="grid gap-2 text-[13px] font-semibold text-[#111827]">
                        Jam Tutup
                        <input
                          aria-label={`Jam buka selesai ${rowNumber}`}
                          className="h-10 rounded-md border border-[#e5e7eb] bg-white px-3 text-sm"
                          disabled={busy}
                          onChange={(event) => updateOpenHour(index, { closes_at: event.target.value })}
                          type="time"
                          value={openHour.closes_at}
                        />
                      </label>
                      <button
                        aria-label={`Hapus Jam Buka ${rowNumber}`}
                        className="min-h-10 rounded-lg border border-[#fecaca] bg-white px-4 text-sm font-bold text-[#dc2626]"
                        disabled={busy}
                        onClick={() => removeOpenHourRow(index)}
                        type="button"
                      >
                        Hapus
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 grid gap-2">
                <label className="text-[13px] font-semibold text-[#111827]" htmlFor="facility-payment-instructions">
                  Instruksi Pembayaran
                </label>
                <textarea
                  className="min-h-[92px] w-full resize-y rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white"
                  disabled={busy}
                  id="facility-payment-instructions"
                  onChange={(event) => updateField("payment_instructions", event.target.value)}
                  value={form.payment_instructions}
                />
              </div>
            </section>

            <section className="grid gap-3">
              {message ? (
                <div className="rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#0b7340]">
                  {message}
                </div>
              ) : null}
              {formError ? (
                <div className="rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm font-semibold text-[#dc2626]">
                  {formError}
                </div>
              ) : null}
              <div className="flex items-center gap-4 pt-1 max-md:grid max-md:grid-cols-2 max-md:gap-3">
                <button
                  disabled={busy}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0f9d58] px-6 text-sm font-bold text-white"
                  type="submit"
                >
                  <Save aria-hidden="true" size={18} />
                  Simpan Perubahan
                </button>
                <button
                  disabled={busy || !form.is_active}
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#fee2e2] px-6 text-sm font-bold text-[#dc2626]"
                  onClick={() => deactivateMutation.mutate()}
                  type="button"
                >
                  Nonaktifkan
                </button>
                <p className="m-0 flex items-start gap-2 text-xs leading-5 text-[#6b7280] max-md:col-span-2 max-md:rounded-lg max-md:border max-md:border-[#fed7aa] max-md:bg-[#fff7ed] max-md:p-3">
                  <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-[#dc2626]" size={16} />
                  Perubahan akan langsung tampil di dashboard setelah disimpan.
                </p>
              </div>
            </section>
          </div>

          <aside className="sticky top-24 w-[380px] shrink-0 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-lg:static max-lg:w-full">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="m-0 text-sm font-bold text-[#111827]">Galeri Media</h2>
            </div>
            <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3 text-xs leading-5 text-[#6b7280]">
              Media yang ada dikelola oleh backend. Tambahkan gambar baru dengan URL dan teks alternatif.
            </div>
            <div className="mt-4 grid gap-3">
              <Field id="facility-image-url" label="URL Gambar">
                <input
                  className="h-[42px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 text-sm"
                  id="facility-image-url"
                  onChange={(event) => setImageForm((current) => ({ ...current, url: event.target.value }))}
                  value={imageForm.url}
                />
              </Field>
              <Field id="facility-image-alt" label="Teks Alternatif">
                <input
                  className="h-[42px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 text-sm"
                  id="facility-image-alt"
                  onChange={(event) => setImageForm((current) => ({ ...current, alt_text: event.target.value }))}
                  value={imageForm.alt_text}
                />
              </Field>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#d1fae5] bg-[#e8f5e9] px-4 text-sm font-bold text-[#0f9d58]"
                disabled={busy || !imageForm.url.trim() || !imageForm.alt_text.trim()}
                onClick={() => imageMutation.mutate()}
                type="button"
              >
                <Upload aria-hidden="true" size={16} />
                Tambah Gambar
              </button>
            </div>

            <div className="mt-5 grid gap-3 border-t border-[#e5e7eb] pt-5 text-sm">
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3">
                <p className="m-0 mb-3 font-bold text-[#111827]">Tambah Blackout</p>
                <div className="grid gap-2">
                  <input
                    aria-label="Blackout mulai"
                    className="h-10 rounded-md border border-[#e5e7eb] bg-white px-2 text-xs"
                    onChange={(event) => setBlackoutForm((current) => ({ ...current, starts_at: event.target.value }))}
                    type="datetime-local"
                    value={blackoutForm.starts_at}
                  />
                  <input
                    aria-label="Blackout selesai"
                    className="h-10 rounded-md border border-[#e5e7eb] bg-white px-2 text-xs"
                    onChange={(event) => setBlackoutForm((current) => ({ ...current, ends_at: event.target.value }))}
                    type="datetime-local"
                    value={blackoutForm.ends_at}
                  />
                  <input
                    aria-label="Alasan blackout"
                    className="h-10 rounded-md border border-[#e5e7eb] bg-white px-2 text-xs"
                    onChange={(event) => setBlackoutForm((current) => ({ ...current, reason: event.target.value }))}
                    placeholder="Maintenance"
                    value={blackoutForm.reason}
                  />
                </div>
                <button
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[#0f9d58] px-4 text-sm font-bold text-white"
                  disabled={busy || !blackoutForm.reason.trim()}
                  onClick={() => blackoutMutation.mutate()}
                  type="button"
                >
                  Tambah Blackout
                </button>
              </div>
            </div>
          </aside>
        </form>
        ) : null}
      </main>
    </StaffShell>
  );
}
