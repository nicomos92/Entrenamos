-- Cuota mensual del alumno
ALTER TABLE students ADD COLUMN fee_amount NUMERIC CHECK (fee_amount >= 0);
ALTER TABLE students ADD COLUMN fee_due_day INTEGER DEFAULT 10 CHECK (fee_due_day >= 1 AND fee_due_day <= 31);

-- Registro de pagos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(profile_id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  period_month DATE NOT NULL,
  paid_at TIMESTAMPTZ DEFAULT now(),
  trainer_id UUID NOT NULL REFERENCES profiles(id),
  notes TEXT DEFAULT ''
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Trainers pueden gestionar pagos de sus propios alumnos
CREATE POLICY "trainer_manage_payments" ON payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.profile_id = student_id
      AND students.trainer_id = auth.uid()
    )
  );

-- Alumnos pueden ver sus propios pagos
CREATE POLICY "student_read_payments" ON payments
  FOR SELECT
  USING (student_id = auth.uid());
