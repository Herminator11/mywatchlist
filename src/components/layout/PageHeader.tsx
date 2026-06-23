import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

// Editorial-Kopf: große Display-Serife mit Oxblood-Markierung, optional
// Subzeile und eine Aktion (z. B. Hinzufügen-Button) rechts.
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="rise mb-8 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span
            className="block h-8 w-1 rounded-full"
            style={{ backgroundColor: "var(--oxblood)" }}
          />
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(1.9rem, 4vw, 2.4rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h1>
        </div>
        {subtitle && (
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)", paddingLeft: "1rem" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </header>
  );
}
