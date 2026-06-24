"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Movie } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Segmented } from "@/components/common/Segmented";
import { FavoritesList } from "@/components/cards/FavoritesList";
import { Skeleton } from "@/components/ui/skeleton";
import { useMovies } from "@/hooks/useMovies";

type Tab = "series" | "movies";

export default function FavoritesPage() {
  const [tab, setTab] = useState<Tab>("series");
  const series = useMovies("FAVORITE_SERIES");
  const movies = useMovies("FAVORITE_MOVIES");
  const active = tab === "series" ? series : movies;

  async function handleDelete(movie: Movie) {
    try {
      await active.deleteMovie(movie);
      toast.success("Aus Favoriten entfernt");
    } catch {
      toast.error("Löschen fehlgeschlagen");
    }
  }

  async function persistOrder(ordered: Movie[]) {
    try {
      const res = await fetch("/api/favorites/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: ordered.map((m, i) => ({
            tmdbId: m.tmdbId,
            listType: m.listType,
            seasonNumber: m.seasonNumber,
            sortOrder: i,
          })),
        }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Reihenfolge konnte nicht gespeichert werden");
    }
  }

  const count = active.movies.length;
  const subtitle = active.loading
    ? "Wird geladen…"
    : count === 0
    ? "Noch keine Favoriten"
    : `${count} ${tab === "series" ? "Lieblingsserien" : "Lieblingsfilme"}`;

  // key nur über die IDs: Reorder (gleiche IDs) remountet nicht, Add/Delete schon.
  const listKey = active.movies.map((m) => m.tmdbId).join(",");

  return (
    <div>
      <PageHeader title="Favoriten" subtitle={subtitle} />

      <div className="mb-7">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "series", label: "Serien" },
            { value: "movies", label: "Filme" },
          ]}
        />
      </div>

      {active.loading && (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[5.9rem] w-full rounded-xl" />
          ))}
        </div>
      )}

      {!active.loading && active.error && (
        <p className="text-sm" style={{ color: "var(--destructive)" }}>
          {active.error}
        </p>
      )}

      {!active.loading && !active.error && count === 0 && (
        <div
          className="rise rounded-xl border border-dashed p-10 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p style={{ color: "var(--text-secondary)" }}>
            {tab === "series"
              ? "Noch keine Lieblingsserien."
              : "Noch keine Lieblingsfilme."}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Füge über die Suche etwas zu deinen Favoriten hinzu.
          </p>
        </div>
      )}

      {!active.loading && !active.error && count > 0 && (
        <>
          <p className="mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
            Zum Sortieren am Griff ziehen.
          </p>
          <FavoritesList
            key={listKey}
            initial={active.movies}
            onDelete={handleDelete}
            onPersist={persistOrder}
          />
        </>
      )}
    </div>
  );
}
