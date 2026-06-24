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
  vote_average?: number;
  vote_count?: number;
}

// Posterbasis in höherer Auflösung für die große Detail-Karte.
export const TMDB_IMAGE_BASE_LARGE = "https://image.tmdb.org/t/p/w500";

export function posterUrl(path?: string | null): string | null {
  return path ? `${TMDB_IMAGE_BASE}${path}` : null;
}

export function posterUrlLarge(path?: string | null): string | null {
  return path ? `${TMDB_IMAGE_BASE_LARGE}${path}` : null;
}

// Normalisierte TMDb-Detaildaten – von /api/tmdb/tv/[id] und /api/tmdb/movie/[id]
// in derselben Form geliefert, damit das Detail-Pop-up beide Typen gleich rendert.
export interface TitleDetails {
  mediaType: "tv" | "movie";
  overview: string | null;
  tagline: string | null;
  genres: string[];
  status: string | null;
  releaseDate: string | null; // Film: release_date · Serie: first_air_date
  voteAverage: number | null;
  voteCount: number | null;
  // Nur Serie
  numberOfSeasons?: number | null;
  numberOfEpisodes?: number | null;
  lastAirDate?: string | null;
  episodeRunTime?: number | null;
  networks?: string[];
  createdBy?: string[];
  // Nur Film
  runtime?: number | null;
}

// Laufzeit in Minuten lesbar machen: 142 -> "2 Std. 22 Min.".
export function formatRuntime(minutes?: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} Min.`;
  if (m === 0) return `${h} Std.`;
  return `${h} Std. ${m} Min.`;
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

// TMDb-Community-Score (vote_average 0–10), eine Nachkommastelle.
export function formatScore(vote?: number): string | null {
  if (!vote || vote <= 0) return null;
  return vote.toFixed(1);
}

// Stimmenzahl kompakt: 1234 -> "1.2k", 980 -> "980".
export function formatVotes(count?: number): string | null {
  if (!count || count <= 0) return null;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}
