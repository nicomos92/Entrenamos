import type { CSSProperties } from "react";
import { requireProfile } from "@/lib/auth";
import { TopBar } from "@/app/components/TopBar";
import { SectionNav, type NavItem } from "@/app/components/SectionNav";
import { Sidebar } from "@/app/components/Sidebar";
import { brandCssVars } from "@/lib/color";
import { NotificationBell } from "@/app/components/shared/NotificationBell";

const NAV_ITEMS: NavItem[] = [
  { href: "/trainer", label: "Panel", icon: "LayoutDashboard" },
  { href: "/trainer/students", label: "Alumnos", icon: "Users" },
  { href: "/trainer/exercises", label: "Ejercicios", icon: "Dumbbell" },
  { href: "/trainer/routines", label: "Rutinas", icon: "ClipboardList" },
  { href: "/trainer/agenda", label: "Agenda", icon: "CalendarDays" },
  { href: "/trainer/import", label: "Importar", icon: "Upload" },
  { href: "/trainer/settings", label: "Config", icon: "Settings2" },
];

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireProfile("trainer");

  const brandStyle = brandCssVars(profile.brand_primary, profile.brand_secondary) as CSSProperties;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-5 pb-28 pt-6 lg:max-w-6xl lg:flex-row lg:gap-10 lg:px-8 lg:pb-8 lg:pt-8" style={brandStyle}>
      <Sidebar items={NAV_ITEMS} logoUrl={profile.logo_url} name={profile.full_name} subtitle="Panel del entrenador" />
      <main className="min-w-0 flex-1 lg:py-2">
        <div className="flex items-start justify-between">
          <TopBar logoUrl={profile.logo_url} name={profile.full_name} subtitle="Panel del entrenador" />
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
