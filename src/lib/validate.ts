import { z, ZodSchema } from "zod";
import { NextResponse } from "next/server";

export function validateBody<T>(
  schema: ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Validierungsfehler",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}