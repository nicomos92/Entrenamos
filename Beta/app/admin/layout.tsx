import { requireProfile } from "@/lib/auth";
import { TopBar } from "@/app/components/TopBar";
import { Sidebar } from "@/app/components/Sidebar";
import type { NavItem } from "@/app/components/SectionNav";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Entrenadores", icon: "Users" },
  { href: "/ayuda", label: "Ayuda", icon: "CircleHelp" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile("admin");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-5 pb-16 pt-6 lg:max-w-6xl lg:flex-row lg:gap-10 lg:px-8 lg:pb-8 lg:pt-8">
      <Sidebar items={NAV_ITEMS} name={profile.full_name} subtitle="Panel de administración" />
      <main className="min-w-0 flex-1 lg:py-2">
        <TopBar name={profile.full_name} subtitle="Panel de administración" />
        <div className="animate-in">{children}</div>
      </main>
    </div>
  );
}
