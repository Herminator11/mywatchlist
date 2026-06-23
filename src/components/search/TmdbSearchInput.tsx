"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  posterUrl,
  releaseYear,
  tmdbReleaseDate,
  tmdbTitle,
  type TmdbResult,
} from "@/lib/tmdb";

interface TmdbSearchInputProps {
  onSelect: (result: TmdbResult) => void;
}

// Debounced TMDb-Suche: tippt der User, wird serverseitig /api/tmdb/search abgefragt.
export function TmdbSearchInput({ onSelect }: TmdbSearchInputProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  // Ergebnisse werden zusammen mit der Query gespeichert, zu der sie gehören.
  // So lassen sich "loading" und die anzuzeigenden Treffer ableiten, ohne
  // synchrones setState im Effect (vermeidet kaskadierende Renders).
  const [data, setData] = useState<{ q: string; results: TmdbResult[] }>({
    q: "",
    results: [],
  });

  const q = debouncedQuery.trim();
  const isActive = q.length >= 2;
  const loading = isActive && data.q !== q;
  const results = isActive && data.q === q ? data.results : [];

  useEffect(() => {
    if (q.length < 2) return;
    let cancelled = false;
    fetch(`/api/tmdb/search?query=${encodeURIComponent(q)}`)
      .then((res) => (res.ok ? res.json() : { results: [] }))
      .then((json) => {
        if (!cancelled) setData({ q, results: json.results ?? [] });
      })
      .catch(() => {
        if (!cancelled) setData({ q, results: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        placeholder="Film oder Serie suchen..."
        className="rounded-lg px-3 py-2 text-sm outline-none"
        style={{
          backgroundColor: "var(--surface-elevated)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
      />

      {loading && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Suche läuft...
        </p>
      )}

      {!loading && debouncedQuery.trim().length >= 2 && results.length === 0 && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Keine Treffer.
        </p>
      )}

      <ul className="flex flex-col gap-1 overflow-y-auto">
        {results.map((r) => {
          const poster = posterUrl(r.poster_path);
          const year = releaseYear(tmdbReleaseDate(r));
          return (
            <li key={`${r.media_type}_${r.id}`}>
              <button
                type="button"
                onClick={() => onSelect(r)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--surface)" }}
              >
                <div
                  className="h-16 w-11 shrink-0 overflow-hidden rounded"
                  style={{ backgroundColor: "var(--surface-elevated)" }}
                >
                  {poster && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={poster}
                      alt={tmdbTitle(r)}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className="truncate text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {tmdbTitle(r)}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {r.media_type === "tv" ? "Serie" : "Film"}
                    {year ? ` · ${year}` : ""}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
