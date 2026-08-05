"use client";

import { useState } from "react";
import { Pencil, Dumbbell, ChevronUp, ChevronDown } from "lucide-react";
import { DeleteButton } from "@/app/components/shared/DeleteButton";
import { removeExerciseFromRoutine } from "@/app/trainer/routines/actions";
import { EditExerciseForm, type RoutineExerciseData } from "@/app/trainer/routines/[id]/EditExerciseForm";
import { formatDuration } from "@/lib/duration";

interface ExerciseOption {
  id: string;
  name: string;
  focus: string;
  rm: number | null;
}

export function ExerciseItem({
  routineId,
  re,
  exercises,
  days,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  routineId: string;
  re: RoutineExerciseData & { name: string; rm: number | null };
  exercises: ExerciseOption[];
  days: number;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const formatSets = () => {
    if (re.setsConfig.length > 0) {
      return re.setsConfig
        .map((s) => {
          if (s.unit === "time") return `S${s.setNumber}: ${formatDuration(s.durationSeconds)}`;
          let label = `S${s.setNumber}: ${s.reps ?? "-"} reps`;
          if (s.weightKg != null) label += ` @ ${s.weightKg}kg`;
          return label;
        })
        .join(" | ");
    }
    return `Series: ${re.sets} · ${re.reps ?? re.time ?? "-"}`;
  };

  if (editing) {
    return (
      <div className="rounded-2xl bg-white/40 p-4">
        <EditExerciseForm
          days={days}
          exercise={re}
          exercises={exercises}
          onCancel={() => setEditing(false)}
          routineId={routineId}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/30 px-4 py-3 text-sm">
      <div>
        <p className="font-bold">{re.name}</p>
        <p className="text-xs text-text-muted">
          {formatSets()} · descanso {formatDuration(re.rest)}
          {re.intensityPct != null && ` · ${re.intensityPct}%`}
        </p>
        {re.rm && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
            <Dumbbell size={10} strokeWidth={2.5} />
            RM: {re.rm}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex flex-col">
          <button
            aria-label="Subir ejercicio"
            className="grid size-6 place-items-center rounded-md text-text-muted transition hover:bg-white/50 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            type="button"
          >
            <ChevronUp size={15} strokeWidth={2.5} />
          </button>
          <button
            aria-label="Bajar ejercicio"
            className="grid size-6 place-items-center rounded-md text-text-muted transition hover:bg-white/50 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            type="button"
          >
            <ChevronDown size={15} strokeWidth={2.5} />
          </button>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary transition hover:bg-secondary/20"
          onClick={() => setEditing(true)}
          type="button"
        >
          <Pencil size={13} strokeWidth={2.25} />
          Editar
        </button>
        <DeleteButton
          action={removeExerciseFromRoutine.bind(null, routineId, re.id)}
          confirmMessage="¿Quitar este ejercicio de la rutina?"
        />
      </div>
    </div>
  );
}
