"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TmdbSearchInput } from "@/components/search/TmdbSearchInput";
import { AddToListSheet } from "@/components/sheets/AddToListSheet";
import {
  TitleDetailDialog,
  resultToTarget,
} from "@/components/cards/TitleDetailDialog";
import { useAddGuard } from "@/hooks/useAddGuard";
import type { TmdbResult } from "@/lib/tmdb";

export default function SearchPage() {
  const [selected, setSelected] = useState<TmdbResult | null>(null);
  const [detail, setDetail] = useState<TmdbResult | null>(null);
  const guardAdd = useAddGuard();

  return (
    <div>
      <PageHeader title="Suche" subtitle="Finde Filme & Serien über TMDb" />

      {/* Treffer-Klick öffnet das Detail-Pop-up; Hinzufügen erfolgt von dort. */}
      <TmdbSearchInput onSelect={setDetail} />

      {/* key sorgt für frischen Sheet-Zustand pro Auswahl */}
      <AddToListSheet
        key={selected ? `${selected.media_type}_${selected.id}` : "none"}
        result={selected}
        onClose={() => setSelected(null)}
      />

      <TitleDetailDialog
        target={detail ? resultToTarget(detail) : null}
        onClose={() => setDetail(null)}
        onAdd={() => {
          const r = detail;
          setDetail(null);
          guardAdd(() => setSelected(r));
        }}
      />
    </div>
  );
}
