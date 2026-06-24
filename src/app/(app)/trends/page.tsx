"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Segmented } from "@/components/common/Segmented";
import { TrendCard } from "@/components/cards/TrendCard";
import { AddToListSheet } from "@/components/sheets/AddToListSheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { TmdbResult } from "@/lib/tmdb";

type Filter = "all" | "tv" | "movie";

export default function TrendsPage() {
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<TmdbResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tmdb/trending")
      .then((res) =>
        res.ok
          ? res.json()
          : Promise.reject(new Error("Trends konnten nicht geladen werden"))
      )
      .then((data) => {
        if (!cancelled) {
          setResults(data.results ?? []);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Fehler");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const shown =
    filter === "all" ? results : results.filter((r) => r.media_type === filter);

  return (
    <div>
      <PageHeader title="Trends" subtitle="Diese Woche im Trend auf TMDb" />

      <div className="mb-7">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Alle" },
            { value: "tv", label: "Serien" },
            { value: "movie", label: "Filme" },
          ]}
        />
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-sm" style={{ color: "var(--destructive)" }}>
          {error}
        </p>
      )}

      {!loading && !error && shown.length === 0 && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Keine Trends gefunden.
        </p>
      )}

      {!loading && !error && shown.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((r, i) => (
            <div
              key={`${r.media_type}_${r.id}`}
              className="rise"
              style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}
            >
              <TrendCard result={r} onAdd={setSelected} />
            </div>
          ))}
        </div>
      )}

      <AddToListSheet
        key={selected ? `${selected.media_type}_${selected.id}` : "none"}
        result={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
