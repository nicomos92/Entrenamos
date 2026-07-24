"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DIAS_SEMANA } from "@/lib/supabase/database.types";
import type { StudentSchedule } from "@/lib/supabase/database.types";
import { saveStudentSchedules } from "@/app/trainer/students/actions";

interface ScheduleEntry {
  dia_semana: number;
  hora: string;
}

interface ScheduleEditorProps {
  studentId: string;
  schedules: StudentSchedule[];
}

export function ScheduleEditor({ studentId, schedules: initial }: ScheduleEditorProps) {
  const [entries, setEntries] = useState<ScheduleEntry[]>(
    initial.map((s) => ({ dia_semana: s.dia_semana, hora: s.hora.slice(0, 5) }))
  );
  const [pending, startTransition] = useTransition();

  const addEntry = () => {
    setEntries((prev) => [...prev, { dia_semana: 1, hora: "09:00" }]);
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof ScheduleEntry, value: string | number) => {
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      await saveStudentSchedules(studentId, entries);
    });
  };

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div className="flex items-center gap-2" key={`schedule-${studentId}-${i}`}>
          <select
            className="field-input flex-1 rounded-xl"
            value={entry.dia_semana}
            onChange={(e) => updateEntry(i, "dia_semana", Number(e.target.value))}
          >
            {DIAS_SEMANA.map((dia, idx) => (
              <option key={idx} value={idx}>{dia}</option>
            ))}
          </select>
          <input
            className="field-input w-28 rounded-xl"
            type="time"
            value={entry.hora}
            onChange={(e) => updateEntry(i, "hora", e.target.value)}
          />
          <button
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-status-urgent/10 text-status-urgent hover:bg-status-urgent/20"
            onClick={() => removeEntry(i)}
            type="button"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <button
          className="premium-button-outline flex items-center gap-2 text-sm"
          onClick={addEntry}
          type="button"
        >
          <Plus size={14} strokeWidth={2.5} />
          Agregar horario
        </button>

        {entries.length > 0 && (
          <button
            className="premium-button flex-1 items-center justify-center text-sm"
            disabled={pending}
            onClick={handleSave}
            type="button"
          >
            {pending ? "Guardando..." : "Guardar horarios"}
          </button>
        )}
      </div>
    </div>
  );
}
