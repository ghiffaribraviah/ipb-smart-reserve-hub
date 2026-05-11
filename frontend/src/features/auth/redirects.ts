import { UserRole } from "./types";

export function roleHomePath(role: UserRole) {
  if (role === "staff") {
    return "/staff";
  }
  if (role === "super_admin") {
    return "/admin";
  }
  return "/student";
}

export function safeRedirectForRole(target: string | null, role: UserRole) {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(target, "http://app.local");
  } catch {
    return null;
  }

  if (parsed.origin !== "http://app.local") {
    return null;
  }

  const fullPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;

  if (role === "student" && isStudentPath(parsed.pathname)) {
    return fullPath;
  }
  if (role === "staff" && isWithinRoleShell(parsed.pathname, "/staff")) {
    return fullPath;
  }
  if (role === "super_admin" && isWithinRoleShell(parsed.pathname, "/admin")) {
    return fullPath;
  }

  return null;
}

export function loginPathWithRedirect(currentPath: string) {
  const safeTarget = currentPath.startsWith("/") && !currentPath.startsWith("//") ? currentPath : "/student";
  return `/login?redirect=${encodeURIComponent(safeTarget)}`;
}

function isStudentPath(pathname: string) {
  return isWithinRoleShell(pathname, "/student");
}

function isWithinRoleShell(pathname: string, shell: string) {
  return pathname === shell || pathname.startsWith(`${shell}/`);
}
