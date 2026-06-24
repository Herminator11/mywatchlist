"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Movie } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { formatFinishedDate, parseFinishedDate } from "@/lib/utils";
import type {
  EditMovieInput,
  FavoriteCategory,
  WatchListType,
} from "@/schemas/movie";

interface EditSheetProps {
  movie: Movie | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES: FavoriteCategory[] = ["Realserie", "Animated", "Anime"];

function seasonNumberFrom(value: string): string {
  const m = value.match(/(\d+)/);
  return m ? m[1] : "1";
}

// Bearbeiten eines vorhandenen Eintrags – zeigt je nach Liste die passenden Felder.
export function EditSheet({ movie, onClose, onSaved }: EditSheetProps) {
  const isTv = movie?.mediaType === "tv";
  const isFavList =
    movie?.listType === "FAVORITE_SERIES" || movie?.listType === "FAVORITE_MOVIES";
  const isWatchedList =
    movie?.listType === "RECENTLY_WATCHED_TV" ||
    movie?.listType === "RECENTLY_WATCHED_MOVIES";
  const isSeasonList =
    isTv &&
    (movie?.listType === "WANT_TO_WATCH" ||
      movie?.listType === "CURRENTLY_WATCHING" ||
      movie?.listType === "RECENTLY_WATCHED_TV");

  const [category, setCategory] = useState<FavoriteCategory | "">(
    (movie?.favoriteCategory as FavoriteCategory | null) ?? ""
  );
  const [season, setSeason] = useState(
    movie ? seasonNumberFrom(movie.seasonNumber) : "1"
  );
  const [finishedAt, setFinishedAt] = useState(() => {
    const d = parseFinishedDate(movie?.finishedDate);
    return d ? format(d, "yyyy-MM-dd") : "";
  });
  const [notes, setNotes] = useState(movie?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  if (!movie) {
    return <Sheet open={false} onOpenChange={() => onClose()} />;
  }

  async function handleSave() {
    if (!movie) return;

    const newSeason = isSeasonList ? `Staffel ${season || "1"}` : movie.seasonNumber;
    const newFinished = isWatchedList
      ? finishedAt
        ? formatFinishedDate(new Date(`${finishedAt}T00:00:00`), movie.mediaType)
        : null
      : movie.finishedDate;

    const payload: EditMovieInput = {
      tmdbId: movie.tmdbId,
      listType: movie.listType as WatchListType,
      seasonNumber: newSeason,
      title: movie.title,
      releaseDate: movie.releaseDate,
      posterPath: movie.posterPath,
      mediaType: movie.mediaType as "tv" | "movie",
      finishedDate: newFinished,
      favoriteCategory: isFavList
        ? category || null
        : (movie.favoriteCategory as FavoriteCategory | null),
      notes: notes.trim() || null,
      oldListType: movie.listType as WatchListType,
      oldSeasonNumber: movie.seasonNumber,
    };

    setSubmitting(true);
    try {
      const res = await fetch(`/api/movies/${movie.tmdbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Speichern fehlgeschlagen");
      }
      toast.success("Gespeichert");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
      setSubmitting(false);
    }
  }

  const fieldStyle = {
    backgroundColor: "var(--surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-md"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <SheetHeader>
          <SheetTitle style={{ color: "var(--text-primary)" }}>Bearbeiten</SheetTitle>
          <SheetDescription style={{ color: "var(--text-muted)" }}>
            {movie.title}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 p-4">
          {isFavList && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Kategorie
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => {
                  const active = c === category;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(active ? "" : c)}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                      style={
                        active
                          ? {
                              backgroundColor: "color-mix(in oklab, var(--accent) 16%, transparent)",
                              color: "var(--accent)",
                              border: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)",
                            }
                          : { color: "var(--text-secondary)", border: "1px solid var(--border)" }
                      }
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isSeasonList && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Staffel
              </label>
              <input
                type="number"
                min={1}
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-24 rounded-lg px-3 py-2 text-sm outline-none"
                style={fieldStyle}
              />
            </div>
          )}

          {isWatchedList && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {isTv ? "Abgeschlossen am" : "Gesehen am"}
              </label>
              <input
                type="date"
                value={finishedAt}
                onChange={(e) => setFinishedAt(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={fieldStyle}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Notizen
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Eigene Notiz…"
              className="resize-none rounded-lg px-3 py-2 text-sm outline-none"
              style={fieldStyle}
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="btn-accent mt-1 rounded-lg px-3.5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
