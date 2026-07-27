"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startConversation(params: {
  studentId: string;
  trainerId: string;
  subject?: string;
  contextType?: string;
  contextId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("student_id", params.studentId)
    .eq("trainer_id", params.trainerId)
    .eq("status", "open");

  // If there's an existing open conversation, reuse it
  if (existing && existing.length > 0) {
    const convId = existing[0].id;
    revalidatePath("/student/messages");
    return { id: convId, existing: true };
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      student_id: params.studentId,
      trainer_id: params.trainerId,
      subject: params.subject ?? "",
      context_type: params.contextType ?? "general",
      context_id: params.contextId ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error("No se pudo crear la conversación");
  revalidatePath("/student/messages");
  return { id: data.id, existing: false };
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!content.trim()) throw new Error("El mensaje no puede estar vacío");

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content.trim(),
  });

  if (error) throw new Error("No se pudo enviar el mensaje");

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath("/student/messages");
  revalidatePath("/trainer/messages");
}

export async function markConversationRead(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id);
}
