"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MessageView } from "@/lib/data/messages";
import { getMessages } from "@/lib/data/messages";
import { sendMessage } from "@/app/messages/actions";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";

export function ChatMessages({
  conversationId,
  userId,
  otherName,
  conversationStatus,
}: {
  conversationId: string;
  userId: string;
  otherName: string;
  conversationStatus: "open" | "closed";
}) {
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      setLoading(true);
      const msgs = await getMessages(supabase, conversationId);
      setMessages(msgs);
      setLoading(false);
      scrollToBottom();
    }

    load();

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Record<string, unknown>;
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id as string,
              conversationId: newMsg.conversation_id as string,
              senderId: newMsg.sender_id as string,
              content: newMsg.content as string,
              read: newMsg.read as boolean,
              createdAt: newMsg.created_at as string,
            },
          ]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSend() {
    if (!input.trim() || sending || conversationStatus !== "open") return;
    setSending(true);
    try {
      await sendMessage(conversationId, input.trim());
      setInput("");
      inputRef.current?.focus();
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
      <div className="flex-1 space-y-3 overflow-y-auto px-1 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 pt-16 text-center">
            <MessageCircle size={32} strokeWidth={1.5} className="text-text-muted" />
            <p className="text-sm text-text-muted">No hay mensajes todavía. Escribí algo para empezar.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === userId;
            return (
              <div className={`flex ${isMine ? "justify-end" : "justify-start"}`} key={msg.id}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isMine
                      ? "bg-primary text-white"
                      : "glass-card border border-white/40 bg-white/60 text-text-primary"
                  }`}
                >
                  <p className="text-sm leading-snug">{msg.content}</p>
                  <p
                    className={`mt-1 text-right text-[10px] ${
                      isMine ? "text-white/70" : "text-text-muted"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {conversationStatus === "closed" ? (
        <div className="rounded-2xl bg-white/40 px-4 py-3 text-center text-sm font-bold text-text-muted backdrop-blur-sm">
          Conversación cerrada
        </div>
      ) : (
        <div className="flex items-center gap-2 border-t border-white/30 bg-white/40 px-1 pb-2 pt-3 backdrop-blur-sm">
          <input
            ref={inputRef}
            className="min-w-0 flex-1 rounded-2xl bg-white/60 px-4 py-2.5 text-sm text-text-primary outline-none ring-1 ring-white/40 placeholder:text-text-muted/60 focus:ring-primary/40"
            disabled={sending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí un mensaje..."
            type="text"
            value={input}
          />
          <button
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:opacity-40"
            disabled={!input.trim() || sending}
            onClick={handleSend}
            type="button"
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
