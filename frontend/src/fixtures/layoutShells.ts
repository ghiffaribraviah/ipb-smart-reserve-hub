export type RoleKey = "student" | "staff" | "super_admin";

export type ShellFixture = {
  accent: "green";
  active: string;
  contentLabels: readonly string[];
  profile: {
    email: string;
    initials: string;
    name: string;
  };
  role: RoleKey;
  search?: string;
  subtitle: string;
  title: string;
  nav: readonly {
    href: string;
    key: string;
    label: string;
  }[];
};

export const shellFixtures: ShellFixture[] = [
  {
    accent: "green",
    active: "home",
    contentLabels: ["content", "cards", "summary"],
    profile: {
      email: "nadia@apps.ipb.ac.id",
      initials: "NP",
      name: "Nadia Putri",
    },
    role: "student",
    search: "Cari fasilitas",
    subtitle: "green accent",
    title: "Student Shell",
    nav: [
      { href: "/student", key: "home", label: "Beranda" },
      { href: "/student/facilities", key: "facilities", label: "Fasilitas" },
      { href: "/student/reservations", key: "reservations", label: "Reservasi" },
    ],
  },
  {
    accent: "green",
    active: "home",
    contentLabels: ["queue table", "facility list", "actions"],
    profile: {
      email: "bagus@apps.ipb.ac.id",
      initials: "BS",
      name: "Bagus Saputra",
    },
    role: "staff",
    search: "Cari reservasi",
    subtitle: "operational",
    title: "Staff Shell",
    nav: [
      { href: "/staff", key: "home", label: "Beranda" },
      { href: "/staff/reservations", key: "reservations", label: "Reservasi" },
      { href: "/staff/facilities", key: "facilities", label: "Fasilitas" },
    ],
  },
  {
    accent: "green",
    active: "dashboard",
    contentLabels: ["KPI", "governance", "activity"],
    profile: {
      email: "super_admin@apps.ipb.ac.id",
      initials: "SA",
      name: "Super Admin",
    },
    role: "super_admin",
    subtitle: "logo green accent",
    title: "Super Admin Shell",
    nav: [
      { href: "/super-admin", key: "dashboard", label: "Dashboard" },
      { href: "/super-admin/users", key: "users", label: "Pengguna" },
      { href: "/super-admin/facilities", key: "facilities", label: "Fasilitas" },
      { href: "/super-admin/reports", key: "reports", label: "Laporan" },
      { href: "/super-admin/system", key: "system", label: "Sistem" },
    ],
  },
] as const;

export const drawerFixture = {
  activeGreen: "student-home",
  activeSuper: "super-system",
  profile: shellFixtures[2].profile,
  nav: [
    { icon: "home", key: "student-home", label: "Beranda Mahasiswa" },
    { icon: "building", key: "facility", label: "Fasilitas" },
    { icon: "calendar", key: "reservation", label: "Reservasi" },
    { icon: "settings", key: "super-system", label: "Sistem Super Admin" },
  ],
} as const;
