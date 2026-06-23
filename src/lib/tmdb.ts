// Hilfsfunktionen & Typen rund um TMDb-Suchergebnisse (clientseitig nutzbar).
// Die Bild-Basis ist ein öffentliches CDN – kein Secret, darf im Client stehen.
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

export interface TmdbResult {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string;
}

export function posterUrl(path?: string | null): string | null {
  return path ? `${TMDB_IMAGE_BASE}${path}` : null;
}

export function tmdbTitle(r: TmdbResult): string {
  return r.title ?? r.name ?? "Unbekannt";
}

export function tmdbReleaseDate(r: TmdbResult): string {
  return r.release_date ?? r.first_air_date ?? "";
}

export function releaseYear(date?: string | null): string {
  if (!date) return "";
  const year = date.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : "";
}
