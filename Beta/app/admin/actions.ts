"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FormState } from "@/lib/types/form";

export async function createTrainer(_prevState: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: "Completa nombre, email y contraseña." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "trainer", full_name: fullName },
  });

  if (error) {
    return { error: "No se pudo crear el entrenador. Puede que el email ya esté registrado." };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function resetDatabase(confirm: string): Promise<{ error?: string; ok?: boolean }> {
  if (confirm !== "RESET") return { error: "Escribí RESET para confirmar." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (adminProfile?.role !== "admin") return { error: "Solo admin puede resetear." };

  const adminClient = createAdminClient();

  const { data: nonAdmin } = await supabase
    .from("profiles")
    .select("id")
    .neq("role", "admin");
  const ids = nonAdmin?.map((p) => p.id) ?? [];
  if (ids.length === 0) return { error: "No hay usuarios para eliminar." };

  // orphan tables (no FK to profiles)
  const routineIds = (await supabase.from("routines").select("id").in("trainer_id", ids)).data?.map((r) => r.id) ?? [];
  await supabase.from("routine_exercises").delete().in("routine_id", routineIds);

  // FK → profiles (trainer_id) o → students (profile_id)
  await supabase.from("notifications").delete().in("user_id", ids);
  await supabase.from("session_exercises").delete().in("session_id", (
    await supabase.from("sessions").select("id").in("student_id", ids)
  ).data?.map((s) => s.id) ?? []);
  await supabase.from("sessions").delete().in("student_id", ids);
  await supabase.from("assignments").delete().in("student_id", ids);
  await supabase.from("body_metrics").delete().in("student_id", ids);
  await supabase.from("student_schedules").delete().in("student_id", ids);
  await supabase.from("appointments").delete().in("trainer_id", ids);
  // appointments also FK → students (profile_id), may have been deleted above — safe
  await supabase.from("routines").delete().in("trainer_id", ids);
  await supabase.from("exercises").delete().in("trainer_id", ids);
  await supabase.from("students").delete().in("profile_id", ids);

  // delete profiles
  await supabase.from("profiles").delete().in("id", ids);

  // delete auth users
  for (const id of ids) {
    try { await adminClient.auth.admin.deleteUser(id); } catch { /* ignore if already gone */ }
  }

  revalidatePath("/admin");
  return { ok: true };
}
