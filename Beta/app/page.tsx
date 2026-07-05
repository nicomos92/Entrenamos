"use client";

import { Header } from "@/app/components/Header";
import { StudentHomeView } from "@/app/components/student/StudentHomeView";
import { WorkoutView } from "@/app/components/student/WorkoutView";
import { SummaryView } from "@/app/components/student/SummaryView";
import { TrainerDashboardView } from "@/app/components/trainer/TrainerDashboardView";
import { TrainerStudentsView } from "@/app/components/trainer/TrainerStudentsView";
import { TrainerRoutinesView } from "@/app/components/trainer/TrainerRoutinesView";
import { BottomNav } from "@/app/components/BottomNav";
import { useAppState } from "@/app/hooks/useAppState";

export default function Home() {
  const {
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
    setRole,
    setStudentView,
    setTrainerView,
    setEffort,
    setCoachNote,
    startWorkout,
    completeExercise,
    nextExercise,
  } = useAppState();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-5 pb-28 pt-6">
      <Header role={role} onRoleChange={setRole} />

      {role === "student" && studentView === "home" && (
        <StudentHomeView weeklyProgress={weeklyProgress} onStartWorkout={startWorkout} />
      )}

      {role === "student" && studentView === "workout" && (
        <WorkoutView
          activeExercise={activeExercise}
          completedIds={completedIds}
          effort={effort}
          exercise={exercise}
          onComplete={completeExercise}
          onEffortChange={setEffort}
          onExit={() => setStudentView("summary")}
          onNext={nextExercise}
        />
      )}

      {role === "student" && studentView === "summary" && (
        <SummaryView
          coachNote={coachNote}
          completed={completedIds.length}
          effort={effort}
          elapsedMinutes={elapsedMinutes}
          isComplete={isComplete}
          onCoachNoteChange={setCoachNote}
          onHome={() => setStudentView("home")}
        />
      )}

      {role === "trainer" && trainerView === "trainer-dashboard" && (
        <TrainerDashboardView onOpenStudents={() => setTrainerView("trainer-students")} />
      )}

      {role === "trainer" && trainerView === "trainer-students" && <TrainerStudentsView />}

      {role === "trainer" && trainerView === "trainer-routines" && <TrainerRoutinesView />}

      <BottomNav
        role={role}
        studentView={studentView}
        trainerView={trainerView}
        onRoleChange={setRole}
        onStudentViewChange={setStudentView}
        onTrainerViewChange={setTrainerView}
      />
    </main>
  );
}
