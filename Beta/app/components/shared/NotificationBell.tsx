"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, BellDot, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data as unknown as Notification[]);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
  }, [supabase, userId]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative flex size-9 items-center justify-center rounded-xl bg-white/30 text-text-muted transition hover:bg-white/50"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {unreadCount > 0 ? (
          <>
            <BellDot size={18} strokeWidth={2} />
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-status-urgent text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </>
        ) : (
          <Bell size={18} strokeWidth={2} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 origin-top-right animate-scale rounded-2xl border border-white/50 bg-white/90 p-3 shadow-lift backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">Notificaciones</p>
            {unreadCount > 0 && (
              <button
                className="text-[11px] font-bold text-primary hover:text-secondary"
                onClick={markAllAsRead}
                type="button"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="max-h-80 space-y-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">Sin notificaciones</p>
            ) : (
              notifications.map((n) => (
                <button
                  className={`flex w-full gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                    n.read ? "opacity-60" : "bg-primary/5"
                  } hover:bg-primary/10`}
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  type="button"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text-primary">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-text-muted line-clamp-2">{n.body}</p>}
                    <p className="mt-1 text-[10px] text-text-muted/60">
                      {new Date(n.created_at).toLocaleDateString("es-AR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-secondary" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
