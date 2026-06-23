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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <PageHeader title="Want to Watch" />
        <AddSheet listType="WANT_TO_WATCH" onAdd={addMovie} />
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[6.5rem] w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-sm" style={{ color: "var(--destructive)" }}>
          {error}
        </p>
      )}

      {!loading && !error && movies.length === 0 && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Noch nichts auf der Liste. Füge oben einen Film oder eine Serie hinzu.
        </p>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="flex flex-col gap-2">
          {movies.map((movie) => (
            <MediaCard
              key={`${movie.tmdbId}_${movie.listType}_${movie.seasonNumber}`}
              movie={movie}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
