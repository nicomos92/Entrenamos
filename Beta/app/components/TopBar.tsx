import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";

interface TopBarProps {
  name: string;
  subtitle: string;
  logoUrl?: string | null;
}

export function TopBar({ name, subtitle, logoUrl }: TopBarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="mb-5 flex items-center justify-between lg:hidden">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center overflow-hidden rounded-xl bg-soft text-sm font-black text-primary shadow-soft">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="size-full object-cover" src={logoUrl} />
          ) : (
            initials || "EN"
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">{name}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-text-muted">{subtitle}</p>
        </div>
      </div>
      <form action={logout}>
        <button
          aria-label="Cerrar sesión"
          className="grid size-11 place-items-center rounded-xl border border-white/50 bg-white/50 text-text-muted transition-all duration-200 hover:bg-status-urgent/10 hover:text-status-urgent"
          type="submit"
        >
          <LogOut size={18} strokeWidth={2.25} />
        </button>
      </form>
    </header>
  );
}
