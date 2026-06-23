import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import { EditMovieSchema } from "@/schemas/movie";
import { requireAuth } from "@/lib/session";

// PATCH /api/movies/[id]
export async function PATCH(
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
  const validation = validateBody(EditMovieSchema, body);
  if (!validation.success) return validation.response;

  const data = validation.data;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Alten Eintrag löschen
    await tx.movie.deleteMany({
      where: {
        tmdbId,
        listType: data.oldListType,
        seasonNumber: data.oldSeasonNumber,
        userId: user.id,
      },
    });

    // 2. isFavorite auf ALLE Einträge dieser tmdbId anwenden
    if (data.isFavorite !== undefined) {
      await tx.movie.updateMany({
        where: { tmdbId, userId: user.id },
        data: { isFavorite: data.isFavorite },
      });
    }

    // 3. Neuen Eintrag erstellen
    return tx.movie.upsert({
      where: {
        tmdbId_listType_seasonNumber: {
          tmdbId,
          listType: data.listType,
          seasonNumber: data.seasonNumber ?? "",
        },
      },
      update: {
        title: data.title,
        releaseDate: data.releaseDate,
        posterPath: data.posterPath,
        mediaType: data.mediaType,
        finishedDate: data.finishedDate,
        favoriteCategory: data.favoriteCategory,
        notes: data.notes,
        userId: user.id,
      },
      create: {
        tmdbId,
        listType: data.listType,
        seasonNumber: data.seasonNumber ?? "",
        title: data.title,
        releaseDate: data.releaseDate,
        posterPath: data.posterPath ?? null,
        mediaType: data.mediaType,
        finishedDate: data.finishedDate,
        favoriteCategory: data.favoriteCategory,
        notes: data.notes,
        userId: user.id,
      },
    });
  });

  return NextResponse.json(result);
}

// DELETE /api/movies/[id]?listType=X&seasonNumber=Y&mediaType=Z
export async function DELETE(
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

  const { searchParams } = new URL(req.url);
  const listType = searchParams.get("listType");
  const seasonNumber = searchParams.get("seasonNumber");
  const mediaType = searchParams.get("mediaType");

  if (!listType || !mediaType) {
    return NextResponse.json({ error: "listType und mediaType fehlen" }, { status: 400 });
  }

  if (mediaType === "tv" && seasonNumber !== null) {
    // TV: exakt eine Staffel löschen
    await prisma.movie.deleteMany({
      where: { tmdbId, listType, seasonNumber, userId: user.id },
    });
  } else {
    // Film: alle Einträge in der Liste löschen
    await prisma.movie.deleteMany({
      where: { tmdbId, listType, userId: user.id },
    });
  }

  return NextResponse.json({ success: true });
}