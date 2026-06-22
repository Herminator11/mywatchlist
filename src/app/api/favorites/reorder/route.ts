import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import { requireAuth } from "@/lib/session";
import { ReorderFavoritesSchema } from "@/schemas/movie";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const validation = validateBody(ReorderFavoritesSchema, body);
  if (!validation.success) return validation.response;

  await prisma.$transaction(
    validation.data.items.map((item) =>
      prisma.movie.update({
        where: {
          tmdbId_listType_seasonNumber: {
            tmdbId: item.tmdbId,
            listType: item.listType,
            seasonNumber: item.seasonNumber,
          },
        },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  return NextResponse.json({ success: true });
}