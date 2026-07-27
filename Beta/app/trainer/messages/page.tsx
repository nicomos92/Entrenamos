import { MessageCircle } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getConversations } from "@/lib/data/messages";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { ConversationList } from "@/app/components/shared/ConversationList";

export default async function TrainerMessagesPage() {
  const { supabase, user } = await requireProfile("trainer");

  const conversations = await getConversations(supabase, user.id);

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Mensajes con alumnos"
        icon={<MessageCircle size={20} strokeWidth={2.25} />}
        title="Bandeja de entrada"
      />
      <ConversationList conversations={conversations} role="trainer" userId={user.id} />
    </section>
  );
}
