import { Dumbbell } from "lucide-react";
import { LoginForm } from "@/app/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-soft text-primary shadow-soft">
          <Dumbbell size={26} strokeWidth={2.25} />
        </div>
        <p className="text-2xl font-black tracking-tight text-primary">EntrenaMOS</p>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Ingresá a tu cuenta</h1>
        <p className="mt-2 text-text-muted">Administradores, entrenadores y alumnos ingresan desde acá.</p>
      </div>

      <div className="glass-card rounded-[2rem] p-6">
        <LoginForm />
      </div>
    </main>
  );
}
