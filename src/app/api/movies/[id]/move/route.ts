import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import { requireAuth } from "@/lib/session";
import { MoveMovieSchema } from "@/schemas/movie";

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

  const { action, seasonNumber = "" } = validation.data;

  const result = await prisma.$transaction(async (tx) => {
    const source = await tx.movie.findFirst({
      where: {
        tmdbId,
        listType: "WANT_TO_WATCH",
        seasonNumber,
        userId: user!.id,
      },
    });

    if (!source) throw new Error("Eintrag nicht gefunden");

    const targetListType =
      action === "to_watching"
        ? "CURRENTLY_WATCHING"
        : source.mediaType === "tv"
        ? "RECENTLY_WATCHED_TV"
        : "RECENTLY_WATCHED_MOVIES";

    const moved = await tx.movie.create({
      data: {
        tmdbId: source.tmdbId,
        listType: targetListType,
        seasonNumber: source.seasonNumber,
        title: source.title,
        releaseDate: source.releaseDate,
        posterPath: source.posterPath,
        mediaType: source.mediaType,
        finishedDate: source.finishedDate,
        favoriteCategory: source.favoriteCategory,
        isFavorite: source.isFavorite,
        notes: source.notes,
        sortOrder: source.sortOrder,
        userId: source.userId,
      },
    });

    await tx.movie.delete({
      where: {
        tmdbId_listType_seasonNumber: {
          tmdbId,
          listType: "WANT_TO_WATCH",
          seasonNumber,
        },
      },
    });

    return moved;
  });

  return NextResponse.json(result);
}