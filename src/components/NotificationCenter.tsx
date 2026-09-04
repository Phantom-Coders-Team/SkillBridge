"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Mail,
  Sparkles,
  Briefcase,
  CalendarClock,
  Award,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { AppNotification } from "@/lib/notifications";

export function NotificationCenter({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      handleMarkAsRead(notif.id);
    }
    setOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silent fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "APPLICATION":
        return <Briefcase className="size-4 text-emerald-500" />;
      case "PITCH":
        return <Sparkles className="size-4 text-purple-500" />;
      case "MENTOR_SLOT":
        return <CalendarClock className="size-4 text-amber-500" />;
      case "BADGE":
        return <Award className="size-4 text-indigo-500" />;
      default:
        return <Mail className="size-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        aria-label="View notifications"
        className="relative flex size-9 items-center justify-center rounded-xl border border-border-muted bg-surface text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className="animate-pop-in absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border-muted bg-surface shadow-pop sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-muted px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-text-primary">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary"
              >
                <CheckCheck className="size-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border-muted">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-text-secondary">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Mail className="mx-auto size-7 text-text-secondary/40" />
                <p className="mt-2 text-xs font-semibold text-text-primary">No notifications yet</p>
                <p className="mt-0.5 text-[11px] text-text-secondary">
                  You will receive email notifications as offers, pitches, and bookings occur.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex cursor-pointer items-start gap-3 p-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    !notif.read ? "bg-indigo-50/30 dark:bg-indigo-950/20" : ""
                  }`}
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated border border-border-muted shadow-xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`truncate text-xs ${
                          !notif.read
                            ? "font-bold text-text-primary"
                            : "font-semibold text-text-secondary"
                        }`}
                      >
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="size-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-text-secondary line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800">
                        <Mail className="size-2.5" /> Email Dispatched
                      </span>
                      <span className="text-[10px] text-text-secondary/70">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {notif.link && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notif);
                          }}
                          className="ml-auto inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100 hover:text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/80"
                        >
                          <span>View</span>
                          <ExternalLink className="size-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border-muted px-4 py-2.5 text-center text-[11px] text-text-secondary">
            <span>Delivered via SkillBridge Email Engine to </span>
            <span className="font-semibold text-text-primary">{userEmail}</span>
          </div>
        </div>
      )}
    </div>
  );
}
