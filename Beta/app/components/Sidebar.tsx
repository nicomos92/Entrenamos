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
        <div className="flex items-center gap-3 px-3">
          <div className="grid size-10 place-items-center rounded-xl bg-soft text-sm font-black text-primary shadow-soft">
            EN
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-primary">EntrenaMOS</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-text-muted">{subtitle}</p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-4">
          <SectionNav items={items} variant="sidebar" />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white/40 p-3 shadow-soft ring-1 ring-white/30">
        <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/60 text-xs font-black text-primary ring-1 ring-white/40">
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
            className="grid size-9 shrink-0 place-items-center rounded-full border border-white/50 bg-white/50 text-text-muted transition-all duration-200 hover:bg-status-urgent/10 hover:text-status-urgent"
            type="submit"
          >
            <LogOut size={16} strokeWidth={2.25} />
          </button>
        </form>
      </div>
    </aside>
  );
}
