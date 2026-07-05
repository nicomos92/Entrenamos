import { useState, useMemo } from "react";
import { Role, StudentView, TrainerView, WeeklyProgress } from "@/app/types";
import { sessions, currentUser } from "@/app/data/users";
import { workouts } from "@/app/data/workouts";

export function useAppState() {
  const [role, setRole] = useState<Role>("student");
  const [studentView, setStudentView] = useState<StudentView>("home");
  const [trainerView, setTrainerView] = useState<TrainerView>("trainer-dashboard");
  const [activeExercise, setActiveExercise] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [effort, setEffort] = useState(3);
  const [coachNote, setCoachNote] = useState("Mantené la intensidad y priorizá técnica limpia en cada repetición.");

  const studentWorkout = workouts[0];
  const exercise = studentWorkout.exercises[activeExercise];
  const isComplete = completedIds.length === studentWorkout.exercises.length;
  const elapsedMinutes = Math.max(18, studentWorkout.estimatedMinutes - (isComplete ? 3 : 9));

  const weeklyProgress = useMemo(() => {
    const done = sessions.filter((session) => session.userId === currentUser.id).length + (isComplete ? 1 : 0);
    return { done, goal: 5, percentage: Math.min(100, (done / 5) * 100) };
  }, [isComplete]);

  const changeRole = (nextRole: Role) => {
    setRole(nextRole);
  };

  const startWorkout = () => {
    setRole("student");
    setStudentView("workout");
    setActiveExercise(0);
    setCompletedIds([]);
    setEffort(3);
  };

  const completeExercise = () => {
    setCompletedIds((ids) => (ids.includes(exercise.id) ? ids : [...ids, exercise.id]));
  };

  const nextExercise = () => {
    if (activeExercise < studentWorkout.exercises.length - 1) {
      setActiveExercise((index) => index + 1);
      return;
    }
    setStudentView("summary");
  };

  return {
    role,
    studentView,
    trainerView,
    activeExercise,
    completedIds,
    effort,
    coachNote,
    weeklyProgress,
    exercise,
    isComplete,
    elapsedMinutes,
    studentWorkout,
    setRole: changeRole,
    setStudentView,
    setTrainerView,
    setEffort,
    setCoachNote,
    startWorkout,
    completeExercise,
    nextExercise,
  };
}
