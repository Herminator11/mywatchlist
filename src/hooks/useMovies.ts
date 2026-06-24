"use client";

import { useCallback, useEffect, useState } from "react";
import type { Movie } from "@prisma/client";
import type { AddMovieInput, WatchListType, MediaType } from "@/schemas/movie";

// Reiner Daten-Load (ohne State) – von Effect und Refetch gemeinsam genutzt.
async function loadMovies(
  listType: WatchListType,
  mediaType?: MediaType
): Promise<Movie[]> {
  const params = new URLSearchParams({ listType });
  if (mediaType) params.set("mediaType", mediaType);
  const res = await fetch(`/api/movies?${params.toString()}`);
  if (!res.ok) throw new Error("Liste konnte nicht geladen werden");
  return res.json();
}

// Lädt die Einträge einer Liste und bietet Mutationen (hinzufügen/löschen),
// die danach automatisch neu laden. Verbindet die Screens mit der API.
export function useMovies(listType: WatchListType, mediaType?: MediaType) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initiales Laden: setState ausschließlich in den .then-Callbacks (async),
  // nie synchron im Effect-Body.
  useEffect(() => {
    let cancelled = false;
    loadMovies(listType, mediaType)
      .then((data) => {
        if (!cancelled) {
          setMovies(data);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unbekannter Fehler");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listType, mediaType]);

  // Refetch nach Mutationen (läuft aus Event-Handlern, nicht aus einem Effect).
  const refetch = useCallback(async () => {
    try {
      setMovies(await loadMovies(listType, mediaType));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    }
  }, [listType, mediaType]);

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
      await refetch();
    },
    [refetch]
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
      await refetch();
    },
    [refetch]
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
      await refetch();
    },
    [refetch]
  );

  return { movies, loading, error, refetch, addMovie, deleteMovie, moveMovie };
}
