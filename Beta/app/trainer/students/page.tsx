import Link from "next/link";
import { Users, Plus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getStudentsWithStats } from "@/lib/data/trainer";
import { StudentsList } from "@/app/trainer/students/StudentsList";
import { SectionHeader } from "@/app/components/shared/SectionHeader";

export default async function TrainerStudentsPage() {
  const { supabase, user } = await requireProfile("trainer");
  const students = await getStudentsWithStats(supabase, user.id);

  return (
    <section className="space-y-5">
      <SectionHeader
        action={
          <Link className="premium-button whitespace-nowrap px-4 py-3 text-sm" href="/trainer/students/new">
            <Plus size={16} strokeWidth={2.5} />
            Alumno
          </Link>
        }
        eyebrow="Gestión de alumnos"
        icon={Users}
        title="Alumnos"
      />

      <StudentsList students={students} />
    </section>
  );
}
