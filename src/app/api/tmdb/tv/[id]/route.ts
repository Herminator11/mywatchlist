import { NextResponse } from "next/server";
import type { TitleDetails } from "@/lib/tmdb";

interface TmdbGenre {
  id: number;
  name: string;
}
interface TmdbNetwork {
  id: number;
  name: string;
}
interface TmdbCreator {
  id: number;
  name: string;
}

// GET /api/tmdb/tv/[id] – Serien-Details (serverseitig), normalisiert als TitleDetails.
// numberOfSeasons bleibt erhalten (SeasonPicker liest es), weitere Felder fürs Detail-Pop-up.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) {
    return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API Key fehlt" }, { status: 500 });
  }

  const url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}&language=de-DE`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    return NextResponse.json({ error: "TMDb Fehler" }, { status: 502 });
  }

  const data = await res.json();

  const details: TitleDetails = {
    mediaType: "tv",
    overview: data.overview || null,
    tagline: data.tagline || null,
    genres: Array.isArray(data.genres)
      ? data.genres.map((g: TmdbGenre) => g.name)
      : [],
    status: data.status || null,
    releaseDate: data.first_air_date || null,
    voteAverage: typeof data.vote_average === "number" ? data.vote_average : null,
    voteCount: typeof data.vote_count === "number" ? data.vote_count : null,
    numberOfSeasons:
      typeof data.number_of_seasons === "number" ? data.number_of_seasons : null,
    numberOfEpisodes:
      typeof data.number_of_episodes === "number"
        ? data.number_of_episodes
        : null,
    lastAirDate: data.last_air_date || null,
    episodeRunTime:
      Array.isArray(data.episode_run_time) && data.episode_run_time.length > 0
        ? data.episode_run_time[0]
        : null,
    networks: Array.isArray(data.networks)
      ? data.networks.map((n: TmdbNetwork) => n.name)
      : [],
    createdBy: Array.isArray(data.created_by)
      ? data.created_by.map((c: TmdbCreator) => c.name)
      : [],
  };

  return NextResponse.json(details);
}
