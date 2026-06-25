import { NextResponse } from "next/server";
import type { TitleDetails } from "@/lib/tmdb";

interface TmdbGenre {
  id: number;
  name: string;
}

// GET /api/tmdb/movie/[id] – Film-Details (serverseitig), normalisiert als TitleDetails.
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

  const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=de-DE`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    return NextResponse.json({ error: "TMDb Fehler" }, { status: 502 });
  }

  const data = await res.json();

  const details: TitleDetails = {
    mediaType: "movie",
    overview: data.overview || null,
    tagline: data.tagline || null,
    genres: Array.isArray(data.genres)
      ? data.genres.map((g: TmdbGenre) => g.name)
      : [],
    status: data.status || null,
    releaseDate: data.release_date || null,
    voteAverage: typeof data.vote_average === "number" ? data.vote_average : null,
    voteCount: typeof data.vote_count === "number" ? data.vote_count : null,
    runtime: typeof data.runtime === "number" ? data.runtime : null,
  };

  return NextResponse.json(details);
}
