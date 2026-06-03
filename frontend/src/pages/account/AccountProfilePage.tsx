import { useMemo } from "react";
import { useAuth, type UserRole } from "../../auth/session";
import { StaffShell } from "../staff/StaffReservationOperationsPages";
import { SuperAdminShell } from "../super-admin/SuperAdminDashboardUsersPages";
import logo from "../../assets/logo.png";

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
    faculty: displayValue(profile?.faculty ?? profile?.academic_profile?.faculty),
    nim: displayValue(profile?.nim),
    nip: displayValue(profile?.nip),
    phone: displayValue(profile?.phone),
    program: displayValue(profile?.academic_profile?.program_studi),
    role: profile ? roleLabel[profile.role] : "Akun",
  };
  const profileRows = useMemo(
    () =>
      profile?.role === "super_admin"
        ? ([
            ["Role", visibleProfile.role],
            ["Email", visibleProfile.email],
          ] as const)
        : profile?.role === "staff"
          ? ([
              ["Role", visibleProfile.role],
              ["Email", visibleProfile.email],
              ["Nomor Telepon", visibleProfile.phone],
              ["NIP", visibleProfile.nip],
              ["Fakultas", visibleProfile.faculty],
            ] as const)
          : ([
              ["Role", visibleProfile.role],
              ["Email", visibleProfile.email],
              ["Nomor Telepon", visibleProfile.phone],
              ["NIM", visibleProfile.nim],
              ["Program Studi", visibleProfile.program],
              ["Fakultas", visibleProfile.faculty],
              ["Tahun Masuk", visibleProfile.entryYear],
              ["Strata", visibleProfile.degree],
            ] as const),
    [
      visibleProfile.degree,
      visibleProfile.email,
      visibleProfile.entryYear,
      visibleProfile.faculty,
      visibleProfile.nim,
      visibleProfile.nip,
      visibleProfile.phone,
      visibleProfile.program,
      visibleProfile.role,
      profile?.role,
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
      <section className="mt-8 rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
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
