import { Workout } from "@/app/types";

export const workouts: Workout[] = [
  {
    id: "full-body-a",
    name: "Full Body A",
    estimatedMinutes: 42,
    goal: "Fuerza general",
    exercises: [
      { id: "push-ups", name: "Push ups", sets: 4, reps: 12, rest: 60, focus: "Empuje" },
      { id: "squats", name: "Squats", sets: 4, reps: 15, rest: 75, focus: "Piernas" },
      { id: "plank", name: "Plank", sets: 3, time: "45 seg", rest: 45, focus: "Core" },
    ],
  },
  {
    id: "mobility-b",
    name: "Mobility B",
    estimatedMinutes: 28,
    goal: "Recuperacion activa",
    exercises: [
      { id: "hip-openers", name: "Hip openers", sets: 3, time: "40 seg", rest: 30, focus: "Movilidad" },
      { id: "dead-bug", name: "Dead bug", sets: 3, reps: 10, rest: 45, focus: "Core" },
    ],
  },
];

export function getWorkout(workoutId: string): Workout {
  return workouts.find((workout) => workout.id === workoutId) ?? workouts[0];
}
