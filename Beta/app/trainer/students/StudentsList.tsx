"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { SmallStat } from "@/app/components/shared/SmallStat";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { normalize } from "@/app/utils/string";
import type { StudentWithStats } from "@/lib/data/trainer";

export function StudentsList({ students }: { students: StudentWithStats[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query.trim());

  const filtered = students.filter((student) => {
    if (!normalizedQuery) return true;
    const searchable = normalize(
      [student.fullName, student.status, student.note, student.routineName ?? ""].join(" ")
    );
    return searchable.includes(normalizedQuery);
  });

  return (
    <div className="space-y-5">
      <label className="relative block">
        <span className="sr-only">Buscar alumno o rutina</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          className="field-input rounded-3xl pl-11"
          placeholder="Buscar por alumno, rutina, estado o nota..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <p className="text-sm font-bold text-text-muted">
        {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          description={students.length === 0 ? "Todavía no diste de alta a ningún alumno." : "No encontramos alumnos para esa búsqueda."}
          icon={Users}
          title="Sin resultados"
        />
      ) : (
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
          {filtered.map((student) => (
            <Link className="glass-card block rounded-3xl p-4 transition hover:shadow-soft" href={`/trainer/students/${student.profileId}`} key={student.profileId}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-2xl bg-soft font-bold text-primary">
                    {student.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{student.fullName}</p>
                    <p className="text-sm text-text-muted">
                      {student.routineName ?? "Sin rutina asignada"}
                      {student.nextAppointment
                        ? ` · ${new Date(student.nextAppointment).toLocaleString("es-AR", { weekday: "short", hour: "2-digit", minute: "2-digit" })}`
                        : ""}
                    </p>
                  </div>
                </div>
                <StatusBadge status={student.status} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <SmallStat label="Semana" value={`${student.weeklyCompleted}/5`} />
                <SmallStat label="RPE" value={student.lastEffort ? `${student.lastEffort}/5` : "-"} />
                <SmallStat label="Rutina" value={student.routineName ?? "-"} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
