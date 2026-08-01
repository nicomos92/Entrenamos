"use client";

import { useState } from "react";
import { PlusCircle, Calculator, Dumbbell } from "lucide-react";
import { addExerciseToRoutine } from "@/app/trainer/routines/actions";
import { ExerciseSetsEditor, type SetEditorRow } from "@/app/trainer/routines/[id]/ExerciseSetsEditor";

interface Exercise {
  id: string;
  name: string;
  focus: string;
  rm: number | null;
}

function emptyRows(count: number): SetEditorRow[] {
  return Array.from({ length: Math.max(1, count) }, () => ({ unit: "reps", reps: "", weight: "", duration: "" }));
}

export function AddExerciseForm({
  routineId,
  exercises,
  days,
}: {
  routineId: string;
  exercises: Exercise[];
  days: number;
}) {
  const boundAction = addExerciseToRoutine.bind(null, routineId);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [intensityPct, setIntensityPct] = useState("");
  const [rows, setRows] = useState<SetEditorRow[]>(emptyRows(3));

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  const handleIntensityChange = (value: string) => {
    setIntensityPct(value);
    const pct = Number(value);
    if (selectedExercise?.rm && Number.isFinite(pct) && pct > 0 && pct <= 100) {
      const calculated = Math.round((selectedExercise.rm * pct) / 100);
      setRows((prev) => prev.map((r) => ({ ...r, reps: String(Math.max(1, calculated)) })));
    }
  };

  return (
    <form action={boundAction} className="space-y-4">
      <select
        className="field-input rounded-3xl"
        name="exercise_id"
        onChange={(e) => {
          setSelectedExerciseId(e.target.value);
          setIntensityPct("");
        }}
        required
        value={selectedExerciseId}
      >
        <option value="">Elegí un ejercicio</option>
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name} {ex.rm ? `(RM: ${ex.rm})` : ""}
          </option>
        ))}
      </select>

      {selectedExercise?.rm && (
        <p className="flex items-center gap-2 text-xs font-bold text-primary">
          <Dumbbell size={12} strokeWidth={2.5} />
          RM: {selectedExercise.rm} reps al 100%
        </p>
      )}

      {days > 1 && (
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Día</label>
          <select className="field-input rounded-3xl" name="day_number" defaultValue="1">
            {Array.from({ length: days }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Día {i + 1}
              </option>
            ))}
          </select>
        </div>
      )}
      {days === 1 && <input name="day_number" type="hidden" value="1" />}

      <div className="grid grid-cols-2 gap-3">
        <input className="field-input rounded-3xl" name="rest" placeholder="Descanso (seg)" type="number" min={0} defaultValue={60} />
        <input className="field-input rounded-3xl" name="time" placeholder="Tiempo (ej: 45s)" type="text" />
      </div>

      {selectedExercise?.rm && (
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
            <Calculator size={12} strokeWidth={2.5} className="mr-1 inline" />
            Intensidad (%)
          </label>
          <input
            className="field-input rounded-3xl"
            max={100}
            min={1}
            name="intensity_pct"
            onChange={(e) => handleIntensityChange(e.target.value)}
            placeholder="Ej: 70"
            type="number"
            value={intensityPct}
          />
          {selectedExercise.rm && intensityPct && Number(intensityPct) > 0 && (
            <p className="mt-1 text-xs text-text-muted">
              Reps calculadas: ~{Math.round((selectedExercise.rm * Number(intensityPct)) / 100)} por serie
            </p>
          )}
        </div>
      )}

      <div>
        <ExerciseSetsEditor rows={rows} onRowsChange={setRows} />
      </div>

      <button className="secondary-button w-full" type="submit">
        <PlusCircle size={16} strokeWidth={2.5} />
        Agregar a la rutina
      </button>
    </form>
  );
}
