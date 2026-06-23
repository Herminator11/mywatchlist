"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Movie } from "@prisma/client";
import { posterUrl, releaseYear } from "@/lib/tmdb";

interface MediaCardProps {
  movie: Movie;
  onDelete?: (movie: Movie) => Promise<void> | void;
}

// Universelle Karte für einen Film-/Serien-Eintrag (Kino-Editorial).
export function MediaCard({ movie, onDelete }: MediaCardProps) {
  const [deleting, setDeleting] = useState(false);
  const poster = posterUrl(movie.posterPath);
  const year = releaseYear(movie.releaseDate);
  const isTv = movie.mediaType === "tv";
  const tint = isTv ? "var(--accent-tv)" : "var(--accent-movie)";

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(movie);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="media-card flex gap-4 rounded-xl p-3">
      <div
        className="relative h-[5.5rem] w-14 shrink-0 overflow-hidden rounded-md"
        style={{ backgroundColor: "var(--surface-elevated)" }}
      >
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={movie.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            Kein Bild
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start gap-2">
          <h3
            className="flex-1 truncate text-[0.95rem] font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {movie.title}
          </h3>
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Eintrag löschen"
              className="-mr-1 shrink-0 rounded-md p-1.5 transition-colors hover:bg-[color-mix(in_oklab,var(--destructive)_18%,transparent)] disabled:opacity-40"
              style={{ color: "var(--text-muted)" }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2.5 text-xs">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium"
            style={{
              color: tint,
              backgroundColor: "color-mix(in oklab, " + tint + " 14%, transparent)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: tint }}
            />
            {isTv ? "Serie" : "Film"}
          </span>
          {year && <span style={{ color: "var(--text-muted)" }}>{year}</span>}
          {isTv && movie.seasonNumber && (
            <span style={{ color: "var(--text-muted)" }}>· {movie.seasonNumber}</span>
          )}
        </div>
      </div>
    </div>
  );
}
