import type { Role } from "@/lib/supabase/database.types";

export function roleHome(role: Role | null | undefined): string {
  if (role === "admin") return "/admin";
  if (role === "trainer") return "/trainer";
  return "/student";
}
