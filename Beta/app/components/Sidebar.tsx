import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";
import { SectionNav, type NavItem } from "@/app/components/SectionNav";

interface SidebarProps {
  name: string;
  subtitle: string;
  logoUrl?: string | null;
  items: NavItem[];
}

export function Sidebar({ name, subtitle, logoUrl, items }: SidebarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between py-8 lg:flex">
      <div>
        <p className="text-2xl font-black tracking-tight text-primary">EntrenaMOS</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] text-text-muted">{subtitle}</p>
        <div className="mt-8">
          <SectionNav items={items} variant="sidebar" />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white/40 p-3 shadow-soft">
        <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/60 text-xs font-black text-primary">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="size-full object-cover" src={logoUrl} />
          ) : (
            initials || "EN"
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-primary">{name}</p>
        </div>
        <form action={logout}>
          <button
            aria-label="Cerrar sesión"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-white/50 bg-white/50 text-text-muted transition hover:text-status-urgent"
            type="submit"
          >
            <LogOut size={16} strokeWidth={2.25} />
          </button>
        </form>
      </div>
    </aside>
  );
}
