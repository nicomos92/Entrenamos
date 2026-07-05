import { workouts } from "@/app/data/workouts";

export function TrainerRoutinesView() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-text-muted">Biblioteca del entrenador</p>
        <h1 className="text-4xl font-bold text-text-primary">Rutinas</h1>
      </div>

      {workouts.map((workout) => (
        <article className="glass-card rounded-[2rem] p-5" key={workout.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-text-muted">{workout.goal}</p>
              <h2 className="mt-1 text-2xl font-bold text-primary">{workout.name}</h2>
            </div>
            <span className="rounded-full bg-[#BAE6FD] px-3 py-1 text-sm font-bold text-primary">{workout.estimatedMinutes} min</span>
          </div>
          <div className="mt-4 space-y-2">
            {workout.exercises.map((exercise) => (
              <div className="flex justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={exercise.id}>
                <span className="font-bold">{exercise.name}</span>
                <span className="text-text-muted">{exercise.sets} x {exercise.reps ?? exercise.time}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
