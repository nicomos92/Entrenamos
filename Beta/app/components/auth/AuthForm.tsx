"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/app/login/actions";

interface Field {
  name: string;
  label: string;
  type: string;
  autoComplete?: string;
}

interface AuthFormProps {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  fields: Field[];
  submitLabel: string;
}

const initialState: AuthFormState = { error: null };

export function AuthForm({ action, fields, submitLabel }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {fields.map((field) => (
        <label className="block" key={field.name}>
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
            {field.label}
          </span>
          <input
            className="w-full rounded-3xl border border-white/50 bg-white/40 px-5 py-4 text-text-primary outline-none placeholder:text-text-muted focus:border-secondary"
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            required
          />
        </label>
      ))}

      {state.error && (
        <p className="rounded-2xl bg-[#DC2626]/10 px-4 py-3 text-sm font-bold text-[#DC2626]">{state.error}</p>
      )}

      <button className="premium-button w-full" disabled={pending} type="submit">
        {pending ? "Un momento..." : submitLabel}
      </button>
    </form>
  );
}
