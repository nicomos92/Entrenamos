"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { FormState } from "@/lib/types/form";
import { emptyFormState } from "@/lib/types/form";

interface Field {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
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
          ) : field.type === "select" && field.options ? (
            <select
              className="field-input rounded-3xl"
              defaultValue={field.defaultValue ?? ""}
              name={field.name}
              required={field.required ?? true}
            >
              <option value="" disabled>{field.placeholder ?? "Seleccionar..."}</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : field.type === "file" ? (
            <input
              accept={field.placeholder}
              className="field-input rounded-3xl file:cursor-pointer file:border-0 file:bg-transparent file:p-0 file:text-sm file:font-bold file:text-primary"
              name={field.name}
              type="file"
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
        <p className="flex items-center gap-2 rounded-2xl bg-status-urgent/10 px-4 py-3 text-sm font-bold text-status-urgent">
          <AlertCircle size={16} strokeWidth={2.5} className="shrink-0" />
          {state.error}
        </p>
      )}

      {state.success && state.message && (
        <p className="flex items-center gap-2 rounded-2xl bg-status-active/10 px-4 py-3 text-sm font-bold text-status-active">
          <CheckCircle2 size={16} strokeWidth={2.5} className="shrink-0" />
          {state.message}
        </p>
      )}

      <button className="premium-button w-full" disabled={pending} type="submit">
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
