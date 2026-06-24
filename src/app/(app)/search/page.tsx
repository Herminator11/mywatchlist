"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TmdbSearchInput } from "@/components/search/TmdbSearchInput";
import { AddToListSheet } from "@/components/sheets/AddToListSheet";
import type { TmdbResult } from "@/lib/tmdb";

export default function SearchPage() {
  const [selected, setSelected] = useState<TmdbResult | null>(null);

  return (
    <div>
      <PageHeader title="Suche" subtitle="Finde Filme & Serien über TMDb" />

      <TmdbSearchInput onSelect={setSelected} />

      {/* key sorgt für frischen Sheet-Zustand pro Auswahl */}
      <AddToListSheet
        key={selected ? `${selected.media_type}_${selected.id}` : "none"}
        result={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
