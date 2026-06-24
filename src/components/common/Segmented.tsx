"use client";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
}

// Schlichte Segment-Umschaltung (z. B. Serien / Filme) im Kino-Editorial-Look.
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: SegmentedProps<T>) {
  return (
    <div
      className="inline-flex gap-1 rounded-lg p-1"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
            style={
              active
                ? { backgroundColor: "var(--accent)", color: "var(--accent-ink)" }
                : { color: "var(--text-secondary)", backgroundColor: "transparent" }
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
