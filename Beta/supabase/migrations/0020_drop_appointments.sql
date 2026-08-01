-- Agenda semanal: se elimina el modelo de turnos con fecha.
-- La planificación pasa a vivir en student_schedules (día + hora), duración fija de 60 min.
DROP TABLE IF EXISTS public.appointments;

-- Tipos de notificación: se reemplazan los de turnos por el de horarios.
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type in (
    'schedule_updated',
    'routine_assigned',
    'session_completed',
    'metric_recorded'
  ));
