"use client";

import { useState } from "react";
import { Save, X, Dumbbell, Calculator } from "lucide-react";
import { updateExerciseInRoutine } from "@/app/trainer/routines/actions";
import { ExerciseSetsEditor, type SetEditorRow } from "@/app/trainer/routines/[id]/ExerciseSetsEditor";

interface Exercise {
  id: string;
  name: string;
  focus: string;
  rm: number | null;
}

export interface RoutineExerciseData {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number | null;
  time: string | null;
  rest: number;
  intensityPct: number | null;
  dayNumber: number;
  setsConfig: {
    setNumber: number;
    reps: number | null;
    weightKg: number | null;
    unit: "reps" | "time";
    durationSeconds: number | null;
  }[];
}

export function EditExerciseForm({
  routineId,
  exercise,
  exercises,
  days,
  onCancel,
}: {
  routineId: string;
  exercise: RoutineExerciseData;
  exercises: Exercise[];
  days: number;
  onCancel: () => void;
}) {
  const boundAction = updateExerciseInRoutine.bind(null, routineId);
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercise.exerciseId);
  const [intensityPct, setIntensityPct] = useState(exercise.intensityPct != null ? String(exercise.intensityPct) : "");
  const [rows, setRows] = useState<SetEditorRow[]>(() => {
    if (exercise.setsConfig.length > 0) {
      return exercise.setsConfig.map((s) => ({
        unit: s.unit,
        reps: s.reps != null ? String(s.reps) : "",
        weight: s.weightKg != null ? String(s.weightKg) : "",
        duration: s.durationSeconds != null ? String(s.durationSeconds) : "",
      }));
    }
    return Array.from({ length: Math.max(1, exercise.sets) }, () => ({
      unit: "reps",
      reps: exercise.reps != null ? String(exercise.reps) : "",
      weight: "",
      duration: "",
    }));
  });

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
      <input name="routine_exercise_id" type="hidden" value={exercise.id} />

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Ejercicio</label>
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
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name} {ex.rm ? `(RM: ${ex.rm})` : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedExercise?.rm && (
        <p className="flex items-center gap-2 text-xs font-bold text-primary">
          <Dumbbell size={12} strokeWidth={2.5} />
          RM: {selectedExercise.rm} reps al 100%
        </p>
      )}

      {days > 1 && (
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Día</label>
          <select className="field-input rounded-3xl" name="day_number" defaultValue={String(exercise.dayNumber)}>
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
        <input
          className="field-input rounded-3xl"
          name="rest"
          placeholder="Descanso (seg)"
          type="number"
          min={0}
          defaultValue={exercise.rest}
        />
        <input className="field-input rounded-3xl" name="time" placeholder="Tiempo (ej: 45s)" type="text" defaultValue={exercise.time ?? ""} />
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

      <div className="flex gap-3">
        <button className="premium-button flex-1" type="submit">
          <Save size={16} strokeWidth={2.5} />
          Guardar
        </button>
        <button className="ghost-button" onClick={onCancel} type="button">
          <X size={16} strokeWidth={2.5} />
          Cancelar
        </button>
      </div>
    </form>
  );
}
