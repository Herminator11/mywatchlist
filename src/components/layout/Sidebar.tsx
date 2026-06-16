"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/watchlist/want-to-watch", label: "Want to Watch", icon: "🎬" },
  { href: "/watchlist/currently-watching", label: "Currently Watching", icon: "▶️" },
  { href: "/watchlist/recently-watched", label: "Recently Watched", icon: "✅" },
  { href: "/watchlist/favorites", label: "Favoriten", icon: "⭐" },
  { href: "/search", label: "Suche", icon: "🔍" },
  { href: "/settings", label: "Einstellungen", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col w-56 min-h-screen px-3 py-6 border-r"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div className="px-3 mb-8">
        <span
          className="text-lg font-bold tracking-tight"
          style={{ color: "var(--accent)" }}
        >
          MyWatchlist
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? "var(--accent)" : "transparent",
                color: isActive ? "#000" : "var(--text-secondary)",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}