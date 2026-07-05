"use client";

import { useState } from "react";
import { SmallStat } from "@/app/components/shared/SmallStat";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { users } from "@/app/data/users";
import { getWorkout } from "@/app/data/workouts";
import { normalize } from "@/app/utils/string";

export function TrainerStudentsView() {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query.trim());

  const filteredUsers = users.filter((user) => {
    if (!normalizedQuery) return true;
    const workout = getWorkout(user.assignedWorkoutId);
    const searchable = normalize(
      [user.name, user.status, user.note, user.nextSession ?? "", workout.name, workout.goal].join(" ")
    );
    return searchable.includes(normalizedQuery);
  });

  return (
    <section className="space-y-5">
      <div>
        <p className="text-text-muted">Gestion de alumnos</p>
        <h1 className="text-4xl font-bold text-text-primary">Alumnos</h1>
      </div>

      <label className="block">
        <span className="sr-only">Buscar alumno o rutina</span>
        <input
          className="w-full rounded-3xl border border-white/50 bg-white/40 px-5 py-4 text-text-primary outline-none placeholder:text-text-muted focus:border-secondary"
          placeholder="Buscar por alumno, rutina, estado o nota..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <p className="text-sm font-bold text-text-muted">
        {filteredUsers.length} resultado{filteredUsers.length === 1 ? "" : "s"}
      </p>

      <div className="space-y-3">
        {filteredUsers.map((user) => {
          const assignedWorkout = getWorkout(user.assignedWorkoutId);
          return (
            <article className="glass-card rounded-3xl p-4" key={user.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-2xl bg-[#BAE6FD] font-bold text-primary">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-text-muted">
                      {assignedWorkout.name} - {user.nextSession ?? "Sin turno"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={user.status} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <SmallStat label="Adh." value={`${user.adherence}%`} />
                <SmallStat label="RPE" value={`${user.lastEffort}/5`} />
                <SmallStat label="Meta" value={assignedWorkout.goal} />
              </div>
            </article>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="glass-card rounded-3xl p-6 text-center text-text-muted">
          No hay alumnos para esa busqueda.
        </div>
      )}
    </section>
  );
}
