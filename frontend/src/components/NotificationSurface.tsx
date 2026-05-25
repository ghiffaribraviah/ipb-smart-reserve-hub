import { Bell, CheckCircle2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "../utils/cn";
import { Link } from "react-router-dom";
import {
  categoryLabel,
  fetchNotifications,
  fetchUnreadNotificationCount,
  formatNotificationTime,
  markAllNotificationsRead,
  markNotificationRead,
  notificationListingHref,
  resolveNotificationHref,
  type NotificationItem,
  type NotificationRole,
} from "../notifications/notificationCenter";

function markNotificationReadInCache(queryClient: ReturnType<typeof useQueryClient>, notificationId: string) {
  queryClient.setQueryData<NotificationItem[] | undefined>(["notifications"], (current) => {
    if (!current) {
      return current;
    }

    return current.map((notification) =>
      notification.id === notificationId && notification.read_at === null
        ? { ...notification, read_at: new Date().toISOString() }
        : notification,
    );
  });
  queryClient.setQueryData<{ unread_count: number } | undefined>(["notifications", "unread-count"], (current) => {
    if (!current || current.unread_count <= 0) {
      return current;
    }

    return { unread_count: current.unread_count - 1 };
  });
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
  const unreadCountQuery = useQuery({
    queryFn: fetchUnreadNotificationCount,
    queryKey: ["notifications", "unread-count"],
  });
  const notificationsQuery = useQuery({
    queryFn: fetchNotifications,
    queryKey: ["notifications"],
    enabled: isOpen,
  });
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId) => {
      markNotificationReadInCache(queryClient, notificationId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
  const notifications = notificationsQuery.data ?? [];
  const unreadCount = unreadCountQuery.data?.unread_count ?? 0;

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
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-bold text-[#4b5563]">
                {unreadCount} belum dibaca
              </span>
              {unreadCount > 0 ? (
                <button
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-[#dbe2ea] bg-white px-2.5 text-[11px] font-bold text-[#111827] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={markAllReadMutation.isPending}
                  type="button"
                  onClick={() => markAllReadMutation.mutate()}
                >
                  <CheckCircle2 aria-hidden="true" size={13} />
                  <span>Tandai semua</span>
                </button>
              ) : null}
            </div>
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
                  const href = resolveNotificationHref(notification, role);
                  return (
                    <article
                      className={cn(
                        "grid gap-2 border-b border-[#eef2f7] px-4 py-3 last:border-b-0 transition-colors",
                        isUnread ? "bg-[#eef6f1]" : "bg-white",
                      )}
                      key={notification.id}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <Link
                          aria-label={`Buka notifikasi ${notification.title}`}
                          className="min-w-0 flex-1 rounded-lg no-underline outline-none transition-colors hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-[#0f9d58]"
                          to={href}
                          onClick={() => {
                            if (isUnread) {
                              markReadMutation.mutate(notification.id);
                            }
                            setIsOpen(false);
                          }}
                        >
                          <p className="m-0 break-words text-sm font-bold leading-5 text-[#111827]">
                            {notification.title}
                          </p>
                          <p className="m-0 mt-1 break-words text-xs font-medium leading-5 text-[#6b7280]">
                            {notification.message}
                          </p>
                        </Link>
                        <div className="flex shrink-0 items-start gap-1.5 pt-0.5">
                          {isUnread ? (
                            <span
                              aria-hidden="true"
                              className="mt-1 h-2.5 w-2.5 rounded-full bg-[#dc2626]"
                            />
                          ) : (
                            <CheckCircle2 aria-hidden="true" className="mt-0.5 text-[#0f9d58]" size={16} />
                          )}
                          {isUnread ? (
                            <button
                              aria-label={`Tandai dibaca ${notification.title}`}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#dbe2ea] bg-white text-[#0f9d58] transition-colors hover:bg-[#ecfdf5] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={markReadMutation.isPending}
                              type="button"
                              onClick={() => markReadMutation.mutate(notification.id)}
                            >
                              <CheckCircle2 aria-hidden="true" size={14} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#6b7280]">
                        <span className="rounded-full bg-[#f3f4f6] px-2 py-1">{categoryLabel(notification.category)}</span>
                        <time dateTime={notification.created_at}>{formatNotificationTime(notification.created_at)}</time>
                        <span>{isUnread ? "Belum dibaca" : "Sudah dibaca"}</span>
                      </div>
                    </article>
                  );
                })
              : null}
          </div>
          <div className="border-t border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
            <Link
              className="text-sm font-bold text-[#0f9d58] no-underline"
              to={notificationListingHref(role)}
              onClick={() => setIsOpen(false)}
            >
              Lihat semua notifikasi
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
