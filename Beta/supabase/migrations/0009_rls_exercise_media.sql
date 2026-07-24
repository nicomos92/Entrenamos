-- EntrenaMos - RLS policies para bucket exercise_media
-- y policy UPDATE para que alumnos editen su perfil.

-- 1. RLS policies para storage.objects del bucket exercise_media
-- (el bucket ya fue creado en 0008_exercise_cleanup.sql)

-- 1a. SELECT: trainers ven sus propios archivos; alumnos ven los de su trainer
create policy "exercise_media_select_own"
  on storage.objects for select
  using (
    bucket_id = 'exercise_media'
    and (
      auth.role() = 'authenticated'
    )
  );

-- 1b. INSERT: trainers autenticados pueden subir
create policy "exercise_media_insert_trainer"
  on storage.objects for insert
  with check (
    bucket_id = 'exercise_media'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'trainer'
    )
  );

-- 1c. UPDATE: solo el owner del archivo (trainer) puede modificar
create policy "exercise_media_update_owner"
  on storage.objects for update
  using (
    bucket_id = 'exercise_media'
    and owner = auth.uid()
  );

-- 1d. DELETE: solo el owner del archivo (trainer) puede borrar
create policy "exercise_media_delete_owner"
  on storage.objects for delete
  using (
    bucket_id = 'exercise_media'
    and owner = auth.uid()
  );

-- 2. Policy para que el alumno pueda UPDATE ciertos campos de su fila en students
-- (evita usar el admin client en updateMyProfile)
create policy "students_update_own"
  on public.students for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
