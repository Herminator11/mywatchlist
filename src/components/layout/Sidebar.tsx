"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-config";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col w-60 sticky top-0 h-screen self-start overflow-y-auto px-4 py-7 border-r"
      style={{
        backgroundColor: "color-mix(in oklab, var(--surface) 70%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      {/* Brand */}
      <div className="px-2 mb-10 flex items-center gap-2.5">
        <span
          className="block h-7 w-1 rounded-full"
          style={{ backgroundColor: "var(--oxblood)" }}
        />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "1.35rem",
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          MyWatchlist
        </span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: isActive
                  ? "color-mix(in oklab, var(--accent) 16%, transparent)"
                  : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
