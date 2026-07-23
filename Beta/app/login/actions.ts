"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleHome } from "@/lib/roleHome";

export interface AuthFormState {
  error: string | null;
}

export async function login(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completa email y contraseña." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  redirect(roleHome(profile?.role));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
