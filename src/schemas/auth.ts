import { z } from "zod";

export const LoginSchema = z.object({
  username: z
    .string()
    .min(1, "Benutzername ist erforderlich")
    .min(3, "Benutzername muss mindestens 3 Zeichen haben"),
  password: z
    .string()
    .min(1, "Passwort ist erforderlich")
    .min(6, "Passwort muss mindestens 6 Zeichen haben"),
});

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, "Benutzername muss mindestens 3 Zeichen haben")
    .max(32, "Benutzername darf max. 32 Zeichen haben"),
  password: z
    .string()
    .min(6, "Passwort muss mindestens 6 Zeichen haben")
    .max(72, "Passwort darf max. 72 Zeichen haben"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
