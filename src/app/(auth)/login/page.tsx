"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoginSchema, type LoginInput } from "@/schemas/auth";

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("root", { message: "E-Mail oder Passwort falsch." });
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
            Meld dich an um weiterzumachen
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              E-Mail
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="test@test.de"
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "var(--surface-elevated)",
                color: "var(--text-primary)",
                border: `1px solid ${errors.email ? "var(--destructive)" : "var(--border)"}`,
              }}
            />
            {errors.email && (
              <p className="text-xs" style={{ color: "var(--destructive)" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
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
            {isSubmitting ? "Wird angemeldet..." : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
}