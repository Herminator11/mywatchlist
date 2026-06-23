import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import { ReorderFavoritesSchema } from "@/schemas/movie";
import { requireAuth } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const validation = validateBody(ReorderFavoritesSchema, body);
  if (!validation.success) return validation.response;

  // updateMany mit userId im where: ein User kann nur seine EIGENEN Einträge
  // umsortieren (verhindert IDOR, da der Composite-PK keine userId enthält).
  await prisma.$transaction(
    validation.data.items.map((item) =>
      prisma.movie.updateMany({
        where: {
          tmdbId: item.tmdbId,
          listType: item.listType,
          seasonNumber: item.seasonNumber,
          userId: user.id,
        },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  return NextResponse.json({ success: true });
}