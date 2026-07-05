import { Role } from "@/app/types";

interface HeaderProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

export function Header({ role, onRoleChange }: HeaderProps) {
  return (
    <header className="mb-8 space-y-5">
      <div className="flex items-center justify-between">
        <div className="grid size-12 place-items-center rounded-full bg-white/60 text-sm font-black text-primary shadow-lift">
          EN
        </div>
        <div>
          <p className="text-center text-2xl font-semibold text-primary">EntrenaMOS</p>
          <p className="text-center text-xs uppercase tracking-[0.32em] text-text-muted">
            {role === "student" ? "mockup alumno" : "mockup entrenador"}
          </p>
        </div>
        <button aria-label="Notificaciones" className="grid size-12 place-items-center rounded-full border border-white/50 bg-white/50 text-primary">
          !
        </button>
      </div>

      <div className="glass-card grid grid-cols-2 gap-2 rounded-3xl p-2">
        <button
          className={`rounded-2xl py-3 text-sm font-bold transition ${role === "student" ? "bg-secondary text-white shadow-glow" : "text-primary"}`}
          onClick={() => onRoleChange("student")}
        >
          Alumno
        </button>
        <button
          className={`rounded-2xl py-3 text-sm font-bold transition ${role === "trainer" ? "bg-secondary text-white shadow-glow" : "text-primary"}`}
          onClick={() => onRoleChange("trainer")}
        >
          Entrenador
        </button>
      </div>
    </header>
  );
}
