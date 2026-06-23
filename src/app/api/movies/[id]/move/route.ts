import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import { requireAuth } from "@/lib/session";
import { MoveMovieSchema } from "@/schemas/movie";
import { formatFinishedDate } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const tmdbId = parseInt(id);
  if (isNaN(tmdbId)) {
    return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
  }

  const body = await req.json();
  const validation = validateBody(MoveMovieSchema, body);
  if (!validation.success) return validation.response;

  const { action, fromListType, seasonNumber = "" } = validation.data;

  const result = await prisma.$transaction(async (tx) => {
    const source = await tx.movie.findFirst({
      where: { tmdbId, listType: fromListType, seasonNumber, userId: user.id },
    });

    if (!source) throw new Error("Eintrag nicht gefunden");

    const targetListType =
      action === "to_watching"
        ? "CURRENTLY_WATCHING"
        : source.mediaType === "tv"
        ? "RECENTLY_WATCHED_TV"
        : "RECENTLY_WATCHED_MOVIES";

    // Beim Verschieben in "gesehen" automatisch das Abschlussdatum setzen,
    // falls noch keins vorhanden ist.
    const finishedDate =
      action === "to_watched"
        ? source.finishedDate ??
          formatFinishedDate(new Date(), source.mediaType)
        : source.finishedDate;

    const movedData = {
      title: source.title,
      releaseDate: source.releaseDate,
      posterPath: source.posterPath,
      mediaType: source.mediaType,
      finishedDate,
      favoriteCategory: source.favoriteCategory,
      isFavorite: source.isFavorite,
      notes: source.notes,
      sortOrder: source.sortOrder,
      userId: source.userId,
    };

    // upsert am Ziel: kein Crash, falls die Karte dort schon existiert.
    const moved = await tx.movie.upsert({
      where: {
        tmdbId_listType_seasonNumber: {
          tmdbId,
          listType: targetListType,
          seasonNumber: source.seasonNumber,
        },
      },
      update: movedData,
      create: {
        tmdbId,
        listType: targetListType,
        seasonNumber: source.seasonNumber,
        ...movedData,
      },
    });

    await tx.movie.delete({
      where: {
        tmdbId_listType_seasonNumber: {
          tmdbId,
          listType: fromListType,
          seasonNumber,
        },
      },
    });

    return moved;
  });

  return NextResponse.json(result);
}
