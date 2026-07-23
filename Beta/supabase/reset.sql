-- EntrenaMos - Reset de datos de prueba
-- ============================================================
-- ATENCION: este script BORRA datos. Usalo antes de arrancar
-- con el cliente real, para limpiar todo lo que cargaste como
-- prueba (entrenadores de prueba, alumnos de prueba, rutinas,
-- turnos, mediciones, etc.)
--
-- Que hace:
--   Borra todos los usuarios de auth.users que NO sean admin.
--   Como todas las tablas (students, exercises, routines,
--   assignments, sessions, appointments, body_metrics, etc.)
--   tienen "on delete cascade" hacia profiles/students, se borran
--   solas en cadena. Las cuentas de admin (vos) NO se tocan.
--
-- Que NO hace:
--   No borra los archivos de logo ya subidos al bucket "logos"
--   de Storage. Si un entrenador de prueba subio un logo y lo
--   queres borrar, hacelo a mano desde Storage > logos en el
--   dashboard.
--
-- Como usarlo:
--   1. Copiar TODO este archivo.
--   2. Pegarlo en el SQL Editor de Supabase.
--   3. Revisar una vez mas que sea lo que queres hacer (es
--      irreversible).
--   4. Run.
-- ============================================================

delete from auth.users
where id not in (
  select id from public.profiles where role = 'admin'
);

-- Confirmacion: deberian quedar 0 filas en estas tablas
-- (salvo profiles, que conserva a los admins).
select
  (select count(*) from public.profiles where role != 'admin') as perfiles_no_admin,
  (select count(*) from public.students) as alumnos,
  (select count(*) from public.exercises) as ejercicios,
  (select count(*) from public.routines) as rutinas,
  (select count(*) from public.assignments) as asignaciones,
  (select count(*) from public.sessions) as sesiones,
  (select count(*) from public.appointments) as turnos,
  (select count(*) from public.body_metrics) as mediciones;
