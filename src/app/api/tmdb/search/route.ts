import { NextRequest, NextResponse } from "next/server";

// Öffentliche TMDb-Suche (auch für Gäste nutzbar).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API Key fehlt" }, { status: 500 });
  }

  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=de-DE&page=1`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    return NextResponse.json({ error: "TMDb Fehler" }, { status: 502 });
  }

  const data = await res.json();

  // Nur Filme und Serien, ohne Personen
  const results = data.results
    .filter((item: { media_type: string }) =>
      item.media_type === "movie" || item.media_type === "tv"
    )
    .slice(0, 10);

  return NextResponse.json({ results });
}