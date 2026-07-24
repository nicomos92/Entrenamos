import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getRoutines } from "@/lib/data/trainer";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { RoutinesList } from "@/app/trainer/routines/RoutinesList";

export default async function TrainerRoutinesPage() {
  const { supabase, user } = await requireProfile("trainer");
  const routines = await getRoutines(supabase, user.id);

  return (
    <section className="space-y-5">
      <SectionHeader
        action={
          <Link className="premium-button whitespace-nowrap px-4 py-3 text-sm" href="/trainer/routines/new">
            <Plus size={16} strokeWidth={2.5} />
            Rutina
          </Link>
        }
        eyebrow="Biblioteca del entrenador"
        icon={<ClipboardList size={20} strokeWidth={2.25} />}
        title="Rutinas"
      />

      <RoutinesList routines={routines} />
    </section>
  );
}
