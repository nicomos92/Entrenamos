import { Metric } from "@/app/components/shared/Metric";
import { users } from "@/app/data/users";

interface TrainerDashboardViewProps {
  onOpenStudents: () => void;
}

export function TrainerDashboardView({ onOpenStudents }: TrainerDashboardViewProps) {
  const activeUsers = users.filter((user) => user.status === "activo").length;
  const needsAttention = users.filter((user) => user.lastEffort >= 5 || user.status === "inactivo").length;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-text-muted">Vista exclusiva del entrenador</p>
        <h1 className="mt-2 text-4xl font-bold text-text-primary">Panel del día</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Alumnos activos" value={`${activeUsers}`} />
        <Metric label="Alertas" value={`${needsAttention}`} />
        <Metric label="Sesiones hoy" value="6" />
        <Metric label="Cumplimiento" value="94%" />
      </div>

      <article className="glass-card rounded-[2rem] p-6">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-text-muted">Prioridad</p>
        <h2 className="mt-2 text-2xl font-bold text-primary">Seguimiento de fatiga</h2>
        <p className="mt-2 text-text-muted">Lucia marco RPE 5 en la ultima sesion. Conviene ajustar volumen o descanso.</p>
        <button className="premium-button mt-5 w-full" onClick={onOpenStudents}>
          Revisar alumnos
        </button>
      </article>
    </section>
  );
}
