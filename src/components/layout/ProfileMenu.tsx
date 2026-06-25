"use client";

import Link from "next/link";
import { Popover } from "@base-ui/react/popover";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Settings, User, LogIn, UserPlus } from "lucide-react";

// Profil-Icon im Header: eingeloggt → Name + Abmelden, Gast → Anmelden/Registrieren.
export function ProfileMenu() {
  const { data: session, status } = useSession();
  const username = session?.user?.username ?? null;
  const isAuthed = status === "authenticated" && !!username;

  const popupStyle = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "0 18px 50px -12px rgba(0,0,0,0.5)",
  };

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label="Profilmenü"
        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
        style={{
          backgroundColor: isAuthed
            ? "color-mix(in oklab, var(--accent) 18%, transparent)"
            : "var(--surface-elevated)",
          color: isAuthed ? "var(--accent)" : "var(--text-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        {isAuthed ? username!.charAt(0).toUpperCase() : <User size={17} />}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          align="end"
          side="bottom"
          sideOffset={8}
          className="isolate z-50"
        >
          <Popover.Popup
            className="flex w-56 origin-(--transform-origin) flex-col overflow-hidden rounded-xl outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
            style={popupStyle}
          >
            {isAuthed ? (
              <>
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor:
                        "color-mix(in oklab, var(--accent) 18%, transparent)",
                      color: "var(--accent)",
                    }}
                  >
                    {username!.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span
                      className="truncate text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {username}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Angemeldet
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)" }} />

                <Popover.Close
                  render={
                    <Link href="/settings" className={itemClass} style={itemStyle} />
                  }
                >
                  <Settings size={16} />
                  Einstellungen
                </Popover.Close>

                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/trends" })}
                  className={itemClass}
                  style={{ ...itemStyle, color: "var(--destructive)" }}
                >
                  <LogOut size={16} />
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-0.5 px-3.5 py-3">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Nicht angemeldet
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Melde dich an, um deine Listen zu nutzen
                  </span>
                </div>

                <div style={{ borderTop: "1px solid var(--border)" }} />

                <Popover.Close
                  render={
                    <Link href="/login" className={itemClass} style={itemStyle} />
                  }
                >
                  <LogIn size={16} />
                  Anmelden
                </Popover.Close>

                <Popover.Close
                  render={
                    <Link href="/signup" className={itemClass} style={itemStyle} />
                  }
                >
                  <UserPlus size={16} />
                  Registrieren
                </Popover.Close>
              </>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

const itemClass =
  "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]";

const itemStyle = { color: "var(--text-secondary)" } as const;
