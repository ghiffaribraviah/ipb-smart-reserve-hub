import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Megaphone,
  Plus,
  Save,
  Star,
  Upload,
  Users,
  Wifi,
  Wind,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  calendarDays,
  staffFacilityEditFixture,
  staffFacilities,
  staffScheduleEntries,
  type StaffFacility,
  type StaffFacilityMedia,
  type StaffScheduleEntry,
} from "../../fixtures/staffFacilities";
import { cn } from "../../utils/cn";
import { StaffShell } from "./StaffReservationOperationsPages";

const imageToneClasses = {
  amber: "from-[#4a2511] via-[#7c4a24] to-[#f59e0b]",
  blue: "from-[#1e3a5f] via-[#2563eb] to-[#93c5fd]",
  green: "from-[#1f4f3a] via-[#2f6f4f] to-[#a7f3d0]",
  red: "from-[#802020] via-[#b91c1c] to-[#fecaca]",
};

const mediaToneClasses = {
  amber: "from-[#4a2511] via-[#7c4a24] to-[#f59e0b]",
  blue: "from-[#1e3a5f] via-[#2563eb] to-[#93c5fd]",
  green: "from-[#1f4f3a] via-[#2f6f4f] to-[#a7f3d0]",
};

const scheduleAvatarClasses = {
  amber: "bg-[#b45309] text-white",
  dark: "bg-[#064e3b] text-white",
  slate: "bg-[#475569] text-white",
};

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
          {facility.department}
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
            Rating: {facility.rating}
          </span>
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
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0f9d58] px-5 text-sm font-bold text-white max-md:w-full"
            type="button"
          >
            <Plus aria-hidden="true" size={18} />
            Tambah Fasilitas
          </button>
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
              <option value="maintenance">Perawatan</option>
            </select>
          </div>
          <p className="m-0 text-sm text-[#6b7280]">
            Menampilkan <strong>4</strong> fasilitas
          </p>
        </section>

        <section className="mt-6 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-5">
          {staffFacilities.map((facility) => (
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
              Jadwal Grand Auditorium
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
              defaultValue="2024-10-24"
              type="date"
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
                <h2 className="m-0 mt-1 text-xl font-bold text-[#111827]">Oktober 2024</h2>
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
              <p className="m-0 mt-1 text-[13px] text-[#6b7280]">24 Oktober 2024</p>
            </div>
            <div className="grid gap-4">
              {staffScheduleEntries.map((entry) => (
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
              {staffScheduleEntries.map((entry) => (
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

function TextInput({
  id,
  label,
  type = "text",
  value,
  withIcon,
}: {
  id: string;
  label: string;
  type?: "number" | "text";
  value: string;
  withIcon?: "credit" | "users";
}) {
  const Icon = withIcon === "credit" ? CreditCard : withIcon === "users" ? Users : null;
  return (
    <Field id={id} label={label}>
      <span className="relative block">
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]"
            size={18}
          />
        ) : null}
        <input
          className={cn(
            "h-[46px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white max-md:h-[52px]",
            Icon && "pl-10",
          )}
          defaultValue={value}
          id={id}
          type={type}
        />
      </span>
    </Field>
  );
}

function AmenityIcon({ amenityKey }: { amenityKey: string }) {
  if (amenityKey === "network") return <Wifi aria-hidden="true" size={18} />;
  if (amenityKey === "audio") return <Megaphone aria-hidden="true" size={18} />;
  if (amenityKey === "projector") return <CalendarDays aria-hidden="true" size={18} />;
  return <Wind aria-hidden="true" size={18} />;
}

function MediaPreview({ media }: { media: StaffFacilityMedia }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
      <div
        className={cn(
          "flex h-[120px] items-center justify-center bg-gradient-to-br text-sm font-bold text-white",
          mediaToneClasses[media.tone],
        )}
      >
        {media.label}
      </div>
      <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-[#6b7280]">
        <span className="min-w-0 break-words font-semibold">{media.filename}</span>
        <button className="shrink-0 text-[#dc2626]" type="button">
          Hapus
        </button>
      </div>
    </div>
  );
}

export function StaffFacilityEditPage() {
  const fixture = staffFacilityEditFixture;

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

        <div className="flex items-start gap-8 max-lg:flex-col">
          <div className="grid min-w-0 flex-1 gap-6">
            <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
              <h2 className="m-0 mb-6 text-sm font-bold text-[#111827]">Informasi Umum</h2>
              <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                <TextInput id="facility-name" label="Nama" value={fixture.name} />
                <TextInput id="facility-location" label="Lokasi" value={fixture.location} />
                <div className="col-span-2 grid gap-2 max-md:col-span-1">
                  <label className="text-[13px] font-semibold text-[#111827]" htmlFor="facility-about">
                    Tentang Fasilitas
                  </label>
                  <textarea
                    className="min-h-[112px] w-full resize-y rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-[#111827] outline-none focus:border-[#0f9d58] focus:bg-white max-md:min-h-[132px]"
                    defaultValue={fixture.description}
                    id="facility-about"
                  />
                </div>
                <TextInput
                  id="facility-capacity"
                  label="Kapasitas (Orang)"
                  type="number"
                  value={fixture.capacity}
                  withIcon="users"
                />
                <div>
                  <TextInput
                    id="facility-price"
                    label="Harga sewa (Rupiah)"
                    type="number"
                    value={fixture.price}
                    withIcon="credit"
                  />
                  <p className="m-0 mt-1 text-[10px] text-[#6b7280]">*Keterangan</p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
              <h2 className="m-0 mb-6 text-sm font-bold text-[#111827]">Fasilitas Pendukung</h2>
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                {fixture.amenities.map((amenity) => (
                  <label
                    className="flex min-h-14 min-w-0 items-center gap-3 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4 has-[:checked]:border-[#0f9d58] has-[:checked]:bg-[#f0fdf4]"
                    key={amenity.key}
                  >
                    <input
                      aria-label={amenity.label}
                      className="peer sr-only"
                      defaultChecked={amenity.checked}
                      type="checkbox"
                    />
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-2 border-[#cbd5e1] text-white peer-checked:border-[#0f9d58] peer-checked:bg-[#0f9d58]">
                      <Check aria-hidden="true" size={12} />
                    </span>
                    <span className="text-[#6b7280] peer-checked:text-[#0f9d58]">
                      <AmenityIcon amenityKey={amenity.key} />
                    </span>
                    <span className="min-w-0 break-words text-[13px] font-semibold text-[#111827]">
                      {amenity.label}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
              <h2 className="m-0 mb-6 text-sm font-bold text-[#111827]">Status</h2>
              <div className="rounded-lg border border-[#dcfce7] bg-[#f0fdf4] p-6">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.05em] text-[#0b7340]">
                  Terakhir Diubah
                </p>
                <p className="m-0 mt-1 text-[13px] font-bold text-[#0b7340]">
                  {fixture.lastChangedAt}
                </p>
                <p className="m-0 mt-1 text-xs text-[#0b7340]/80">oleh {fixture.lastChangedBy}</p>
              </div>
            </section>

            <section className="grid gap-3">
              <div className="rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#0b7340]">
                {fixture.successMessage}
              </div>
              <div className="rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm font-semibold text-[#dc2626]">
                {fixture.errorMessage}
              </div>
              <div className="flex items-center gap-4 pt-1 max-md:grid max-md:grid-cols-2 max-md:gap-3">
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0f9d58] px-6 text-sm font-bold text-white"
                  type="button"
                >
                  <Save aria-hidden="true" size={18} />
                  Simpan Perubahan
                </button>
                <button
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#fee2e2] px-6 text-sm font-bold text-[#dc2626]"
                  type="button"
                >
                  Batalkan
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
              <button className="inline-flex items-center gap-1 text-xs font-bold text-[#0f9d58]" type="button">
                <Plus aria-hidden="true" size={14} />
                Add
              </button>
            </div>
            <div className="grid gap-3">
              {fixture.media.map((media) => (
                <MediaPreview key={media.filename} media={media} />
              ))}
            </div>
            <button
              className="mt-4 flex h-[120px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#cbd5e1] bg-[#f8fafc] text-[#111827]"
              type="button"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5e9] text-[#0f9d58]">
                <Upload aria-hidden="true" size={18} />
              </span>
              <span className="text-xs font-bold">Unggah Lagi</span>
            </button>

            <div className="mt-5 grid gap-3 border-t border-[#e5e7eb] pt-5 text-sm">
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3">
                <p className="m-0 font-bold text-[#111827]">
                  Open hours: {fixture.openHours.days} {fixture.openHours.start}-
                  {fixture.openHours.end}
                </p>
                <p className="m-0 mt-1 text-xs text-[#6b7280]">Fixture-only operational hours row.</p>
              </div>
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3">
                <p className="m-0 font-bold text-[#111827]">Blackout: {fixture.blackout.date}</p>
                <p className="m-0 mt-1 text-xs text-[#6b7280]">{fixture.blackout.reason}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </StaffShell>
  );
}
