"use client";

import type { ReactNode } from "react";
import type { Movie } from "@prisma/client";
import { MediaCard } from "./MediaCard";
import { Skeleton } from "@/components/ui/skeleton";

interface MovieListViewProps {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  emptyTitle?: string;
  emptyHint?: string;
  onDelete?: (movie: Movie) => Promise<void> | void;
  onEdit?: (movie: Movie) => void;
  renderActions?: (movie: Movie) => ReactNode;
}

// Geteilte Listendarstellung für alle Screens: Lade-Skeletons, Fehler,
// Leerzustand und gestaffelt eingeblendete Karten.
export function MovieListView({
  movies,
  loading,
  error,
  emptyTitle = "Noch nichts hier.",
  emptyHint,
  onDelete,
  onEdit,
  renderActions,
}: MovieListViewProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[5.9rem] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm" style={{ color: "var(--destructive)" }}>
        {error}
      </p>
    );
  }

  if (movies.length === 0) {
    return (
      <div
        className="rise rounded-xl border border-dashed p-10 text-center"
        style={{ borderColor: "var(--border)" }}
      >
        <p style={{ color: "var(--text-secondary)" }}>{emptyTitle}</p>
        {emptyHint && (
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {emptyHint}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {movies.map((movie, i) => (
        <div
          key={`${movie.tmdbId}_${movie.listType}_${movie.seasonNumber}`}
          className="rise"
          style={{ animationDelay: `${i * 55}ms` }}
        >
          <MediaCard
            movie={movie}
            onDelete={onDelete}
            onEdit={onEdit}
            actions={renderActions?.(movie)}
          />
        </div>
      ))}
    </div>
  );
}
