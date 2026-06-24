"use client";

import { useEffect, useState } from "react";
import { Minus, Pencil, Plus, Hash } from "lucide-react";

interface SeasonPickerProps {
  // TMDb-Serien-ID; wird genutzt, um den Zähler auf die reale Staffelzahl zu klemmen.
  tmdbId: number;
  // Aktueller seasonNumber-String (frei), z. B. "Staffel 2" oder "Staffel 1 & Staffel 2".
  value: string;
  onChange: (value: string) => void;
}

// Ein "Staffel N"-Wert aus dem Zähler-Modus, sonst null (= Freitext).
const COUNTER_RE = /^Staffel (\d+)$/;

function initialState(value: string): {
  mode: "counter" | "freetext";
  count: number;
  text: string;
} {
  const m = value.match(COUNTER_RE);
  if (m) return { mode: "counter", count: Number(m[1]), text: value };
  if (!value.trim()) return { mode: "counter", count: 1, text: "" };
  return { mode: "freetext", count: 1, text: value };
}

// Gemeinsame Staffel-Auswahl für Add-/Edit-Sheets.
// Zähler-Modus klemmt auf die reale Staffelzahl (TMDb); Freitext-Modus ignoriert den Zähler.
export function SeasonPicker({ tmdbId, value, onChange }: SeasonPickerProps) {
  const [mode, setMode] = useState<"counter" | "freetext">(
    () => initialState(value).mode
  );
  const [count, setCount] = useState(() => initialState(value).count);
  const [text, setText] = useState(() => initialState(value).text);
  const [maxSeasons, setMaxSeasons] = useState<number | null>(null);

  // Reale Staffelzahl laden und Zähler ggf. herunterklemmen.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tmdb/tv/${tmdbId}`)
      .then((res) => (res.ok ? res.json() : { numberOfSeasons: null }))
      .then((json) => {
        if (cancelled) return;
        const max =
          typeof json.numberOfSeasons === "number" && json.numberOfSeasons > 0
            ? json.numberOfSeasons
            : null;
        setMaxSeasons(max);
        if (max && count > max) {
          setCount(max);
          onChange(`Staffel ${max}`);
        }
      })
      .catch(() => {
        if (!cancelled) setMaxSeasons(null);
      });
    return () => {
      cancelled = true;
    };
    // Nur an die Serie gebunden – count/onChange bewusst nicht in den Deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId]);

  function applyCount(next: number) {
    const upper = maxSeasons ?? Number.MAX_SAFE_INTEGER;
    const clamped = Math.min(Math.max(1, next), upper);
    setCount(clamped);
    onChange(`Staffel ${clamped}`);
  }

  function toCounter() {
    setMode("counter");
    onChange(`Staffel ${count}`);
  }

  function toFreetext() {
    setMode("freetext");
    onChange(text);
  }

  function applyText(next: string) {
    setText(next);
    onChange(next);
  }

  const atMax = maxSeasons !== null && count >= maxSeasons;

  const fieldStyle = {
    backgroundColor: "var(--surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Staffel
        </label>
        <button
          type="button"
          onClick={mode === "counter" ? toFreetext : toCounter}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors"
          style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
        >
          {mode === "counter" ? (
            <>
              <Pencil size={12} />
              Freitext
            </>
          ) : (
            <>
              <Hash size={12} />
              Zähler
            </>
          )}
        </button>
      </div>

      {mode === "counter" ? (
        <div className="flex flex-col gap-1">
          <div
            className="inline-flex w-fit items-center overflow-hidden rounded-lg"
            style={{ border: "1px solid var(--border)" }}
          >
            <button
              type="button"
              onClick={() => applyCount(count - 1)}
              disabled={count <= 1}
              aria-label="Staffel verringern"
              className="flex h-9 w-9 items-center justify-center transition-colors disabled:opacity-30"
              style={{ color: "var(--text-secondary)" }}
            >
              <Minus size={16} />
            </button>
            <span
              className="flex h-9 w-12 items-center justify-center text-sm font-semibold tabular-nums"
              style={{
                color: "var(--text-primary)",
                backgroundColor: "var(--surface-elevated)",
              }}
            >
              {count}
            </span>
            <button
              type="button"
              onClick={() => applyCount(count + 1)}
              disabled={atMax}
              aria-label="Staffel erhöhen"
              className="flex h-9 w-9 items-center justify-center transition-colors disabled:opacity-30"
              style={{ color: "var(--text-secondary)" }}
            >
              <Plus size={16} />
            </button>
          </div>
          {maxSeasons !== null && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              von {maxSeasons} {maxSeasons === 1 ? "Staffel" : "Staffeln"}
            </span>
          )}
        </div>
      ) : (
        <input
          type="text"
          value={text}
          onChange={(e) => applyText(e.target.value)}
          placeholder="z. B. Staffel 1 & Staffel 2"
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={fieldStyle}
        />
      )}
    </div>
  );
}
