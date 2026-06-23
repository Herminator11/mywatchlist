"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface CardActionButtonProps {
  onClick: () => Promise<void> | void;
  children: ReactNode;
  icon?: ReactNode;
  accent?: boolean;
}

// Kleiner Aktionsbutton in einer Karte (z. B. „Gesehen", „Anschauen").
export function CardActionButton({
  onClick,
  children,
  icon,
  accent,
}: CardActionButtonProps) {
  const [busy, setBusy] = useState(false);

  async function handle() {
    setBusy(true);
    try {
      await onClick();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40"
      style={
        accent
          ? {
              color: "var(--accent)",
              backgroundColor: "color-mix(in oklab, var(--accent) 12%, transparent)",
            }
          : { color: "var(--text-secondary)", border: "1px solid var(--border)" }
      }
    >
      {icon}
      {children}
    </button>
  );
}
