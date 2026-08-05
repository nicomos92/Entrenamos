"use client";

import { useState, useTransition } from "react";
import { reorderExercises } from "@/app/trainer/routines/actions";
import { ExerciseItem } from "@/app/trainer/routines/[id]/ExerciseItem";
import type { RoutineExerciseData } from "@/app/trainer/routines/[id]/EditExerciseForm";

interface DayItem extends RoutineExerciseData {
  name: string;
  rm: number | null;
}

interface ExerciseOption {
  id: string;
  name: string;
  focus: string;
  rm: number | null;
}

export function ExerciseDayList({
  routineId,
  dayNumber,
  items,
  exercises,
  days,
}: {
  routineId: string;
  dayNumber: number;
  items: DayItem[];
  exercises: ExerciseOption[];
  days: number;
}) {
  const [order, setOrder] = useState<DayItem[]>(items);
  const [, startTransition] = useTransition();

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    startTransition(() => {
      reorderExercises(routineId, dayNumber, next.map((it) => it.id));
    });
  };

  return (
    <div className="space-y-2">
      {order.map((item, i) => (
        <ExerciseItem
          canMoveDown={i < order.length - 1}
          canMoveUp={i > 0}
          days={days}
          exercises={exercises}
          key={item.id}
          onMoveDown={() => move(i, 1)}
          onMoveUp={() => move(i, -1)}
          re={item}
          routineId={routineId}
        />
      ))}
    </div>
  );
}