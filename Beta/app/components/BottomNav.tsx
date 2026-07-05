import { Role, StudentView, TrainerView } from "@/app/types";

interface BottomNavProps {
  role: Role;
  studentView: StudentView;
  trainerView: TrainerView;
  onRoleChange: (role: Role) => void;
  onStudentViewChange: (view: StudentView) => void;
  onTrainerViewChange: (view: TrainerView) => void;
}

export function BottomNav({
  role,
  studentView,
  trainerView,
  onRoleChange,
  onStudentViewChange,
  onTrainerViewChange,
}: BottomNavProps) {
  const studentItems: { view: StudentView; label: string }[] = [
    { view: "home", label: "Hoy" },
    { view: "workout", label: "Rutina" },
    { view: "summary", label: "Resumen" },
  ];

  const trainerItems: { view: TrainerView; label: string }[] = [
    { view: "trainer-dashboard", label: "Panel" },
    { view: "trainer-students", label: "Alumnos" },
    { view: "trainer-routines", label: "Rutinas" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] border-t border-white/50 bg-white/70 px-5 py-3 backdrop-blur-xl">
      {role === "student" ? (
        <div className="grid grid-cols-4 gap-2">
          {studentItems.map((item) => (
            <button
              className={`rounded-2xl px-2 py-3 text-sm font-bold transition ${studentView === item.view ? "bg-[#BAE6FD] text-primary" : "text-text-muted"}`}
              key={item.view}
              onClick={() => onStudentViewChange(item.view)}
            >
              {item.label}
            </button>
          ))}
          <button className="rounded-2xl px-2 py-3 text-sm font-bold text-text-muted transition" onClick={() => onRoleChange("trainer")}>
            Entrenador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {trainerItems.map((item) => (
            <button
              className={`rounded-2xl px-2 py-3 text-sm font-bold transition ${trainerView === item.view ? "bg-[#BAE6FD] text-primary" : "text-text-muted"}`}
              key={item.view}
              onClick={() => onTrainerViewChange(item.view)}
            >
              {item.label}
            </button>
          ))}
          <button className="rounded-2xl px-2 py-3 text-sm font-bold text-text-muted transition" onClick={() => onRoleChange("student")}>
            Alumno
          </button>
        </div>
      )}
    </nav>
  );
}
