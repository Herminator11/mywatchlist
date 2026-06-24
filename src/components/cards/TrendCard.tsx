"use client";

import { Star, Plus } from "lucide-react";
import {
  posterUrl,
  releaseYear,
  tmdbReleaseDate,
  tmdbTitle,
  formatScore,
  formatVotes,
  type TmdbResult,
} from "@/lib/tmdb";

interface TrendCardProps {
  result: TmdbResult;
  onAdd: (result: TmdbResult) => void;
  onSelect?: (result: TmdbResult) => void;
}

// Poster-Karte für die Trends-Page – inkl. TMDb-Community-Score (nur hier).
export function TrendCard({ result, onAdd, onSelect }: TrendCardProps) {
  const poster = posterUrl(result.poster_path);
  const year = releaseYear(tmdbReleaseDate(result));
  const isTv = result.media_type === "tv";
  const tint = isTv ? "var(--accent-tv)" : "var(--accent-movie)";
  const score = formatScore(result.vote_average);
  const votes = formatVotes(result.vote_count);

  return (
    <div className="media-card flex flex-col overflow-hidden rounded-xl">
      <div
        role={onSelect ? "button" : undefined}
        onClick={onSelect ? () => onSelect(result) : undefined}
        className={`relative aspect-[2/3] w-full${onSelect ? " cursor-pointer" : ""}`}
        style={{ backgroundColor: "var(--surface-elevated)" }}
      >
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={tmdbTitle(result)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Kein Bild
          </div>
        )}

        {score && (
          <div
            className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{
              backgroundColor: "color-mix(in oklab, var(--background) 78%, transparent)",
              color: "var(--accent)",
              backdropFilter: "blur(4px)",
            }}
            title={votes ? `${votes} Stimmen` : undefined}
          >
            <Star size={12} fill="var(--accent)" />
            {score}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(result);
          }}
          aria-label="Zur Liste hinzufügen"
          className="btn-accent absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full"
        >
          <Plus size={17} />
        </button>
      </div>

      <div className="flex flex-col gap-1 p-2.5">
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(result)}
            className="cursor-pointer truncate text-left text-sm font-medium transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--text-primary)" }}
          >
            {tmdbTitle(result)}
          </button>
        ) : (
          <span
            className="truncate text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {tmdbTitle(result)}
          </span>
        )}
        <div className="flex items-center gap-2 text-xs">
          <span
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium"
            style={{
              color: tint,
              backgroundColor: "color-mix(in oklab, " + tint + " 14%, transparent)",
            }}
          >
            {isTv ? "Serie" : "Film"}
          </span>
          {year && <span style={{ color: "var(--text-muted)" }}>{year}</span>}
          {votes && (
            <span style={{ color: "var(--text-muted)" }}>· {votes}</span>
          )}
        </div>
      </div>
    </div>
  );
}
