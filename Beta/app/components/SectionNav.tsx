"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const ROOT_PATHS = ["/trainer", "/student", "/admin"];

export function SectionNav({ items, variant = "bottom" }: { items: NavItem[]; variant?: "bottom" | "sidebar" }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return ROOT_PATHS.includes(href) ? pathname === href : pathname.startsWith(href);
  }

  if (variant === "sidebar") {
    return (
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                active ? "bg-soft text-primary" : "text-text-muted hover:bg-white/40 hover:text-text-primary"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] border-t border-white/50 bg-white/70 px-3 py-2 backdrop-blur-xl lg:hidden">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center text-[11px] font-bold transition ${
                active ? "bg-soft text-primary" : "text-text-muted"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon size={19} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
