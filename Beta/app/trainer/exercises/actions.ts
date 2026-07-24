"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types/form";

function parseExerciseFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const focus = String(formData.get("focus") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
  const videoUrl = String(formData.get("video_url") ?? "").trim() || null;

  return {
    name,
    description,
    focus,
    image_url: imageUrl,
    video_url: videoUrl,
  };
}

export async function createExercise(_prevState: FormState, formData: FormData): Promise<FormState> {
  const fields = parseExerciseFields(formData);
  if (!fields.name) return { error: "El ejercicio necesita un nombre." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const url = await uploadExerciseFile(imageFile, user.id);
    if (url) fields.image_url = url;
  }

  const { error } = await supabase.from("exercises").insert({ ...fields, trainer_id: user.id });
  if (error) return { error: "No se pudo crear el ejercicio." };

  revalidatePath("/trainer/exercises");
  redirect("/trainer/exercises");
}

export async function updateExercise(exerciseId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const fields = parseExerciseFields(formData);
  if (!fields.name) return { error: "El ejercicio necesita un nombre." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const url = await uploadExerciseFile(imageFile, user.id);
    if (url) fields.image_url = url;
  }

  const { error } = await supabase.from("exercises").update(fields).eq("id", exerciseId);
  if (error) return { error: "No se pudo actualizar el ejercicio." };

  revalidatePath("/trainer/exercises");
  redirect("/trainer/exercises");
}

export async function deleteExercise(exerciseId: string) {
  const supabase = await createClient();
  await supabase.from("exercises").delete().eq("id", exerciseId);
  revalidatePath("/trainer/exercises");
}

async function uploadExerciseFile(file: File, userId: string): Promise<string | null> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "png";
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("exercise_media").upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) return null;

  const { data: publicUrl } = supabase.storage.from("exercise_media").getPublicUrl(fileName);
  return publicUrl.publicUrl;
}
