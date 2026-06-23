import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      ),
    };
  }

  return {
    user: session.user as { id: string; username: string; name?: string | null },
    error: null,
  };
}