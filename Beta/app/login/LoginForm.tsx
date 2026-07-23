"use client";

import { useActionState, useState, useTransition, type CSSProperties } from "react";
import { ArrowRight, LogIn } from "lucide-react";
import { login, type AuthFormState } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/client";
import { brandCssVars } from "@/lib/color";

const initialState: AuthFormState = { error: null };

interface Branding {
  trainer_name: string;
  logo_url: string | null;
  brand_primary: string | null;
  brand_secondary: string | null;
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [branding, setBranding] = useState<Branding | null>(null);
  const [checking, startChecking] = useTransition();

  function handleContinue() {
    if (!email.trim()) return;
    startChecking(async () => {
      const supabase = createClient();
      const { data } = await supabase.rpc("get_student_trainer_branding", { p_email: email.trim() });
      setBranding(data && data.length > 0 ? data[0] : null);
      setStep("password");
    });
  }

  const brandStyle = brandCssVars(branding?.brand_primary, branding?.brand_secondary) as CSSProperties;

  return (
    <form action={formAction} className="space-y-4" style={brandStyle}>
      <input name="email" type="hidden" value={email} />

      {step === "email" ? (
        <>
          <label className="block">
            <span className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-text-muted">Email</span>
            <input
              autoComplete="email"
              autoFocus
              className="field-input"
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleContinue();
                }
              }}
              type="email"
              value={email}
            />
          </label>
          <button className="premium-button w-full" disabled={checking || !email.trim()} onClick={handleContinue} type="button">
            {checking ? "Buscando..." : "Continuar"}
            {!checking && <ArrowRight size={18} strokeWidth={2.5} />}
          </button>
        </>
      ) : (
        <>
          {branding && (
            <div className="flex items-center gap-3 rounded-3xl bg-soft px-4 py-3">
              {branding.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={branding.trainer_name} className="size-10 rounded-xl object-cover" src={branding.logo_url} />
              ) : (
                <div className="grid size-10 place-items-center rounded-xl bg-white/60 text-xs font-bold text-primary">
                  {branding.trainer_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <p className="text-sm font-bold text-primary">Ingresando como alumno de {branding.trainer_name}</p>
            </div>
          )}

          <p className="text-sm text-text-muted">
            {email}{" "}
            <button
              className="font-bold text-primary underline"
              onClick={() => {
                setStep("email");
                setBranding(null);
              }}
              type="button"
            >
              Cambiar
            </button>
          </p>

          <label className="block">
            <span className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-text-muted">Contraseña</span>
            <input
              autoComplete="current-password"
              autoFocus
              className="field-input"
              name="password"
              type="password"
            />
          </label>

          {state.error && (
            <p className="rounded-2xl bg-status-urgent/10 px-4 py-3 text-sm font-bold text-status-urgent">{state.error}</p>
          )}

          <button className="premium-button w-full" disabled={pending} type="submit">
            {pending ? "Ingresando..." : "Ingresar"}
            {!pending && <LogIn size={18} strokeWidth={2.5} />}
          </button>
        </>
      )}
    </form>
  );
}
