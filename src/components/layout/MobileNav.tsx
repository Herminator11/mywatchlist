"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/watchlist/want-to-watch", label: "Watch", icon: "🎬" },
  { href: "/watchlist/currently-watching", label: "Watching", icon: "▶️" },
  { href: "/watchlist/recently-watched", label: "Watched", icon: "✅" },
  { href: "/watchlist/favorites", label: "Favoriten", icon: "⭐" },
  { href: "/search", label: "Suche", icon: "🔍" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center px-2 py-3 border-t z-50"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-2"
          >
            <span className="text-xl">{item.icon}</span>
            <span
              className="text-[10px] font-medium"
              style={{
                color: isActive ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}