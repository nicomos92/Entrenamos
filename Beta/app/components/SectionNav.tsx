"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon | string;
}

const ROOT_PATHS = ["/trainer", "/student", "/admin"];

function resolveIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] || Icons.Circle;
}

function NavIndicator({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-secondary lg:inset-x-0 lg:bottom-auto lg:left-0 lg:top-2 lg:h-8 lg:w-0.5" />
  );
}

export function SectionNav({ items, variant = "bottom" }: { items: NavItem[]; variant?: "bottom" | "sidebar" }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return ROOT_PATHS.includes(href) ? pathname === href : pathname.startsWith(href);
  }

  if (variant === "sidebar") {
    return (
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = typeof item.icon === "string" ? resolveIcon(item.icon) : item.icon;
          const active = isActive(item.href);
          return (
            <Link
              className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                active
                  ? "bg-soft text-primary"
                  : "text-text-muted hover:bg-white/30 hover:text-text-primary"
              }`}
              href={item.href}
              key={item.href}
            >
              <NavIndicator active={active} />
              <Icon
                className="transition-transform duration-200 group-hover:scale-110"
                size={18}
                strokeWidth={active ? 2.5 : 2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] border-t border-white/50 bg-white/80 px-3 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur-xl transition-all lg:hidden">
      <div className="relative grid gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = typeof item.icon === "string" ? resolveIcon(item.icon) : item.icon;
          const active = isActive(item.href);
          return (
            <Link
              className={`group relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-center text-[11px] font-bold transition-all duration-200 ${
                active ? "text-primary" : "text-text-muted"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon
                className="transition-all duration-200 group-hover:scale-110"
                size={active ? 21 : 19}
                strokeWidth={active ? 2.5 : 2}
              />
              {item.label}
              <NavIndicator active={active} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
