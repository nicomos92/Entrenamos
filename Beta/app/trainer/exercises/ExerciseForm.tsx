"use client";

import { useState, useActionState } from "react";
import { AlertCircle, ImageIcon, Video, Upload, Link } from "lucide-react";
import type { FormState } from "@/lib/types/form";
import { emptyFormState } from "@/lib/types/form";

type MediaMode = "url" | "file";

interface ExerciseFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  defaultValues?: {
    name: string;
    description: string;
    focus: string;
    rm: string;
    image_url: string;
    video_url: string;
  };
}

export function ExerciseForm({ action, submitLabel, defaultValues }: ExerciseFormProps) {
  const [state, formAction, pending] = useActionState(action, emptyFormState);
  const [imageMode, setImageMode] = useState<MediaMode>(defaultValues?.image_url ? "url" : "file");
  const [videoMode, setVideoMode] = useState<MediaMode>(defaultValues?.video_url ? "url" : "file");

  const Toggle = ({ mode, onChange }: { mode: MediaMode; onChange: (m: MediaMode) => void }) => (
    <div className="flex rounded-2xl bg-white/40 p-1">
      <button
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
          mode === "url" ? "bg-white text-primary shadow-sm" : "text-text-muted"
        }`}
        onClick={() => onChange("url")}
        type="button"
      >
        <Link size={12} strokeWidth={2.5} />
        URL
      </button>
      <button
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
          mode === "file" ? "bg-white text-primary shadow-sm" : "text-text-muted"
        }`}
        onClick={() => onChange("file")}
        type="button"
      >
        <Upload size={12} strokeWidth={2.5} />
        Archivo
      </button>
    </div>
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-text-muted">Nombre</span>
        <input className="field-input rounded-3xl" defaultValue={defaultValues?.name} name="name" required type="text" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-text-muted">Descripción</span>
        <textarea className="field-input min-h-24 rounded-3xl" defaultValue={defaultValues?.description} name="description" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-text-muted">Grupo / Foco</span>
          <input className="field-input rounded-3xl" defaultValue={defaultValues?.focus} name="focus" placeholder="Ej: Piernas, Core" type="text" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-text-muted">RM</span>
          <input className="field-input rounded-3xl" defaultValue={defaultValues?.rm} name="rm" placeholder="Repetición máxima" type="number" />
        </label>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
          <ImageIcon size={14} strokeWidth={2.5} />
          Imagen de ejemplo
        </p>
        <Toggle mode={imageMode} onChange={setImageMode} />
        <div className="mt-2">
          {imageMode === "url" ? (
            <input className="field-input rounded-3xl" defaultValue={defaultValues?.image_url} name="image_url" placeholder="https://ejemplo.com/imagen.jpg" type="text" />
          ) : (
            <input accept="image/png,image/jpeg,image/webp,image/gif" className="field-input rounded-3xl file:cursor-pointer file:border-0 file:bg-transparent file:p-0 file:text-sm file:font-bold file:text-primary" name="image" type="file" />
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
          <Video size={14} strokeWidth={2.5} />
          Video demostrativo
        </p>
        <Toggle mode={videoMode} onChange={setVideoMode} />
        <div className="mt-2">
          {videoMode === "url" ? (
            <input className="field-input rounded-3xl" defaultValue={defaultValues?.video_url} name="video_url" placeholder="https://youtube.com/watch?v=..." type="text" />
          ) : (
            <input accept="video/mp4,video/webm,video/quicktime" className="field-input rounded-3xl file:cursor-pointer file:border-0 file:bg-transparent file:p-0 file:text-sm file:font-bold file:text-primary" name="video" type="file" />
          )}
        </div>
      </div>

      {state.error && (
        <p className="flex items-center gap-2 rounded-2xl bg-status-urgent/10 px-4 py-3 text-sm font-bold text-status-urgent">
          <AlertCircle size={16} strokeWidth={2.5} className="shrink-0" />
          {state.error}
        </p>
      )}

      <button className="premium-button w-full" disabled={pending} type="submit">
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
