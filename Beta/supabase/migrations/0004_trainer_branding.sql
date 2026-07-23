-- EntrenaMos - Marca del entrenador (logo)
-- Correr DESPUES de 0001, 0002 y 0003.

-- 1. Columna para la URL publica del logo del entrenador.
alter table public.profiles add column if not exists logo_url text;

-- 2. Bucket de Storage para los logos (lectura publica, escritura solo del propio dueño).
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

drop policy if exists "logo_public_read" on storage.objects;
create policy "logo_public_read"
  on storage.objects for select
  using (bucket_id = 'logos');

drop policy if exists "logo_trainer_upload" on storage.objects;
create policy "logo_trainer_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "logo_trainer_update" on storage.objects;
create policy "logo_trainer_update"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "logo_trainer_delete" on storage.objects;
create policy "logo_trainer_delete"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. RPC publica (sin exponer datos sensibles) para que el login del alumno
-- pueda mostrar el nombre/logo de su entrenador antes de pedir la contraseña.
create or replace function public.get_student_trainer_branding(p_email text)
returns table (trainer_name text, logo_url text)
language sql
security definer
set search_path = public
stable
as $$
  select t.full_name, t.logo_url
  from public.profiles s
  join public.students st on st.profile_id = s.id
  join public.profiles t on t.id = st.trainer_id
  where s.email = p_email and s.role = 'student'
  limit 1;
$$;

grant execute on function public.get_student_trainer_branding(text) to anon, authenticated;
