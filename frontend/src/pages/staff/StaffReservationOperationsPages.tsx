import {
  Check,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Eye,
  FileText,
  Filter,
  Home,
  LogOut,
  Menu,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../api/http";
import { useAuth } from "../../auth/session";
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
import logo from "../../assets/logo.png";

const navItems = [
  { href: "/staff", icon: Home, key: "home", label: "Beranda" },
  { href: "/staff/reservations", icon: FileText, key: "reservations", label: "Reservasi" },
  { href: "/staff/facilities", icon: Building2, key: "facilities", label: "Fasilitas" },
] as const;

const badgeClasses: Record<StaffBadgeTone, string> = {
  danger: "bg-[#fee2e2] text-[#991b1b]",
  info: "bg-[#dbeafe] text-[#1d4ed8]",
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

function isActionableQueueItem(item: StaffReservationOperationResponse) {
  return item.workflow_type === "document_review" || item.workflow_type === "payment_review";
}

export function StaffShell({
  active,
  children,
}: {
  active: "facilities" | "home" | "reservations";
  children: ReactNode;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const auth = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <header className="fixed inset-x-0 top-0 z-50 flex h-[72px] justify-center border-b border-[#e5e7eb] bg-white max-md:h-16">
        <div className="flex h-full w-[1200px] max-w-[95%] items-center justify-between gap-[22px] max-md:max-w-full max-md:px-3.5">
          <div className="flex min-w-0 items-center gap-[22px] max-md:gap-3.5">
            <button
              aria-label="Buka navigasi staff"
              className="hidden text-[#6b7280] max-md:inline-flex"
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <Menu aria-hidden="true" size={24} />
            </button>
          <a
            aria-label="IPB Smart Reserve Hub"
            className="flex shrink-0 items-center no-underline"
            href="/student"
          >
            <img
              src={logo}
              alt="IPB Smart Reserve Hub"
              className="h-10 w-auto max-md:h-9"
            />
          </a>
          </div>

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

      <aside
        aria-label="Navigasi staff utama"
        className="group fixed left-0 top-[72px] z-40 hidden h-[calc(100vh-72px)] w-[78px] overflow-hidden border-r border-[#e5e7eb] bg-white/95 shadow-none backdrop-blur transition-[width,box-shadow] duration-200 hover:w-[244px] hover:shadow-[8px_0_28px_rgba(15,23,42,0.08)] max-md:hidden md:flex"
      >
        <div className="flex h-full w-full flex-col px-2 py-4">
          <div className="mb-4 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af]">
            <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Menu staff
            </span>
            <ChevronRight
              aria-hidden="true"
              className="shrink-0 text-[#9ca3af] transition-transform duration-200 group-hover:rotate-180"
              size={16}
            />
          </div>

          <nav aria-label="Menu utama staff" className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;

              return (
                <a
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-center gap-0 rounded-[12px] px-3 py-3 text-sm font-bold text-[#6b7280] no-underline transition-colors hover:bg-[#f8fafc] hover:text-[#111827] group-hover:justify-start group-hover:gap-3",
                    isActive && "bg-[#e8f5e9] text-[#0f9d58]",
                  )}
                  href={item.href}
                  key={item.key}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8fafc] transition-colors group-hover:bg-[#eef7f1]",
                      isActive && "bg-white",
                    )}
                  >
                    <Icon aria-hidden="true" size={18} />
                  </span>
                  <span className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:w-auto group-hover:translate-x-0 group-hover:opacity-100">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>
          <button
            aria-label="Keluar"
            className="mt-auto flex w-full items-center justify-center gap-0 rounded-[12px] px-3 py-3 text-sm font-bold text-[#b91c1c] transition-colors hover:bg-[#fef2f2] group-hover:justify-start group-hover:gap-3"
            onClick={() => auth.logout()}
            type="button"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fee2e2]">
              <LogOut aria-hidden="true" size={18} />
            </span>
            <span className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:w-auto group-hover:translate-x-0 group-hover:opacity-100">
              Keluar
            </span>
          </button>
        </div>
      </aside>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-[60] bg-slate-950/35 md:hidden" onClick={() => setIsMobileNavOpen(false)}>
          <aside
            aria-label="Navigasi staff mobile"
            className="flex h-full w-[304px] max-w-[84%] flex-col bg-white px-[18px] py-4 shadow-[0_10px_30px_rgba(15,23,42,0.16)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-[18px] flex items-center justify-between">
              <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] p-3.5">
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#0f9d58] text-[13px] font-bold text-white">
                  BS
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#111827]">Bagus Saputra</div>
                  <div className="truncate text-xs text-[#6b7280]">staff@ipb.ac.id</div>
                </div>
              </div>
              <button
                aria-label="Tutup navigasi staff"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280]"
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5" aria-label="Navigasi staff utama">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;

                return (
                  <a
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-[10px] px-2.5 py-3 text-sm font-bold text-[#6b7280] no-underline",
                      isActive && "bg-[#e8f5e9] text-[#0f9d58]",
                    )}
                    href={item.href}
                    key={item.key}
                  >
                    <span className="flex w-6 justify-center">
                      <Icon aria-hidden="true" size={18} />
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </nav>
            <button
              aria-label="Keluar"
              className="mt-auto flex items-center gap-3 rounded-[10px] px-2.5 py-3 text-sm font-bold text-[#b91c1c]"
              onClick={() => auth.logout()}
              type="button"
            >
              <span className="flex w-6 justify-center">
                <LogOut aria-hidden="true" size={18} />
              </span>
              Keluar
            </button>
          </aside>
        </div>
      ) : null}

      <div className="pb-20 md:pl-[78px] max-md:pb-14">{children}</div>
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
        "inline-flex w-max max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold leading-4 max-md:px-2.5 max-md:text-[11px]",
        badgeClasses[tone],
      )}
    >
      <Icon aria-hidden="true" className="shrink-0" size={13} />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

function StaffReservationActionLink({
  applicant,
  href,
  label,
}: {
  applicant: string;
  href: string;
  label: string;
}) {
  const isReviewAction = label === "Tinjau Pengajuan";
  const Icon = isReviewAction ? ClipboardCheck : Eye;

  return (
    <a
      aria-label={`${label} ${applicant}`}
      className={cn(
        "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-center no-underline shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f9d58]",
        isReviewAction
          ? "border-[#0f9d58] bg-[#0f9d58] text-white hover:bg-[#0b7340]"
          : "border-[#0f9d58] bg-white text-[#0f9d58] hover:bg-[#e8f5e9]",
      )}
      href={href}
      title={label}
    >
      <Icon aria-hidden="true" size={22} strokeWidth={2.4} />
    </a>
  );
}

function VerificationActionButtons({ item }: { item: StaffVerificationItem }) {
  const detailHref = `/staff/reservations/${item.id}`;

  return (
    <div className="flex justify-start max-md:border-t max-md:border-[#e5e7eb] max-md:pt-4 md:justify-center">
      <StaffReservationActionLink
        applicant={item.applicant}
        href={detailHref}
        label={item.actionLabel}
      />
    </div>
  );
}

function VerificationRow({ item }: { item: StaffVerificationItem }) {
  return (
    <tr className="max-md:grid max-md:grid-cols-1 max-md:gap-4 max-md:rounded-xl max-md:border max-md:border-[#e5e7eb] max-md:bg-white max-md:p-4 max-md:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-middle max-md:col-start-1 max-md:row-start-1 max-md:border-0 max-md:p-0">
        <div className="flex min-w-0 items-center gap-4 max-md:gap-3">
          <StaffAvatar avatar={item.avatar} tone={item.avatarTone} />
          <div className="min-w-0">
            <p className="m-0 break-words text-sm font-bold text-[#111827]">{item.applicant}</p>
            <p className="m-0 mt-0.5 break-words text-xs text-[#6b7280]">{item.role}</p>
          </div>
        </div>
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 text-sm font-semibold text-[#111827] max-md:col-start-1 max-md:row-start-3 max-md:border-0 max-md:p-0 max-md:before:block max-md:before:text-[10px] max-md:before:font-bold max-md:before:uppercase max-md:before:tracking-[0.08em] max-md:before:text-[#6b7280] max-md:before:content-['Fasilitas']">
        {item.facility}
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 text-sm font-semibold text-[#111827] max-md:col-start-1 max-md:row-start-4 max-md:border-0 max-md:p-0 max-md:text-left max-md:before:block max-md:before:text-[10px] max-md:before:font-bold max-md:before:uppercase max-md:before:tracking-[0.08em] max-md:before:text-[#6b7280] max-md:before:content-['Jadwal']">
        {item.date}
      </td>
      <td className="border-b border-[#e5e7eb] px-4 py-5 align-middle max-md:col-start-1 max-md:row-start-2 max-md:border-0 max-md:p-0 max-md:text-left">
        <StaffStatusBadge label={item.status} tone={item.tone} />
      </td>
      <td className="border-b border-[#e5e7eb] px-4 py-5 align-middle max-md:col-start-1 max-md:row-start-5 max-md:border-0 max-md:p-0">
        <VerificationActionButtons item={item} />
      </td>
    </tr>
  );
}

function ReservationRow({ item }: { item: StaffReservationListItem }) {
  return (
    <tr className="max-md:grid max-md:grid-cols-1 max-md:gap-4 max-md:rounded-xl max-md:border max-md:border-[#e5e7eb] max-md:bg-white max-md:p-4 max-md:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <td className="border-b border-[#e5e7eb] px-8 py-5 align-middle max-md:col-start-1 max-md:row-start-1 max-md:border-0 max-md:p-0">
        <div className="flex min-w-0 items-center gap-4 max-md:gap-3">
          <StaffAvatar avatar={item.avatar} tone={item.avatarTone} />
          <div className="min-w-0">
            <p className="m-0 break-words text-sm font-bold text-[#111827]">{item.applicant}</p>
            <p className="m-0 mt-0.5 break-words text-xs text-[#6b7280]">{item.role}</p>
          </div>
        </div>
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 text-sm font-semibold text-[#111827] max-md:col-start-1 max-md:row-start-3 max-md:border-0 max-md:p-0 max-md:before:block max-md:before:text-[10px] max-md:before:font-bold max-md:before:uppercase max-md:before:tracking-[0.08em] max-md:before:text-[#6b7280] max-md:before:content-['Fasilitas']">
        {item.facility}
        <span className="mt-1 block text-xs font-normal text-[#6b7280]">{item.activity}</span>
      </td>
      <td className="border-b border-[#e5e7eb] px-8 py-5 text-sm font-semibold text-[#111827] max-md:col-start-1 max-md:row-start-4 max-md:border-0 max-md:p-0 max-md:text-left max-md:before:block max-md:before:text-[10px] max-md:before:font-bold max-md:before:uppercase max-md:before:tracking-[0.08em] max-md:before:text-[#6b7280] max-md:before:content-['Jadwal']">
        {item.date}
        <span className="mt-1 block text-xs font-normal text-[#6b7280]">{item.time}</span>
      </td>
      <td className="border-b border-[#e5e7eb] px-4 py-5 align-middle max-md:col-start-1 max-md:row-start-2 max-md:border-0 max-md:p-0 max-md:text-left">
        <StaffStatusBadge label={item.status} tone={item.tone} />
      </td>
      <td className="border-b border-[#e5e7eb] px-4 py-5 align-middle max-md:col-start-1 max-md:row-start-5 max-md:border-0 max-md:p-0 max-md:border-t max-md:border-[#e5e7eb] max-md:pt-4">
        <div className="flex justify-start md:justify-center">
          <StaffReservationActionLink
            applicant={item.applicant}
            href={item.detailHref}
            label={item.actionLabel}
          />
        </div>
      </td>
    </tr>
  );
}

export function StaffHomePage() {
  const queueQuery = useQuery({
    queryFn: fetchStaffVerificationQueue,
    queryKey: ["staff-verification-queue"],
  });
  const actionableQueue = queueQuery.data?.filter(isActionableQueueItem) ?? [];
  const verificationItems = actionableQueue.map(mapStaffVerificationItem);
  const pendingCount = actionableQueue.length;
  const visibleCount = verificationItems.length;

  return (
    <StaffShell active="home">
      <main className="mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[92px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
        <section className="max-w-[620px]">
          <h1 className="m-0 text-[32px] font-bold leading-tight max-md:text-[32px]">
            Hub Verifikasi
          </h1>
          <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
            Tinjau pengajuan reservasi, verifikasi dokumen, dan kelola akses fasilitas kampus
            dalam satu antrean yang hanya menampilkan pekerjaan yang perlu tindakan.
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
            <a
              className="inline-flex items-center gap-2 rounded-md border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-bold text-[#6b7280] no-underline"
              href="/staff/reservations"
            >
              <Filter aria-hidden="true" size={15} />
              Filter
            </a>
          </div>

          <table className="w-full border-collapse text-left max-md:block">
            <thead className="bg-[#f9fafb] max-md:hidden">
              <tr>
                <th className="w-[22%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Pemohon
                </th>
                <th className="w-[27%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Fasilitas
                </th>
                <th className="w-[16%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Jadwal
                </th>
                <th className="w-[21%] border-b border-[#e5e7eb] px-4 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Status
                </th>
                <th className="w-[14%] border-b border-[#e5e7eb] px-4 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
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
                className="rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2 text-[13px] font-semibold text-[#9ca3af]"
                disabled
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
                <th className="w-[22%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Pemohon
                </th>
                <th className="w-[27%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Fasilitas
                </th>
                <th className="w-[16%] border-b border-[#e5e7eb] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Jadwal
                </th>
                <th className="w-[21%] border-b border-[#e5e7eb] px-4 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  Status
                </th>
                <th className="w-[14%] border-b border-[#e5e7eb] px-4 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
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
                className="rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2 text-[13px] font-semibold text-[#9ca3af]"
                disabled
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
