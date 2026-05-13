import {
  AlertTriangle,
  Bell,
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
import type { ReactNode } from "react";
import {
  superAdminDashboardFixture,
  superAdminFacilitiesFixture,
  superAdminNav,
  superAdminReportsFixture,
  superAdminSystemFixture,
  superAdminUsersFixture,
} from "../../fixtures/superAdminDashboardUsers";
import { cn } from "../../utils/cn";

type SuperAdminActive = (typeof superAdminNav)[number]["key"];

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
            <button
              aria-label="Notifikasi"
              className="inline-flex border-0 bg-transparent p-0 text-[#6b7280]"
              type="button"
            >
              <Bell aria-hidden="true" size={18} />
            </button>
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
  primary,
}: {
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold max-md:min-h-11 max-md:w-full max-md:gap-1.5 max-md:px-3 max-md:text-[13px]",
        primary
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
        (status === "Perlu Data" || status === "Butuh Staff" || status === "Perlu Aksi" || status === "Perlu Tinjauan") &&
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

function SettingField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
        {label}
      </span>
      <input
        aria-label={label.charAt(0).toUpperCase() + label.slice(1)}
        className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
        readOnly
        value={value}
      />
    </label>
  );
}

export function SuperAdminSystemPage() {
  const fixture = superAdminSystemFixture;

  return (
    <SuperAdminShell active="system">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Pantau kesehatan layanan dan kelola aturan booking yang berlaku untuk seluruh platform."
          mobileStackActions
          title="Sistem"
        >
          <SuperButton>Lihat Riwayat</SuperButton>
          <SuperButton primary>Simpan Pengaturan</SuperButton>
        </PageHeader>

        <section className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {fixture.kpis.map((kpi) => (
            <PlainKpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
          ))}
        </section>

        <div className="mt-7 grid grid-cols-2 gap-7 max-lg:grid-cols-1">
          <SectionCard link="" title="Status Layanan">
            <div className="absolute right-6 top-5 max-md:right-5">
              <StatusBadge status="Semua Aktif" />
            </div>
            <div className="grid">
              {fixture.services.map((service) => (
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
          </SectionCard>

          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-5">
            <h2 className="m-0 text-lg font-bold">Aturan Booking</h2>
            <div className="mt-2 grid gap-4">
              <SettingField label="Domain email mahasiswa" value={fixture.settings.emailDomain} />
              <SettingField label="Batas unggah surat" value={fixture.settings.letterDeadline} />
              <SettingField label="Cutoff pembayaran" value={fixture.settings.paymentCutoff} />
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#e5e7eb] pt-5">
              <div className="min-w-0">
                <p className="m-0 break-words text-sm font-bold">Aktifkan notifikasi sistem</p>
                <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">
                  Kirim pesan untuk transisi penting.
                </p>
              </div>
              <button
                aria-checked="true"
                aria-label="Aktifkan notifikasi sistem"
                className="relative h-6 w-11 shrink-0 rounded-full bg-[#6366f1]"
                role="switch"
                type="button"
              >
                <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
              </button>
            </div>
          </section>
        </div>
      </main>
    </SuperAdminShell>
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
  const fixture = superAdminFacilitiesFixture;

  return (
    <SuperAdminShell active="facilities">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Pantau fasilitas lintas unit, status publikasi, dan penugasan staff pengelola."
          title="Fasilitas"
        >
          <SuperButton>Impor Data</SuperButton>
          <SuperButton primary>
            <Plus aria-hidden="true" size={15} />
            Tambah Fasilitas
          </SuperButton>
        </PageHeader>

        <section className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {fixture.kpis.map((kpi) => (
            <PlainKpiCard key={kpi.label} label={kpi.label} sub={kpi.sub} value={kpi.value} />
          ))}
        </section>

        <div className="mt-7 grid grid-cols-[2fr_1fr] gap-7 max-lg:grid-cols-1">
          <SectionCard link="Lihat Semua" title="Daftar Fasilitas">
            <div className="grid">
              {fixture.facilities.map((facility) => (
                <article
                  className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-4 border-t border-[#e5e7eb] p-5 first:border-t-0 max-md:grid-cols-1 max-md:items-start"
                  key={facility.name}
                >
                  <FacilityThumb label={facility.badge} />
                  <div className="min-w-0">
                    <h3 className="m-0 break-words text-base font-bold">{facility.name}</h3>
                    <p className="m-0 mt-2 break-words text-sm text-[#6b7280]">{facility.meta}</p>
                  </div>
                  <div className="justify-self-end max-md:justify-self-start">
                    <StatusBadge status={facility.status} />
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>

          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <h2 className="m-0 border-b border-[#e5e7eb] pb-3 text-lg font-bold">
              Penugasan Terbaru
            </h2>
            <div className="grid">
              {fixture.assignments.map((assignment) => (
                <article
                  className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] py-5 last:border-b-0"
                  key={`${assignment.name}-${assignment.facility}`}
                >
                  <div className="min-w-0">
                    <p className="m-0 break-words text-sm font-bold">{assignment.name}</p>
                    <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">{assignment.facility}</p>
                  </div>
                  <StatusBadge status={assignment.status} />
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </SuperAdminShell>
  );
}

function TrendChart() {
  return (
    <div
      aria-label="Grafik tren reservasi"
      className="flex h-[200px] items-end gap-4 px-6 pb-7 pt-9 max-md:h-[190px] max-md:px-4"
      role="img"
    >
      {superAdminReportsFixture.trend.map((bar) => (
        <div
          aria-label={`${bar.day}: ${bar.height}`}
          className="w-full rounded-t-lg bg-[#6366f1] opacity-90"
          key={bar.day}
          style={{ height: bar.height }}
        />
      ))}
    </div>
  );
}

export function SuperAdminReportsPage() {
  const fixture = superAdminReportsFixture;

  return (
    <SuperAdminShell active="reports">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Ringkasan reservasi, log audit, dan moderasi ulasan untuk pengawasan lintas platform."
          title="Laporan"
        >
          <SuperButton>Rentang Waktu</SuperButton>
          <SuperButton primary>Ekspor Laporan</SuperButton>
        </PageHeader>

        <section className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {fixture.kpis.map((kpi) => (
            <PlainKpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
          ))}
        </section>

        <div className="mt-7 grid grid-cols-[1.4fr_1fr] gap-7 max-lg:grid-cols-1">
          <SectionCard link="Detail" title="Tren Reservasi Mingguan">
            <TrendChart />
          </SectionCard>

          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <h2 className="m-0 text-lg font-bold">Log Audit Terbaru</h2>
            <div className="mt-4 grid">
              {fixture.audit.map((item) => (
                <article className="flex gap-4 border-t border-[#e5e7eb] py-4 first:border-t-0" key={item.title}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ede9fe] text-[#6366f1]">
                    <SuperIcon name={item.icon} size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 break-words text-sm font-bold">{item.title}</p>
                    <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">{item.meta}</p>
                  </div>
                </article>
              ))}
            </div>
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
              {fixture.moderation.map((row) => (
                <tr className="border-t border-[#e5e7eb]" key={row.title}>
                  <td className="px-5 py-4">
                    <p className="m-0 text-sm font-bold">{row.title}</p>
                    <p className="m-0 mt-1 text-xs text-[#6b7280]">{row.meta}</p>
                  </td>
                  <td className="px-5 py-4">{row.facility}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                  <td className="px-5 py-4">
                    <a className="text-sm font-bold text-[#6366f1] no-underline" href="#">
                      {row.action}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="hidden gap-4 max-md:grid">
            {fixture.moderation.map((row) => (
              <article className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]" key={row.title}>
                <UserField label="Ulasan">
                  <strong>{row.title}</strong>
                  <span className="block text-xs text-[#6b7280]">{row.meta}</span>
                </UserField>
                <UserField label="Fasilitas">{row.facility}</UserField>
                <UserField label="Status"><StatusBadge status={row.status} /></UserField>
                <UserField label="Aksi">
                  <a className="text-sm font-bold text-[#6366f1] no-underline" href="#">
                    {row.action}
                  </a>
                </UserField>
              </article>
            ))}
          </div>
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
  const fixture = superAdminDashboardFixture;

  return (
    <SuperAdminShell active="dashboard">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Pantau kesehatan sistem, pengguna, fasilitas, dan aktivitas administratif lintas platform."
          title="Dashboard Super Admin"
        >
          <SuperButton>Ekspor Laporan</SuperButton>
          <SuperButton primary>
            <Plus aria-hidden="true" size={15} />
            Tambah Admin
          </SuperButton>
        </PageHeader>

        <section className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-6">
          {fixture.kpis.map((kpi) => (
            <KpiCard
              icon={kpi.icon}
              key={kpi.label}
              label={kpi.label}
              tone={kpi.tone}
              trend={kpi.trend}
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
                  <th className="px-6 py-3">Terakhir Aktif</th>
                </tr>
              </thead>
              <tbody>
                {fixture.administrators.map((admin) => (
                  <tr className="border-t border-[#e5e7eb]" key={admin.email}>
                    <td className="px-6 py-4">
                      <p className="m-0 text-sm font-bold">{admin.name}</p>
                      <p className="m-0 mt-1 text-xs text-[#6b7280]">{admin.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="m-0 text-sm font-bold">{admin.department}</p>
                      <p className="m-0 mt-1 text-xs text-[#6b7280]">{admin.scope}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={admin.status} /></td>
                    <td className="px-6 py-4 text-sm text-[#6b7280]">{admin.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="hidden max-md:grid">
              {fixture.administrators.map((admin) => (
                <article className="grid grid-cols-[1fr_auto] gap-4 border-t border-[#e5e7eb] p-4" key={admin.email}>
                  <div className="min-w-0">
                    <h3 className="m-0 break-words text-sm font-bold">{admin.name}</h3>
                    <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">{admin.email}</p>
                    <p className="m-0 mt-5 break-words text-sm font-bold">{admin.department}</p>
                    <p className="m-0 mt-1 text-xs text-[#6b7280]">{admin.scope}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-6">
                    <StatusBadge status={admin.status} />
                    <p className="m-0 text-xs text-[#6b7280]">{admin.lastActive}</p>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard link="Log Lengkap" title="Log Aktivitas Sistem">
            <ul className="m-0 list-none p-0">
              {fixture.activity.map((item) => (
                <li className="flex gap-4 border-t border-[#e5e7eb] px-6 py-4 first:border-t-0 max-md:px-5" key={item.text}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[#111827]">
                    <SuperIcon name={item.icon} size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 break-words text-sm leading-5 text-[#111827]">{item.text}</p>
                    <p className="m-0 mt-2 text-xs text-[#6b7280]">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </main>
    </SuperAdminShell>
  );
}

export function SuperAdminUsersPage() {
  const fixture = superAdminUsersFixture;

  return (
    <SuperAdminShell active="users">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Kelola akun mahasiswa, staff fasilitas, dan Super Admin dengan status akses yang jelas."
          title="Pengguna"
        >
          <SuperButton>Ekspor CSV</SuperButton>
          <SuperButton primary>
            <Plus aria-hidden="true" size={15} />
            Tambah Pengguna
          </SuperButton>
        </PageHeader>

        <section className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-5">
          {fixture.kpis.map((kpi) => (
            <KpiCard icon={kpi.icon} key={kpi.label} label={kpi.label} value={kpi.value} />
          ))}
        </section>

        <section className="mt-7 grid grid-cols-[1fr_180px_180px] gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:grid-cols-1">
          <input
            aria-label="Cari pengguna"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            readOnly
            value="Cari nama, email, atau NIM"
          />
          <select
            aria-label="Filter role"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            defaultValue="Semua role"
          >
            <option>Semua role</option>
          </select>
          <select
            aria-label="Filter status"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            defaultValue="Semua status"
          >
            <option>Semua status</option>
          </select>
        </section>

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
              {fixture.users.map((user) => (
                <tr className="border-t border-[#e5e7eb]" key={user.identity}>
                  <td className="px-5 py-4">
                    <p className="m-0 text-sm font-bold">{user.name}</p>
                    <p className="m-0 mt-1 text-xs text-[#6b7280]">{user.identity}</p>
                  </td>
                  <td className="px-5 py-4">{user.role}</td>
                  <td className="px-5 py-4">{user.unit}</td>
                  <td className="px-5 py-4"><StatusBadge status={user.status} /></td>
                  <td className="px-5 py-4">
                    <a className="text-sm font-bold text-[#6366f1] no-underline" href="#">
                      {user.action}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="hidden gap-4 max-md:grid">
            {fixture.users.map((user) => (
              <article className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]" key={user.identity}>
                <UserField label="Pengguna">
                  <strong>{user.name}</strong>
                  <span className="block break-words text-xs text-[#6b7280]">{user.identity}</span>
                </UserField>
                <UserField label="Role">{user.role}</UserField>
                <UserField label="Unit">{user.unit}</UserField>
                <UserField label="Status"><StatusBadge status={user.status} /></UserField>
                <UserField label="Aksi">
                  <a className="text-sm font-bold text-[#6366f1] no-underline" href="#">
                    {user.action}
                  </a>
                </UserField>
              </article>
            ))}
          </div>
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
