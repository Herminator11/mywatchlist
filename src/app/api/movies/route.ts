import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import { requireAuth } from "@/lib/session";
import { AddMovieSchema } from "@/schemas/movie";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const listType = searchParams.get("listType");
  const mediaType = searchParams.get("mediaType");

  if (!listType) {
    return NextResponse.json({ error: "listType fehlt" }, { status: 400 });
  }

  const movies = await prisma.movie.findMany({
    where: {
      userId: user!.id,
      listType,
      ...(mediaType ? { mediaType } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(movies);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const validation = validateBody(AddMovieSchema, body);
  if (!validation.success) return validation.response;

  const data = validation.data;

  const movie = await prisma.movie.upsert({
    where: {
      tmdbId_listType_seasonNumber: {
        tmdbId: data.tmdbId,
        listType: data.listType,
        seasonNumber: data.seasonNumber ?? "",
      },
    },
    update: { ...data, userId: user!.id },
    create: { ...data, userId: user!.id, seasonNumber: data.seasonNumber ?? "" },
  });

  return NextResponse.json(movie, { status: 201 });
}