export type UserRole = "student" | "staff" | "super_admin";

export type AcademicProfile = {
  degree: string | null;
  entry_year: number | null;
  faculty: string | null;
  program_studi: string | null;
};

export type UserAccount = {
  academic_profile: AcademicProfile | null;
  email: string;
  full_name: string;
  id: string;
  is_active: boolean;
  nim: string | null;
  phone: string | null;
  role: UserRole;
};
