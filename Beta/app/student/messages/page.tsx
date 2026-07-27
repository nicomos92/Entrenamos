import { MessageCircle } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getConversations } from "@/lib/data/messages";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { ConversationList } from "@/app/components/shared/ConversationList";

export default async function StudentMessagesPage() {
  const { supabase, user } = await requireProfile("student");

  const conversations = await getConversations(supabase, user.id);

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Conversaciones"
        icon={<MessageCircle size={20} strokeWidth={2.25} />}
        title="Mensajes"
      />
      <ConversationList conversations={conversations} role="student" userId={user.id} />
    </section>
  );
}
