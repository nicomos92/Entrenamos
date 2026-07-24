import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import { CheckInSuccess } from "./CheckInSuccess";

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ appointmentId?: string }>;
}) {
  const { appointmentId } = await searchParams;
  if (!appointmentId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg font-bold text-text-muted">Falta el código de check-in</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/checkin?appointmentId=${appointmentId}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "student") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg font-bold text-text-muted">Solo los alumnos pueden hacer check-in</p>
      </div>
    );
  }

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, student_id, status, scheduled_at, trainer_id")
    .eq("id", appointmentId)
    .single();

  if (!appointment) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg font-bold text-text-muted">Turno no encontrado</p>
      </div>
    );
  }

  if (appointment.student_id !== user.id) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg font-bold text-text-muted">Este turno no te pertenece</p>
      </div>
    );
  }

  if (appointment.status === "completado") {
    return <CheckInSuccess message="Ya habías hecho check-in para este turno." />;
  }

  if (appointment.status === "cancelado") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg font-bold text-text-muted">Este turno está cancelado</p>
      </div>
    );
  }

  await supabase
    .from("appointments")
    .update({ status: "completado" })
    .eq("id", appointmentId);

  await createNotification({
    userId: appointment.trainer_id,
    type: "appointment_updated",
    title: "Check-in realizado",
    body: "El alumno realizó el check-in.",
    data: { appointmentId },
  });

  return <CheckInSuccess />;
}
