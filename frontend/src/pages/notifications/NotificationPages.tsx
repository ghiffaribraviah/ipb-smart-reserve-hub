import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, Menu } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { NotificationSurface } from "../../components/NotificationSurface";
import { StudentHeaderSearch } from "../../components/layout/StudentHeaderSearch";
import { studentHomeSession } from "../../fixtures/studentHome";
import {
  categoryLabel,
  fetchNotifications,
  fetchUnreadNotificationCount,
  formatNotificationTime,
  groupNotificationsByDate,
  markAllNotificationsRead,
  markNotificationRead,
  resolveNotificationHref,
  type NotificationItem,
  type NotificationRole,
} from "../../notifications/notificationCenter";
import { StaffShell } from "../staff/StaffReservationOperationsPages";
import { SuperAdminShell } from "../super-admin/SuperAdminDashboardUsersPages";

const PAGE_SIZE = 20;

const studentNavItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

function StudentNotificationsShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <header className="fixed inset-x-0 top-0 z-50 flex h-[72px] justify-center border-b border-[#e5e7eb] bg-white max-md:h-16">
        <div className="flex h-full w-[1200px] max-w-[95%] items-center justify-between gap-[22px] max-md:max-w-full max-md:px-3.5">
          <div className="flex min-w-0 items-center gap-[22px] max-md:gap-3.5">
            <button
              aria-label="Buka navigasi mahasiswa"
              className="hidden text-slate-500 max-md:inline-flex"
              type="button"
            >
              <Menu aria-hidden="true" size={24} />
            </button>
            <a
              aria-label="IPB Smart Reserve Hub"
              className="whitespace-nowrap font-serif text-2xl font-bold leading-none text-[#1d7667] no-underline max-md:text-[22px]"
              href="/student"
            >
              <span className="hidden md:inline">
                IPB
                <br />
                SRH
              </span>
              <span className="md:hidden">IPB SRH</span>
            </a>
            <StudentHeaderSearch />
          </div>

          <nav aria-label="Navigasi mahasiswa" className="flex items-center gap-10 max-md:hidden">
            {studentNavItems.map((item) => (
              <a
                className="border-b-2 border-transparent pb-1 text-sm font-bold text-slate-500 no-underline"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-[22px] max-md:gap-3.5">
            <NotificationSurface className="text-slate-500" role="student" />
            <a
              aria-label={`Profil ${studentHomeSession.name}`}
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#0f9d58] text-[13px] font-bold text-white no-underline"
              href="/student/profile"
            >
              {studentHomeSession.initials}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-[104px] w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
        {children}
      </main>

      <footer className="mt-20 flex justify-center border-t border-[#e5e7eb] bg-white py-[22px] max-md:mt-16">
        <div className="flex w-[1200px] max-w-[95%] items-center justify-between gap-6 max-md:flex-col max-md:gap-3.5 max-md:text-center">
          <div className="flex min-w-0 items-center gap-4 max-md:flex-col max-md:gap-2">
            <p className="m-0 whitespace-nowrap font-serif text-[30px] font-bold leading-none text-[#4da38b]">
              IPB SRH
            </p>
            <p className="m-0 text-[13px] leading-5 text-[#6b7280]">
              © 2026 IPB Smart Reserve Hub. Hak cipta dilindungi.
            </p>
          </div>
          <nav
            aria-label="Navigasi footer mahasiswa"
            className="flex flex-wrap justify-end gap-x-[18px] gap-y-2.5 text-sm font-semibold text-[#6b7280] max-md:justify-center"
          >
            {studentNavItems.map((item) => (
              <a className="whitespace-nowrap no-underline" href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

function markNotificationReadInInfiniteCache(
  queryClient: ReturnType<typeof useQueryClient>,
  role: NotificationRole,
  notificationId: string,
) {
  queryClient.setQueryData<{ pages: NotificationItem[][]; pageParams: number[] } | undefined>(
    ["notifications", "pages", role],
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        pages: current.pages.map((page) =>
          page.map((notification) =>
            notification.id === notificationId && notification.read_at === null
              ? { ...notification, read_at: new Date().toISOString() }
              : notification,
          ),
        ),
      };
    },
  );
  queryClient.setQueryData<{ unread_count: number } | undefined>(["notifications", "unread-count"], (current) => {
    if (!current || current.unread_count <= 0) {
      return current;
    }

    return { unread_count: current.unread_count - 1 };
  });
}

function NotificationCenterContent({ role }: { role: NotificationRole }) {
  const queryClient = useQueryClient();
  const unreadCountQuery = useQuery({
    queryFn: fetchUnreadNotificationCount,
    queryKey: ["notifications", "unread-count"],
  });
  const notificationsQuery = useInfiniteQuery({
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchNotifications({ limit: PAGE_SIZE, offset: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length * PAGE_SIZE;
    },
    queryKey: ["notifications", "pages", role],
  });
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId) => {
      markNotificationReadInInfiniteCache(queryClient, role, notificationId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = notificationsQuery.data?.pages.flat() ?? [];
  const unreadCount = unreadCountQuery.data?.unread_count ?? 0;
  const groups = groupNotificationsByDate(notifications);

  return (
    <section className="pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[720px]">
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">Pusat notifikasi</p>
          <h1 className="m-0 mt-3 text-[32px] font-bold leading-tight max-md:text-[28px]">Semua Notifikasi</h1>
          <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
            Pantau pembaruan reservasi dan aktivitas sistem terbaru tanpa kehilangan alasan penolakan atau tindak lanjut.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#eef2f7] px-3 py-2 text-xs font-bold text-[#4b5563]">
            {unreadCount} belum dibaca
          </span>
          {unreadCount > 0 ? (
            <button
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#111827] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={markAllReadMutation.isPending}
              type="button"
              onClick={() => markAllReadMutation.mutate()}
            >
              <CheckCircle2 aria-hidden="true" size={16} />
              Tandai dibaca semua
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[20px] border border-[#e5e7eb] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        {notificationsQuery.isLoading ? (
          <div className="px-6 py-8 text-sm font-medium text-[#6b7280]">Memuat notifikasi...</div>
        ) : null}

        {notificationsQuery.isError ? (
          <div className="grid gap-3 px-6 py-8 text-sm text-[#6b7280]">
            <p className="m-0 font-semibold text-[#991b1b]">Notifikasi belum bisa dimuat.</p>
            <button
              className="justify-self-start rounded-lg border border-[#dbe2ea] bg-white px-3 py-2 text-xs font-bold text-[#374151]"
              type="button"
              onClick={() => notificationsQuery.refetch()}
            >
              Muat ulang notifikasi
            </button>
          </div>
        ) : null}

        {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef6f1] text-[#0f9d58]">
              <Bell aria-hidden="true" size={24} />
            </div>
            <p className="m-0 mt-4 text-base font-bold text-[#111827]">Belum ada notifikasi.</p>
            <p className="m-0 mt-2 text-sm text-[#6b7280]">Pembaruan baru akan muncul di halaman ini.</p>
          </div>
        ) : null}

        {!notificationsQuery.isLoading && !notificationsQuery.isError ? (
          <div className="divide-y divide-[#eef2f7]">
            {groups.map((group) => (
              <section key={group.date}>
                <div className="sticky top-0 border-b border-[#eef2f7] bg-[#f8fafc] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  {group.label}
                </div>
                <div className="divide-y divide-[#eef2f7]">
                  {group.items.map((notification) => {
                    const isUnread = notification.read_at === null;
                    const href = resolveNotificationHref(notification, role);

                    return (
                      <article
                        className={isUnread ? "bg-[#eef6f1]" : "bg-white"}
                        key={notification.id}
                      >
                        <div className="flex items-start gap-4 px-6 py-4 max-md:flex-col max-md:px-4">
                          <Link
                            aria-label={`Buka notifikasi ${notification.title}`}
                            className="min-w-0 flex-1 rounded-xl p-1 text-inherit no-underline outline-none transition-colors hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-[#0f9d58]"
                            to={href}
                            onClick={() => {
                              if (isUnread) {
                                markReadMutation.mutate(notification.id);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between gap-3 max-md:flex-col">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="m-0 break-words text-base font-bold leading-6 text-[#111827]">
                                    {notification.title}
                                  </p>
                                  <span className="rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-bold text-[#4b5563]">
                                    {categoryLabel(notification.category)}
                                  </span>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                      isUnread ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-[#6b7280]"
                                    }`}
                                  >
                                    {isUnread ? "Belum dibaca" : "Sudah dibaca"}
                                  </span>
                                </div>
                                <p className="m-0 mt-2 break-words text-sm leading-6 text-[#6b7280]">
                                  {notification.message}
                                </p>
                              </div>
                              <div className="shrink-0 text-xs font-semibold text-[#6b7280]">
                                {formatNotificationTime(notification.created_at)}
                              </div>
                            </div>
                          </Link>
                          {isUnread ? (
                            <button
                              aria-label={`Tandai dibaca ${notification.title}`}
                              className="inline-flex min-h-[40px] shrink-0 items-center rounded-full border border-[#dbe2ea] bg-white px-3 text-xs font-bold text-[#111827] transition-colors hover:bg-[#f8fafc]"
                              type="button"
                              onClick={() => markReadMutation.mutate(notification.id)}
                            >
                              Tandai dibaca
                            </button>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : null}

        {notificationsQuery.hasNextPage ? (
          <div className="border-t border-[#eef2f7] bg-[#f8fafc] px-6 py-4 max-md:px-4">
            <button
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#dbe2ea] bg-white px-4 text-sm font-bold text-[#111827] transition-colors hover:bg-[#ffffff] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={notificationsQuery.isFetchingNextPage}
              type="button"
              onClick={() => void notificationsQuery.fetchNextPage()}
            >
              {notificationsQuery.isFetchingNextPage ? "Memuat..." : "Muat lebih banyak"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function StudentNotificationsPage() {
  return (
    <StudentNotificationsShell>
      <NotificationCenterContent role="student" />
    </StudentNotificationsShell>
  );
}

export function StaffNotificationsPage() {
  return (
    <StaffShell active="home">
      <main className="mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
        <NotificationCenterContent role="staff" />
      </main>
    </StaffShell>
  );
}

export function SuperAdminNotificationsPage() {
  return (
    <SuperAdminShell active="dashboard">
      <main className="mx-auto mt-28 w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
        <NotificationCenterContent role="super_admin" />
      </main>
    </SuperAdminShell>
  );
}
