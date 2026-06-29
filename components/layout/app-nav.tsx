"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ListMusic } from "lucide-react";

const navItems = [
  { href: "/", label: "Board", icon: LayoutGrid },
  { href: "/playlist", label: "Playlist", icon: ListMusic },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Main navigation"
    >
      <ul className="mx-auto flex max-w-6xl px-2 pt-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-surface-elevated hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-6 w-6" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
