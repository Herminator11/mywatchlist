import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";

// GET /api/tmdb/tv/[id] – Serien-Details (serverseitig).
// Liefert aktuell nur die reale Staffelzahl, um den SeasonPicker zu klemmen.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

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
  const numberOfSeasons =
    typeof data.number_of_seasons === "number" ? data.number_of_seasons : null;

  return NextResponse.json({ numberOfSeasons });
}
