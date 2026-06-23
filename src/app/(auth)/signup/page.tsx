"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RegisterSchema, type RegisterInput } from "@/schemas/auth";

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(data: RegisterInput) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError("root", {
        message: body?.error ?? "Registrierung fehlgeschlagen.",
      });
      return;
    }

    // Nach erfolgreicher Registrierung direkt einloggen
    const result = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("root", {
        message: "Account erstellt, aber Anmeldung fehlgeschlagen.",
      });
    } else {
      router.push("/watchlist/want-to-watch");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--accent)" }}
          >
            MyWatchlist
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Erstelle einen Account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Benutzername
            </label>
            <input
              {...register("username")}
              type="text"
              autoComplete="username"
              placeholder="deinname"
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "var(--surface-elevated)",
                color: "var(--text-primary)",
                border: `1px solid ${errors.username ? "var(--destructive)" : "var(--border)"}`,
              }}
            />
            {errors.username && (
              <p className="text-xs" style={{ color: "var(--destructive)" }}>
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Passwort
            </label>
            <input
              {...register("password")}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "var(--surface-elevated)",
                color: "var(--text-primary)",
                border: `1px solid ${errors.password ? "var(--destructive)" : "var(--border)"}`,
              }}
            />
            {errors.password && (
              <p className="text-xs" style={{ color: "var(--destructive)" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm" style={{ color: "var(--destructive)" }}>
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "#000" }}
          >
            {isSubmitting ? "Wird erstellt..." : "Registrieren"}
          </button>
        </form>

        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Schon einen Account?{" "}
          <Link
            href="/login"
            className="font-medium"
            style={{ color: "var(--accent)" }}
          >
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
