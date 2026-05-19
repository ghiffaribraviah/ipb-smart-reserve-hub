import { LogOut } from "lucide-react";
import { useMemo } from "react";
import { useAuth, type UserRole } from "../../auth/session";
import { StaffShell } from "../staff/StaffReservationOperationsPages";
import { SuperAdminShell } from "../super-admin/SuperAdminDashboardUsersPages";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Belum tersedia" : String(value);
}

const roleLabel: Record<UserRole, string> = {
  staff: "Staff",
  student: "Mahasiswa",
  super_admin: "Super Admin",
};

function ProfileContent() {
  const auth = useAuth();
  const profile = auth.user;
  const visibleProfile = {
    degree: displayValue(profile?.academic_profile?.degree),
    email: displayValue(profile?.email),
    entryYear: displayValue(profile?.academic_profile?.entry_year),
    faculty: displayValue(profile?.academic_profile?.faculty),
    initials: initials(profile?.full_name ?? "User"),
    name: displayValue(profile?.full_name),
    nim: displayValue(profile?.nim),
    phone: displayValue(profile?.phone),
    program: displayValue(profile?.academic_profile?.program_studi),
    role: profile ? roleLabel[profile.role] : "Akun",
    status: profile?.is_active ? "Akun Aktif" : "Tidak Aktif",
  };
  const profileRows = useMemo(
    () =>
      [
        ["Role", visibleProfile.role],
        ["Email", visibleProfile.email],
        ["Nomor Telepon", visibleProfile.phone],
        ["NIM", visibleProfile.nim],
        ["Program Studi", visibleProfile.program],
        ["Fakultas", visibleProfile.faculty],
        ["Tahun Masuk", visibleProfile.entryYear],
        ["Strata", visibleProfile.degree],
      ] as const,
    [
      visibleProfile.degree,
      visibleProfile.email,
      visibleProfile.entryYear,
      visibleProfile.faculty,
      visibleProfile.nim,
      visibleProfile.phone,
      visibleProfile.program,
      visibleProfile.role,
    ],
  );

  return (
    <main className="mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
      <section className="max-w-[620px]">
        <h1 className="m-0 text-[32px] font-bold max-md:text-[30px]">Profil Akun</h1>
        <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
          Lihat identitas akun dan status akses yang terhubung dengan sesi saat ini.
        </p>
      </section>
      <div className="mt-8 grid grid-cols-[320px_1fr] items-start gap-8 max-lg:grid-cols-1">
        <aside className="rounded-xl border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
          <div className="mx-auto flex h-[116px] w-[116px] items-center justify-center rounded-full border-4 border-white bg-[#e8f5e9] text-[38px] font-bold text-[#0f9d58] shadow">
            {visibleProfile.initials}
          </div>
          <h2 className="m-0 mt-6 text-xl font-bold">{visibleProfile.name}</h2>
          <p className="m-0 mt-2 text-sm text-[#6b7280]">{visibleProfile.role}</p>
          <p className="m-0 mt-1 break-words text-sm text-[#6b7280]">{visibleProfile.email}</p>
          <span className="mt-5 inline-flex rounded-full bg-[#dcfce7] px-4 py-2 text-sm font-bold text-[#047857]">
            {visibleProfile.status}
          </span>
          <button
            aria-label="Keluar"
            className="mt-7 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-[#fecaca] bg-[#fee2e2] text-sm font-bold text-[#b91c1c]"
            onClick={() => auth.logout()}
            type="button"
          >
            <LogOut aria-hidden="true" size={18} />
            Keluar
          </button>
        </aside>
        <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
          <h2 className="m-0 text-xl font-bold">Informasi Akun</h2>
          <dl className="m-0 mt-6 grid grid-cols-2 gap-x-10 gap-y-7 border-t border-[#e5e7eb] pt-6 max-md:grid-cols-1">
            {profileRows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  {label}
                </dt>
                <dd className="m-0 mt-3 break-words text-base font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}

export function StaffProfilePage() {
  return (
    <StaffShell active="home">
      <ProfileContent />
    </StaffShell>
  );
}

export function SuperAdminProfilePage() {
  return (
    <SuperAdminShell active="dashboard">
      <ProfileContent />
    </SuperAdminShell>
  );
}
