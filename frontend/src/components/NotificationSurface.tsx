import { Bell, CheckCircle2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "../api/http";
import { cn } from "../utils/cn";

type NotificationRole = "staff" | "student" | "super_admin";

type NotificationTarget = {
  reservation_id: string | null;
  route: string;
  type: string;
};

type NotificationItem = {
  category: string;
  created_at: string;
  id: string;
  message: string;
  read_at: string | null;
  reservation_id: string | null;
  target: NotificationTarget | null;
  title: string;
};

const roleLanding: Record<NotificationRole, string> = {
  staff: "/staff",
  student: "/student",
  super_admin: "/super-admin",
};

const supportedRoutePatterns: Record<NotificationRole, RegExp[]> = {
  staff: [/^\/staff$/, /^\/staff\/facilities(?:\/[^/]+)?$/, /^\/staff\/reservations(?:\/[^/]+)?$/],
  student: [/^\/student$/, /^\/student\/facilities(?:\/[^/]+)?$/, /^\/student\/reservations(?:\/[^/]+)?$/],
  super_admin: [
    /^\/super-admin$/,
    /^\/super-admin\/facilities(?:\/[^/]+)?$/,
    /^\/super-admin\/reports$/,
    /^\/super-admin\/system$/,
    /^\/super-admin\/users$/,
  ],
};

function fetchNotifications() {
  return apiRequest<NotificationItem[]>("/notifications");
}

function markNotificationRead(notificationId: string) {
  return apiRequest<NotificationItem>(`/notifications/${notificationId}/read`, { method: "POST" });
}

function fillRouteTemplate(route: string, reservationId: string | null) {
  if (!reservationId) {
    return route;
  }

  return route.replace("{reservation_id}", encodeURIComponent(reservationId));
}

function isSupportedRoleRoute(route: string, role: NotificationRole) {
  return supportedRoutePatterns[role].some((pattern) => pattern.test(route));
}

export function resolveNotificationHref(notification: NotificationItem, role: NotificationRole) {
  const route = notification.target?.route
    ? fillRouteTemplate(notification.target.route, notification.target.reservation_id ?? notification.reservation_id)
    : null;

  if (route && isSupportedRoleRoute(route, role)) {
    return route;
  }

  return roleLanding[role];
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function categoryLabel(category: string) {
  if (category === "reservation") {
    return "Reservasi";
  }

  return "Sistem";
}

export function NotificationSurface({
  className,
  label = "Notifikasi",
  role,
}: {
  className?: string;
  label?: string;
  role: NotificationRole;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    enabled: isOpen,
    queryFn: fetchNotifications,
    queryKey: ["notifications"],
  });
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((notification) => notification.read_at === null).length;

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        aria-expanded={isOpen}
        aria-label={label}
        className="relative inline-flex border-0 bg-transparent p-0 text-current"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell aria-hidden="true" size={18} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dc2626] px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          aria-label="Daftar notifikasi"
          className="absolute right-0 top-8 z-[70] w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-lg border border-[#e5e7eb] bg-white text-left shadow-[0_18px_45px_rgba(15,23,42,0.16)] max-md:fixed max-md:left-3 max-md:right-3 max-md:top-[72px] max-md:w-auto"
          role="dialog"
        >
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
            <p className="m-0 text-sm font-bold text-[#111827]">Notifikasi</p>
            <span className="rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-bold text-[#4b5563]">
              {unreadCount} belum dibaca
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notificationsQuery.isLoading ? (
              <p className="m-0 px-4 py-5 text-sm font-medium text-[#6b7280]">Memuat notifikasi...</p>
            ) : null}

            {notificationsQuery.isError ? (
              <div className="grid gap-3 px-4 py-5 text-sm text-[#6b7280]">
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
              <p className="m-0 px-4 py-5 text-sm font-medium text-[#6b7280]">Belum ada notifikasi.</p>
            ) : null}

            {!notificationsQuery.isLoading && !notificationsQuery.isError
              ? notifications.map((notification) => {
                  const isUnread = notification.read_at === null;
                  return (
                    <article
                      className="grid gap-2 border-b border-[#eef2f7] px-4 py-3 last:border-b-0"
                      key={notification.id}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="m-0 break-words text-sm font-bold leading-5 text-[#111827]">
                            {notification.title}
                          </p>
                          <p className="m-0 mt-1 break-words text-xs font-medium leading-5 text-[#6b7280]">
                            {notification.message}
                          </p>
                        </div>
                        {isUnread ? (
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#dc2626]" aria-hidden="true" />
                        ) : (
                          <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-[#0f9d58]" size={16} />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#6b7280]">
                        <span className="rounded-full bg-[#f3f4f6] px-2 py-1">{categoryLabel(notification.category)}</span>
                        <time dateTime={notification.created_at}>{formatNotificationTime(notification.created_at)}</time>
                        <span>{isUnread ? "Belum dibaca" : "Sudah dibaca"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a
                          className="rounded-lg border border-[#dbe2ea] px-3 py-2 text-xs font-bold text-[#374151] no-underline"
                          href={resolveNotificationHref(notification, role)}
                        >
                          Buka {notification.title}
                        </a>
                        {isUnread ? (
                          <button
                            className="rounded-lg bg-[#111827] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                            disabled={markReadMutation.isPending}
                            type="button"
                            onClick={() => markReadMutation.mutate(notification.id)}
                          >
                            Tandai dibaca {notification.title}
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
