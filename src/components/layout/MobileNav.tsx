"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavItems } from "./nav-config";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center px-2 py-2.5 border-t z-50"
      style={{
        backgroundColor: "color-mix(in oklab, var(--surface) 92%, transparent)",
        borderColor: "var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {mobileNavItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-2 py-1"
            style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
            <span className="text-[10px]" style={{ fontWeight: isActive ? 500 : 400 }}>
              {item.short}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
