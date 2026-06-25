"use client";

import { useState } from "react";
import { Check, Play } from "lucide-react";
import { toast } from "sonner";
import type { Movie } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Segmented } from "@/components/common/Segmented";
import { MovieListView } from "@/components/cards/MovieListView";
import { CardActionButton } from "@/components/cards/CardActionButton";
import { AddSheet } from "@/components/sheets/AddSheet";
import { EditSheet } from "@/components/sheets/EditSheet";
import {
  TitleDetailDialog,
  movieToTarget,
  type DetailTarget,
} from "@/components/cards/TitleDetailDialog";
import { useMovies } from "@/hooks/useMovies";

type Tab = "tv" | "movies";

export default function WantToWatchPage() {
  const [tab, setTab] = useState<Tab>("tv");
  const [editing, setEditing] = useState<Movie | null>(null);
  const [detail, setDetail] = useState<DetailTarget | null>(null);
  // Eine WANT_TO_WATCH-Liste, nach Medientyp gefiltert (wie Recently Watched).
  const tv = useMovies("WANT_TO_WATCH", "tv");
  const mv = useMovies("WANT_TO_WATCH", "movie");
  const active = tab === "tv" ? tv : mv;

  async function handleDelete(movie: Movie) {
    try {
      await active.deleteMovie(movie);
      toast.success("Eintrag entfernt");
    } catch {
      toast.error("Löschen fehlgeschlagen");
    }
  }

  async function handleMove(movie: Movie, action: "to_watching" | "to_watched") {
    try {
      await active.moveMovie(movie, action);
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

  const count = active.movies.length;
  const noun = tab === "tv" ? (count === 1 ? "Serie" : "Serien") : count === 1 ? "Film" : "Filme";
  const subtitle = active.loading
    ? "Wird geladen…"
    : count === 0
    ? "Deine Merkliste ist noch leer"
    : `${count} ${noun} auf der Liste`;

  return (
    <div>
      <PageHeader
        title="Want to Watch"
        subtitle={subtitle}
        action={<AddSheet listType="WANT_TO_WATCH" onAdd={active.addMovie} />}
      />

      <div className="mb-7">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "tv", label: "Serien" },
            { value: "movies", label: "Filme" },
          ]}
        />
      </div>

      <MovieListView
        movies={active.movies}
        loading={active.loading}
        error={active.error}
        emptyTitle={
          tab === "tv" ? "Noch keine Serien gemerkt." : "Noch keine Filme gemerkt."
        }
        emptyHint="Füge oben über „Hinzufügen“ einen Film oder eine Serie hinzu."
        onDelete={handleDelete}
        onEdit={setEditing}
        onSelect={(movie) => setDetail(movieToTarget(movie))}
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
        onSaved={active.refetch}
      />

      <TitleDetailDialog target={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
