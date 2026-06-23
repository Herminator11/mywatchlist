"use client";

import { toast } from "sonner";
import type { Movie } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { MediaCard } from "@/components/cards/MediaCard";
import { AddSheet } from "@/components/sheets/AddSheet";
import { useMovies } from "@/hooks/useMovies";
import { Skeleton } from "@/components/ui/skeleton";

export default function WantToWatchPage() {
  const { movies, loading, error, addMovie, deleteMovie } =
    useMovies("WANT_TO_WATCH");

  async function handleDelete(movie: Movie) {
    try {
      await deleteMovie(movie);
      toast.success("Eintrag entfernt");
    } catch {
      toast.error("Löschen fehlgeschlagen");
    }
  }

  const count = movies.length;
  const subtitle = loading
    ? "Wird geladen…"
    : count === 0
    ? "Deine Merkliste ist noch leer"
    : `${count} ${count === 1 ? "Titel" : "Titel"} auf der Liste`;

  return (
    <div>
      <PageHeader
        title="Want to Watch"
        subtitle={subtitle}
        action={<AddSheet listType="WANT_TO_WATCH" onAdd={addMovie} />}
      />

      {loading && (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[5.9rem] w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-sm" style={{ color: "var(--destructive)" }}>
          {error}
        </p>
      )}

      {!loading && !error && count === 0 && (
        <div
          className="rise rounded-xl border border-dashed p-10 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p style={{ color: "var(--text-secondary)" }}>
            Noch nichts auf der Liste.
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Füge oben über „Hinzufügen“ einen Film oder eine Serie hinzu.
          </p>
        </div>
      )}

      {!loading && !error && count > 0 && (
        <div className="flex flex-col gap-2.5">
          {movies.map((movie, i) => (
            <div
              key={`${movie.tmdbId}_${movie.listType}_${movie.seasonNumber}`}
              className="rise"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <MediaCard movie={movie} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
