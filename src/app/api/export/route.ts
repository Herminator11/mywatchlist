import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function GET() {
  const { user, error } = await requireAuth();
    if (error) return error;

  const movies = await prisma.movie.findMany({
    where: {
      userId: user.id,
      listType: { in: ["RECENTLY_WATCHED_TV", "RECENTLY_WATCHED_MOVIES"] },
    },
    orderBy: { finishedDate: "desc" },
  });

  const lines = movies.map((m) => {
    const date = m.finishedDate ?? "Kein Datum";
    const season = m.seasonNumber ? ` (${m.seasonNumber})` : "";
    return `${m.title}${season} — ${date}`;
  });

  const content = lines.join("\n");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="watchlist-history.txt"`,
    },
  });
}