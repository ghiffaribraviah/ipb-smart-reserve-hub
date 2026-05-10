import { apiRequest } from '../../shared/api';

export type UserRole = 'student' | 'staff' | 'super_admin';

export type CurrentUser = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiRequest<CurrentUser>('/auth/me');
}

export function getRoleLandingPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    student: '/student',
    staff: '/staff',
    super_admin: '/admin',
  };

  return paths[role];
}
