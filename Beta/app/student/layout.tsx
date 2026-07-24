import type { CSSProperties } from "react";
import { requireProfile } from "@/lib/auth";
import { TopBar } from "@/app/components/TopBar";
import { SectionNav, type NavItem } from "@/app/components/SectionNav";
import { Sidebar } from "@/app/components/Sidebar";
import { brandCssVars } from "@/lib/color";
import { NotificationBell } from "@/app/components/shared/NotificationBell";

const NAV_ITEMS: NavItem[] = [
  { href: "/student", label: "Hoy", icon: "Home" },
  { href: "/student/workout", label: "Rutina", icon: "Dumbbell" },
  { href: "/student/agenda", label: "Agenda", icon: "CalendarDays" },
  { href: "/student/summary", label: "Resumen", icon: "BarChart3" },
  { href: "/student/profile", label: "Perfil", icon: "User" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile } = await requireProfile("student");

  const { data: studentRow } = await supabase
    .from("students")
    .select("trainer_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  let trainerLogoUrl: string | null = null;
  let subtitle = "Mi entrenamiento";
  let brandStyle: CSSProperties = {};

  if (studentRow?.trainer_id) {
    const { data: trainer } = await supabase
      .from("profiles")
      .select("full_name, logo_url, brand_primary, brand_secondary")
      .eq("id", studentRow.trainer_id)
      .maybeSingle();

    if (trainer) {
      trainerLogoUrl = trainer.logo_url;
      subtitle = `Entrenado por ${trainer.full_name}`;
      brandStyle = brandCssVars(trainer.brand_primary, trainer.brand_secondary) as CSSProperties;
    }
  }

  return (
    <div
      className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-5 pb-28 pt-6 lg:max-w-6xl lg:flex-row lg:gap-10 lg:px-8 lg:pb-8 lg:pt-8"
      style={brandStyle}
    >
      <Sidebar items={NAV_ITEMS} logoUrl={trainerLogoUrl} name={profile.full_name} subtitle={subtitle} />
      <main className="min-w-0 flex-1 lg:py-2">
        <div className="flex items-start justify-between">
          <TopBar logoUrl={trainerLogoUrl} name={profile.full_name} subtitle={subtitle} />
          <div className="hidden lg:block">
            <NotificationBell userId={user.id} />
          </div>
        </div>
        <div className="animate-in">{children}</div>
      </main>
      <SectionNav items={NAV_ITEMS} />
    </div>
  );
}
