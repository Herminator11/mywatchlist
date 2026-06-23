"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Movie } from "@prisma/client";
import { posterUrl, releaseYear } from "@/lib/tmdb";

interface MediaCardProps {
  movie: Movie;
  onDelete?: (movie: Movie) => Promise<void> | void;
}

// Universelle Karte für einen Film-/Serien-Eintrag.
export function MediaCard({ movie, onDelete }: MediaCardProps) {
  const [deleting, setDeleting] = useState(false);
  const poster = posterUrl(movie.posterPath);
  const year = releaseYear(movie.releaseDate);
  const isTv = movie.mediaType === "tv";

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
    <div
      className="flex gap-3 rounded-xl p-3"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div
        className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md"
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
            className="flex h-full w-full items-center justify-center text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Kein Bild
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <h3
            className="flex-1 truncate text-sm font-semibold"
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
              className="shrink-0 rounded-md p-1 transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{ color: "var(--destructive)" }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div
          className="mt-1 flex items-center gap-2 text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          <span
            className="rounded px-1.5 py-0.5 font-medium"
            style={{
              backgroundColor: "var(--surface-elevated)",
              color: "var(--text-secondary)",
            }}
          >
            {isTv ? "Serie" : "Film"}
          </span>
          {year && <span>{year}</span>}
          {isTv && movie.seasonNumber && <span>· {movie.seasonNumber}</span>}
        </div>
      </div>
    </div>
  );
}
