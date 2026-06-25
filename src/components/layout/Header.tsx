"use client";

import { ProfileMenu } from "./ProfileMenu";

// Schlanke Kopfzeile über dem Seiteninhalt – Profil-Icon rechts.
// Markenname links nur auf Mobile (Desktop hat ihn in der Sidebar).
export function Header() {
  return (
    <div className="mb-4 flex items-center justify-between md:mb-2">
      <span
        className="md:hidden"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "1.15rem",
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
        }}
      >
        MyWatchlist
      </span>
      <div className="ml-auto">
        <ProfileMenu />
      </div>
    </div>
  );
}
