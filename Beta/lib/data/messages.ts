import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export interface ConversationView {
  id: string;
  studentId: string;
  trainerId: string;
  subject: string;
  status: "open" | "closed";
  contextType: string | null;
  contextId: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
  otherName: string;
}

export interface MessageView {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export async function getConversations(supabase: Client, userId: string): Promise<ConversationView[]> {
  const { data: convs } = await supabase
    .from("conversations")
    .select("*")
    .or(`student_id.eq.${userId},trainer_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (!convs || convs.length === 0) return [];

  const convIds = convs.map((c) => c.id);

  const { data: lastMessages } = await supabase
    .from("messages")
    .select("conversation_id, content, created_at, sender_id")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false }) as unknown as {
    data: { conversation_id: string; content: string; created_at: string; sender_id: string }[] | null;
  };

  const countByConv: Record<string, number> = {};
  const { data: unreadRows } = await supabase
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", convIds)
    .eq("read", false)
    .neq("sender_id", userId);
  for (const r of unreadRows ?? []) {
    countByConv[r.conversation_id] = (countByConv[r.conversation_id] ?? 0) + 1;
  }

  const lastByConv: Record<string, { content: string; created_at: string; sender_id: string }> = {};
  for (const m of lastMessages ?? []) {
    if (!lastByConv[m.conversation_id]) lastByConv[m.conversation_id] = m;
  }

  const otherIds = convs.map((c) => (c.student_id === userId ? c.trainer_id : c.student_id));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", otherIds);

  const nameMap: Record<string, string> = {};
  for (const p of profiles ?? []) nameMap[p.id] = p.full_name;

  return convs.map((c) => {
    const otherId = c.student_id === userId ? c.trainer_id : c.student_id;
    const lm: { content: string; created_at: string; sender_id: string } | undefined = lastByConv[c.id];
    return {
      id: c.id,
      studentId: c.student_id,
      trainerId: c.trainer_id,
      subject: c.subject,
      status: c.status as "open" | "closed",
      contextType: c.context_type,
      contextId: c.context_id,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      lastMessage: lm ? { content: lm.content, createdAt: lm.created_at, senderId: lm.sender_id } : null,
      unreadCount: countByConv[c.id] ?? 0,
      otherName: nameMap[otherId] ?? "Usuario",
    };
  });
}

export async function getMessages(supabase: Client, conversationId: string): Promise<MessageView[]> {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((m) => ({
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    content: m.content,
    read: m.read,
    createdAt: m.created_at,
  }));
}
