"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users, LayoutList, LayoutGrid, ChevronRight } from "lucide-react";
import { SmallStat } from "@/app/components/shared/SmallStat";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { normalize } from "@/app/utils/string";
import type { StudentWithStats } from "@/lib/data/trainer";

export function StudentsList({ students }: { students: StudentWithStats[] }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "card">("card");
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
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Buscar alumno o rutina</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            className="field-input rounded-3xl pl-11"
            placeholder="Buscar por alumno, rutina, estado o nota..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="flex shrink-0 gap-1 rounded-2xl bg-white/50 p-1">
          <button
            className={`flex size-9 items-center justify-center rounded-xl transition ${
              view === "list" ? "bg-white text-primary shadow-soft" : "text-text-muted hover:text-primary"
            }`}
            onClick={() => setView("list")}
            title="Vista lista"
            type="button"
          >
            <LayoutList size={16} strokeWidth={2.25} />
          </button>
          <button
            className={`flex size-9 items-center justify-center rounded-xl transition ${
              view === "card" ? "bg-white text-primary shadow-soft" : "text-text-muted hover:text-primary"
            }`}
            onClick={() => setView("card")}
            title="Vista tarjetas"
            type="button"
          >
            <LayoutGrid size={16} strokeWidth={2.25} />
          </button>
        </div>
      </div>

      <p className="text-sm font-bold text-text-muted">
        {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          description={students.length === 0 ? "Todavía no diste de alta a ningún alumno." : "No encontramos alumnos para esa búsqueda."}
          icon={<Users size={26} strokeWidth={2.25} />}
          title="Sin resultados"
        />
      ) : view === "card" ? (
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
      ) : (
        <div className="space-y-2">
          {filtered.map((student) => (
            <Link
              className="flex items-center gap-4 rounded-2xl bg-white/50 px-4 py-3 transition hover:bg-white/70"
              href={`/trainer/students/${student.profileId}`}
              key={student.profileId}
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-soft text-sm font-bold text-primary">
                {student.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-6">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{student.fullName}</p>
                  <p className="truncate text-xs text-text-muted">{student.routineName ?? "Sin rutina"}</p>
                </div>
                <StatusBadge status={student.status} />
                <div className="hidden text-center text-xs leading-tight lg:block">
                  <span className="font-bold text-text-muted">Semana</span>
                  <p className="font-bold text-primary">{student.weeklyCompleted}/5</p>
                </div>
                {student.nextAppointment && (
                  <div className="hidden text-center text-xs leading-tight xl:block">
                    <span className="font-bold text-text-muted">Próximo</span>
                    <p className="font-bold text-primary">
                      {new Date(student.nextAppointment).toLocaleDateString("es-AR", {
                        weekday: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
              <ChevronRight size={16} strokeWidth={2.5} className="shrink-0 text-text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
