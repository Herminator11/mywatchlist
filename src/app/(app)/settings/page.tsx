"use client";

import { Download, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { PageHeader } from "@/components/layout/PageHeader";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-3 text-xs font-medium uppercase tracking-wide"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </h2>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const username = session?.user?.username ?? "—";

  return (
    <div>
      <PageHeader title="Einstellungen" subtitle="Account & Daten" />

      <section className="rise mb-8">
        <SectionTitle>Account</SectionTitle>
        <div
          className="flex items-center justify-between gap-4 rounded-xl p-4"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
              style={{
                backgroundColor: "color-mix(in oklab, var(--accent) 18%, transparent)",
                color: "var(--accent)",
              }}
            >
              {username.charAt(0).toUpperCase()}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {username}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Angemeldet
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/trends" })}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            style={{ color: "var(--destructive)", border: "1px solid var(--border)" }}
          >
            <LogOut size={16} />
            Abmelden
          </button>
        </div>
      </section>

      <section className="rise" style={{ animationDelay: "60ms" }}>
        <SectionTitle>Daten</SectionTitle>
        <div
          className="flex items-center justify-between gap-4 rounded-xl p-4"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Verlauf exportieren
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Alle gesehenen Titel als .txt-Datei
            </span>
          </div>
          <a
            href="/api/export"
            className="btn-accent inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium"
          >
            <Download size={16} />
            Export
          </a>
        </div>
      </section>
    </div>
  );
}
