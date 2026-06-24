"use client";

import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import type { Movie } from "@prisma/client";
import type { AddMovieInput, WatchListType, MediaType } from "@/schemas/movie";

// SWR-Key = die fertige Request-URL. Gleicher (listType, mediaType) → gleicher Key,
// also ein gemeinsamer Cache-Eintrag über alle Mounts hinweg.
function moviesKey(listType: WatchListType, mediaType?: MediaType): string {
  const params = new URLSearchParams({ listType });
  if (mediaType) params.set("mediaType", mediaType);
  return `/api/movies?${params.toString()}`;
}

const fetcher = async (url: string): Promise<Movie[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Liste konnte nicht geladen werden");
  return res.json();
};

// Lädt die Einträge einer Liste (cached via SWR) und bietet Mutationen.
// Cache wird zwischen Navigationen geteilt; Mutationen invalidieren alle Listen,
// da Move/Edit Quell- UND Ziel-Liste betreffen können.
export function useMovies(listType: WatchListType, mediaType?: MediaType) {
  const { mutate } = useSWRConfig();
  const key = moviesKey(listType, mediaType);
  // revalidateIfStale:false → beim Re-Mount (Tab-Wechsel) wird der Cache
  // genutzt statt neu Neon zu treffen. Frische kommt über explizite
  // Invalidierung nach Mutationen + Revalidierung bei Fenster-Fokus.
  const { data, error, isLoading } = useSWR<Movie[]>(key, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  // Alle Filmlisten neu validieren (Filter-Form von mutate – trifft auch
  // gerade nicht gemountete Listen, deren Cache sonst veraltet bliebe).
  const invalidate = useCallback(
    () => mutate((k) => typeof k === "string" && k.startsWith("/api/movies?")),
    [mutate]
  );

  const addMovie = useCallback(
    async (input: AddMovieInput) => {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Hinzufügen fehlgeschlagen");
      }
      await invalidate();
    },
    [invalidate]
  );

  const deleteMovie = useCallback(
    async (movie: Movie) => {
      const params = new URLSearchParams({
        listType: movie.listType,
        mediaType: movie.mediaType,
      });
      if (movie.mediaType === "tv") {
        params.set("seasonNumber", movie.seasonNumber);
      }
      const res = await fetch(
        `/api/movies/${movie.tmdbId}?${params.toString()}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Löschen fehlgeschlagen");
      await invalidate();
    },
    [invalidate]
  );

  const moveMovie = useCallback(
    async (movie: Movie, action: "to_watching" | "to_watched") => {
      const res = await fetch(`/api/movies/${movie.tmdbId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          fromListType: movie.listType,
          seasonNumber: movie.seasonNumber,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Verschieben fehlgeschlagen");
      }
      await invalidate();
    },
    [invalidate]
  );

  return {
    movies: data ?? [],
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    // Nach Edit aufgerufen (onSaved): Edit kann die Liste wechseln → breit invalidieren.
    refetch: invalidate,
    addMovie,
    deleteMovie,
    moveMovie,
  };
}
