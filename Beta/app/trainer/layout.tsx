import { LayoutDashboard, Users, Dumbbell, ClipboardList, CalendarDays, Settings2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { TopBar } from "@/app/components/TopBar";
import { SectionNav, type NavItem } from "@/app/components/SectionNav";
import { Sidebar } from "@/app/components/Sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/trainer", label: "Panel", icon: LayoutDashboard },
  { href: "/trainer/students", label: "Alumnos", icon: Users },
  { href: "/trainer/exercises", label: "Ejercicios", icon: Dumbbell },
  { href: "/trainer/routines", label: "Rutinas", icon: ClipboardList },
  { href: "/trainer/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/trainer/settings", label: "Config", icon: Settings2 },
];

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile("trainer");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-5 pb-28 pt-6 lg:max-w-6xl lg:flex-row lg:gap-10 lg:px-8 lg:pb-8 lg:pt-8">
      <Sidebar items={NAV_ITEMS} logoUrl={profile.logo_url} name={profile.full_name} subtitle="Panel del entrenador" />
      <main className="min-w-0 flex-1 lg:py-2">
        <TopBar logoUrl={profile.logo_url} name={profile.full_name} subtitle="Panel del entrenador" />
        {children}
      </main>
      <SectionNav items={NAV_ITEMS} />
    </div>
  );
}
