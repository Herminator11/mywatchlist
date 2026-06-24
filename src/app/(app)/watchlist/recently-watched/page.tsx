"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Movie } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Segmented } from "@/components/common/Segmented";
import { MediaCard } from "@/components/cards/MediaCard";
import { EditSheet } from "@/components/sheets/EditSheet";
import {
  TitleDetailDialog,
  movieToTarget,
  type DetailTarget,
} from "@/components/cards/TitleDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMovies } from "@/hooks/useMovies";
import { parseFinishedDate, displayFinishedDate } from "@/lib/utils";

type Tab = "tv" | "movies";

const NO_DATE = "Ohne Datum";

// Gruppiert Einträge nach Abschluss-Jahr (Jahre absteigend, "Ohne Datum" zuletzt).
function groupByYear(movies: Movie[]) {
  const map = new Map<string, Movie[]>();
  for (const m of movies) {
    const d = parseFinishedDate(m.finishedDate);
    const key = d ? String(d.getFullYear()) : NO_DATE;
    const arr = map.get(key);
    if (arr) arr.push(m);
    else map.set(key, [m]);
  }
  for (const arr of map.values()) {
    arr.sort(
      (a, b) =>
        (parseFinishedDate(b.finishedDate)?.getTime() ?? 0) -
        (parseFinishedDate(a.finishedDate)?.getTime() ?? 0)
    );
  }
  const keys = [...map.keys()].sort((a, b) => {
    if (a === NO_DATE) return 1;
    if (b === NO_DATE) return -1;
    return Number(b) - Number(a);
  });
  return keys.map((year) => ({ year, items: map.get(year)! }));
}

export default function RecentlyWatchedPage() {
  const [tab, setTab] = useState<Tab>("tv");
  const [editing, setEditing] = useState<Movie | null>(null);
  const [detail, setDetail] = useState<DetailTarget | null>(null);
  const tv = useMovies("RECENTLY_WATCHED_TV");
  const mv = useMovies("RECENTLY_WATCHED_MOVIES");
  const active = tab === "tv" ? tv : mv;

  async function handleDelete(movie: Movie) {
    try {
      await active.deleteMovie(movie);
      toast.success("Eintrag entfernt");
    } catch {
      toast.error("Löschen fehlgeschlagen");
    }
  }

  const count = active.movies.length;
  const subtitle = active.loading
    ? "Wird geladen…"
    : count === 0
    ? "Noch nichts abgeschlossen"
    : `${count} abgeschlossen`;

  const groups = groupByYear(active.movies);
  let renderIndex = 0;

  return (
    <div>
      <PageHeader title="Recently Watched" subtitle={subtitle} />

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
            {tab === "tv"
              ? "Noch keine Serien abgeschlossen."
              : "Noch keine Filme abgeschlossen."}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Markiere etwas als „Gesehen“, dann taucht es hier auf.
          </p>
        </div>
      )}

      {!active.loading &&
        !active.error &&
        count > 0 &&
        groups.map((group) => (
          <section key={group.year} className="mb-8">
            <h2
              className="rise mb-3"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "1.15rem",
                color: "var(--text-secondary)",
              }}
            >
              {group.year}
            </h2>
            <div className="flex flex-col gap-2.5">
              {group.items.map((movie) => {
                const delay = `${renderIndex++ * 45}ms`;
                return (
                  <div
                    key={`${movie.tmdbId}_${movie.listType}_${movie.seasonNumber}`}
                    className="rise"
                    style={{ animationDelay: delay }}
                  >
                    <MediaCard
                      movie={movie}
                      onDelete={handleDelete}
                      onEdit={setEditing}
                      onSelect={(m) => setDetail(movieToTarget(m))}
                      extraMeta={displayFinishedDate(movie.finishedDate)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}

      <EditSheet
        key={editing ? `${editing.tmdbId}_${editing.listType}_${editing.seasonNumber}` : "none"}
        movie={editing}
        onClose={() => setEditing(null)}
        onSaved={active.refetch}
      />

      <TitleDetailDialog target={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
