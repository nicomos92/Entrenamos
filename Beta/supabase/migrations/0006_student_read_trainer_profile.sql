-- Allow students to read their trainer's profile (for branding: logo, colors, name)
CREATE POLICY "profiles_select_trainer_for_student" ON profiles
  FOR SELECT
  USING (
    -- Student can read trainer's profile if:
    -- 1. It's their own profile, OR
    -- 2. They are a student whose trainer_id matches this profile.id
    id = auth.uid() OR
    id IN (
      SELECT trainer_id FROM students
      WHERE profile_id = auth.uid()
    )
  );
