"use client";

import { useState } from "react";
import { Check, Play } from "lucide-react";
import { toast } from "sonner";
import type { Movie } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { MovieListView } from "@/components/cards/MovieListView";
import { CardActionButton } from "@/components/cards/CardActionButton";
import { AddSheet } from "@/components/sheets/AddSheet";
import { EditSheet } from "@/components/sheets/EditSheet";
import { useMovies } from "@/hooks/useMovies";

export default function WantToWatchPage() {
  const { movies, loading, error, addMovie, deleteMovie, moveMovie, refetch } =
    useMovies("WANT_TO_WATCH");
  const [editing, setEditing] = useState<Movie | null>(null);

  async function handleDelete(movie: Movie) {
    try {
      await deleteMovie(movie);
      toast.success("Eintrag entfernt");
    } catch {
      toast.error("Löschen fehlgeschlagen");
    }
  }

  async function handleMove(movie: Movie, action: "to_watching" | "to_watched") {
    try {
      await moveMovie(movie, action);
      toast.success(
        action === "to_watching"
          ? `„${movie.title}“ läuft jetzt`
          : `„${movie.title}“ als gesehen markiert`
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verschieben fehlgeschlagen");
      throw e;
    }
  }

  const count = movies.length;
  const subtitle = loading
    ? "Wird geladen…"
    : count === 0
    ? "Deine Merkliste ist noch leer"
    : `${count} Titel auf der Liste`;

  return (
    <div>
      <PageHeader
        title="Want to Watch"
        subtitle={subtitle}
        action={<AddSheet listType="WANT_TO_WATCH" onAdd={addMovie} />}
      />

      <MovieListView
        movies={movies}
        loading={loading}
        error={error}
        emptyTitle="Noch nichts auf der Liste."
        emptyHint="Füge oben über „Hinzufügen“ einen Film oder eine Serie hinzu."
        onDelete={handleDelete}
        onEdit={setEditing}
        renderActions={(movie) =>
          movie.mediaType === "tv" ? (
            <CardActionButton
              accent
              icon={<Play size={14} />}
              onClick={() => handleMove(movie, "to_watching")}
            >
              Anschauen
            </CardActionButton>
          ) : (
            <CardActionButton
              accent
              icon={<Check size={14} />}
              onClick={() => handleMove(movie, "to_watched")}
            >
              Gesehen
            </CardActionButton>
          )
        }
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
