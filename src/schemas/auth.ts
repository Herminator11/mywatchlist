import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "E-Mail ist erforderlich")
    .email("Ungültige E-Mail Adresse"),
  password: z
    .string()
    .min(1, "Passwort ist erforderlich")
    .min(6, "Passwort muss mindestens 6 Zeichen haben"),
});

export type LoginInput = z.infer<typeof LoginSchema>;