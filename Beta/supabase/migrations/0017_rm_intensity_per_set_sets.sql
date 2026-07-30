-- RM (repetición máxima) para ejercicios
ALTER TABLE exercises ADD COLUMN rm INTEGER;

-- Intensidad porcentual para routine_exercises (ej: 70 = 70%)
ALTER TABLE routine_exercises ADD COLUMN intensity_pct NUMERIC;

-- Configuración individual por serie dentro de un ejercicio de rutina
CREATE TABLE routine_exercise_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_exercise_id UUID NOT NULL REFERENCES routine_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL CHECK (set_number > 0),
  reps INTEGER CHECK (reps > 0),
  weight_kg NUMERIC CHECK (weight_kg >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(routine_exercise_id, set_number)
);

ALTER TABLE routine_exercise_sets ENABLE ROW LEVEL SECURITY;

-- Trainers pueden gestionar sets de sus propias rutinas
CREATE POLICY "trainer_manage_routine_exercise_sets" ON routine_exercise_sets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM routine_exercises re
      JOIN routines r ON r.id = re.routine_id
      WHERE re.id = routine_exercise_id
      AND r.trainer_id = auth.uid()
    )
  );

-- Alumnos pueden leer sets de su asignación activa
CREATE POLICY "student_read_routine_exercise_sets" ON routine_exercise_sets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routine_exercises re
      JOIN assignments a ON a.routine_id = re.routine_id
      WHERE re.id = routine_exercise_id
      AND a.student_id = auth.uid()
      AND a.active = true
    )
  );
