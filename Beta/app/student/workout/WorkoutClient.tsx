"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { Repeat, Timer, Gauge, CheckCircle2, ArrowRight, Star, ImageIcon, Video, SkipForward, MessageSquareText, Dumbbell, Moon } from "lucide-react";
import { Metric } from "@/app/components/shared/Metric";
import { finishSession } from "@/app/student/workout/actions";
import type { AssignedRoutine } from "@/lib/data/student";
import { formatDuration } from "@/lib/duration";

interface SetFeedback {
  weightKg: string;
  reps: string;
  durationSeconds: string;
}

interface ExerciseFeedback {
  difficulty: number;
  notes: string;
  sets: SetFeedback[];
}

interface PlannedSetConfig {
  unit: "reps" | "time";
  weightKg: string;
  reps: string;
  durationSeconds: string;
}

function RestTimer({ rest, onFinish }: { rest: number; onFinish: () => void }) {
  const [remaining, setRemaining] = useState(rest);

  useEffect(() => {
    if (remaining <= 0) {
      onFinish();
      return;
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [remaining, onFinish]);

  return (
    <div className="glass-card flex flex-col items-center justify-center gap-4 rounded-[2rem] p-10 text-center">
      <Timer size={48} strokeWidth={2} className="text-primary" />
      <p className="text-lg font-bold uppercase tracking-[0.22em] text-text-muted">Descanso</p>
      <p className="text-6xl font-bold text-primary">{remaining}</p>
      <p className="text-sm text-text-muted">Segundos restantes</p>
      <button className="secondary-button mt-2" onClick={onFinish} type="button">
        <SkipForward size={16} strokeWidth={2.5} />
        Saltar descanso
      </button>
    </div>
  );
}

function FeedbackForm({
  plannedSetConfigs,
  defaultSets,
  onSubmit,
  onSkip,
}: {
  plannedSetConfigs: PlannedSetConfig[];
  defaultSets: SetFeedback[];
  onSubmit: (data: ExerciseFeedback) => void;
  onSkip: () => void;
}) {
  const [difficulty, setDifficulty] = useState(3);
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState<SetFeedback[]>(
    plannedSetConfigs.length === defaultSets.length
      ? defaultSets
      : plannedSetConfigs.map((p, i) => defaultSets[i] ?? { weightKg: p.weightKg, reps: p.reps, durationSeconds: p.durationSeconds })
  );

  const updateSet = (index: number, field: keyof SetFeedback, value: string) => {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  return (
    <div className="glass-card space-y-5 rounded-[2rem] p-6">
      <div>
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <Star size={14} strokeWidth={2.5} />
          Dificultad del ejercicio
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              className={`flex-1 rounded-2xl py-3 text-lg font-bold transition ${
                difficulty >= value ? "bg-secondary text-white shadow-glow" : "bg-white/40 text-text-muted"
              }`}
              key={value}
              onClick={() => setDifficulty(value)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-text-muted">
          <span>Muy fácil</span>
          <span>Imposible</span>
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <MessageSquareText size={14} strokeWidth={2.5} />
          Nota (opcional)
        </p>
        <textarea
          className="field-input min-h-20 rounded-3xl text-sm"
          placeholder="¿Cómo sentiste el ejercicio?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div>
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <Repeat size={14} strokeWidth={2.5} />
          Series realizadas ({sets.length})
        </p>
        <div className="space-y-2">
          {sets.map((s, i) => {
            const unit = plannedSetConfigs[i]?.unit ?? "reps";
            return (
              <div className="flex items-center gap-3 rounded-2xl bg-white/30 px-4 py-3" key={i}>
                <span className="text-sm font-bold text-text-muted">#{i + 1}</span>
                {unit === "time" ? (
                  <div className="flex flex-1 gap-3">
                    <input
                      className="field-input w-full rounded-2xl py-2 text-sm"
                      min={1}
                      onChange={(e) => updateSet(i, "durationSeconds", e.target.value)}
                      placeholder="Segundos"
                      type="number"
                      value={s.durationSeconds}
                    />
                    <input
                      className="field-input w-full rounded-2xl py-2 text-sm"
                      min={0}
                      onChange={(e) => updateSet(i, "weightKg", e.target.value)}
                      placeholder="Kg"
                      step={0.5}
                      type="number"
                      value={s.weightKg}
                    />
                  </div>
                ) : (
                  <div className="flex flex-1 gap-3">
                    <input
                      className="field-input w-full rounded-2xl py-2 text-sm"
                      placeholder="Kg"
                      type="number"
                      value={s.weightKg}
                      onChange={(e) => updateSet(i, "weightKg", e.target.value)}
                    />
                    <input
                      className="field-input w-full rounded-2xl py-2 text-sm"
                      placeholder="Reps"
                      type="number"
                      value={s.reps}
                      onChange={(e) => updateSet(i, "reps", e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          className="premium-button flex-1"
          onClick={() =>
            onSubmit({
              difficulty,
              notes: notes.trim(),
              sets: sets.map((s) => ({
                weightKg: s.weightKg,
                reps: s.reps,
                durationSeconds: s.durationSeconds,
              })),
            })
          }
          type="button"
        >
          <CheckCircle2 size={16} strokeWidth={2.5} />
          Confirmar
        </button>
        <button className="ghost-button" onClick={onSkip} type="button">
          Saltar
        </button>
      </div>
    </div>
  );
}

export function WorkoutClient({ assignment, todayDay }: { assignment: AssignedRoutine; todayDay: number | null }) {
  const [selectedDay, setSelectedDay] = useState(todayDay ?? 1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, ExerciseFeedback>>({});
  const [effort, setEffort] = useState(3);
  const [startedAt] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();
  const [showRest, setShowRest] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const dayExercises = assignment.exercises.filter((e) => e.dayNumber === selectedDay);
  const exercise = dayExercises[activeIndex];
  const progress = Math.round(((activeIndex + 1) / dayExercises.length) * 100);

  const changeDay = (day: number) => {
    setSelectedDay(day);
    setActiveIndex(0);
    setShowRest(false);
    setShowFeedback(false);
    setCompletedIds([]);
  };

  const finish = useCallback(
    (completed: string[]) => {
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
      startTransition(() => {
        finishSession({
          assignmentId: assignment.assignmentId,
          routineId: assignment.routineId,
          totalExercises: dayExercises.length,
          completedExerciseIds: completed,
          effort,
          elapsedMinutes,
          exerciseFeedback: completed.map((id) => ({
            exerciseId: id,
            difficulty: feedback[id]?.difficulty,
            notes: feedback[id]?.notes,
            sets: feedback[id]?.sets.map((s) => ({
              weightKg: s.weightKg ? Number(s.weightKg) : undefined,
              reps: s.reps ? Number(s.reps) : undefined,
              durationSeconds: s.durationSeconds ? Number(s.durationSeconds) : undefined,
            })),
          })),
        });
      });
    },
    [assignment, effort, startedAt, feedback, dayExercises.length]
  );

  const handleConfirmFeedback = (data: ExerciseFeedback) => {
    const exerciseId = exercise.exerciseId;
    setFeedback((prev) => ({ ...prev, [exerciseId]: data }));
    setShowFeedback(false);
    setCompletedIds((ids) => {
      if (ids.includes(exerciseId)) return ids;
      const newIds = [...ids, exerciseId];
      if (activeIndex < dayExercises.length - 1) {
        setShowRest(true);
      }
      return newIds;
    });
  };

  const handleSkipFeedback = () => {
    setShowFeedback(false);
    setCompletedIds((ids) => {
      if (ids.includes(exercise.exerciseId)) return ids;
      const newIds = [...ids, exercise.exerciseId];
      if (activeIndex < dayExercises.length - 1) {
        setShowRest(true);
      }
      return newIds;
    });
  };

  const toggleComplete = () => {
    if (completedIds.includes(exercise.exerciseId)) return;
    const existing = feedback[exercise.exerciseId];
    if (existing) {
      setShowRest(true);
      setCompletedIds((ids) => [...ids, exercise.exerciseId]);
    } else {
      setShowFeedback(true);
    }
  };

  const goNext = () => {
    if (activeIndex < dayExercises.length - 1) {
      setShowRest(false);
      setActiveIndex((index) => index + 1);
      return;
    }
    finish(completedIds);
  };

  const goToExercise = () => {
    setShowRest(false);
    setActiveIndex((index) => index + 1);
  };

  if (dayExercises.length === 0) {
    return (
      <section className="space-y-6">
        <p className="text-center text-lg font-bold uppercase tracking-[0.22em] text-text-muted">
          <Moon size={20} strokeWidth={2.5} className="mr-2 inline" />
          Hoy es día de descanso
        </p>
        <p className="text-center text-text-muted">
          {todayDay === null
            ? "Hoy no te toca entrenar. Elegí otro día para adelantar el entrenamiento."
            : "Este día todavía no tiene ejercicios. Elegí otro día."}
        </p>
        <div className="glass-card flex gap-2 rounded-3xl p-2">
          {Array.from({ length: assignment.days }, (_, i) => (
            <button
              className={`flex-1 rounded-2xl py-2 text-sm font-bold transition ${
                selectedDay === i + 1 ? "bg-secondary text-white shadow-glow" : "text-primary"
              }`}
              key={i}
              onClick={() => changeDay(i + 1)}
              type="button"
            >
              Día {i + 1}
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (showRest && activeIndex < dayExercises.length - 1) {
    return (
      <section className="space-y-6">
        <RestTimer rest={exercise.rest} onFinish={goToExercise} />
      </section>
    );
  }

  const isCompleted = completedIds.includes(exercise?.exerciseId);

  const exerciseSetsLabel = (() => {
    if (exercise.setsConfig.length > 0) {
      return exercise.setsConfig
        .map((s) => {
          if (s.unit === "time") {
            const base = `S${s.setNumber}: ${formatDuration(s.durationSeconds)}`;
            return s.weightKg != null ? `${base} @ ${s.weightKg}kg` : base;
          }
          let label = `S${s.setNumber}: ${s.reps ?? "-"}`;
          if (s.weightKg != null) label += ` @ ${s.weightKg}kg`;
          return label;
        })
        .join(" · ");
    }
    return `${exercise.sets} x ${exercise.reps ?? exercise.time ?? "-"}`;
  })();

  const defaultSets: SetFeedback[] = exercise.setsConfig.length > 0
    ? exercise.setsConfig.map((s) => ({
        weightKg: s.weightKg != null ? String(s.weightKg) : "",
        reps: s.reps != null ? String(s.reps) : "",
        durationSeconds: s.durationSeconds != null ? String(s.durationSeconds) : "",
      }))
    : Array.from({ length: exercise.sets }, () => ({ weightKg: "", reps: "", durationSeconds: "" }));

  const plannedSetConfigs: PlannedSetConfig[] = exercise.setsConfig.length > 0
    ? exercise.setsConfig.map((s) => ({
        unit: s.unit,
        weightKg: s.weightKg != null ? String(s.weightKg) : "",
        reps: s.reps != null ? String(s.reps) : "",
        durationSeconds: s.durationSeconds != null ? String(s.durationSeconds) : "",
      }))
    : Array.from({ length: exercise.sets }, () => ({
        unit: "reps" as const,
        weightKg: "",
        reps: exercise.reps != null ? String(exercise.reps) : "",
        durationSeconds: "",
      }));

  return (
    <section className="space-y-6">
      <div className="glass-card flex gap-2 rounded-3xl p-2">
        {Array.from({ length: assignment.days }, (_, i) => (
          <button
            className={`flex-1 rounded-2xl py-2 text-sm font-bold transition ${
              selectedDay === i + 1 ? "bg-secondary text-white shadow-glow" : "text-primary"
            }`}
            key={i}
            onClick={() => changeDay(i + 1)}
            type="button"
          >
            Día {i + 1}
          </button>
        ))}
      </div>

      {todayDay === null && (
        <p className="flex items-center gap-2 rounded-2xl bg-white/30 px-4 py-3 text-xs font-bold text-text-muted">
          <Moon size={13} strokeWidth={2.5} />
          Hoy es día de descanso. Estás viendo otro día de la rutina.
        </p>
      )}

      <div className="flex items-end justify-between">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-text-muted">
          Ejercicio {activeIndex + 1} de {dayExercises.length}
        </p>
        <p className="text-4xl font-bold text-primary">{progress}%</p>
      </div>
      <div className="h-3 rounded-full bg-white/50">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>

      {showFeedback ? (
        <FeedbackForm
          defaultSets={defaultSets}
          onSkip={handleSkipFeedback}
          onSubmit={handleConfirmFeedback}
          plannedSetConfigs={plannedSetConfigs}
        />
      ) : (
        <>
          <article className="glass-card overflow-hidden rounded-[2rem]">
            <div className="relative h-56 bg-gradient-to-br from-soft via-white to-secondary/40 p-6">
              <div className="absolute inset-x-8 bottom-8 h-16 rounded-full bg-primary/20 blur-2xl" />
              <div className="relative z-10 flex h-full flex-col justify-end">
                <span className="mb-3 w-fit rounded-full bg-white/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
                  {exercise.focus || "General"}
                </span>
                <h1 className="text-4xl font-bold text-primary">{exercise.name}</h1>
              </div>
            </div>

            {(exercise.imageUrl || exercise.videoUrl) && (
              <div className="flex gap-2 px-5 pt-3">
                {exercise.imageUrl && (
                  <a
                    className="flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-white/70"
                    href={exercise.imageUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ImageIcon size={12} strokeWidth={2.5} />
                    Ver imagen
                  </a>
                )}
                {exercise.videoUrl && (
                  <a
                    className="flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-white/70"
                    href={exercise.videoUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Video size={12} strokeWidth={2.5} />
                    Ver video
                  </a>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 p-5">
              <Metric icon={<Repeat size={16} strokeWidth={2.25} />} label="Series" value={`${exercise.sets}`} />
              <Metric icon={<Timer size={16} strokeWidth={2.25} />} label="Descanso" value={formatDuration(exercise.rest)} />
            </div>

            <div className="px-5 pb-3">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
                <Dumbbell size={11} strokeWidth={2.5} />
                Series planificadas
              </p>
              <p className="mt-1 text-sm font-bold text-primary">{exerciseSetsLabel}</p>
              {exercise.intensityPct != null && (
                <p className="text-xs text-text-muted">Intensidad: {exercise.intensityPct}%</p>
              )}
            </div>

            {isCompleted && feedback[exercise.exerciseId] && (
              <div className="border-t border-white/20 px-5 py-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-text-muted">
                    <Star size={12} strokeWidth={2.5} />
                    Dificultad: {feedback[exercise.exerciseId].difficulty}/5
                  </span>
                  {feedback[exercise.exerciseId].notes && (
                    <span className="text-text-muted">· {feedback[exercise.exerciseId].notes}</span>
                  )}
                </div>
                {feedback[exercise.exerciseId].sets.some((s) => s.weightKg || s.reps || s.durationSeconds) && (
                  <div className="mt-2 flex gap-4 text-xs text-text-muted">
                    {feedback[exercise.exerciseId].sets.map((s, i) => {
                      const unit = plannedSetConfigs[i]?.unit ?? "reps";
                      return (
                        <span key={i}>
                          #{i + 1}:{" "}
                          {unit === "time"
                            ? `${formatDuration(s.durationSeconds ? Number(s.durationSeconds) : null)}${s.weightKg ? ` @ ${s.weightKg}kg` : ""}`
                            : `${s.weightKg || "-"} kg × ${s.reps || "-"} reps`}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </article>

          <div>
            <p className="mb-3 flex items-center justify-center gap-2 text-center text-sm font-bold uppercase tracking-[0.28em] text-text-muted">
              <Gauge size={14} strokeWidth={2.5} />
              Nivel de esfuerzo (RPE)
            </p>
            <div className="glass-card grid grid-cols-5 gap-2 rounded-3xl p-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  className={`rounded-2xl py-3 text-2xl font-bold transition ${effort === value ? "bg-secondary text-white shadow-glow" : "text-primary"}`}
                  key={value}
                  onClick={() => setEffort(value)}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-sm text-text-muted">
              <span>Fácil</span>
              <span>Al límite</span>
            </div>
          </div>

          <button
            className={`premium-button w-full ${isCompleted ? "opacity-60" : ""}`}
            disabled={isPending || isCompleted}
            onClick={toggleComplete}
            type="button"
          >
            <CheckCircle2 size={18} strokeWidth={2.5} />
            {isCompleted ? "Completado" : "Completar ejercicio"}
          </button>

          <button className="secondary-button w-full" disabled={isPending} onClick={goNext} type="button">
            {activeIndex === dayExercises.length - 1 ? "Ver resumen" : "Siguiente ejercicio"}
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>

          <button
            className="ghost-button w-full"
            disabled={isPending}
            onClick={() => finish(completedIds)}
            type="button"
          >
            Terminar incompleto
          </button>
        </>
      )}
    </section>
  );
}
