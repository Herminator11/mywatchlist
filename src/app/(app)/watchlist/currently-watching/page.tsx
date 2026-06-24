"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import type { Movie } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { MovieListView } from "@/components/cards/MovieListView";
import { CardActionButton } from "@/components/cards/CardActionButton";
import { EditSheet } from "@/components/sheets/EditSheet";
import { useMovies } from "@/hooks/useMovies";

export default function CurrentlyWatchingPage() {
  const { movies, loading, error, deleteMovie, moveMovie, refetch } = useMovies(
    "CURRENTLY_WATCHING",
    "tv"
  );
  const [editing, setEditing] = useState<Movie | null>(null);

  async function handleDelete(movie: Movie) {
    try {
      await deleteMovie(movie);
      toast.success("Eintrag entfernt");
    } catch {
      toast.error("Löschen fehlgeschlagen");
    }
  }

  async function handleWatched(movie: Movie) {
    try {
      await moveMovie(movie, "to_watched");
      toast.success(`„${movie.title}“ als gesehen markiert`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verschieben fehlgeschlagen");
      throw e;
    }
  }

  const count = movies.length;
  const subtitle = loading
    ? "Wird geladen…"
    : count === 0
    ? "Du schaust gerade nichts"
    : `${count} ${count === 1 ? "Serie" : "Serien"} am Laufen`;

  return (
    <div>
      <PageHeader title="Currently Watching" subtitle={subtitle} />

      <MovieListView
        movies={movies}
        loading={loading}
        error={error}
        emptyTitle="Du schaust gerade nichts."
        emptyHint="Verschiebe eine Serie aus „Want to Watch“ mit „Anschauen“ hierher."
        onDelete={handleDelete}
        onEdit={setEditing}
        renderActions={(movie) => (
          <CardActionButton
            accent
            icon={<Check size={14} />}
            onClick={() => handleWatched(movie)}
          >
            Gesehen
          </CardActionButton>
        )}
      />

      <EditSheet
        key={editing ? `${editing.tmdbId}_${editing.seasonNumber}` : "none"}
        movie={editing}
        onClose={() => setEditing(null)}
        onSaved={refetch}
      />
    </div>
  );
}
