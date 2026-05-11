import {
  Bell,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  Home,
  LogOut,
  Search,
  UserRound,
} from "lucide-react";
import { FormEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { UserAccount } from "../auth/types";

export type StudentNavKey = "Beranda" | "Fasilitas" | "Reservasi" | "Profil";

type StudentAppShellProps = {
  confirmNavigation?: () => boolean;
  currentUser: UserAccount;
  isPreview?: boolean;
  logout: () => void;
  notificationCount?: number;
  previewContent?: ReactNode;
  previewPath?: string;
};

type NavItem = {
  href: string;
  icon: typeof Home;
  key: StudentNavKey;
};

const navItems: NavItem[] = [
  { href: "/student", icon: Home, key: "Beranda" },
  { href: "/student/facilities", icon: Building2, key: "Fasilitas" },
  { href: "/student/reservations", icon: CalendarDays, key: "Reservasi" },
];

const mobileNavItems: NavItem[] = [...navItems, { href: "/student/profile", icon: UserRound, key: "Profil" }];

export function StudentAppShell({
  confirmNavigation = () => true,
  currentUser,
  isPreview = false,
  logout,
  notificationCount,
  previewContent,
  previewPath,
}: StudentAppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const shellPathname = previewPath ?? location.pathname;
  const activeNav = getStudentActiveNav(shellPathname);
  const showSearch = isStudentShellSearchVisible(shellPathname);
  const initials = getInitials(currentUser.full_name);
  const hasNotificationBadge = typeof notificationCount === "number" && notificationCount > 0;

  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isProfileOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        profileButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isProfileOpen]);

  function requestNavigation(href: string) {
    if (!confirmNavigation()) {
      return;
    }
    navigate(href);
  }

  function onNavClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    requestNavigation(href);
  }

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    const destination = trimmedQuery ? `/student/facilities?${new URLSearchParams({ q: trimmedQuery }).toString()}` : "/student/facilities";
    requestNavigation(destination);
  }

  function onLogout() {
    if (!confirmNavigation()) {
      return;
    }
    logout();
  }

  return (
    <div className={["relative bg-surface text-on-surface", isPreview ? "min-h-[720px] overflow-hidden rounded-lg border border-outline-variant" : "min-h-screen"].join(" ")}>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-md focus:top-md focus:z-50 focus:rounded focus:bg-secondary focus:px-md focus:py-sm focus:text-secondary-on"
        href="#student-main"
      >
        Lewati ke konten utama
      </a>

      <header
        className={[
          "top-0 z-40 border-b border-outline-variant bg-surface-container-lowest/95 shadow-control backdrop-blur",
          isPreview ? "absolute inset-x-0" : "sticky",
        ].join(" ")}
      >
        <div className="mx-auto flex min-h-16 max-w-container items-center gap-md px-md py-sm lg:px-gutter">
          <Link
            aria-label="IPB Smart Reserve Hub beranda"
            className="flex shrink-0 items-center gap-sm rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            onClick={(event) => onNavClick(event, "/student")}
            to="/student"
          >
            <span className="grid h-10 w-10 place-items-center rounded bg-primary-container text-label-bold text-primary-on">SRH</span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-label-bold text-primary-container">IPB SRH</span>
              <span className="block text-label-sm text-on-surface-variant">Smart Reserve Hub</span>
            </span>
          </Link>

          <nav aria-label="Navigasi utama mahasiswa" className="hidden items-center gap-xs md:flex">
            {navItems.map((item) => (
              <StudentNavLink activeNav={activeNav} item={item} key={item.key} onNavClick={onNavClick} />
            ))}
          </nav>

          {showSearch ? (
            <form aria-label="Pencarian fasilitas global" className="ml-auto hidden min-w-72 max-w-md flex-1 md:block" onSubmit={onSearchSubmit} role="search">
              <div className="flex min-h-11 items-center gap-sm rounded-xl border border-outline-variant bg-surface-container-low px-md shadow-control focus-within:border-secondary focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-secondary">
                <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-primary-container" />
                <label className="sr-only" htmlFor="student-shell-search">
                  Cari fasilitas
                </label>
                <input
                  className="min-w-0 flex-1 bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                  id="student-shell-search"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari fasilitas"
                  type="search"
                  value={query}
                />
                <button className="rounded px-sm py-xs text-label-bold text-secondary hover:bg-secondary-fixed" type="submit">
                  Cari
                </button>
              </div>
            </form>
          ) : (
            <div className="ml-auto hidden md:block" />
          )}

          <div className="ml-auto flex items-center gap-sm md:ml-0">
            <button
              aria-label={hasNotificationBadge ? `Notifikasi, ${notificationCount} belum dibaca` : "Notifikasi"}
              className="relative grid h-11 w-11 place-items-center rounded border border-outline-variant bg-surface-container-lowest text-primary-container transition-colors hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              type="button"
            >
              <Bell aria-hidden="true" className="h-5 w-5" />
              {hasNotificationBadge ? (
                <span className="absolute right-1 top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-tertiary-container px-1 text-label-sm font-bold text-tertiary-on-container">
                  {notificationCount}
                </span>
              ) : null}
            </button>

            <div className="relative hidden md:block">
              <button
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
                aria-label={`Menu profil ${currentUser.full_name}`}
                className="flex min-h-11 items-center gap-sm rounded border border-outline-variant bg-surface-container-lowest px-sm text-left transition-colors hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                onClick={() => setIsProfileOpen((value) => !value)}
                ref={profileButtonRef}
                type="button"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary-container text-label-bold text-secondary-on-container">{initials}</span>
                <span className="hidden max-w-36 truncate text-label-bold text-primary-container lg:block">{currentUser.full_name}</span>
                <ChevronDown aria-hidden="true" className="h-4 w-4 text-on-surface-variant" />
              </button>

              {isProfileOpen ? (
                <div
                  aria-label="Menu profil"
                  className="absolute right-0 mt-sm w-56 rounded-lg border border-outline-variant bg-surface-container-lowest p-sm shadow-ambient"
                  role="menu"
                >
                  <Link
                    className="flex min-h-11 items-center gap-sm rounded px-md text-body-md text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                    onClick={(event) => onNavClick(event, "/student/profile")}
                    role="menuitem"
                    to="/student/profile"
                  >
                    <UserRound aria-hidden="true" className="h-5 w-5" />
                    Profil Saya
                  </Link>
                  <button
                    className="flex min-h-11 w-full items-center gap-sm rounded px-md text-left text-body-md text-error transition-colors hover:bg-error-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                    onClick={onLogout}
                    role="menuitem"
                    type="button"
                  >
                    <LogOut aria-hidden="true" className="h-5 w-5" />
                    Keluar
                  </button>
                </div>
              ) : null}
            </div>

            <Link
              aria-label={`Profil ${currentUser.full_name}`}
              className="grid h-11 w-11 place-items-center rounded-full bg-secondary-container text-label-bold text-secondary-on-container md:hidden"
              onClick={(event) => onNavClick(event, "/student/profile")}
              to="/student/profile"
            >
              {initials}
            </Link>
          </div>
        </div>

        {showSearch ? (
          <form aria-label="Pencarian fasilitas global mobile" className="border-t border-outline-variant px-md py-sm md:hidden" onSubmit={onSearchSubmit} role="search">
            <div className="flex min-h-11 items-center gap-sm rounded-xl border border-outline-variant bg-surface-container-low px-md">
              <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-primary-container" />
              <label className="sr-only" htmlFor="student-shell-search-mobile">
                Cari fasilitas
              </label>
              <input
                className="min-w-0 flex-1 bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                id="student-shell-search-mobile"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari fasilitas"
                type="search"
                value={query}
              />
              <button className="rounded px-sm py-xs text-label-bold text-secondary" type="submit">
                Cari
              </button>
            </div>
          </form>
        ) : null}
      </header>

      <main
        className={[
          "mx-auto max-w-container px-md pb-28 lg:px-gutter",
          isPreview ? "min-h-[600px] pt-32 md:pt-28" : "min-h-[calc(100vh-160px)] pt-lg md:pb-xl md:pt-xl",
        ].join(" ")}
        id="student-main"
      >
        {previewContent ?? <Outlet />}
      </main>

      <footer className="hidden border-t border-outline-variant bg-primary-container text-primary-on md:block">
        <div className="mx-auto flex max-w-container items-center justify-between gap-lg px-gutter py-lg">
          <div>
            <p className="text-label-bold">IPB Smart Reserve Hub</p>
            <p className="mt-xs text-label-sm text-primary-on/75">Reservasi fasilitas kampus yang tertata dan mudah dipantau.</p>
          </div>
          <BookOpenCheck aria-hidden="true" className="h-6 w-6 text-secondary-fixed" />
        </div>
      </footer>

      <nav
        aria-label="Navigasi bawah mahasiswa"
        className={[
          "inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-primary-container px-sm pb-[calc(env(safe-area-inset-bottom)+8px)] pt-sm text-primary-on md:hidden",
          isPreview ? "absolute" : "fixed",
        ].join(" ")}
      >
        <div className="mx-auto grid max-w-md grid-cols-4 gap-xs">
          {mobileNavItems.map((item) => (
            <StudentMobileNavLink activeNav={activeNav} item={item} key={item.key} onNavClick={onNavClick} />
          ))}
        </div>
      </nav>
    </div>
  );
}

export function getStudentActiveNav(pathname: string): StudentNavKey {
  if (pathname === "/student/profile") {
    return "Profil";
  }
  if (pathname === "/student") {
    return "Beranda";
  }
  if (pathname.startsWith("/student/reservations")) {
    return "Reservasi";
  }
  if (pathname.startsWith("/student/facilities")) {
    return "Fasilitas";
  }
  return "Beranda";
}

export function isStudentShellSearchVisible(pathname: string) {
  if (pathname.includes("/reserve/")) {
    return false;
  }
  if (/^\/student\/reservations\/[^/]+(?:\/|$)/.test(pathname)) {
    return false;
  }
  return pathname === "/student" || pathname.startsWith("/student/facilities") || pathname === "/student/reservations" || pathname === "/student/profile";
}

function StudentNavLink({
  activeNav,
  item,
  onNavClick,
}: {
  activeNav: StudentNavKey;
  item: NavItem;
  onNavClick: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const Icon = item.icon;
  const isActive = activeNav === item.key;
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex min-h-11 items-center gap-sm rounded px-md text-label-bold transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
        isActive ? "bg-secondary-container text-secondary-on-container" : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary-container",
      ].join(" ")}
      onClick={(event) => onNavClick(event, item.href)}
      to={item.href}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {item.key}
    </Link>
  );
}

function StudentMobileNavLink({
  activeNav,
  item,
  onNavClick,
}: {
  activeNav: StudentNavKey;
  item: NavItem;
  onNavClick: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const Icon = item.icon;
  const isActive = activeNav === item.key;
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={[
        "grid min-h-14 place-items-center gap-1 rounded px-xs py-xs text-center text-[11px] font-bold leading-tight transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-fixed",
        isActive ? "bg-secondary-container text-secondary-on-container" : "text-primary-on/78 hover:bg-primary-on/10",
      ].join(" ")}
      onClick={(event) => onNavClick(event, item.href)}
      to={item.href}
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
      <span>{item.key}</span>
    </Link>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
