"use client";

import { useState } from "react";
import { PlusCircle, Calculator, Dumbbell } from "lucide-react";
import { addExerciseToRoutine } from "@/app/trainer/routines/actions";

interface Exercise {
  id: string;
  name: string;
  focus: string;
  rm: number | null;
}

export function AddExerciseForm({ routineId, exercises }: { routineId: string; exercises: Exercise[] }) {
  const boundAction = addExerciseToRoutine.bind(null, routineId);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [setCount, setSetCount] = useState(3);
  const [intensityPct, setIntensityPct] = useState("");
  const [repsPerSet, setRepsPerSet] = useState<string[]>(Array(3).fill(""));
  const [weightPerSet, setWeightPerSet] = useState<string[]>(Array(3).fill(""));

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  const updateSetCount = (count: number) => {
    const n = Math.max(1, count);
    setSetCount(n);
    setRepsPerSet((prev) => {
      const next = [...prev];
      while (next.length < n) next.push("");
      return next.slice(0, n);
    });
    setWeightPerSet((prev) => {
      const next = [...prev];
      while (next.length < n) next.push("");
      return next.slice(0, n);
    });
  };

  const handleIntensityChange = (value: string) => {
    setIntensityPct(value);
    const pct = Number(value);
    if (selectedExercise?.rm && Number.isFinite(pct) && pct > 0 && pct <= 100) {
      const calculated = Math.round(selectedExercise.rm * pct / 100);
      setRepsPerSet((prev) => prev.map(() => String(Math.max(1, calculated))));
    }
  };

  const handleSetRepsChange = (index: number, value: string) => {
    setRepsPerSet((prev) => prev.map((r, i) => (i === index ? value : r)));
  };

  const handleSetWeightChange = (index: number, value: string) => {
    setWeightPerSet((prev) => prev.map((w, i) => (i === index ? value : w)));
  };

  return (
    <form action={boundAction} className="space-y-4">
      <select
        className="field-input rounded-3xl"
        name="exercise_id"
        required
        value={selectedExerciseId}
        onChange={(e) => {
          setSelectedExerciseId(e.target.value);
          setIntensityPct("");
        }}
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

      <div className="grid grid-cols-3 gap-3">
        <input
          className="field-input rounded-3xl"
          name="sets"
          placeholder="Series"
          type="number"
          min={1}
          value={setCount}
          onChange={(e) => updateSetCount(Number(e.target.value))}
        />
        <input
          className="field-input rounded-3xl"
          name="rest"
          placeholder="Descanso (seg)"
          type="number"
          defaultValue={60}
        />
        <input
          className="field-input rounded-3xl"
          name="time"
          placeholder="Tiempo (ej: 45s)"
          type="text"
        />
      </div>

      {selectedExercise?.rm && (
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
            <Calculator size={12} strokeWidth={2.5} className="mr-1 inline" />
            Intensidad (%)
          </label>
          <input
            className="field-input rounded-3xl"
            name="intensity_pct"
            placeholder="Ej: 70"
            type="number"
            min={1}
            max={100}
            value={intensityPct}
            onChange={(e) => handleIntensityChange(e.target.value)}
          />
          {selectedExercise.rm && intensityPct && Number(intensityPct) > 0 && (
            <p className="mt-1 text-xs text-text-muted">
              Reps calculadas: ~{Math.round(selectedExercise.rm * Number(intensityPct) / 100)} por serie
            </p>
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
          Series ({setCount})
        </p>
        <div className="space-y-2">
          {Array.from({ length: setCount }, (_, i) => (
            <div className="flex items-center gap-3 rounded-2xl bg-white/30 px-4 py-2" key={i}>
              <span className="text-xs font-bold text-text-muted">#{i + 1}</span>
              <input
                className="field-input w-full rounded-2xl py-1.5 text-sm"
                name={`reps_${i}`}
                placeholder="Reps"
                type="number"
                min={1}
                value={repsPerSet[i] ?? ""}
                onChange={(e) => handleSetRepsChange(i, e.target.value)}
              />
              <input
                className="field-input w-full rounded-2xl py-1.5 text-sm"
                name={`weight_${i}`}
                placeholder="Peso (kg)"
                type="number"
                min={0}
                step={0.5}
                value={weightPerSet[i] ?? ""}
                onChange={(e) => handleSetWeightChange(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <button className="secondary-button w-full" type="submit">
        <PlusCircle size={16} strokeWidth={2.5} />
        Agregar a la rutina
      </button>
    </form>
  );
}
