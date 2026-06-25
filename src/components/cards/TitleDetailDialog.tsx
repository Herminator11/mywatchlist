"use client";

import { Dialog } from "@base-ui/react/dialog";
import useSWR from "swr";
import { Plus, Star, X } from "lucide-react";
import type { Movie } from "@prisma/client";
import {
  formatRuntime,
  formatScore,
  formatVotes,
  posterUrlLarge,
  releaseYear,
  tmdbTitle,
  type TitleDetails,
  type TmdbResult,
} from "@/lib/tmdb";
import { displayFinishedDate } from "@/lib/utils";
import { useTilt } from "@/hooks/useTilt";

export interface DetailTarget {
  tmdbId: number;
  mediaType: "tv" | "movie";
  title: string;
  posterPath: string | null;
}

// Movie (DB) → DetailTarget fürs Pop-up.
export function movieToTarget(m: {
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
}): DetailTarget {
  return {
    tmdbId: m.tmdbId,
    mediaType: m.mediaType === "tv" ? "tv" : "movie",
    title: m.title,
    posterPath: m.posterPath,
  };
}

// TmdbResult (Suche/Trends) → DetailTarget fürs Pop-up.
export function resultToTarget(r: TmdbResult): DetailTarget {
  return {
    tmdbId: r.id,
    mediaType: r.media_type,
    title: tmdbTitle(r),
    posterPath: r.poster_path ?? null,
  };
}

interface TitleDetailDialogProps {
  target: DetailTarget | null;
  onClose: () => void;
  // Optional (Trends/Suche): zeigt einen „Hinzufügen"-Button im Pop-up.
  onAdd?: (target: DetailTarget) => void;
}

const LIST_LABELS: Record<string, string> = {
  WANT_TO_WATCH: "Want to Watch",
  CURRENTLY_WATCHING: "Currently Watching",
  RECENTLY_WATCHED_TV: "Recently Watched",
  RECENTLY_WATCHED_MOVIES: "Recently Watched",
  FAVORITE_SERIES: "Lieblingsserie",
  FAVORITE_MOVIES: "Lieblingsfilm",
};

const fetcher = (url: string) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Fehler"))));

// TMDb liefert "YYYY-MM-DD" → dd/MM/yyyy, sonst Rohwert/Jahr.
function fmtDate(raw?: string | null): string | null {
  if (!raw) return null;
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : raw;
}

export function TitleDetailDialog({ target, onClose, onAdd }: TitleDetailDialogProps) {
  const { transform, glare, onMouseMove, onMouseLeave } = useTilt();

  const { data: details, isLoading: detailsLoading } = useSWR<TitleDetails>(
    target ? `/api/tmdb/${target.mediaType}/${target.tmdbId}` : null,
    fetcher
  );
  const { data: entries } = useSWR<Movie[]>(
    target ? `/api/movies/by-tmdb/${target.tmdbId}` : null,
    fetcher
  );

  const poster = target ? posterUrlLarge(target.posterPath) : null;
  const isTv = target?.mediaType === "tv";
  const tint = isTv ? "var(--accent-tv)" : "var(--accent-movie)";
  const score = formatScore(details?.voteAverage ?? undefined);
  const votes = formatVotes(details?.voteCount ?? undefined);
  const year = releaseYear(details?.releaseDate);

  return (
    <Dialog.Root open={!!target} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className="fixed inset-0 z-50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          style={{
            backgroundColor: "color-mix(in oklab, var(--background) 55%, black 30%)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        />
        <Dialog.Popup
          className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 80px -12px rgba(0,0,0,0.6)",
          }}
        >
          {target && (
            <div className="flex flex-col">
              <Dialog.Close
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: "color-mix(in oklab, var(--background) 70%, transparent)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
                aria-label="Schließen"
              >
                <X size={16} />
              </Dialog.Close>

              {/* Poster als interaktive 3D-Tilt-Karte */}
              <div className="flex justify-center px-6 pt-8 pb-2">
                <div
                  onMouseMove={onMouseMove}
                  onMouseLeave={onMouseLeave}
                  className="relative aspect-[2/3] w-44 shrink-0 overflow-hidden rounded-xl will-change-transform"
                  style={{
                    transform,
                    transition: "transform 120ms ease-out",
                    transformStyle: "preserve-3d",
                    backgroundColor: "var(--surface-elevated)",
                    boxShadow: "0 18px 50px -10px rgba(0,0,0,0.7)",
                  }}
                >
                  {poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={poster}
                      alt={target.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Kein Bild
                    </div>
                  )}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl transition-opacity"
                    style={glare}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-5 px-6 pb-6 pt-2">
                {/* Titel + Kopf-Meta */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <Dialog.Title
                    className="text-xl font-semibold leading-tight"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
                  >
                    {target.title}
                  </Dialog.Title>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium"
                      style={{
                        color: tint,
                        backgroundColor: "color-mix(in oklab, " + tint + " 14%, transparent)",
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tint }} />
                      {isTv ? "Serie" : "Film"}
                    </span>
                    {year && <span style={{ color: "var(--text-muted)" }}>{year}</span>}
                    {score && (
                      <span
                        className="inline-flex items-center gap-1 font-medium"
                        style={{ color: "var(--accent)" }}
                        title={votes ? `${votes} Stimmen` : undefined}
                      >
                        <Star size={12} fill="var(--accent)" />
                        {score}
                      </span>
                    )}
                  </div>
                  {details?.tagline && (
                    <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
                      „{details.tagline}“
                    </p>
                  )}
                </div>

                {/* Abschnitt 1: Deine Daten */}
                <Section title="Deine Daten">
                  {entries === undefined ? (
                    <RowSkeleton />
                  ) : entries.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Noch nicht auf deinen Listen.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {entries.map((e) => (
                        <div
                          key={`${e.tmdbId}_${e.listType}_${e.seasonNumber}`}
                          className="flex flex-col gap-1 rounded-lg p-2.5"
                          style={{ backgroundColor: "var(--surface-elevated)" }}
                        >
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span
                              className="rounded-full px-2 py-0.5 font-medium"
                              style={{
                                color: "var(--accent)",
                                backgroundColor:
                                  "color-mix(in oklab, var(--accent) 14%, transparent)",
                              }}
                            >
                              {LIST_LABELS[e.listType] ?? e.listType}
                            </span>
                            {e.seasonNumber && (
                              <span style={{ color: "var(--text-secondary)" }}>
                                {e.seasonNumber}
                              </span>
                            )}
                            {e.favoriteCategory && (
                              <span style={{ color: "var(--text-muted)" }}>
                                · {e.favoriteCategory}
                              </span>
                            )}
                            {displayFinishedDate(e.finishedDate) && (
                              <span style={{ color: "var(--text-muted)" }}>
                                · {displayFinishedDate(e.finishedDate)}
                              </span>
                            )}
                          </div>
                          {e.notes && (
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              {e.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Abschnitt 2: Allgemein (TMDb) */}
                <Section title="Allgemein">
                  {detailsLoading || !details ? (
                    <RowSkeleton />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {details.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {details.genres.map((g) => (
                            <span
                              key={g}
                              className="rounded-full px-2 py-0.5 text-xs"
                              style={{
                                color: "var(--text-secondary)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      )}

                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                        {isTv ? (
                          <>
                            <Fact label="Staffeln" value={details.numberOfSeasons?.toString()} />
                            <Fact label="Folgen" value={details.numberOfEpisodes?.toString()} />
                            <Fact
                              label="Ø Folgenlänge"
                              value={formatRuntime(details.episodeRunTime)}
                            />
                            <Fact label="Erstausstrahlung" value={fmtDate(details.releaseDate)} />
                            <Fact label="Letzte Folge" value={fmtDate(details.lastAirDate)} />
                            <Fact label="Status" value={details.status} />
                            <Fact label="Netzwerk" value={details.networks?.join(", ")} />
                            <Fact label="Erstellt von" value={details.createdBy?.join(", ")} />
                          </>
                        ) : (
                          <>
                            <Fact label="Laufzeit" value={formatRuntime(details.runtime)} />
                            <Fact label="Release" value={fmtDate(details.releaseDate)} />
                            <Fact label="Status" value={details.status} />
                          </>
                        )}
                      </dl>

                      {details.overview && (
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {details.overview}
                        </p>
                      )}
                    </div>
                  )}
                </Section>

                {onAdd && (
                  <button
                    type="button"
                    onClick={() => onAdd(target)}
                    className="btn-accent inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-medium"
                  >
                    <Plus size={16} />
                    Zu Liste hinzufügen
                  </button>
                )}
              </div>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h4
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </h4>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <dt className="text-xs" style={{ color: "var(--text-muted)" }}>
        {label}
      </dt>
      <dd className="text-sm" style={{ color: "var(--text-primary)" }}>
        {value}
      </dd>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-4 w-2/3 animate-pulse rounded" style={{ backgroundColor: "var(--surface-elevated)" }} />
      <div className="h-4 w-1/2 animate-pulse rounded" style={{ backgroundColor: "var(--surface-elevated)" }} />
    </div>
  );
}
