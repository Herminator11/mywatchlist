"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TmdbSearchInput } from "@/components/search/TmdbSearchInput";
import { posterUrl, tmdbReleaseDate, tmdbTitle, type TmdbResult } from "@/lib/tmdb";
import type { AddMovieInput, WatchListType } from "@/schemas/movie";

interface AddSheetProps {
  listType?: WatchListType;
  onAdd: (input: AddMovieInput) => Promise<void>;
}

// Sheet zum Hinzufügen: TMDb-Suche → Auswahl → (bei Serien) Staffel → speichern.
export function AddSheet({ listType = "WANT_TO_WATCH", onAdd }: AddSheetProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TmdbResult | null>(null);
  const [season, setSeason] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setSelected(null);
    setSeason("1");
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  async function handleConfirm() {
    if (!selected) return;
    const isTv = selected.media_type === "tv";
    const input: AddMovieInput = {
      tmdbId: selected.id,
      listType,
      seasonNumber: isTv ? `Staffel ${season || "1"}` : "",
      title: tmdbTitle(selected),
      releaseDate: tmdbReleaseDate(selected),
      posterPath: selected.poster_path ?? null,
      mediaType: selected.media_type,
    };

    setSubmitting(true);
    try {
      await onAdd(input);
      toast.success(`"${input.title}" hinzugefügt`);
      handleOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Hinzufügen fehlgeschlagen");
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-accent inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium"
      >
        <Plus size={16} />
        Hinzufügen
      </button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="w-full gap-0 sm:max-w-md"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <SheetHeader>
            <SheetTitle style={{ color: "var(--text-primary)" }}>
              Zur Liste hinzufügen
            </SheetTitle>
            <SheetDescription style={{ color: "var(--text-muted)" }}>
              {selected
                ? "Auswahl bestätigen"
                : "Suche einen Film oder eine Serie"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
            {!selected ? (
              <TmdbSearchInput onSelect={setSelected} />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div
                    className="h-28 w-20 shrink-0 overflow-hidden rounded-md"
                    style={{ backgroundColor: "var(--surface-elevated)" }}
                  >
                    {posterUrl(selected.poster_path) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={posterUrl(selected.poster_path)!}
                        alt={tmdbTitle(selected)}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {tmdbTitle(selected)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {selected.media_type === "tv" ? "Serie" : "Film"}
                    </span>
                  </div>
                </div>

                {selected.media_type === "tv" && (
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

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    disabled={submitting}
                    className="rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-40"
                    style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                  >
                    Zurück
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="btn-accent rounded-lg px-3.5 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    {submitting ? "Wird hinzugefügt..." : "Hinzufügen"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
