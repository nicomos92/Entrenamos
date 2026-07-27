"use client";

import Link from "next/link";
import { MessageCircle, ChevronRight } from "lucide-react";
import type { ConversationView } from "@/lib/data/messages";
import { EmptyState } from "@/app/components/shared/EmptyState";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("es-AR");
}

export function ConversationList({
  conversations,
  userId,
  role,
}: {
  conversations: ConversationView[];
  userId: string;
  role: "student" | "trainer";
}) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        description="No tenés conversaciones activas."
        icon={<MessageCircle size={26} strokeWidth={2.25} />}
        title="Sin mensajes"
      />
    );
  }

  const basePath = role === "student" ? "/student/messages" : "/trainer/messages";

  return (
    <div className="space-y-3">
      {conversations.map((conv) => (
        <Link
          className="glass-card flex items-center gap-4 rounded-3xl p-4 transition hover:bg-white/40"
          href={`${basePath}/${conv.id}`}
          key={conv.id}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="truncate font-bold text-text-primary">{conv.otherName}</span>
              {conv.unreadCount > 0 && (
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">
                  {conv.unreadCount}
                </span>
              )}
            </div>
            {conv.subject && (
              <p className="truncate text-xs font-semibold text-text-muted">{conv.subject}</p>
            )}
            {conv.lastMessage && (
              <p className="truncate text-sm text-text-muted">
                {conv.lastMessage.content}
              </p>
            )}
            <span className="mt-0.5 text-xs text-text-muted">{timeAgo(conv.updatedAt)}</span>
          </div>
          <ChevronRight className="shrink-0 text-text-muted" size={18} strokeWidth={2} />
        </Link>
      ))}
    </div>
  );
}
