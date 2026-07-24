"use client";

import { useMemo, useState, useCallback, useTransition } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Loader2 } from "lucide-react";
import { rescheduleAppointment } from "@/app/trainer/agenda/actions";

interface AppointmentView {
  id: string;
  student_id: string;
  studentName: string;
  scheduled_at: string;
  status: string;
  notes: string;
  duration_minutes: number;
}

interface AgendaCalendarProps {
  appointments: AppointmentView[];
}

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toCellKey(scheduledAt: string): string {
  const d = new Date(scheduledAt);
  const mins = d.getHours() * 60 + d.getMinutes();
  const slotKey = Math.floor(mins / 30) * 30;
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${slotKey}`;
}

export function AgendaCalendar({ appointments }: AgendaCalendarProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart]
  );

  const appointmentMap = useMemo(() => {
    const map = new Map<string, AppointmentView[]>();
    for (const appt of appointments) {
      const d = new Date(appt.scheduled_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(appt);
    }
    return map;
  }, [appointments]);

  const now = new Date();
  const isCurrentWeek = weekStart.getTime() === getWeekStart(new Date()).getTime();

  const navigate = (direction: -1 | 1) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + direction * 7);
    setWeekStart(d);
  };

  const handleDragStart = useCallback((e: React.DragEvent, apptId: string) => {
    e.dataTransfer.setData("text/plain", apptId);
    e.dataTransfer.effectAllowed = "move";
    setDragging(apptId);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, cellKey: string) => {
      e.preventDefault();
      if (dragging) setDropTarget(cellKey);
    },
    [dragging]
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, dayIdx: number, hour: number) => {
      e.preventDefault();
      const apptId = e.dataTransfer.getData("text/plain");
      if (!apptId) return;

      if (!appointments.find((a) => a.id === apptId)) return;

      const targetDate = new Date(weekDays[dayIdx]);
      targetDate.setHours(hour, 0, 0, 0);

      const newScheduledAt = targetDate.toISOString();
      setPendingId(apptId);
      setDragging(null);
      setDropTarget(null);

      startTransition(async () => {
        await rescheduleAppointment(apptId, newScheduledAt);
        setPendingId(null);
      });
    },
    [appointments, weekDays, startTransition]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completado":
        return "bg-success/20 text-success";
      case "cancelado":
        return "bg-status-urgent/10 text-status-urgent line-through";
      case "confirmado":
        return "bg-secondary/20 text-secondary";
      default:
        return "bg-white/30 text-text-muted";
    }
  };

  if (appointments.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden rounded-[2rem]">
      <div className="flex items-center justify-between border-b border-white/20 px-5 py-4">
        <div className="flex items-center gap-3">
          <CalendarDays size={18} className="text-text-muted" strokeWidth={2} />
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
            {weekDays[0].toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
            {" — "}
            {weekDays[6].toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            className="flex size-8 items-center justify-center rounded-xl bg-white/30 text-text-muted hover:bg-white/50"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          {!isCurrentWeek && (
            <button
              className="rounded-xl bg-white/30 px-3 text-xs font-bold text-text-muted hover:bg-white/50"
              onClick={() => setWeekStart(getWeekStart(new Date()))}
              type="button"
            >
              Hoy
            </button>
          )}
          <button
            className="flex size-8 items-center justify-center rounded-xl bg-white/30 text-text-muted hover:bg-white/50"
            onClick={() => navigate(1)}
            type="button"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[700px] grid-cols-[60px_repeat(7,1fr)]">
          <div className="sticky left-0 z-10 bg-white/40" />
          {weekDays.map((day, i) => {
            const isToday =
              day.getDate() === now.getDate() &&
              day.getMonth() === now.getMonth() &&
              day.getFullYear() === now.getFullYear();
            return (
              <div
                className={`border-l border-white/20 px-2 py-2 text-center text-xs font-bold ${
                  isToday ? "text-secondary" : "text-text-muted"
                }`}
                key={i}
              >
                <span className="block">{DIAS[day.getDay()]}</span>
                <span
                  className={`mt-0.5 block size-6 rounded-full text-sm leading-6 ${
                    isToday ? "bg-secondary text-white" : ""
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}

          {HOURS.map((hour) => {
            const timeKey = `${hour.toString().padStart(2, "0")}:00`;
            return (
              <div className="contents" key={`row-${hour}`}>
                <div className="sticky left-0 z-10 border-t border-white/20 bg-white/40 px-2 py-3 text-xs font-bold text-text-muted">
                  {timeKey}
                </div>
                {weekDays.map((day, dayIdx) => {
                  const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
                  const cellKey = `${key}-${hour * 60}`;
                  const dayAppts = appointmentMap.get(key)?.filter((a) => {
                    const h = new Date(a.scheduled_at).getHours();
                    return h === hour;
                  });

                  const isOver = dropTarget === cellKey;

                  return (
                    <div
                      className={`relative min-h-12 border-t border-l border-white/20 p-1 transition-colors ${
                        isOver ? "bg-secondary/10" : ""
                      }`}
                      key={`cell-${dayIdx}-${hour}`}
                      onDragLeave={handleDragLeave}
                      onDragOver={(e) => handleDragOver(e, cellKey)}
                      onDrop={(e) => handleDrop(e, dayIdx, hour)}
                    >
                      {dayAppts?.map((appt) => {
                        const start = new Date(appt.scheduled_at);
                        const mins = start.getMinutes();
                        const duration = appt.duration_minutes ?? 60;
                        const topOffset = (mins / 60) * 48;
                        const height = Math.max(24, (duration / 60) * 48);
                        const isDragging = dragging === appt.id;
                        const isPending = pendingId === appt.id;

                        return (
                          <div
                            className={`absolute inset-x-1 cursor-grab rounded-lg px-1.5 py-1 text-xs font-bold text-primary transition ${
                              isPending
                                ? "animate-pulse opacity-50"
                                : isDragging
                                  ? "opacity-30"
                                  : "hover:opacity-80"
                            } ${getStatusColor(appt.status)}`}
                            draggable
                            key={appt.id}
                            style={{ top: `${topOffset}px`, height: `${height}px` }}
                            title={`${appt.studentName}: ${start.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`}
                            onDragStart={(e) => handleDragStart(e, appt.id)}
                          >
                            {isPending ? (
                              <Loader2 size={12} className="animate-spin" strokeWidth={2.5} />
                            ) : (
                              <>
                                <span className="block truncate leading-tight">{appt.studentName}</span>
                                <span className="block text-[10px] font-normal text-text-muted">
                                  {start.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })}
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
