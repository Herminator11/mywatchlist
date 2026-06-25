import { NextResponse } from "next/server";

interface RawResult {
  id: number;
  poster_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  [key: string]: unknown;
}

// GET /api/tmdb/trending – Filme & Serien der Woche im Trend (öffentlich, auch für Gäste).
export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API Key fehlt" }, { status: 500 });
  }

  const base = "https://api.themoviedb.org/3/trending";
  const params = `api_key=${apiKey}&language=de-DE`;

  const [moviesRes, tvRes] = await Promise.all([
    fetch(`${base}/movie/week?${params}`, { next: { revalidate: 3600 } }),
    fetch(`${base}/tv/week?${params}`, { next: { revalidate: 3600 } }),
  ]);

  if (!moviesRes.ok || !tvRes.ok) {
    return NextResponse.json({ error: "TMDb Fehler" }, { status: 502 });
  }

  const moviesData = await moviesRes.json();
  const tvData = await tvRes.json();

  const tag = (items: RawResult[], type: "movie" | "tv") =>
    (items ?? [])
      .filter((i) => i.poster_path)
      .slice(0, 20)
      .map((i) => ({ ...i, media_type: type }));

  const results = [
    ...tag(moviesData.results, "movie"),
    ...tag(tvData.results, "tv"),
  ];

  return NextResponse.json({ results });
}
