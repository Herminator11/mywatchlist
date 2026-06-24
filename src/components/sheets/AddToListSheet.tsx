"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  posterUrl,
  tmdbReleaseDate,
  tmdbTitle,
  type TmdbResult,
} from "@/lib/tmdb";
import { formatFinishedDate } from "@/lib/utils";
import type { AddMovieInput, WatchListType, MediaType } from "@/schemas/movie";

interface ListOption {
  value: WatchListType;
  label: string;
}

// Welche Listen für welchen Medientyp erlaubt sind (siehe Datenmodell-Regeln).
function optionsFor(media: MediaType): ListOption[] {
  if (media === "tv") {
    return [
      { value: "WANT_TO_WATCH", label: "Want to Watch" },
      { value: "CURRENTLY_WATCHING", label: "Currently Watching" },
      { value: "RECENTLY_WATCHED_TV", label: "Recently Watched" },
      { value: "FAVORITE_SERIES", label: "Lieblingsserie" },
    ];
  }
  return [
    { value: "WANT_TO_WATCH", label: "Want to Watch" },
    { value: "RECENTLY_WATCHED_MOVIES", label: "Recently Watched" },
    { value: "FAVORITE_MOVIES", label: "Lieblingsfilm" },
  ];
}

interface AddToListSheetProps {
  result: TmdbResult | null;
  onClose: () => void;
}

// Sheet aus der Suche: Treffer in eine frei wählbare Liste übernehmen.
export function AddToListSheet({ result, onClose }: AddToListSheetProps) {
  const [listType, setListType] = useState<WatchListType>("WANT_TO_WATCH");
  const [season, setSeason] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  if (!result) {
    return <Sheet open={false} onOpenChange={() => onClose()} />;
  }

  const isTv = result.media_type === "tv";
  const options = optionsFor(result.media_type);
  // Staffel nur, wenn TV und Zielliste pro Staffel geführt wird (nicht Favoriten).
  const needsSeason =
    isTv &&
    (listType === "WANT_TO_WATCH" ||
      listType === "CURRENTLY_WATCHING" ||
      listType === "RECENTLY_WATCHED_TV");
  const isWatchedList =
    listType === "RECENTLY_WATCHED_TV" || listType === "RECENTLY_WATCHED_MOVIES";

  async function handleAdd() {
    if (!result) return;
    const input: AddMovieInput = {
      tmdbId: result.id,
      listType,
      seasonNumber: needsSeason ? `Staffel ${season || "1"}` : "",
      title: tmdbTitle(result),
      releaseDate: tmdbReleaseDate(result),
      posterPath: result.poster_path ?? null,
      mediaType: result.media_type,
      finishedDate: isWatchedList
        ? formatFinishedDate(new Date(), result.media_type)
        : null,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Hinzufügen fehlgeschlagen");
      }
      const label = options.find((o) => o.value === listType)?.label ?? "Liste";
      toast.success(`„${input.title}“ → ${label}`);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Hinzufügen fehlgeschlagen");
      setSubmitting(false);
    }
  }

  const poster = posterUrl(result.poster_path);

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-md"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <SheetHeader>
          <SheetTitle style={{ color: "var(--text-primary)" }}>
            Zu einer Liste hinzufügen
          </SheetTitle>
          <SheetDescription style={{ color: "var(--text-muted)" }}>
            Wähle, wohin „{tmdbTitle(result)}“ soll
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 p-4">
          <div className="flex gap-3">
            <div
              className="h-28 w-20 shrink-0 overflow-hidden rounded-md"
              style={{ backgroundColor: "var(--surface-elevated)" }}
            >
              {poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={poster}
                  alt={tmdbTitle(result)}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {tmdbTitle(result)}
              </span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {isTv ? "Serie" : "Film"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Liste
            </span>
            <div className="flex flex-col gap-1.5">
              {options.map((o) => {
                const active = o.value === listType;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setListType(o.value)}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors"
                    style={
                      active
                        ? {
                            backgroundColor:
                              "color-mix(in oklab, var(--accent) 16%, transparent)",
                            color: "var(--accent)",
                            border: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)",
                          }
                        : {
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border)",
                          }
                    }
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {needsSeason && (
            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Staffel
              </label>
              <input
                type="number"
                min={1}
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-24 rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={submitting}
            className="btn-accent mt-1 rounded-lg px-3.5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Wird hinzugefügt..." : "Hinzufügen"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
