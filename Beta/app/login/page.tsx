import { Dumbbell } from "lucide-react";
import { LoginForm } from "@/app/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col justify-center px-5 py-10">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-soft text-primary shadow-soft ring-1 ring-white/50">
          <Dumbbell size={28} strokeWidth={2.25} />
        </div>
        <p className="text-3xl font-black tracking-tight text-primary">EntrenaMOS</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.32em] text-text-muted">Plataforma de entrenamiento</p>
        <div className="mx-auto mt-6 h-px w-12 bg-secondary/30" />
        <h1 className="mt-6 text-2xl font-bold text-text-primary">Ingresá a tu cuenta</h1>
        <p className="mt-2 text-sm text-text-muted">Administradores, entrenadores y alumnos ingresan desde acá.</p>
      </div>

      <div className="animate-scale glass-card rounded-[2rem] p-6 ring-1 ring-white/40">
        <LoginForm />
      </div>
    </main>
  );
}
