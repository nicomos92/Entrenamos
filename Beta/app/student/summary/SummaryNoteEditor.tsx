"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Check } from "lucide-react";
import { updateSessionNote } from "@/app/student/workout/actions";

export function SummaryNoteEditor({ sessionId, initialNote }: { sessionId: string; initialNote: string }) {
  const [note, setNote] = useState(initialNote);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <label className="block text-left">
      <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-text-muted">
        <MessageSquare size={14} strokeWidth={2.5} />
        Nota para tu entrenador
      </span>
      <textarea
        className="field-input mt-3 min-h-32 rounded-3xl"
        onChange={(event) => {
          setNote(event.target.value);
          setSaved(false);
        }}
        value={note}
      />
      <button
        className="secondary-button mt-3 w-full"
        disabled={isPending}
        onClick={() =>
          startTransition(() => {
            updateSessionNote(sessionId, note);
            setSaved(true);
          })
        }
        type="button"
      >
        {saved ? <Check size={18} strokeWidth={2.5} /> : null}
        {saved ? "Guardado" : "Guardar nota"}
      </button>
    </label>
  );
}
