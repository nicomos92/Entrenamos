"use client";

import { useState, useTransition } from "react";
import { Power, Dumbbell, StickyNote } from "lucide-react";
import { assignRoutineToStudent, toggleStudentStatus, updateStudentNote } from "@/app/trainer/students/actions";

interface Props {
  studentId: string;
  initialNote: string;
  status: "activo" | "inactivo";
  routines: { id: string; name: string }[];
  currentRoutineId: string | null;
}

export function StudentDetailActions({ studentId, initialNote, status, routines, currentRoutineId }: Props) {
  const [note, setNote] = useState(initialNote);
  const [routineId, setRoutineId] = useState(currentRoutineId ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <article className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
            <Power size={14} strokeWidth={2.5} />
            Estado
          </p>
          <button
            className="whitespace-nowrap rounded-full bg-secondary px-4 py-2 text-sm font-bold text-white transition hover:brightness-105"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                toggleStudentStatus(studentId, status === "activo" ? "inactivo" : "activo");
              })
            }
          >
            Marcar {status === "activo" ? "inactivo" : "activo"}
          </button>
        </div>
      </article>

      <article className="glass-card rounded-3xl p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <Dumbbell size={14} strokeWidth={2.5} />
          Rutina asignada
        </p>
        <select
          className="field-input"
          onChange={(event) => setRoutineId(event.target.value)}
          value={routineId}
        >
          <option value="">Sin rutina</option>
          {routines.map((routine) => (
            <option key={routine.id} value={routine.id}>
              {routine.name}
            </option>
          ))}
        </select>
        <button
          className="secondary-button mt-3 w-full"
          disabled={isPending || !routineId || routineId === currentRoutineId}
          onClick={() =>
            startTransition(() => {
              assignRoutineToStudent(studentId, routineId);
            })
          }
        >
          Asignar rutina
        </button>
      </article>

      <article className="glass-card rounded-3xl p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <StickyNote size={14} strokeWidth={2.5} />
          Nota del entrenador
        </p>
        <textarea
          className="field-input min-h-24"
          onChange={(event) => setNote(event.target.value)}
          value={note}
        />
        <button
          className="secondary-button mt-3 w-full"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              updateStudentNote(studentId, note);
            })
          }
        >
          Guardar nota
        </button>
      </article>
    </div>
  );
}
