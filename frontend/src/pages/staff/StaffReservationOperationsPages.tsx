import {
  Check,
  Clock,
  Download,
  FileText,
  Filter,
  Menu,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../api/http";
import { NotificationSurface } from "../../components/NotificationSurface";
import {
  staffReservationList,
  type StaffBadgeTone,
  type StaffReservationListItem,
  type StaffVerificationItem,
} from "../../fixtures/staffReservationOperations";
import {
  mapStaffReservationListItem,
  mapStaffVerificationItem,
  type StaffReservationOperationResponse,
} from "../../reservations/staffReservationOperations";
import { cn } from "../../utils/cn";

const navItems = [
  { href: "/staff", key: "home", label: "Beranda" },
  { href: "/staff/reservations", key: "reservations", label: "Reservasi" },
  { href: "/staff/facilities", key: "facilities", label: "Fasilitas" },
] as const;

const badgeClasses: Record<StaffBadgeTone, string> = {
  danger: "bg-[#fee2e2] text-[#991b1b]",
  neutral: "bg-[#f3f4f6] text-[#4b5563]",
  success: "bg-[#d1fae5] text-[#065f46]",
  warning: "bg-[#fef3c7] text-[#92400e]",
};

const avatarClasses = {
  dark: "bg-[#064e3b] text-white",
  green: "bg-[#065f46] text-white",
  light: "bg-[#a7f3d0] text-[#065f46]",
  neutral: "bg-[#e5e7eb] text-[#4b5563]",
};

type StaffReservationFilters = {
  date: string;
  facilityId: string;
  status: string;
};

function staffReservationsPath(filters: StaffReservationFilters) {
  const params = new URLSearchParams();

  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.facilityId !== "all") {
    params.set("facility_id", filters.facilityId);
  }

  if (filters.date) {
    params.set("date_from", filters.date);
    params.set("date_to", filters.date);
  }

  const query = params.toString();
  return `/staff/reservations${query ? `?${query}` : ""}`;
}

function fetchStaffVerificationQueue() {
  return apiRequest<StaffReservationOperationResponse[]>("/staff/reservations/verification-queue");
}

function fetchStaffReservations(filters: StaffReservationFilters) {
  return apiRequest<StaffReservationOperationResponse[]>(staffReservationsPath(filters));
}

export function StaffShell({
  active,
  children,
}: {
  active: "facilities" | "home" | "reservations";
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <header className="fixed inset-x-0 top-0 z-50 flex h-[72px] justify-center border-b border-[#e5e7eb] bg-white max-md:h-16">
        <div className="flex h-full w-[1200px] max-w-[95%] items-center justify-between gap-[22px] max-md:max-w-full max-md:px-3.5">
          <div className="flex min-w-0 items-center gap-[22px] max-md:gap-3.5">
            <button
              aria-label="Buka navigasi staff"
              className="hidden text-[#6b7280] max-md:inline-flex"
              type="button"
            >
              <Menu aria-hidden="true" size={24} />
            </button>
            <a
              aria-label="IPB Smart Reserve Hub"
              className="whitespace-nowrap font-serif text-2xl font-bold leading-none text-[#1d7667] no-underline max-md:text-[22px]"
              href="/staff"
            >
              <span className="hidden md:inline">
                IPB
                <br />
                SRH
              </span>
              <span className="md:hidden">IPB SRH</span>
            </a>
            <label className="relative flex h-10 min-w-[232px] items-center text-[#6b7280] max-md:hidden">
              <span className="sr-only">Cari reservasi</span>
              <Search aria-hidden="true" className="absolute left-4 text-slate-400" size={18} />
              <input
                className="h-10 w-[250px] rounded-full border border-[#dbe2ea] bg-gradient-to-b from-white to-slate-50 py-2.5 pl-[42px] pr-4 text-[13px] font-medium leading-5 outline-none focus:border-[#0f9d58] focus:bg-white"
                placeholder="Cari reservasi..."
                type="search"
              />
            </label>
          </div>

          <nav aria-label="Navigasi staff" className="flex items-center gap-10 max-md:hidden">
            {navItems.map((item) => (
              <a
                aria-current={active === item.key ? "page" : undefined}
                className={cn(
                  "border-b-2 border-transparent pb-1 text-sm font-bold text-[#6b7280] no-underline",
                  active === item.key && "border-[#0f9d58] text-[#0f9d58]",
                )}
                href={item.href}
                key={item.key}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-[22px] max-md:gap-3.5">
            <NotificationSurface className="text-[#6b7280]" label="Notifikasi staff" role="staff" />
            <a
              aria-label="Profil Bagus Saputra"
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#0f9d58] text-[13px] font-bold text-white no-underline"
              href="/staff/profile"
            >
              BS
            </a>
          </div>
        </div>
      </header>

      {children}

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
            aria-label="Navigasi footer staff"
            className="flex flex-wrap justify-end gap-x-[18px] gap-y-2.5 text-sm font-semibold text-[#6b7280] max-md:justify-center"
          >
            {navItems.map((item) => (
              <a className="whitespace-nowrap no-underline" href={item.href} key={item.key}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

function StaffAvatar({
  avatar,
  tone,
}: {
  avatar: string;
  tone: keyof typeof avatarClasses;
}) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold max-md:h-9 max-md:w-9",
        avatarClasses[tone],
      )}
    >
      {avatar}
    </span>
  );
}

function StaffStatusBadge({ label, tone }: { label: string; tone: StaffBadgeTone }) {
  const Icon = tone === "success" ? Check : tone === "danger" ? X : tone === "warning" ? Upload : Clock;
  return (
    <span
      className={cn(
        "inline-flex max-w-[190px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold leading-4 max-md:max-w-[150px] max-md:px-2 max-md:py-1 max-md:text-[11px]",
        badgeClasses[tone],
      )}
    >
      <Icon aria-hidden="true" className="shrink-0" size={13} />
      <span className="min-w-0 whitespace-normal break-words">{label}</span>
    </span>
  );
}

function VerificationActionButtons({ item }: { item: StaffVerificationItem }) {
  const detailHref = `/staff/reservations/${item.id}`;

  return (
    <div className="grid items-center gap-3 md:flex md:gap-4 max-md:grid-cols-3 max-md:border-t max-md:border-[#e5e7eb] max-md:pt-4">
      <a
        aria-label={`Unduh dokumen ${item.applicant}`}
        className="inline-flex min-h-10 flex-col items-center justify-center rounded-lg border border-[#e5e7eb] bg-[#f8fafc] text-[#6b7280] md:min-h-0 md:border-0 md:bg-transparent md:p-1"
        href={detailHref}
        title="Unduh"
      >
        <Download aria-hidden="true" size={18} />
        <span className="mt-1 text-[11px] font-bold md:sr-only">Unduh</span>
      </a>
      <a
        aria-label={`Verifikasi ${item.applicant}`}
        className="inline-flex min-h-10 flex-col items-center justify-center rounded-lg border border-[#e5e7eb] bg-[#f8fafc] text-[#10b981] md:min-h-0 md:border-0 md:bg-transparent md:p-1"
        href={detailHref}
        title="Verifikasi"
      >
        <Check aria-hidden="true" size={18} />
        <span className="mt-1 text-[11px] font-bold md:sr-only">Verifikasi</span>
      </a>
      <a
        aria-label={`Tolak ${item.applicant}`}
        className="inline-flex min-h-10 flex-col items-center justify-center rounded-lg border border-[#e5e7eb] bg-[#f8fafc] text-[#ef4444] md:min-h-0 md:border-0 md:bg-transparent md:p-1"
        href={detailHref}
        title="Tolak"
      >
        <X aria-hidden="true" size={18} />
        <span className="mt-1 text-[11px] font-bold md:sr-only">Tolak</span>
      </a>
    </div>
  );
}

function VerificationRow({ item }: { item: StaffVerificationItem }) {
  return (
    <tr className="max-md:grid max-md:grid-cols-[1fr_auto] max-md:gap-4 max-md:rounded-xl max-md:border max-md:border-[#e5e7eb] max-md:bg-white max-md:p-4 max-md:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-middle max-md:col-start-1 max-md:row-start-1 max-md:border-0 max-md:p-0">
        <div className="flex min-w-0 items-center gap-4 max-md:gap-3">
          <StaffAvatar avatar={item.avatar} tone={item.avatarTone} />
          <div className="min-w-0">
            <p className="m-0 break-words text-sm font-bold text-[#111827]">{item.applicant}</p>
            <p className="m-0 mt-0.5 break-words text-xs text-[#6b7280]">{item.role}</p>
          </div>
        </div>
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 text-sm font-semibold text-[#111827] max-md:col-start-1 max-md:row-start-2 max-md:border-0 max-md:p-0 max-md:before:block max-md:before:text-[10px] max-md:before:font-bold max-md:before:uppercase max-md:before:tracking-[0.08em] max-md:before:text-[#6b7280] max-md:before:content-['Nama_Fasilitas']">
        {item.facility}
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 text-sm font-semibold text-[#111827] max-md:col-start-2 max-md:row-start-2 max-md:border-0 max-md:p-0 max-md:text-right max-md:before:block max-md:before:text-[10px] max-md:before:font-bold max-md:before:uppercase max-md:before:tracking-[0.08em] max-md:before:text-[#6b7280] max-md:before:content-['Tanggal_Pengajuan']">
        {item.date}
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-middle max-md:col-start-2 max-md:row-start-1 max-md:border-0 max-md:p-0 max-md:text-right">
        <StaffStatusBadge label={item.status} tone={item.tone} />
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-middle max-md:col-span-2 max-md:row-start-3 max-md:border-0 max-md:p-0">
        <VerificationActionButtons item={item} />
      </td>
    </tr>
  );
}

function ReservationRow({ item }: { item: StaffReservationListItem }) {
  return (
    <tr className="max-md:grid max-md:grid-cols-[1fr_auto] max-md:gap-4 max-md:rounded-xl max-md:border max-md:border-[#e5e7eb] max-md:bg-white max-md:p-4 max-md:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-middle max-md:col-start-1 max-md:row-start-1 max-md:border-0 max-md:p-0">
        <div className="flex min-w-0 items-center gap-4 max-md:gap-3">
          <StaffAvatar avatar={item.avatar} tone={item.avatarTone} />
          <div className="min-w-0">
            <p className="m-0 break-words text-sm font-bold text-[#111827]">{item.applicant}</p>
            <p className="m-0 mt-0.5 break-words text-xs text-[#6b7280]">{item.role}</p>
          </div>
        </div>
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 text-sm font-semibold text-[#111827] max-md:col-start-1 max-md:row-start-2 max-md:border-0 max-md:p-0 max-md:before:block max-md:before:text-[10px] max-md:before:font-bold max-md:before:uppercase max-md:before:tracking-[0.08em] max-md:before:text-[#6b7280] max-md:before:content-['Fasilitas']">
        {item.facility}
        <span className="mt-1 block text-xs font-normal text-[#6b7280]">{item.activity}</span>
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 text-sm font-semibold text-[#111827] max-md:col-start-2 max-md:row-start-2 max-md:border-0 max-md:p-0 max-md:text-right max-md:before:block max-md:before:text-[10px] max-md:before:font-bold max-md:before:uppercase max-md:before:tracking-[0.08em] max-md:before:text-[#6b7280] max-md:before:content-['Jadwal']">
        {item.date}
        <span className="mt-1 block text-xs font-normal text-[#6b7280]">{item.time}</span>
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-middle max-md:col-start-2 max-md:row-start-1 max-md:border-0 max-md:p-0 max-md:text-right">
        <StaffStatusBadge label={item.status} tone={item.tone} />
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-middle max-md:col-span-2 max-md:row-start-3 max-md:border-0 max-md:p-0 max-md:border-t max-md:border-[#e5e7eb] max-md:pt-4">
        <a
          aria-label={`Lihat Detail ${item.applicant}`}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-4 text-center text-[13px] font-bold text-[#0f9d58] no-underline md:min-h-0 md:w-auto md:border-0 md:bg-transparent md:p-0"
          href={item.detailHref}
        >
          Lihat Detail
        </a>
      </td>
    </tr>
  );
}

export function StaffHomePage() {
  const queueQuery = useQuery({
    queryFn: fetchStaffVerificationQueue,
    queryKey: ["staff-verification-queue"],
  });
  const verificationItems = queueQuery.data?.map(mapStaffVerificationItem) ?? [];
  const pendingCount = queueQuery.data?.length ?? 0;
  const visibleCount = verificationItems.length;

  return (
    <StaffShell active="reservations">
      <main className="mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[92px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
        <section className="max-w-[620px]">
          <h1 className="m-0 text-[32px] font-bold leading-tight max-md:text-[32px]">
            Hub Verifikasi
          </h1>
          <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
            Tinjau pengajuan reservasi, verifikasi dokumen, dan kelola akses fasilitas kampus
            dalam satu tampilan operasional.
          </p>
        </section>

        <section className="mt-8 flex w-[380px] max-w-full items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-8 py-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:mt-6 max-md:w-full max-md:px-5 max-md:py-5">
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
              MENUNGGU VERIFIKASI
            </p>
            <p className="m-0 mt-2 text-4xl font-bold leading-none text-[#111827] max-md:text-[32px]">
              {queueQuery.isLoading ? "..." : pendingCount}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fef3c7] text-[#92400e]">
            <FileText aria-hidden="true" size={22} />
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:mt-9 max-md:overflow-visible max-md:border-0 max-md:bg-transparent max-md:shadow-none">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-8 py-6 max-md:border-0 max-md:px-0 max-md:py-0 max-md:pb-4">
            <h2 className="m-0 text-lg font-bold text-[#111827] max-md:text-xl">
              Pengajuan Reservasi
            </h2>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-bold text-[#6b7280]"
              type="button"
            >
              <Filter aria-hidden="true" size={15} />
              Filter
            </button>
          </div>

          <table className="w-full border-collapse text-left max-md:block">
            <thead className="bg-[#f9fafb] max-md:hidden">
              <tr>
                <th className="border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Pemohon
                </th>
                <th className="border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Nama Fasilitas
                </th>
                <th className="border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Tanggal Pengajuan
                </th>
                <th className="border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Status Dokumen
                </th>
                <th className="border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="max-md:block max-md:space-y-4">
              {queueQuery.isLoading ? (
                <tr>
                  <td className="px-8 py-8 text-sm font-semibold text-[#6b7280]" colSpan={5}>
                    Memuat antrian verifikasi...
                  </td>
                </tr>
              ) : null}
              {queueQuery.isError ? (
                <tr>
                  <td className="px-8 py-8" colSpan={5}>
                    <div className="rounded-xl border border-[#fee2e2] bg-[#fef2f2] p-5">
                      <p className="m-0 text-sm font-bold text-[#991b1b]">
                        Antrian verifikasi belum dapat dimuat.
                      </p>
                      <button
                        className="mt-3 rounded-md border border-[#fecaca] bg-white px-4 py-2 text-[13px] font-bold text-[#991b1b]"
                        onClick={() => queueQuery.refetch()}
                        type="button"
                      >
                        Muat ulang antrian verifikasi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : null}
              {queueQuery.isSuccess && verificationItems.length === 0 ? (
                <tr>
                  <td className="px-8 py-8 text-sm font-semibold text-[#6b7280]" colSpan={5}>
                    Tidak ada pengajuan yang menunggu verifikasi.
                  </td>
                </tr>
              ) : null}
              {queueQuery.isSuccess
                ? verificationItems.map((item) => (
                  <VerificationRow item={item} key={item.id} />
                ))
                : null}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-white px-8 py-5 max-md:flex-col max-md:gap-4 max-md:border-0 max-md:bg-transparent max-md:px-0 max-md:py-6 max-md:text-center">
            <p className="m-0 text-[13px] text-[#6b7280]">
              Menampilkan {visibleCount} dari {pendingCount} pengajuan yang menunggu verifikasi
            </p>
            <div className="flex gap-2">
              <button
                className="rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2 text-[13px] font-semibold text-[#9ca3af]"
                disabled
                type="button"
              >
                Sebelumnya
              </button>
              <button
                className="rounded-md border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827]"
                type="button"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </section>
      </main>
    </StaffShell>
  );
}

export function StaffReservationListPage() {
  const [filters, setFilters] = useState<StaffReservationFilters>({
    date: "",
    facilityId: "all",
    status: "all",
  });
  const reservationsQuery = useQuery({
    queryFn: () => fetchStaffReservations(filters),
    queryKey: ["staff-reservations", filters],
  });
  const reservations = useMemo(
    () => reservationsQuery.data?.map(mapStaffReservationListItem) ?? [],
    [reservationsQuery.data],
  );
  const facilityOptions = useMemo(() => {
    const byId = new Map<string, string>();

    for (const item of reservations) {
      if (item.facilityId) {
        byId.set(item.facilityId, item.facility);
      }
    }

    for (const item of staffReservationList) {
      if (item.facilityId) {
        byId.set(item.facilityId, item.facility);
      }
    }

    return Array.from(byId, ([id, name]) => ({ id, name }));
  }, [reservations]);

  return (
    <StaffShell active="reservations">
      <main className="mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
        <section className="max-w-[650px]">
          <h1 className="m-0 text-[32px] font-bold leading-tight max-md:text-[30px]">
            Semua Reservasi
          </h1>
          <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
            Daftar lengkap reservasi fasilitas departemen, termasuk pengajuan mendatang, aktif,
            selesai, dan ditolak.
          </p>
        </section>

        <section className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-[#e5e7eb] bg-white px-6 py-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:flex-col max-md:items-stretch max-md:p-4">
          <div className="flex flex-wrap items-center gap-4 max-md:grid max-md:grid-cols-2 max-md:gap-3">
            <label className="min-w-0">
              <span className="sr-only">Filter fasilitas</span>
              <select
                aria-label="Filter fasilitas"
                className="h-10 w-full rounded-md border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none"
                onChange={(event) => setFilters((current) => ({ ...current, facilityId: event.target.value }))}
                value={filters.facilityId}
              >
                <option value="all">Semua Fasilitas</option>
                {facilityOptions.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0">
              <span className="sr-only">Filter status</span>
              <select
                aria-label="Filter status"
                className="h-10 w-full rounded-md border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none"
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                value={filters.status}
              >
                <option value="all">Semua Status</option>
                <option value="approved">Disetujui</option>
                <option value="pending_document_review">Menunggu Verifikasi Dokumen</option>
                <option value="pending_payment">Menunggu Pembayaran</option>
                <option value="cancellation_requested">Menunggu Pembatalan</option>
              </select>
            </label>
            <label className="min-w-0 max-md:col-span-2">
              <span className="sr-only">Tanggal reservasi</span>
              <input
                aria-label="Tanggal reservasi"
                className="h-10 w-full rounded-md border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none"
                onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
                type="date"
                value={filters.date}
              />
            </label>
          </div>
          <p className="m-0 whitespace-nowrap text-sm font-semibold text-[#6b7280] max-md:whitespace-normal">
            Menampilkan {reservations.length} hasil
          </p>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:overflow-visible max-md:border-0 max-md:bg-transparent max-md:shadow-none">
          <table className="w-full border-collapse text-left max-md:block">
            <thead className="bg-[#f9fafb] max-md:hidden">
              <tr>
                <th className="w-[24%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Pemohon
                </th>
                <th className="w-[28%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Fasilitas
                </th>
                <th className="w-[18%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Jadwal
                </th>
                <th className="w-[17%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Status
                </th>
                <th className="w-[13%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="max-md:block max-md:space-y-4">
              {reservationsQuery.isLoading ? (
                <tr>
                  <td className="px-8 py-8 text-sm font-semibold text-[#6b7280]" colSpan={5}>
                    Memuat daftar reservasi...
                  </td>
                </tr>
              ) : null}
              {reservationsQuery.isError ? (
                <tr>
                  <td className="px-8 py-8" colSpan={5}>
                    <div className="rounded-xl border border-[#fee2e2] bg-[#fef2f2] p-5">
                      <p className="m-0 text-sm font-bold text-[#991b1b]">
                        Daftar reservasi belum dapat dimuat.
                      </p>
                      <button
                        className="mt-3 rounded-md border border-[#fecaca] bg-white px-4 py-2 text-[13px] font-bold text-[#991b1b]"
                        onClick={() => reservationsQuery.refetch()}
                        type="button"
                      >
                        Muat ulang daftar reservasi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : null}
              {reservationsQuery.isSuccess && reservations.length === 0 ? (
                <tr>
                  <td className="px-8 py-8 text-sm font-semibold text-[#6b7280]" colSpan={5}>
                    Tidak ada reservasi untuk filter ini.
                  </td>
                </tr>
              ) : null}
              {reservationsQuery.isSuccess
                ? reservations.map((item) => (
                  <ReservationRow item={item} key={item.id} />
                ))
                : null}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-white px-8 py-5 max-md:flex-col max-md:gap-4 max-md:border-0 max-md:bg-transparent max-md:px-0 max-md:py-6 max-md:text-center">
            <p className="m-0 text-[13px] text-[#6b7280]">
              Menampilkan {reservations.length} dari {reservations.length} total reservasi
            </p>
            <div className="flex gap-2">
              <button
                className="rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2 text-[13px] font-semibold text-[#9ca3af]"
                disabled
                type="button"
              >
                Sebelumnya
              </button>
              <button
                className="rounded-md border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827]"
                type="button"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </section>
      </main>
    </StaffShell>
  );
}
