"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Lock, LogIn } from "lucide-react";

// In-App-routen, die Gäste ohne Login nutzen dürfen.
const PUBLIC_PREFIXES = ["/trends", "/search"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

// Zeigt auf geschützten Seiten ein Login-Gate, solange kein User angemeldet ist.
export function AppGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  if (isPublic(pathname) || status === "authenticated") {
    return <>{children}</>;
  }

  // SessionProvider bekommt die Server-Session → Status ist sofort aufgelöst;
  // im seltenen Loading-Fall nichts rendern (kein Flackern des Gates).
  if (status === "loading") return null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="rise flex max-w-sm flex-col items-center gap-4 rounded-2xl p-8 text-center"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: "color-mix(in oklab, var(--accent) 16%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Lock size={20} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.4rem",
              color: "var(--text-primary)",
            }}
          >
            Anmeldung erforderlich
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Melde dich an, um deine Listen zu sehen und Titel hinzuzufügen. Trends
            und Suche kannst du auch ohne Account nutzen.
          </p>
        </div>
        <Link
          href="/login"
          className="btn-accent inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium"
        >
          <LogIn size={16} />
          Anmelden
        </Link>
        <Link
          href="/signup"
          className="text-sm font-medium"
          style={{ color: "var(--accent)" }}
        >
          Noch keinen Account? Registrieren
        </Link>
      </div>
    </div>
  );
}
