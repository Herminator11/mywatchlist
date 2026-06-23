import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import { RegisterSchema } from "@/schemas/auth";

// POST /api/auth/register – öffentlich, legt einen neuen User an (Benutzername + Passwort)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const validation = validateBody(RegisterSchema, body);
  if (!validation.success) return validation.response;

  const { username, password } = validation.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json(
      { error: "Benutzername ist bereits vergeben" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, name: username, password: passwordHash },
  });

  return NextResponse.json(
    { id: user.id, username: user.username },
    { status: 201 }
  );
}
