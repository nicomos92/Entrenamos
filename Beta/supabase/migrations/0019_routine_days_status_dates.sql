-- Rutinas: estado (borrador/activa), fechas de uso, cantidad de días y primer día de semana
ALTER TABLE routines ADD COLUMN status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('borrador', 'activa'));
ALTER TABLE routines ADD COLUMN start_date DATE;
ALTER TABLE routines ADD COLUMN end_date DATE;
ALTER TABLE routines ADD COLUMN days INTEGER NOT NULL DEFAULT 1 CHECK (days BETWEEN 1 AND 7);
ALTER TABLE routines ADD COLUMN start_weekday INTEGER NOT NULL DEFAULT 1 CHECK (start_weekday BETWEEN 0 AND 6);

-- Día al que pertenece cada ejercicio dentro de la rutina
ALTER TABLE routine_exercises ADD COLUMN day_number INTEGER NOT NULL DEFAULT 1 CHECK (day_number > 0);

-- Series: unidad de medida por serie (repeticiones o tiempo)
ALTER TABLE routine_exercise_sets ADD COLUMN unit TEXT NOT NULL DEFAULT 'reps' CHECK (unit IN ('reps', 'time'));
ALTER TABLE routine_exercise_sets ADD COLUMN duration_seconds INTEGER CHECK (duration_seconds > 0);

-- Series completadas por el alumno: registrar duración para series por tiempo
ALTER TABLE exercise_sets ADD COLUMN duration_seconds INTEGER CHECK (duration_seconds > 0);
