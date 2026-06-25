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

// Invalidiert ALLE Film-Caches: jede Listen-URL (/api/movies?…) und die
// by-tmdb-Aggregation (fürs Detail-Pop-up). Wird nach jeder Mutation aufgerufen –
// auch außerhalb von useMovies (z. B. AddToListSheet aus Suche/Trends), sonst
// bleibt die Zielliste stale (revalidateIfStale ist aus).
export function useInvalidateMovies() {
  const { mutate } = useSWRConfig();
  return useCallback(
    () =>
      // Cache leeren UND neu validieren: gemountete Listen laden sofort neu,
      // nicht gemountete (Next App-Router cached das Segment) holen beim
      // nächsten Lesen frisch – sonst bliebe ein woanders hinzugefügter Titel
      // bis zum harten Reload unsichtbar.
      mutate(
        (k) =>
          typeof k === "string" &&
          (k.startsWith("/api/movies?") || k.startsWith("/api/movies/by-tmdb/")),
        undefined,
        { revalidate: true }
      ),
    [mutate]
  );
}

// Lädt die Einträge einer Liste (cached via SWR) und bietet Mutationen.
// Cache wird zwischen Navigationen geteilt; Mutationen invalidieren alle Listen,
// da Move/Edit Quell- UND Ziel-Liste betreffen können.
export function useMovies(listType: WatchListType, mediaType?: MediaType) {
  const key = moviesKey(listType, mediaType);
  // Stale-while-revalidate (SWR-Defaults): beim Mount wird der gecachte Stand
  // sofort gezeigt UND im Hintergrund neu validiert. So erscheint ein Titel,
  // der woanders hinzugefügt/verschoben wurde (z. B. aus der Suche), beim
  // Wechsel auf die Liste ohne harten Reload. Der geteilte Cache sorgt weiter
  // für sofortiges Rendern + Request-Dedup.
  const { data, error, isLoading } = useSWR<Movie[]>(key, fetcher);

  const invalidate = useInvalidateMovies();

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
