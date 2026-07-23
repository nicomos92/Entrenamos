"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/types/form";
import { emptyFormState } from "@/lib/types/form";

interface Field {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

interface ActionFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  fields: Field[];
  submitLabel: string;
  extraFields?: Record<string, string>;
}

export function ActionForm({ action, fields, submitLabel, extraFields }: ActionFormProps) {
  const [state, formAction, pending] = useActionState(action, emptyFormState);

  return (
    <form action={formAction} className="space-y-4">
      {Object.entries(extraFields ?? {}).map(([name, value]) => (
        <input key={name} name={name} type="hidden" value={value} />
      ))}

      {fields.map((field) => (
        <label className="block" key={field.name}>
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
            {field.label}
          </span>
          {field.type === "textarea" ? (
            <textarea
              className="field-input min-h-24 rounded-3xl"
              defaultValue={field.defaultValue}
              name={field.name}
              placeholder={field.placeholder}
            />
          ) : (
            <input
              className="field-input rounded-3xl"
              defaultValue={field.defaultValue}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required ?? true}
              type={field.type}
            />
          )}
        </label>
      ))}

      {state.error && (
        <p className="rounded-2xl bg-status-urgent/10 px-4 py-3 text-sm font-bold text-status-urgent">{state.error}</p>
      )}

      <button className="premium-button w-full" disabled={pending} type="submit">
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
