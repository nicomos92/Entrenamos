import Link from "next/link";
import { Users, AlertTriangle, CalendarClock, TrendingUp, Flame, PartyPopper, UserPlus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getStudentsWithStats } from "@/lib/data/trainer";
import { Metric } from "@/app/components/shared/Metric";
import { IconBadge } from "@/app/components/shared/IconBadge";
import { EmptyState } from "@/app/components/shared/EmptyState";

export default async function TrainerDashboardPage() {
  const { supabase, user } = await requireProfile("trainer");
  const students = await getStudentsWithStats(supabase, user.id);

  const activeStudents = students.filter((s) => s.status === "activo").length;
  const needsAttention = students.filter((s) => (s.lastEffort ?? 0) >= 5 || s.status === "inactivo");
  const studentsToday = students.reduce((sum, s) => sum + s.scheduleToday, 0);
  const avgAdherence =
    students.length === 0
      ? 0
      : Math.round(
          (students.reduce((sum, s) => sum + Math.min(1, s.weeklyCompleted / 5), 0) / students.length) * 100
        );

  const priority = needsAttention[0];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-text-muted">Vista exclusiva del entrenador</p>
        <h1 className="mt-1 text-4xl font-bold text-text-primary">Panel del día</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={<Users size={16} strokeWidth={2.25} />} label="Alumnos activos" value={`${activeStudents}`} />
        <Metric icon={<AlertTriangle size={16} strokeWidth={2.25} />} label="Alertas" value={`${needsAttention.length}`} />
        <Metric icon={<CalendarClock size={16} strokeWidth={2.25} />} label="Alumnos hoy" value={`${studentsToday}`} />
        <Metric icon={<TrendingUp size={16} strokeWidth={2.25} />} label="Cumplimiento" value={`${avgAdherence}%`} />
      </div>

      {students.length === 0 ? (
        <EmptyState
          action={
            <Link className="premium-button w-full" href="/trainer/students">
              <UserPlus size={18} strokeWidth={2.25} />
              Agregar alumno
            </Link>
          }
          description="Empezá dando de alta a tu primer alumno para ver su progreso acá."
          icon={<Users size={26} strokeWidth={2.25} />}
          title="Todavía no tenés alumnos cargados"
        />
      ) : priority ? (
        <article className="glass-card rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <IconBadge icon={<Flame size={20} strokeWidth={2.25} />} tone="attention" />
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-text-muted">Prioridad</p>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-primary">{priority.fullName}</h2>
          <p className="mt-2 text-text-muted">
            {priority.status === "inactivo"
              ? "Sin actividad reciente. Conviene retomar contacto."
              : `Marcó RPE ${priority.lastEffort}/5 en la última sesión. Conviene ajustar volumen o descanso.`}
          </p>
          <Link className="premium-button mt-5 block w-full text-center" href="/trainer/students">
            Revisar alumnos
          </Link>
        </article>
      ) : (
        <article className="glass-card flex flex-col items-center gap-3 rounded-[2rem] p-6 text-center">
          <IconBadge icon={<PartyPopper size={20} strokeWidth={2.25} />} />
          <p className="font-bold text-primary">Todo en orden. Ningún alumno requiere atención urgente.</p>
        </article>
      )}
    </section>
  );
}
