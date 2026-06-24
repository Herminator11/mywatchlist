import type { ReactNode } from "react";

interface AuthShellProps {
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

// Gemeinsamer Rahmen für Login & Signup im Kino-Editorial-Look.
// Der atmosphärische Body-Hintergrund (Gradient + Grain) scheint durch.
export function AuthShell({ subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div
        className="rise w-full max-w-sm rounded-2xl p-8"
        style={{
          backgroundColor: "color-mix(in oklab, var(--surface) 88%, transparent)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2.5">
            <span
              className="block h-7 w-1 rounded-full"
              style={{ backgroundColor: "var(--oxblood)" }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "1.6rem",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              MyWatchlist
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        </div>

        {children}

        <div
          className="mt-6 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}
