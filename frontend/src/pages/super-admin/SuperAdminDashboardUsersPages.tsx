import {
  AlertTriangle,
  Briefcase,
  Building2,
  CalendarDays,
  GraduationCap,
  Menu,
  Plus,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../api/http";
import { NotificationSurface } from "../../components/NotificationSurface";
import {
  superAdminNav,
} from "../../fixtures/superAdminDashboardUsers";
import { cn } from "../../utils/cn";

type SuperAdminActive = (typeof superAdminNav)[number]["key"];

type SuperAdminDashboardResponse = {
  administrators?: SuperAdminDashboardAdministratorResponse[];
  facility_governance?: SuperAdminFacilityGovernanceResponse[];
  kpis: {
    active_facilities: number;
    system_health: string;
    total_reservations: number;
    total_users: number;
  };
  recent_activity?: SuperAdminAuditLogResponse[];
  system_status: {
    application: { name: string; version: string };
    backend: { status: string };
    database: { status: string };
    storage: { status: string };
    worker: { status: string };
  };
};

type SuperAdminDashboardAdministratorResponse = {
  email: string;
  full_name: string;
  id: string;
  is_active: boolean;
  role: string;
};

type SuperAdminFacilityGovernanceResponse = {
  active_assigned_staff_count: number;
  assigned_staff_count: number;
  assignment_coverage: string;
  capacity: number;
  category: string;
  id: string;
  is_active: boolean;
  issue_flags: string[];
  location: string;
  name: string;
};

type SuperAdminAuditLogResponse = {
  action_type: string;
  actor_email: string | null;
  created_at: string;
  id: string;
  target_id: string;
  target_type: string;
};

function fetchSuperAdminDashboard() {
  return apiRequest<SuperAdminDashboardResponse>("/admin/dashboard");
}

function fetchFacilityGovernance() {
  return apiRequest<SuperAdminFacilityGovernanceResponse[]>("/admin/facilities/governance");
}

function assignFacilityStaff(facilityId: string, staffId: string) {
  return apiRequest<{ facility_id: string; staff_id: string }>(
    `/admin/facilities/${facilityId}/staff-assignments/${staffId}`,
    { method: "PUT" },
  ).then(() => undefined);
}

function unassignFacilityStaff(facilityId: string, staffId: string) {
  return apiRequest<void>(`/admin/facilities/${facilityId}/staff-assignments/${staffId}`, {
    method: "DELETE",
  });
}

type ReportDateRange = {
  end: string;
  start: string;
};

type SuperAdminReportAggregateResponse = {
  kpis: {
    approved_reservations: number;
    completed_reservations: number;
    paid_reservation_total_rupiah: number;
    rejected_reservations: number;
    total_reservations: number;
  };
  status_counts: Record<string, number>;
  trend: SuperAdminReportTrendPointResponse[];
};

type SuperAdminReportTrendPointResponse = {
  date: string;
  paid_total_rupiah: number;
  reservation_count: number;
};

type AdminAuditLogResponse = {
  action_type: string;
  actor_email: string | null;
  actor_id: string | null;
  created_at: string;
  facility_id: string | null;
  id: string;
  reservation_id: string | null;
  student_id: string | null;
  target_id: string;
  target_type: string;
};

type AdminReviewResponse = {
  admin_removal_reason: string | null;
  comment: string | null;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
  facility_id: string;
  facility_name: string;
  id: string;
  is_deleted: boolean;
  rating: number;
  reservation_id: string;
  student_id: string;
  student_name: string;
};

function reportRangeParams(range: ReportDateRange) {
  return {
    end: `${range.end}T23:59:59.999Z`,
    start: `${range.start}T00:00:00.000Z`,
  };
}

function fetchReportAggregate(range: ReportDateRange) {
  const rangeParams = reportRangeParams(range);
  const params = new URLSearchParams({ start: rangeParams.start, end: rangeParams.end });
  return apiRequest<SuperAdminReportAggregateResponse>(`/admin/reports/aggregate?${params.toString()}`);
}

function fetchAdminAuditLogs(range: ReportDateRange) {
  const rangeParams = reportRangeParams(range);
  const params = new URLSearchParams({ created_from: rangeParams.start, created_to: rangeParams.end });
  return apiRequest<AdminAuditLogResponse[]>(`/admin/audit-logs?${params.toString()}`);
}

function fetchAdminReviews() {
  return apiRequest<AdminReviewResponse[]>("/admin/reviews");
}

function deleteAdminReview(reviewId: string) {
  return apiRequest<AdminReviewResponse>(`/admin/reviews/${reviewId}/delete`, {
    body: { reason: "Moderasi Super Admin" },
    method: "POST",
  });
}

function restoreAdminReview(reviewId: string) {
  return apiRequest<AdminReviewResponse>(`/admin/reviews/${reviewId}/restore`, {
    method: "POST",
  });
}

type SystemStatusResponse = {
  application: { name: string; version: string };
  backend: { status: string };
  database: { status: string };
  storage: { status: string };
  worker: { status: string };
};

type BookingSettingsResponse = {
  allowed_student_email_domains: string[];
  document_upload_due_hours: number;
  document_verification_due_hours: number;
  final_approval_cutoff_hours: number;
  max_booking_advance_hours: number;
  min_booking_lead_hours: number;
  overdue_final_approval_cutoff_hours: number;
  payment_upload_due_hours: number;
  payment_verification_due_hours: number;
};

function fetchSystemStatus() {
  return apiRequest<SystemStatusResponse>("/admin/system-status");
}

function fetchBookingSettings() {
  return apiRequest<BookingSettingsResponse>("/admin/settings");
}

function updateBookingSettings(body: BookingSettingsResponse) {
  return apiRequest<BookingSettingsResponse>("/admin/settings", { body, method: "PATCH" });
}

type UserRoleValue = "staff" | "student" | "super_admin";

type AdminUserResponse = {
  academic_profile: {
    degree: string | null;
    entry_year: number | null;
    faculty: string | null;
    program_studi: string | null;
  } | null;
  email: string;
  full_name: string;
  id: string;
  is_active: boolean;
  nim: string | null;
  phone: string | null;
  role: UserRoleValue;
};

type AdminUsersResponse = {
  items: AdminUserResponse[];
  page: number;
  page_size: number;
  total: number;
};

type UserFilters = {
  isActive: string;
  page: number;
  pageSize: number;
  role: string;
  search: string;
};

function adminUsersPath(filters: UserFilters) {
  const params = new URLSearchParams();
  if (filters.role !== "all") params.set("role", filters.role);
  if (filters.isActive !== "all") params.set("is_active", filters.isActive);
  if (filters.search.trim()) params.set("search", filters.search.trim());
  params.set("page", String(filters.page));
  params.set("page_size", String(filters.pageSize));
  return `/admin/users?${params.toString()}`;
}

function fetchAdminUsers(filters: UserFilters) {
  return apiRequest<AdminUsersResponse>(adminUsersPath(filters));
}

function createAdminUser(body: { email: string; full_name: string; is_active: boolean; password: string; role: string }) {
  return apiRequest<AdminUserResponse>("/admin/users", { body, method: "POST" });
}

function setAdminUserStatus(userId: string, active: boolean) {
  return apiRequest<AdminUserResponse>(`/admin/users/${userId}/${active ? "activate" : "deactivate"}`, {
    method: "POST",
  });
}

const kpiTone = {
  alert: "bg-[#ede9fe] text-[#6366f1]",
  blue: "bg-[#dff4ff] text-[#0ea5e9]",
  green: "bg-[#d1fae5] text-[#10b981]",
  orange: "bg-[#ffedd5] text-[#f97316]",
  purple: "bg-[#ede9fe] text-[#6366f1]",
};

function SuperIcon({ name, size = 18 }: { name: string; size?: number }) {
  const props = { "aria-hidden": true, size };
  switch (name) {
    case "alert":
      return <AlertTriangle {...props} />;
    case "briefcase":
      return <Briefcase {...props} />;
    case "building":
      return <Building2 {...props} />;
    case "calendar":
      return <CalendarDays {...props} />;
    case "graduation":
      return <GraduationCap {...props} />;
    case "file":
      return <Briefcase {...props} />;
    case "settings":
      return <Settings {...props} />;
    case "user":
      return <User {...props} />;
    case "x":
      return <X {...props} />;
    default:
      return <Users {...props} />;
  }
}

export function SuperAdminShell({
  active,
  children,
}: {
  active: SuperAdminActive;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex h-[72px] w-[1200px] max-w-[95%] items-center justify-between max-md:h-16 max-md:max-w-full max-md:px-4">
          <div className="flex items-center gap-5">
            <button
              aria-label="Buka navigasi"
              className="hidden text-[#6b7280] max-md:inline-flex"
              type="button"
            >
              <Menu aria-hidden="true" size={24} />
            </button>
            <a
              aria-label="IPB Smart Reserve Hub"
              className="font-serif text-2xl font-bold leading-none text-[#1d7667] no-underline max-md:text-[22px]"
              href="/super-admin"
            >
              <span className="hidden md:inline">
                IPB
                <br />
                SRH
              </span>
              <span className="md:hidden">IPB SRH</span>
            </a>
          </div>

          <nav aria-label="Super Admin utama" className="flex items-center gap-10 max-md:hidden">
            {superAdminNav.map((item) => (
              <a
                aria-current={item.key === active ? "page" : undefined}
                className={cn(
                  "border-b-2 border-transparent pb-1 text-sm font-bold text-[#6b7280] no-underline",
                  item.key === active && "border-[#6366f1] text-[#6366f1]",
                )}
                href={item.href}
                key={item.key}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-[22px] max-md:gap-3.5">
            <NotificationSurface className="text-[#6b7280]" role="super_admin" />
            <a
              aria-label="Profil Super Admin"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#6366f1] text-[13px] font-bold text-white no-underline"
              href="/super-admin/profile"
            >
              SA
            </a>
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-20 border-t border-[#e5e7eb] bg-white">
        <div className="mx-auto flex min-h-[72px] w-[1200px] max-w-[95%] items-center justify-between gap-8 py-5 max-md:max-w-full max-md:flex-col max-md:gap-3.5 max-md:px-4 max-md:text-center">
          <div className="flex items-center gap-4 max-md:flex-col max-md:gap-2">
            <p className="m-0 font-serif text-[30px] font-bold leading-none text-[#4da38b]">
              IPB SRH
            </p>
            <p className="m-0 text-[13px] text-[#6b7280]">
              © 2026 IPB Smart Reserve Hub. Hak cipta dilindungi.
            </p>
          </div>
          <nav className="flex flex-wrap justify-end gap-x-[18px] gap-y-2 text-sm font-bold text-[#6b7280] max-md:justify-center">
            {superAdminNav.map((item) => (
              <a className="no-underline" href={item.href} key={item.key}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

function PageHeader({
  children,
  description,
  mobileStackActions,
  title,
}: {
  children: ReactNode;
  description: string;
  mobileStackActions?: boolean;
  title: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 max-md:grid max-md:gap-4">
      <div>
        <h1 className="m-0 text-[32px] font-bold leading-tight text-[#111827] max-md:text-[28px]">
          {title}
        </h1>
        <p className="m-0 mt-3 max-w-[680px] text-sm leading-6 text-[#6b7280]">{description}</p>
      </div>
      <div
        className={cn(
          "flex gap-3 max-md:grid",
          mobileStackActions ? "max-md:grid-cols-1" : "max-md:grid-cols-2",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SuperButton({
  children,
  deferred,
  primary,
}: {
  children: ReactNode;
  deferred?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      aria-disabled={deferred ? "true" : undefined}
      className={cn(
        "inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold max-md:min-h-11 max-md:w-full max-md:gap-1.5 max-md:px-3 max-md:text-[13px]",
        deferred
          ? "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-[#6b7280]"
          : primary
          ? "border-[#6366f1] bg-[#6366f1] text-white"
          : "border-[#e5e7eb] bg-white text-[#111827]",
      )}
      type="button"
    >
      {children}
    </button>
  );
}

function KpiCard({
  icon,
  label,
  tone = "purple",
  trend,
  value,
}: {
  icon: string;
  label: string;
  tone?: keyof typeof kpiTone;
  trend?: string;
  value: string;
}) {
  return (
    <article className="flex min-h-[88px] items-center gap-4 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:min-h-[112px] max-md:px-6">
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", kpiTone[tone])}>
        <SuperIcon name={icon} />
      </div>
      <div className="min-w-0">
        <p className="m-0 text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
          {label}
        </p>
        <p className="m-0 mt-1 text-[28px] font-bold leading-none text-[#111827]">{value}</p>
        {trend ? (
          <p className={cn("m-0 mt-2 text-xs font-bold", trend.startsWith("↑") ? "text-[#10b981]" : "text-[#6b7280]")}>
            {trend}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
        status === "Aktif" && "bg-[#d1fae5] text-[#047857]",
        status === "Nonaktif" && "bg-[#fee2e2] text-[#b91c1c]",
        (status === "Butuh Staff" || status === "Perlu Aksi" || status === "Perlu Tinjauan") &&
          "bg-[#fef3c7] text-[#b45309]",
        status === "Baru" && "bg-[#dff4ff] text-[#0284c7]",
        status === "Dipulihkan" && "bg-[#d1fae5] text-[#047857]",
        status === "Semua Aktif" && "bg-[#d1fae5] text-[#047857]",
        status === "Pantau" && "bg-[#fef3c7] text-[#b45309]",
      )}
    >
      {status}
    </span>
  );
}

function healthLabel(status: string) {
  return status === "ok" ? "OK" : status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ");
}

function activeLabel(isActive: boolean) {
  return isActive ? "Aktif" : "Nonaktif";
}

function coverageLabel(value: string) {
  if (value === "covered") {
    return "Semua Aktif";
  }
  if (value === "needs_staff") {
    return "Butuh Staff";
  }
  return value.replaceAll("_", " ");
}

function formatAuditTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  })
    .format(new Date(value))
    .replace(".", ":");
}

function dashboardActivityText(item: SuperAdminAuditLogResponse) {
  const actor = item.actor_email ?? "Sistem";
  return `${actor} melakukan ${item.action_type}`;
}

function roleLabel(role: string) {
  if (role === "super_admin") return "Super Admin";
  if (role === "staff") return "Staff";
  if (role === "student") return "Mahasiswa";
  return role;
}

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Belum tersedia" : String(value);
}

function userProfileText(user: AdminUserResponse) {
  if (user.role === "student") {
    return [
      displayValue(user.nim),
      displayValue(user.phone),
      displayValue(user.academic_profile?.program_studi),
      displayValue(user.academic_profile?.faculty),
      displayValue(user.academic_profile?.entry_year),
      displayValue(user.academic_profile?.degree),
    ].join(" - ");
  }
  return "Profil staff/admin dikelola internal";
}

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

function DashboardStateMessage({
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
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-[#6366f1] px-4 text-sm font-bold text-white"
          onClick={onRetry}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function SuperAdminSystemPage() {
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const statusQuery = useQuery({
    queryFn: fetchSystemStatus,
    queryKey: ["super-admin", "system-status"],
  });
  const settingsQuery = useQuery({
    queryFn: fetchBookingSettings,
    queryKey: ["super-admin", "booking-settings"],
  });
  const settingsMutation = useMutation({
    mutationFn: updateBookingSettings,
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Pengaturan booking belum dapat disimpan."));
    },
    onSuccess: (settings) => {
      setFormError("");
      setMessage("Pengaturan booking disimpan.");
      settingsQuery.refetch();
      return settings;
    },
  });
  const status = statusQuery.data;
  const services = status
    ? [
        { meta: `${status.application.name} ${status.application.version}`, name: "Application", status: "Aktif" },
        { meta: "API", name: "Backend", status: healthLabel(status.backend.status) },
        { meta: "Database", name: "Database", status: healthLabel(status.database.status) },
        { meta: "Object storage", name: "Storage", status: healthLabel(status.storage.status) },
        { meta: "Deadline worker", name: "Worker", status: healthLabel(status.worker.status) },
      ]
    : [];

  return (
    <SuperAdminShell active="system">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Pantau kesehatan layanan dan kelola aturan booking yang berlaku untuk seluruh platform."
          mobileStackActions
          title="Sistem"
        >
          <button
            aria-disabled="true"
            className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-5 text-sm font-bold text-[#6b7280]"
            type="button"
          >
            Lihat Riwayat ditunda
          </button>
        </PageHeader>

        <section className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          <PlainKpiCard label="Backend" value={status ? healthLabel(status.backend.status) : "-"} />
          <PlainKpiCard label="Database" value={status ? healthLabel(status.database.status) : "-"} />
          <PlainKpiCard label="Storage" value={status ? healthLabel(status.storage.status) : "-"} />
          <PlainKpiCard label="Worker" value={status ? healthLabel(status.worker.status) : "-"} />
        </section>

        {message ? (
          <div className="mt-4 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#0b7340]">
            {message}
          </div>
        ) : null}
        {formError ? (
          <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm font-semibold text-[#dc2626]">
            {formError}
          </div>
        ) : null}
        {statusQuery.isError ? (
          <DashboardStateMessage actionLabel="Muat ulang status sistem" onRetry={() => void statusQuery.refetch()}>
            Status sistem belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}
        {settingsQuery.isError ? (
          <DashboardStateMessage actionLabel="Muat ulang pengaturan" onRetry={() => void settingsQuery.refetch()}>
            Pengaturan booking belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}

        <div className="mt-7 grid grid-cols-2 gap-7 max-lg:grid-cols-1">
          <SectionCard link="" title="Status Layanan">
            <div className="absolute right-6 top-5 max-md:right-5">
              <StatusBadge status={status && status.storage.status === "ok" ? "Semua Aktif" : "Pantau"} />
            </div>
            <div className="grid">
              {services.map((service) => (
                <article
                  className="flex items-center justify-between gap-4 border-t border-[#e5e7eb] px-6 py-5 first:border-t-0 max-md:px-4"
                  key={service.name}
                >
                  <div className="min-w-0">
                    <p className="m-0 break-words text-sm font-bold">{service.name}</p>
                    <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">{service.meta}</p>
                  </div>
                  <StatusBadge status={service.status} />
                </article>
              ))}
            </div>
            {statusQuery.isLoading ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Memuat status sistem...
              </div>
            ) : null}
          </SectionCard>

          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-5">
            <h2 className="m-0 text-lg font-bold">Aturan Booking</h2>
            {settingsQuery.data ? (
              <BookingSettingsForm
                isSaving={settingsMutation.isPending}
                key={JSON.stringify(settingsQuery.data)}
                onSave={(payload) => settingsMutation.mutate(payload)}
                settings={settingsQuery.data}
              />
            ) : null}
            {settingsQuery.isLoading ? (
              <div className="mt-4 text-sm font-semibold text-[#6b7280]">Memuat pengaturan booking...</div>
            ) : null}
          </section>
        </div>
      </main>
    </SuperAdminShell>
  );
}

function BookingSettingsForm({
  isSaving,
  onSave,
  settings,
}: {
  isSaving: boolean;
  onSave: (payload: BookingSettingsResponse) => void;
  settings: BookingSettingsResponse;
}) {
  const [form, setForm] = useState({
    ...settings,
    allowed_student_email_domains: settings.allowed_student_email_domains.join(", "),
  });
  const setNumberField = (field: keyof Omit<BookingSettingsResponse, "allowed_student_email_domains">, value: string) => {
    setForm((current) => ({ ...current, [field]: Number(value) }));
  };
  const payload: BookingSettingsResponse = {
    ...form,
    allowed_student_email_domains: form.allowed_student_email_domains
      .split(",")
      .map((domain) => domain.trim())
      .filter(Boolean),
  };
  const unchanged = JSON.stringify(payload) === JSON.stringify(settings);
  const invalid =
    Object.entries(payload).some(([key, value]) => key !== "allowed_student_email_domains" && Number(value) <= 0) ||
    payload.allowed_student_email_domains.length === 0;

  return (
    <form
      className="mt-4 grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(payload);
      }}
    >
      <SystemNumberField
        label="Minimum lead time jam"
        onChange={(value) => setNumberField("min_booking_lead_hours", value)}
        value={form.min_booking_lead_hours}
      />
      <SystemNumberField
        label="Maximum advance booking jam"
        onChange={(value) => setNumberField("max_booking_advance_hours", value)}
        value={form.max_booking_advance_hours}
      />
      <SystemNumberField
        label="Batas unggah surat jam"
        onChange={(value) => setNumberField("document_upload_due_hours", value)}
        value={form.document_upload_due_hours}
      />
      <SystemNumberField
        label="Batas review surat jam"
        onChange={(value) => setNumberField("document_verification_due_hours", value)}
        value={form.document_verification_due_hours}
      />
      <SystemNumberField
        label="Batas unggah pembayaran jam"
        onChange={(value) => setNumberField("payment_upload_due_hours", value)}
        value={form.payment_upload_due_hours}
      />
      <SystemNumberField
        label="Batas review pembayaran jam"
        onChange={(value) => setNumberField("payment_verification_due_hours", value)}
        value={form.payment_verification_due_hours}
      />
      <SystemNumberField
        label="Cutoff persetujuan final jam"
        onChange={(value) => setNumberField("final_approval_cutoff_hours", value)}
        value={form.final_approval_cutoff_hours}
      />
      <SystemNumberField
        label="Cutoff terlambat final jam"
        onChange={(value) => setNumberField("overdue_final_approval_cutoff_hours", value)}
        value={form.overdue_final_approval_cutoff_hours}
      />
      <label className="grid gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
          Domain email mahasiswa
        </span>
        <input
          aria-label="Domain email mahasiswa"
          className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
          onChange={(event) =>
            setForm((current) => ({ ...current, allowed_student_email_domains: event.target.value }))
          }
          value={form.allowed_student_email_domains}
        />
      </label>
      <button
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#6366f1] px-5 text-sm font-bold text-white disabled:opacity-60"
        disabled={unchanged || invalid || isSaving}
        type="submit"
      >
        Simpan Pengaturan
      </button>
    </form>
  );
}

function SystemNumberField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
        {label}
      </span>
      <input
        aria-label={label}
        className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
        min="1"
        onChange={(event) => onChange(event.target.value)}
        type="number"
        value={value}
      />
    </label>
  );
}

function PlainKpiCard({ label, sub, value }: { label: string; sub?: string; value: string }) {
  return (
    <article className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:min-h-[116px]">
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
        {label}
      </p>
      <p className="m-0 mt-2 text-[28px] font-bold leading-none text-[#111827]">{value}</p>
      {sub ? <p className="m-0 mt-2 text-sm text-[#6b7280]">{sub}</p> : null}
    </article>
  );
}

function FacilityThumb({ label }: { label: string }) {
  return (
    <div className="flex h-[72px] w-24 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#d1fae5] to-[#fef3c7] text-base font-bold text-[#0f766e] max-md:h-[140px] max-md:w-full">
      {label}
    </div>
  );
}

export function SuperAdminFacilitiesPage() {
  const queryClient = useQueryClient();
  const [staffInputs, setStaffInputs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const governanceQuery = useQuery({
    queryFn: fetchFacilityGovernance,
    queryKey: ["super-admin", "facility-governance"],
  });
  const facilities = governanceQuery.data ?? [];
  const activeFacilities = facilities.filter((facility) => facility.is_active).length;
  const needsStaff = facilities.filter((facility) => facility.assignment_coverage === "needs_staff").length;
  const activeAssignedStaff = facilities.reduce(
    (total, facility) => total + facility.active_assigned_staff_count,
    0,
  );
  const assignmentMutation = useMutation({
    mutationFn: ({
      action,
      facilityId,
      staffId,
    }: {
      action: "assign" | "unassign";
      facilityId: string;
      staffId: string;
    }) =>
      action === "assign"
        ? assignFacilityStaff(facilityId, staffId)
        : unassignFacilityStaff(facilityId, staffId),
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Penugasan staff belum dapat diperbarui."));
    },
    onSuccess: async () => {
      setFormError("");
      setMessage("Penugasan staff diperbarui.");
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "facility-governance"] });
    },
  });

  return (
    <SuperAdminShell active="facilities">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Pantau fasilitas lintas unit, status publikasi, dan penugasan staff pengelola."
          title="Fasilitas"
        >
          <SuperButton deferred>Impor Data ditunda</SuperButton>
          <SuperButton deferred>
            <Plus aria-hidden="true" size={15} />
            Tambah Fasilitas ditunda
          </SuperButton>
        </PageHeader>

        <section className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          <PlainKpiCard
            label="Fasilitas Aktif"
            sub={`${facilities.length} total fasilitas`}
            value={governanceQuery.data ? String(activeFacilities) : "-"}
          />
          <PlainKpiCard
            label="Tanpa Staff"
            sub="Butuh penugasan aktif"
            value={governanceQuery.data ? String(needsStaff) : "-"}
          />
          <PlainKpiCard
            label="Staff Aktif"
            sub="Penugasan aktif"
            value={governanceQuery.data ? String(activeAssignedStaff) : "-"}
          />
        </section>

        {message ? (
          <div className="mt-4 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#0b7340]">
            {message}
          </div>
        ) : null}
        {formError ? (
          <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm font-semibold text-[#dc2626]">
            {formError}
          </div>
        ) : null}
        {governanceQuery.isError ? (
          <DashboardStateMessage actionLabel="Muat ulang fasilitas" onRetry={() => void governanceQuery.refetch()}>
            Tata kelola fasilitas belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}

        <div className="mt-7 grid grid-cols-[2fr_1fr] gap-7 max-lg:grid-cols-1">
          <SectionCard link="Lihat Semua" title="Daftar Fasilitas">
            <div className="grid">
              {facilities.map((facility) => (
                <article
                  className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-4 border-t border-[#e5e7eb] p-5 first:border-t-0 max-md:grid-cols-1 max-md:items-start"
                  key={facility.id}
                >
                  <FacilityThumb label={facility.name.slice(0, 2).toUpperCase()} />
                  <div className="min-w-0">
                    <h3 className="m-0 break-words text-base font-bold">{facility.name}</h3>
                    <p className="m-0 mt-2 break-words text-sm text-[#6b7280]">
                      {facility.location} - {facility.category} - {facility.capacity} kursi
                    </p>
                    <p className="m-0 mt-2 break-words text-xs font-semibold text-[#6b7280]">
                      {facility.active_assigned_staff_count}/{facility.assigned_staff_count} staff aktif
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {facility.issue_flags.length > 0 ? (
                        facility.issue_flags.map((flag) => <StatusBadge key={flag} status={flag} />)
                      ) : (
                        <span className="text-xs font-semibold text-[#6b7280]">Tidak ada issue</span>
                      )}
                    </div>
                  </div>
                  <div className="grid justify-items-end gap-2 max-md:justify-items-start">
                    <StatusBadge status={facility.is_active ? "Aktif" : "Nonaktif"} />
                    <StatusBadge status={coverageLabel(facility.assignment_coverage)} />
                  </div>
                </article>
              ))}
            </div>
            {governanceQuery.isLoading ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Memuat tata kelola fasilitas...
              </div>
            ) : null}
            {governanceQuery.isSuccess && facilities.length === 0 ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                <p className="m-0">Belum ada data tata kelola fasilitas.</p>
                <button
                  className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-[#6366f1] px-4 text-sm font-bold text-white"
                  onClick={() => void governanceQuery.refetch()}
                  type="button"
                >
                  Muat ulang fasilitas
                </button>
              </div>
            ) : null}
          </SectionCard>

          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <h2 className="m-0 border-b border-[#e5e7eb] pb-3 text-lg font-bold">
              Penugasan Terbaru
            </h2>
            <div className="grid">
              {facilities.map((facility) => {
                const staffId = staffInputs[facility.id]?.trim() ?? "";
                return (
                  <article
                    className="grid gap-3 border-b border-[#e5e7eb] py-5 last:border-b-0"
                    key={facility.id}
                  >
                    <div className="min-w-0">
                      <p className="m-0 break-words text-sm font-bold">{facility.name}</p>
                      <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">
                        {facility.active_assigned_staff_count}/{facility.assigned_staff_count} aktif
                      </p>
                    </div>
                    <input
                      aria-label={`Staff ID untuk ${facility.name}`}
                      className="min-h-10 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
                      onChange={(event) =>
                        setStaffInputs((current) => ({ ...current, [facility.id]: event.target.value }))
                      }
                      placeholder="staff-id"
                      value={staffInputs[facility.id] ?? ""}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        aria-label={`Tugaskan staff ke ${facility.name}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#6366f1] px-3 text-xs font-bold text-white disabled:opacity-60"
                        disabled={!staffId || assignmentMutation.isPending}
                        onClick={() =>
                          assignmentMutation.mutate({ action: "assign", facilityId: facility.id, staffId })
                        }
                        type="button"
                      >
                        Tugaskan
                      </button>
                      <button
                        aria-label={`Hapus staff dari ${facility.name}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#e5e7eb] bg-white px-3 text-xs font-bold text-[#111827] disabled:opacity-60"
                        disabled={!staffId || assignmentMutation.isPending}
                        onClick={() =>
                          assignmentMutation.mutate({ action: "unassign", facilityId: facility.id, staffId })
                        }
                        type="button"
                      >
                        Hapus
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </SuperAdminShell>
  );
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  })
    .format(value)
    .replace(/\s/g, "");
}

function TrendChart({ points }: { points: SuperAdminReportTrendPointResponse[] }) {
  const maxCount = Math.max(...points.map((point) => point.reservation_count), 1);
  return (
    <div
      aria-label="Grafik tren reservasi"
      className="flex h-[200px] items-end gap-4 px-6 pb-7 pt-9 max-md:h-[190px] max-md:px-4"
      role="img"
    >
      {points.map((point) => (
        <div
          aria-label={`${point.date}: ${point.reservation_count} reservasi, ${formatRupiah(point.paid_total_rupiah)}`}
          className="w-full rounded-t-lg bg-[#6366f1] opacity-90"
          key={point.date}
          style={{ height: `${Math.max(18, (point.reservation_count / maxCount) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function SuperAdminReportsPage() {
  const queryClient = useQueryClient();
  const [range, setRange] = useState<ReportDateRange>({ end: "2026-05-31", start: "2026-05-01" });
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const aggregateQuery = useQuery({
    queryFn: () => fetchReportAggregate(range),
    queryKey: ["super-admin", "reports", "aggregate", range],
  });
  const auditQuery = useQuery({
    queryFn: () => fetchAdminAuditLogs(range),
    queryKey: ["super-admin", "reports", "audit", range],
  });
  const reviewsQuery = useQuery({
    queryFn: fetchAdminReviews,
    queryKey: ["super-admin", "reports", "reviews"],
  });
  const aggregate = aggregateQuery.data;
  const auditLogs = auditQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];
  const reviewMutation = useMutation({
    mutationFn: ({ action, reviewId }: { action: "delete" | "restore"; reviewId: string }) =>
      action === "delete" ? deleteAdminReview(reviewId) : restoreAdminReview(reviewId),
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Moderasi ulasan belum dapat diperbarui."));
    },
    onSuccess: async () => {
      setFormError("");
      setMessage("Moderasi ulasan diperbarui.");
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "reports", "reviews"] });
    },
  });
  const reportError = aggregateQuery.isError || auditQuery.isError || reviewsQuery.isError;

  return (
    <SuperAdminShell active="reports">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Ringkasan reservasi, log audit, dan moderasi ulasan untuk pengawasan lintas platform."
          title="Laporan"
        >
          <SuperButton>Rentang Waktu</SuperButton>
          <SuperButton deferred>Ekspor Laporan ditunda</SuperButton>
        </PageHeader>

        <section className="mb-6 grid grid-cols-[180px_180px] gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:grid-cols-1">
          <input
            aria-label="Tanggal mulai laporan"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => setRange((current) => ({ ...current, start: event.target.value }))}
            type="date"
            value={range.start}
          />
          <input
            aria-label="Tanggal akhir laporan"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => setRange((current) => ({ ...current, end: event.target.value }))}
            type="date"
            value={range.end}
          />
        </section>

        <section className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          <PlainKpiCard label="Reservasi Bulan Ini" value={aggregate ? String(aggregate.kpis.total_reservations) : "-"} />
          <PlainKpiCard label="Disetujui" value={aggregate ? String(aggregate.kpis.approved_reservations) : "-"} />
          <PlainKpiCard label="Selesai" value={aggregate ? String(aggregate.kpis.completed_reservations) : "-"} />
          <PlainKpiCard
            label="Total Pembayaran"
            value={aggregate ? formatRupiah(aggregate.kpis.paid_reservation_total_rupiah) : "-"}
          />
        </section>

        {message ? (
          <div className="mt-4 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#0b7340]">
            {message}
          </div>
        ) : null}
        {formError ? (
          <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm font-semibold text-[#dc2626]">
            {formError}
          </div>
        ) : null}
        {reportError ? (
          <DashboardStateMessage
            actionLabel="Muat ulang laporan"
            onRetry={() => {
              void aggregateQuery.refetch();
              void auditQuery.refetch();
              void reviewsQuery.refetch();
            }}
          >
            Laporan belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}

        <div className="mt-7 grid grid-cols-[1.4fr_1fr] gap-7 max-lg:grid-cols-1">
          <SectionCard link="Detail" title="Tren Reservasi Mingguan">
            {aggregate?.trend.length ? <TrendChart points={aggregate.trend} /> : null}
            {aggregateQuery.isLoading ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Memuat tren reservasi...
              </div>
            ) : null}
            {aggregateQuery.isSuccess && aggregate && !aggregate.trend.length ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Belum ada tren reservasi untuk rentang ini.
              </div>
            ) : null}
            {aggregate ? (
              <div className="flex flex-wrap gap-2 border-t border-[#e5e7eb] p-4 text-xs font-bold text-[#6b7280]">
                {Object.entries(aggregate.status_counts).map(([status, count]) => (
                  <span key={status}>{status}: {count}</span>
                ))}
              </div>
            ) : null}
          </SectionCard>

          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <h2 className="m-0 text-lg font-bold">Log Audit Terbaru</h2>
            <div className="mt-4 grid">
              {auditLogs.map((item) => (
                <article className="flex gap-4 border-t border-[#e5e7eb] py-4 first:border-t-0" key={item.id}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ede9fe] text-[#6366f1]">
                    <SuperIcon name="settings" size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 break-words text-sm font-bold">
                      {item.actor_email ?? "Sistem"} melakukan {item.action_type}
                    </p>
                    <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">{formatAuditTime(item.created_at)}</p>
                  </div>
                </article>
              ))}
            </div>
            {auditQuery.isSuccess && auditLogs.length === 0 ? (
              <div className="mt-4 text-sm font-semibold text-[#6b7280]">
                Belum ada log audit untuk rentang ini.
              </div>
            ) : null}
          </section>
        </div>

        <section className="mt-7 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:border-0 max-md:bg-transparent max-md:shadow-none">
          <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#e5e7eb] px-6 max-md:min-h-12 max-md:border-0 max-md:px-0">
            <h2 className="m-0 text-lg font-bold text-[#111827]">Moderasi Ulasan</h2>
            <a className="text-sm font-bold text-[#6366f1] no-underline" href="#">
              Lihat Semua
            </a>
          </div>
          <table className="w-full border-collapse max-md:hidden">
            <thead className="bg-[#f9fafb] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
              <tr>
                <th className="px-5 py-3">Ulasan</th>
                <th className="px-5 py-3">Fasilitas</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((row) => (
                <tr className="border-t border-[#e5e7eb]" key={row.id}>
                  <td className="px-5 py-4">
                    <p className="m-0 text-sm font-bold">{row.comment ?? "Tanpa komentar"}</p>
                    <p className="m-0 mt-1 text-xs text-[#6b7280]">
                      {row.student_name} - {row.rating}/5 - {formatAuditTime(row.created_at)}
                    </p>
                  </td>
                  <td className="px-5 py-4">{row.facility_name}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.is_deleted ? "Dihapus" : "Aktif"} /></td>
                  <td className="px-5 py-4">
                    <button
                      aria-label={`${row.is_deleted ? "Pulihkan" : "Hapus"} review ${row.id}`}
                      className="text-sm font-bold text-[#6366f1]"
                      disabled={reviewMutation.isPending}
                      onClick={() =>
                        reviewMutation.mutate({ action: row.is_deleted ? "restore" : "delete", reviewId: row.id })
                      }
                      type="button"
                    >
                      {row.is_deleted ? "Pulihkan" : "Hapus"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="hidden gap-4 max-md:grid">
            {reviews.map((row) => (
              <article className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]" key={row.id}>
                <UserField label="Ulasan">
                  <strong>{row.comment ?? "Tanpa komentar"}</strong>
                  <span className="block text-xs text-[#6b7280]">
                    {row.student_name} - {row.rating}/5 - {formatAuditTime(row.created_at)}
                  </span>
                </UserField>
                <UserField label="Fasilitas">{row.facility_name}</UserField>
                <UserField label="Status"><StatusBadge status={row.is_deleted ? "Dihapus" : "Aktif"} /></UserField>
                <UserField label="Aksi">
                  <button
                    aria-label={`${row.is_deleted ? "Pulihkan" : "Hapus"} review ${row.id}`}
                    className="text-sm font-bold text-[#6366f1]"
                    disabled={reviewMutation.isPending}
                    onClick={() =>
                      reviewMutation.mutate({ action: row.is_deleted ? "restore" : "delete", reviewId: row.id })
                    }
                    type="button"
                  >
                    {row.is_deleted ? "Pulihkan" : "Hapus"}
                  </button>
                </UserField>
              </article>
            ))}
          </div>
          {reviewsQuery.isLoading ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              Memuat ulasan...
            </div>
          ) : null}
          {reviewsQuery.isSuccess && reviews.length === 0 ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              Belum ada ulasan untuk dimoderasi.
            </div>
          ) : null}
        </section>
      </main>
    </SuperAdminShell>
  );
}

function SectionCard({
  children,
  link,
  title,
}: {
  children: ReactNode;
  link: string;
  title: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#e5e7eb] px-6 max-md:px-5">
        <h2 className="m-0 text-lg font-bold text-[#111827] max-md:max-w-[180px]">{title}</h2>
        {link ? (
          <a className="text-sm font-bold text-[#6366f1] no-underline" href="#">
            {link}
          </a>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function SuperAdminDashboardPage() {
  const dashboardQuery = useQuery({
    queryFn: fetchSuperAdminDashboard,
    queryKey: ["super-admin", "dashboard"],
  });
  const dashboard = dashboardQuery.data;
  const administrators = dashboard?.administrators ?? [];
  const facilities = dashboard?.facility_governance ?? [];
  const activity = dashboard?.recent_activity ?? [];
  const kpis = dashboard
    ? [
        {
          icon: "users",
          label: "Total Pengguna",
          tone: "purple" as const,
          value: String(dashboard.kpis.total_users),
        },
        {
          icon: "building",
          label: "Fasilitas Aktif",
          tone: "green" as const,
          value: String(dashboard.kpis.active_facilities),
        },
        {
          icon: "calendar",
          label: "Total Reservasi",
          tone: "blue" as const,
          value: String(dashboard.kpis.total_reservations),
        },
        {
          icon: "settings",
          label: "Kesehatan Sistem",
          tone: dashboard.kpis.system_health === "ok" ? ("green" as const) : ("orange" as const),
          value: healthLabel(dashboard.kpis.system_health),
        },
      ]
    : [];

  return (
    <SuperAdminShell active="dashboard">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Pantau kesehatan sistem, pengguna, fasilitas, dan aktivitas administratif lintas platform."
          title="Dashboard Super Admin"
        >
          <SuperButton deferred>Ekspor Laporan ditunda</SuperButton>
          <SuperButton deferred>
            <Plus aria-hidden="true" size={15} />
            Tambah Admin ditunda
          </SuperButton>
        </PageHeader>

        {dashboardQuery.isLoading ? <DashboardStateMessage>Memuat dashboard super admin...</DashboardStateMessage> : null}
        {dashboardQuery.isError ? (
          <DashboardStateMessage actionLabel="Muat ulang dashboard" onRetry={() => void dashboardQuery.refetch()}>
            Dashboard super admin belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}

        {dashboard ? (
        <>
        <section className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-6">
          {kpis.map((kpi) => (
            <KpiCard
              icon={kpi.icon}
              key={kpi.label}
              label={kpi.label}
              tone={kpi.tone}
              value={kpi.value}
            />
          ))}
        </section>

        <div className="mt-8 grid grid-cols-[2fr_1fr] gap-8 max-lg:grid-cols-1 max-md:gap-6">
          <SectionCard link="Lihat Semua" title="Administrator Departemen">
            <table className="w-full border-collapse max-md:hidden">
              <thead className="bg-[#f9fafb] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                <tr>
                  <th className="px-6 py-3">Administrator</th>
                  <th className="px-6 py-3">Departemen</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Catatan Akses</th>
                </tr>
              </thead>
              <tbody>
                {administrators.map((admin) => (
                  <tr className="border-t border-[#e5e7eb]" key={admin.id}>
                    <td className="px-6 py-4">
                      <p className="m-0 text-sm font-bold">{admin.full_name}</p>
                      <p className="m-0 mt-1 text-xs text-[#6b7280]">{admin.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="m-0 text-sm font-bold">Super Admin</p>
                      <p className="m-0 mt-1 text-xs text-[#6b7280]">{admin.role}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={activeLabel(admin.is_active)} /></td>
                    <td className="px-6 py-4 text-sm text-[#6b7280]">
                      {admin.is_active ? "Akses aktif" : "Akses nonaktif"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="hidden max-md:grid">
              {administrators.map((admin) => (
                <article className="grid grid-cols-[1fr_auto] gap-4 border-t border-[#e5e7eb] p-4" key={admin.id}>
                  <div className="min-w-0">
                    <h3 className="m-0 break-words text-sm font-bold">{admin.full_name}</h3>
                    <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">{admin.email}</p>
                    <p className="m-0 mt-5 break-words text-sm font-bold">Super Admin</p>
                    <p className="m-0 mt-1 text-xs text-[#6b7280]">{admin.role}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-6">
                    <StatusBadge status={activeLabel(admin.is_active)} />
                    <p className="m-0 text-xs text-[#6b7280]">
                      {admin.is_active ? "Akses aktif" : "Akses nonaktif"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            {administrators.length === 0 ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Belum ada administrator untuk ditampilkan.
              </div>
            ) : null}
          </SectionCard>

          <SectionCard link="Log Lengkap" title="Log Aktivitas Sistem">
            <ul className="m-0 list-none p-0">
              {activity.map((item) => (
                <li className="flex gap-4 border-t border-[#e5e7eb] px-6 py-4 first:border-t-0 max-md:px-5" key={item.id}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[#111827]">
                    <SuperIcon name="settings" size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 break-words text-sm leading-5 text-[#111827]">
                      {dashboardActivityText(item)}
                    </p>
                    <p className="m-0 mt-2 text-xs text-[#6b7280]">{formatAuditTime(item.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
            {activity.length === 0 ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Belum ada aktivitas sistem terbaru.
              </div>
            ) : null}
          </SectionCard>
        </div>

        <div className="mt-8">
        <SectionCard link="Kelola Fasilitas" title="Tata Kelola Fasilitas">
          <table className="w-full border-collapse max-md:hidden">
            <thead className="bg-[#f9fafb] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
              <tr>
                <th className="px-6 py-3">Fasilitas</th>
                <th className="px-6 py-3">Kapasitas</th>
                <th className="px-6 py-3">Staff</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility) => (
                <tr className="border-t border-[#e5e7eb]" key={facility.id}>
                  <td className="px-6 py-4">
                    <p className="m-0 text-sm font-bold">{facility.name}</p>
                    <p className="m-0 mt-1 text-xs text-[#6b7280]">
                      {facility.category} - {facility.location}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b7280]">{facility.capacity}</td>
                  <td className="px-6 py-4 text-sm text-[#6b7280]">
                    {facility.active_assigned_staff_count}/{facility.assigned_staff_count} aktif
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={facility.is_active ? coverageLabel(facility.assignment_coverage) : "Nonaktif"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="hidden max-md:grid">
            {facilities.map((facility) => (
              <article className="grid grid-cols-[1fr_auto] gap-4 border-t border-[#e5e7eb] p-4" key={facility.id}>
                <div className="min-w-0">
                  <h3 className="m-0 break-words text-sm font-bold">{facility.name}</h3>
                  <p className="m-0 mt-1 text-xs text-[#6b7280]">
                    {facility.category} - {facility.location}
                  </p>
                  <p className="m-0 mt-4 text-xs text-[#6b7280]">
                    {facility.active_assigned_staff_count}/{facility.assigned_staff_count} staff aktif
                  </p>
                </div>
                <StatusBadge status={facility.is_active ? coverageLabel(facility.assignment_coverage) : "Nonaktif"} />
              </article>
            ))}
          </div>
          {facilities.length === 0 ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              Belum ada data tata kelola fasilitas.
            </div>
          ) : null}
        </SectionCard>
        </div>
        </>
        ) : null}
      </main>
    </SuperAdminShell>
  );
}

export function SuperAdminUsersPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserFilters>({
    isActive: "all",
    page: 1,
    pageSize: 10,
    role: "all",
    search: "",
  });
  const [createForm, setCreateForm] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "staff",
  });
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const usersQuery = useQuery({
    queryFn: () => fetchAdminUsers(filters),
    queryKey: ["super-admin", "users", filters],
  });
  const users = usersQuery.data?.items ?? [];
  const activeCount = users.filter((user) => user.is_active).length;
  const studentCount = users.filter((user) => user.role === "student").length;
  const staffCount = users.filter((user) => user.role === "staff").length;

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminUser({
        email: createForm.email.trim(),
        full_name: createForm.fullName.trim(),
        is_active: true,
        password: createForm.password,
        role: createForm.role,
      }),
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Pengguna belum dapat dibuat."));
    },
    onSuccess: async () => {
      setCreateForm({ email: "", fullName: "", password: "", role: "staff" });
      setFormError("");
      setMessage("Pengguna baru dibuat.");
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "users"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ active, userId }: { active: boolean; userId: string }) => setAdminUserStatus(userId, active),
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Status pengguna belum dapat diperbarui."));
    },
    onSuccess: async () => {
      setFormError("");
      setMessage("Status pengguna diperbarui.");
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "users"] });
    },
  });
  const busy = createMutation.isPending || statusMutation.isPending;

  return (
    <SuperAdminShell active="users">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Kelola akun mahasiswa, staff fasilitas, dan Super Admin dengan status akses yang jelas."
          title="Pengguna"
        >
          <SuperButton deferred>Ekspor CSV ditunda</SuperButton>
          <SuperButton primary>
            <Plus aria-hidden="true" size={15} />
            Tambah Pengguna
          </SuperButton>
        </PageHeader>

        <section className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-5">
          {[
            { icon: "users", label: "Total Akun", value: String(usersQuery.data?.total ?? "-") },
            { icon: "user", label: "Akun Aktif", value: String(activeCount) },
            { icon: "graduation", label: "Mahasiswa", value: String(studentCount) },
            { icon: "briefcase", label: "Staff", value: String(staffCount) },
          ].map((kpi) => (
            <KpiCard icon={kpi.icon} key={kpi.label} label={kpi.label} value={kpi.value} />
          ))}
        </section>

        <section className="mt-7 grid grid-cols-[1fr_180px_180px] gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:grid-cols-1">
          <input
            aria-label="Cari pengguna"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => setFilters((current) => ({ ...current, page: 1, search: event.target.value }))}
            placeholder="Cari nama, email, atau NIM"
            value={filters.search}
          />
          <select
            aria-label="Filter role"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => setFilters((current) => ({ ...current, page: 1, role: event.target.value }))}
            value={filters.role}
          >
            <option value="all">Semua role</option>
            <option value="student">Mahasiswa</option>
            <option value="staff">Staff</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <select
            aria-label="Filter status"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => setFilters((current) => ({ ...current, isActive: event.target.value, page: 1 }))}
            value={filters.isActive}
          >
            <option value="all">Semua status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </section>

        <form
          className="mt-6 grid grid-cols-[1fr_1fr_160px_160px_auto] gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-lg:grid-cols-2 max-md:grid-cols-1"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <input
            aria-label="Email pengguna baru"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm"
            onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="email@ipb.ac.id"
            type="email"
            value={createForm.email}
          />
          <input
            aria-label="Nama pengguna baru"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm"
            onChange={(event) => setCreateForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Nama lengkap"
            value={createForm.fullName}
          />
          <input
            aria-label="Password pengguna baru"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm"
            onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password"
            type="password"
            value={createForm.password}
          />
          <select
            aria-label="Role pengguna baru"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm"
            onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value }))}
            value={createForm.role}
          >
            <option value="staff">Staff</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#6366f1] px-5 text-sm font-bold text-white disabled:opacity-60"
            disabled={busy || !createForm.email || !createForm.fullName || !createForm.password}
            type="submit"
          >
            Buat Pengguna
          </button>
        </form>

        {message ? (
          <div className="mt-4 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#0b7340]">
            {message}
          </div>
        ) : null}
        {formError ? (
          <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm font-semibold text-[#dc2626]">
            {formError}
          </div>
        ) : null}
        {usersQuery.isError ? (
          <DashboardStateMessage actionLabel="Muat ulang pengguna" onRetry={() => void usersQuery.refetch()}>
            Daftar pengguna belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}

        <section className="mt-6 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:border-0 max-md:bg-transparent max-md:shadow-none">
          <div className="flex min-h-[88px] items-center justify-between gap-4 border-b border-[#e5e7eb] px-6 max-md:min-h-12 max-md:border-0 max-md:px-0">
            <h2 className="m-0 text-lg font-bold text-[#111827]">Daftar Pengguna</h2>
            <a className="text-sm font-bold text-[#6366f1] no-underline" href="#">
              Filter Lanjutan
            </a>
          </div>
          <table className="w-full border-collapse max-md:hidden">
            <thead className="bg-[#f9fafb] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
              <tr>
                <th className="px-5 py-3">Pengguna</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Unit</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr className="border-t border-[#e5e7eb]" key={user.id}>
                  <td className="px-5 py-4">
                    <p className="m-0 text-sm font-bold">{user.full_name}</p>
                    <p className="m-0 mt-1 text-xs text-[#6b7280]">{user.email}</p>
                    {user.nim ? <p className="m-0 mt-1 text-xs text-[#6b7280]">{user.nim}</p> : null}
                  </td>
                  <td className="px-5 py-4">{roleLabel(user.role)}</td>
                  <td className="px-5 py-4 text-sm text-[#6b7280]">{userProfileText(user)}</td>
                  <td className="px-5 py-4"><StatusBadge status={activeLabel(user.is_active)} /></td>
                  <td className="px-5 py-4">
                    <button
                      aria-label={`${user.is_active ? "Nonaktifkan" : "Aktifkan"} ${user.full_name}`}
                      className="text-sm font-bold text-[#6366f1]"
                      disabled={busy}
                      onClick={() => statusMutation.mutate({ active: !user.is_active, userId: user.id })}
                      type="button"
                    >
                      {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="hidden gap-4 max-md:grid">
            {users.map((user) => (
              <article className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]" key={user.id}>
                <UserField label="Pengguna">
                  <strong>{user.full_name}</strong>
                  <span className="block break-words text-xs text-[#6b7280]">{user.email}</span>
                  {user.nim ? <span className="block break-words text-xs text-[#6b7280]">{user.nim}</span> : null}
                </UserField>
                <UserField label="Role">{roleLabel(user.role)}</UserField>
                <UserField label="Unit">{userProfileText(user)}</UserField>
                <UserField label="Status"><StatusBadge status={activeLabel(user.is_active)} /></UserField>
                <UserField label="Aksi">
                  <button
                    aria-label={`${user.is_active ? "Nonaktifkan" : "Aktifkan"} ${user.full_name}`}
                    className="text-sm font-bold text-[#6366f1]"
                    disabled={busy}
                    onClick={() => statusMutation.mutate({ active: !user.is_active, userId: user.id })}
                    type="button"
                  >
                    {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </UserField>
              </article>
            ))}
          </div>
          {usersQuery.isLoading ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              Memuat pengguna...
            </div>
          ) : null}
          {usersQuery.isSuccess && users.length === 0 ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              <p className="m-0">Tidak ada pengguna untuk filter ini.</p>
              <button
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-[#6366f1] px-4 text-sm font-bold text-white"
                onClick={() => void usersQuery.refetch()}
                type="button"
              >
                Muat ulang pengguna
              </button>
            </div>
          ) : null}
        </section>
      </main>
    </SuperAdminShell>
  );
}

function UserField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="m-0 mb-1 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
        {label}
      </p>
      <div className="break-words text-base text-[#111827]">{children}</div>
    </div>
  );
}
