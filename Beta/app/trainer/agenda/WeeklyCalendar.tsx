"use client";

import { useState, useTransition } from "react";
import { CalendarDays, CheckCircle2, AlertCircle, Loader2, Plus, Pencil, Trash2, X } from "lucide-react";
import {
  addScheduleEntry,
  updateScheduleEntry,
  moveScheduleEntry,
  deleteScheduleEntry,
} from "@/app/trainer/agenda/actions";
import type { FormState } from "@/lib/types/form";
import type { WeeklyScheduleEntry } from "@/lib/data/trainer";

const DIAS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const DURATION_MINUTES = 60;

interface EditTarget {
  mode: "add" | "edit";
  entry?: WeeklyScheduleEntry;
  diaSemana: number;
  hora: string;
}

interface WeeklyCalendarProps {
  entries: WeeklyScheduleEntry[];
  studentOptions: { id: string; name: string }[];
}

const initialState: FormState = { error: null };

function sameSlot(entry: WeeklyScheduleEntry, dayIdx: number, hour: number) {
  return entry.diaSemana === dayIdx && Number(entry.hora.slice(0, 2)) === hour;
}

export function WeeklyCalendar({ entries, studentOptions }: WeeklyCalendarProps) {
  const [target, setTarget] = useState<EditTarget | null>(null);
  const [formState, setFormState] = useState<FormState>(initialState);
  const [pending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overCell, setOverCell] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<string | null>(null);

  const openAdd = (dayIdx: number, hour: number) => {
    setFormState(initialState);
    setTarget({ mode: "add", diaSemana: dayIdx, hora: `${hour.toString().padStart(2, "0")}:00` });
  };

  const openEdit = (entry: WeeklyScheduleEntry) => {
    setFormState(initialState);
    setTarget({ mode: "edit", entry, diaSemana: entry.diaSemana, hora: entry.hora.slice(0, 5) });
  };

  const close = () => {
    if (pending) return;
    setTarget(null);
    setFormState(initialState);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!target || pending) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result =
        target.mode === "add"
          ? await addScheduleEntry(initialState, fd)
          : target.entry
            ? await updateScheduleEntry(target.entry.id, initialState, fd)
            : initialState;
      setFormState(result);
      if (result.success) setTarget(null);
    });
  };

  const handleDelete = () => {
    if (!target?.entry || pending) return;
    startTransition(async () => {
      await deleteScheduleEntry(target.entry!.id);
      setTarget(null);
    });
  };

  const handleDragStart = (e: React.DragEvent, entryId: string) => {
    e.dataTransfer.setData("text/plain", entryId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(entryId);
  };

  const handleDrop = (dayIdx: number, hour: number) => {
    if (!draggingId) return;
    setPendingMove(draggingId);
    setDraggingId(null);
    setOverCell(null);
    startTransition(async () => {
      await moveScheduleEntry(draggingId, dayIdx, `${hour.toString().padStart(2, "0")}:00`);
      setPendingMove(null);
    });
  };

  const entriesBySlot = (dayIdx: number, hour: number) =>
    entries.filter((e) => sameSlot(e, dayIdx, hour));

  return (
    <div className="glass-card overflow-hidden rounded-[2rem]">
      <div className="flex items-center justify-between border-b border-white/20 px-5 py-4">
        <div className="flex items-center gap-3">
          <CalendarDays size={18} className="text-text-muted" strokeWidth={2} />
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
            Semana · {DURATION_MINUTES} min por turno
          </p>
        </div>
        <p className="hidden text-xs text-text-muted md:block">
          Toca un horario para editar · Arrastra para mover
        </p>
      </div>

      {target && (
        <form className="space-y-3 border-b border-white/20 px-5 py-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
              {target.mode === "add" ? "Agregar horario" : `Editar horario de ${target.entry?.studentName ?? ""}`}
            </p>
            <button className="text-text-muted transition hover:text-primary" onClick={close} type="button">
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {target.mode === "add" && (
            <select className="field-input rounded-2xl py-2.5 text-sm" name="student_id" defaultValue="" required>
              <option disabled value="">
                Elegí un alumno
              </option>
              {studentOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          {target.mode === "edit" && target.entry && <input name="student_id" type="hidden" value={target.entry.studentId} />}

          <div className="grid grid-cols-2 gap-3">
            <select
              className="field-input rounded-2xl py-2.5 text-sm"
              defaultValue={String(target.diaSemana)}
              name="dia_semana"
              required
            >
              {DIAS.map((label, i) => (
                <option key={i} value={i}>
                  {label}
                </option>
              ))}
            </select>
            <input className="field-input rounded-2xl py-2.5 text-sm" defaultValue={target.hora} name="time" required type="time" />
          </div>

          {formState.error && (
            <p className="flex items-center gap-2 rounded-2xl bg-status-urgent/10 px-4 py-3 text-sm font-bold text-status-urgent">
              <AlertCircle size={16} strokeWidth={2.5} className="shrink-0" />
              {formState.error}
            </p>
          )}
          {formState.success && formState.message && (
            <p className="flex items-center gap-2 rounded-2xl bg-status-active/10 px-4 py-3 text-sm font-bold text-status-active">
              <CheckCircle2 size={16} strokeWidth={2.5} className="shrink-0" />
              {formState.message}
            </p>
          )}

          <div className="flex gap-2">
            <button className="premium-button flex-1" disabled={pending} type="submit">
              {pending ? <Loader2 size={14} className="animate-spin" strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
              {target.mode === "add" ? "Agregar horario" : "Guardar cambios"}
            </button>
            {target.mode === "edit" && (
              <button
                className="ghost-button flex items-center gap-2 text-status-urgent"
                disabled={pending}
                onClick={handleDelete}
                type="button"
              >
                <Trash2 size={14} strokeWidth={2.5} />
                Eliminar
              </button>
            )}
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-[60px_repeat(7,1fr)]">
          <div className="sticky left-0 z-10 bg-white/40" />
          {DIAS_SHORT.map((dia, i) => (
            <div className="border-l border-white/20 px-2 py-2 text-center text-xs font-bold text-text-muted" key={i}>
              <span className="block">{dia}</span>
            </div>
          ))}

          {HOURS.map((hour) => {
            const timeKey = `${hour.toString().padStart(2, "0")}:00`;
            return (
              <div className="contents" key={`row-${hour}`}>
                <div className="sticky left-0 z-10 border-t border-white/20 bg-white/40 px-2 py-2 text-xs font-bold text-text-muted">
                  {timeKey}
                </div>
                {DIAS_SHORT.map((_, dayIdx) => {
                  const cellKey = `${dayIdx}-${hour}`;
                  const slotEntries = entriesBySlot(dayIdx, hour);
                  const isOver = overCell === cellKey;

                  return (
                    <div
                      className={`group relative min-h-14 border-t border-l border-white/20 p-1 transition-colors ${
                        isOver ? "bg-secondary/15" : "hover:bg-white/30"
                      }`}
                      key={`cell-${dayIdx}-${hour}`}
                      onClick={() => (slotEntries.length === 0 ? openAdd(dayIdx, hour) : openEdit(slotEntries[0]))}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setOverCell(cellKey);
                      }}
                      onDragLeave={() => setOverCell((c) => (c === cellKey ? null : c))}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(dayIdx, hour);
                      }}
                      role="button"
                    >
                      {slotEntries.map((entry) => {
                        const isDragging = draggingId === entry.id;
                        const isMoving = pendingMove === entry.id;
                        return (
                          <div
                            className={`mb-1 cursor-grab rounded-lg px-2 py-1 text-xs font-bold text-primary transition ${
                              isMoving
                                ? "animate-pulse bg-secondary/20 opacity-50"
                                : isDragging
                                  ? "opacity-30"
                                  : "bg-white/50 hover:bg-secondary/20"
                            }`}
                            draggable
                            key={entry.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(entry);
                            }}
                            onDragStart={(e) => handleDragStart(e, entry.id)}
                            title={`${entry.studentName} · ${entry.hora}`}
                          >
                            <span className="block truncate leading-tight">{entry.studentName}</span>
                            <span className="block text-[10px] font-normal text-text-muted">
                              {entry.hora} · {DURATION_MINUTES} min
                            </span>
                          </div>
                        );
                      })}
                      {slotEntries.length === 0 && (
                        <span className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
                          <Plus size={14} strokeWidth={2.5} className="text-text-muted" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
