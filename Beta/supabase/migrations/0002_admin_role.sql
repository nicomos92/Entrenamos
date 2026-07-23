-- EntrenaMos - Rol Admin
-- Correr DESPUES de 0001_init.sql en el SQL Editor de Supabase.
--
-- Agrega el rol "admin" (gestiona entrenadores, ver Product Design System
-- seccion 3). El admin se crea con un script aparte (scripts/create-admin.mjs),
-- no hay signup publico para admin ni para entrenador.

-- 1. Permitir 'admin' en profiles.role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'trainer', 'student'));

-- 2. Funcion security definer para chequear admin sin recursion de RLS.
create or replace function public.is_admin(check_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = check_id and role = 'admin');
$$;

-- 3. El admin puede ver todos los perfiles (para listar entrenadores).
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin(auth.uid()));
