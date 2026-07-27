import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { ChatMessages } from "@/app/components/shared/ChatMessages";
import { SectionHeader } from "@/app/components/shared/SectionHeader";

export default async function StudentConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireProfile("student");

  const { data: conv } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .eq("student_id", user.id)
    .single();

  if (!conv) notFound();

  const otherId = conv.trainer_id;
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", otherId)
    .single();

  const otherName = otherProfile?.full_name ?? "Entrenador";

  return (
    <section className="space-y-4">
      <div>
        <Link
          className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-text-primary"
          href="/student/messages"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Mensajes
        </Link>
      </div>
      <SectionHeader
        eyebrow={conv.subject || "Conversación"}
        icon={<MessageCircle size={20} strokeWidth={2.25} />}
        title={otherName}
      />
      <ChatMessages
        conversationId={id}
        conversationStatus={conv.status as "open" | "closed"}
        otherName={otherName}
        userId={user.id}
      />
    </section>
  );
}
