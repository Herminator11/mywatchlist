import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

// GET /api/movies/by-tmdb/[tmdbId]
// Alle Einträge des angemeldeten Users für einen Titel (über alle Listen/Staffeln).
// Versorgt den „Deine Daten"-Abschnitt im Detail-Pop-up.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { tmdbId: raw } = await params;
  const tmdbId = parseInt(raw, 10);
  if (isNaN(tmdbId)) {
    return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
  }

  const entries = await prisma.movie.findMany({
    where: { userId: user.id, tmdbId },
    orderBy: [{ listType: "asc" }, { seasonNumber: "asc" }],
  });

  return NextResponse.json(entries);
}
